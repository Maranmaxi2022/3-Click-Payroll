"""
Pay Run API Endpoints

Endpoints for creating, managing, and processing payroll runs.
"""

from fastapi import APIRouter, HTTPException, status, Body
from fastapi.responses import StreamingResponse
from typing import List, Optional
from datetime import datetime, date
from pydantic import BaseModel, Field
from beanie import PydanticObjectId
import io
import zipfile

from ...schemas.pay_run import PayRun, PayRunStatus, PayPeriodType
from ...schemas.employee import Employee
from ...schemas.organization import Organization
from ...services.payroll_calculation_service import PayrollCalculationService
from ...services.timesheet_aggregation_service import TimesheetAggregationService
from ...services.payslip_generator import PayslipGenerator

router = APIRouter()


def serialize_pay_run(pay_run_dict: dict) -> dict:
    """
    Recursively convert all PydanticObjectId instances to strings in a pay run dict.
    """
    if isinstance(pay_run_dict, dict):
        result = {}
        for key, value in pay_run_dict.items():
            if isinstance(value, PydanticObjectId):
                result[key] = str(value)
            elif isinstance(value, dict):
                result[key] = serialize_pay_run(value)
            elif isinstance(value, list):
                result[key] = [serialize_pay_run(item) if isinstance(item, (dict, PydanticObjectId)) else item for item in value]
            else:
                result[key] = value
        return result
    elif isinstance(pay_run_dict, PydanticObjectId):
        return str(pay_run_dict)
    else:
        return pay_run_dict


# Request/Response Models
class CreatePayRunRequest(BaseModel):
    """Request model for creating a pay run"""
    pay_run_name: Optional[str] = None
    pay_period_type: PayPeriodType = PayPeriodType.REGULAR
    period_start_date: date
    period_end_date: date
    pay_date: date
    employee_ids: Optional[List[str]] = None  # If None, includes all active employees
    notes: Optional[str] = None


class CalculatePayRunRequest(BaseModel):
    """Request model for calculating a pay run"""
    recalculate: bool = False  # Force recalculation even if already calculated


class ApprovePayRunRequest(BaseModel):
    """Request model for approving a pay run"""
    approved_by: str
    notes: Optional[str] = None


@router.get("/", response_model=List[dict])
async def get_pay_runs(
    status: Optional[PayRunStatus] = None,
    limit: int = 50,
    skip: int = 0
):
    """
    Get all pay runs with optional filtering

    Args:
        status: Filter by pay run status
        limit: Maximum number of results
        skip: Number of results to skip

    Returns:
        List of pay runs
    """
    query = {}
    if status:
        query["status"] = status

    pay_runs = await PayRun.find(query).skip(skip).limit(limit).sort("-created_at").to_list()

    # Convert to dict and ensure all IDs are serializable
    return [serialize_pay_run(pr.dict()) for pr in pay_runs]


@router.post("/", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_pay_run(request: CreatePayRunRequest):
    """
    Create a new pay run

    Args:
        request: Pay run creation parameters

    Returns:
        Created pay run
    """
    # Generate pay run number
    existing_count = await PayRun.count()
    pay_run_number = f"PR-{datetime.now().year}-{existing_count + 1:05d}"

    # Create pay run document
    pay_run = PayRun(
        pay_run_number=pay_run_number,
        pay_run_name=request.pay_run_name or f"Pay Run {request.period_start_date} to {request.period_end_date}",
        pay_period_type=request.pay_period_type,
        period_start_date=request.period_start_date,
        period_end_date=request.period_end_date,
        pay_date=request.pay_date,
        status=PayRunStatus.DRAFT,
        notes=request.notes
    )

    await pay_run.insert()

    # Convert to dict and ensure all IDs are serializable
    return serialize_pay_run(pay_run.dict())


@router.get("/{pay_run_id}", response_model=dict)
async def get_pay_run(pay_run_id: str):
    """
    Get pay run by ID

    Args:
        pay_run_id: Pay run ID

    Returns:
        Pay run details
    """
    try:
        pay_run = await PayRun.get(PydanticObjectId(pay_run_id))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pay run {pay_run_id} not found"
        )

    if not pay_run:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pay run {pay_run_id} not found"
        )

    # Convert to dict and ensure all IDs are serializable
    return serialize_pay_run(pay_run.dict())


@router.post("/{pay_run_id}/calculate", response_model=dict)
async def calculate_pay_run(
    pay_run_id: str,
    request: CalculatePayRunRequest = Body(default=CalculatePayRunRequest())
):
    """
    Calculate payroll for a pay run

    This endpoint:
    1. Fetches all active employees
    2. Calculates CPP, EI, QPIP, federal and provincial tax
    3. Applies YTD maximums
    4. Calculates net pay
    5. Updates pay run with calculations

    Args:
        pay_run_id: Pay run ID
        request: Calculation parameters

    Returns:
        Calculated pay run with all employee pay periods
    """
    # Fetch pay run
    try:
        pay_run = await PayRun.get(PydanticObjectId(pay_run_id))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pay run {pay_run_id} not found"
        )

    if not pay_run:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pay run {pay_run_id} not found"
        )

    # Check if already calculated
    if pay_run.status == PayRunStatus.CALCULATED and not request.recalculate:
        return pay_run.dict()

    # Fetch active employees
    employees = await Employee.find({"status": "active"}).to_list()

    if not employees:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No active employees found"
        )

    # Initialize services
    payroll_service = PayrollCalculationService(tax_year=2025)
    timesheet_service = TimesheetAggregationService()

    # Aggregate timesheet data for all employees
    employee_ids = [str(emp.id) for emp in employees]
    pay_run_earnings = await timesheet_service.aggregate_pay_run_earnings(
        employee_ids=employee_ids,
        period_start_date=pay_run.period_start_date,
        period_end_date=pay_run.period_end_date
    )

    # Prepare employee data for calculation
    employee_data = []
    time_entry_tracking = {}  # Track which time entries are used

    for emp in employees:
        emp_id = str(emp.id)

        # Check if employee has timesheet data
        if emp_id in pay_run_earnings:
            # Use earnings from timesheets
            employee_dict = pay_run_earnings[emp_id]["employee"]
            employee_dict["earnings"] = pay_run_earnings[emp_id]["earnings"]
            employee_dict["deductions"] = []
            employee_dict["benefits"] = []

            # Track time entries for this employee
            time_entry_tracking[emp_id] = pay_run_earnings[emp_id]["time_entry_ids"]
        else:
            # No timesheet data - skip this employee or use default
            # For now, we'll skip employees without approved timesheets
            continue

        employee_data.append(employee_dict)

    # Determine pay frequency from first employee or use biweekly as default
    pay_frequency = employees[0].pay_frequency.value if employees else "biweekly"

    # Calculate payroll
    calculation_result = payroll_service.calculate_pay_run(
        employees=employee_data,
        pay_period_start=datetime.combine(pay_run.period_start_date, datetime.min.time()),
        pay_period_end=datetime.combine(pay_run.period_end_date, datetime.min.time()),
        pay_date=datetime.combine(pay_run.pay_date, datetime.min.time()),
        pay_frequency=pay_frequency
    )

    # Update pay run with calculations
    pay_run.pay_periods = calculation_result["pay_periods"]
    pay_run.total_employees = calculation_result["total_employees"]
    pay_run.total_gross_earnings = calculation_result["total_gross_earnings"]
    pay_run.total_net_pay = calculation_result["total_net_pay"]
    pay_run.total_cpp = calculation_result["total_cpp"]
    pay_run.total_cpp2 = calculation_result["total_cpp2"]
    pay_run.total_ei = calculation_result["total_ei"]
    pay_run.total_federal_tax = calculation_result["total_federal_tax"]
    pay_run.total_provincial_tax = calculation_result["total_provincial_tax"]
    pay_run.total_deductions = calculation_result["total_deductions"]
    pay_run.status = PayRunStatus.CALCULATED
    pay_run.calculated_at = datetime.utcnow()
    pay_run.updated_at = datetime.utcnow()

    await pay_run.save()

    # Mark time entries as processed and link to pay run
    all_time_entry_ids = []
    for emp_id, entry_ids in time_entry_tracking.items():
        all_time_entry_ids.extend(entry_ids)

    if all_time_entry_ids:
        processed_count = await timesheet_service.mark_entries_as_processed(
            time_entry_ids=all_time_entry_ids,
            pay_run_id=str(pay_run.id)
        )

    # Convert to dict and ensure all IDs are serializable
    return serialize_pay_run(pay_run.dict())


@router.post("/{pay_run_id}/approve", response_model=dict)
async def approve_pay_run(pay_run_id: str, request: ApprovePayRunRequest):
    """
    Approve a pay run

    Args:
        pay_run_id: Pay run ID
        request: Approval parameters

    Returns:
        Approved pay run
    """
    try:
        pay_run = await PayRun.get(PydanticObjectId(pay_run_id))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pay run {pay_run_id} not found"
        )

    if not pay_run:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pay run {pay_run_id} not found"
        )

    if pay_run.status != PayRunStatus.CALCULATED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Pay run must be calculated before approval. Current status: {pay_run.status}"
        )

    pay_run.status = PayRunStatus.APPROVED
    pay_run.approved_at = datetime.utcnow()
    pay_run.approved_by = request.approved_by
    if request.notes:
        pay_run.notes = f"{pay_run.notes}\n\nApproval Notes: {request.notes}" if pay_run.notes else request.notes
    pay_run.updated_at = datetime.utcnow()

    await pay_run.save()

    # Convert to dict and ensure all IDs are serializable
    return serialize_pay_run(pay_run.dict())


@router.post("/{pay_run_id}/process", response_model=dict)
async def process_pay_run(pay_run_id: str):
    """
    Process a pay run (mark as processed/completed)

    This typically triggers:
    - Payment file generation
    - Integration with banking systems
    - Update of employee YTD totals

    Args:
        pay_run_id: Pay run ID

    Returns:
        Processed pay run
    """
    try:
        pay_run = await PayRun.get(PydanticObjectId(pay_run_id))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pay run {pay_run_id} not found"
        )

    if not pay_run:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pay run {pay_run_id} not found"
        )

    if pay_run.status != PayRunStatus.APPROVED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Pay run must be approved before processing. Current status: {pay_run.status}"
        )

    # Update employee YTD totals
    for pay_period in pay_run.pay_periods:
        try:
            employee = await Employee.get(PydanticObjectId(pay_period["employee_id"]))
            if employee and employee.ytd_carry_in:
                # Update YTD values
                employee.ytd_carry_in.gross_earnings = pay_period.get("ytd_gross", 0)
                employee.ytd_carry_in.cpp_contributions = pay_period.get("ytd_cpp", 0)
                employee.ytd_carry_in.cpp2_contributions = pay_period.get("ytd_cpp2", 0)
                employee.ytd_carry_in.ei_premiums = pay_period.get("ytd_ei", 0)
                employee.ytd_carry_in.federal_tax = pay_period.get("ytd_federal_tax", 0)
                employee.ytd_carry_in.provincial_tax = pay_period.get("ytd_provincial_tax", 0)
                employee.updated_at = datetime.utcnow()
                await employee.save()
        except Exception as e:
            # Log error but continue processing
            print(f"Error updating employee {pay_period.get('employee_id')}: {e}")

    pay_run.status = PayRunStatus.COMPLETED
    pay_run.processed_at = datetime.utcnow()
    pay_run.updated_at = datetime.utcnow()

    await pay_run.save()

    # Convert to dict and ensure all IDs are serializable
    return serialize_pay_run(pay_run.dict())


@router.delete("/{pay_run_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_pay_run(pay_run_id: str):
    """
    Delete a pay run (only if in draft status)

    Args:
        pay_run_id: Pay run ID
    """
    try:
        pay_run = await PayRun.get(PydanticObjectId(pay_run_id))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pay run {pay_run_id} not found"
        )

    if not pay_run:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pay run {pay_run_id} not found"
        )

    if pay_run.status not in [PayRunStatus.DRAFT, PayRunStatus.CALCULATED]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete pay run in status: {pay_run.status}"
        )

    await pay_run.delete()

    return None


@router.post("/{pay_run_id}/generate-payslips", response_model=dict)
async def generate_payslips(pay_run_id: str):
    """
    Generate PDF payslips for all employees in a pay run

    This endpoint:
    1. Fetches the pay run with calculated pay periods
    2. Fetches organization details for company info
    3. Generates a PDF payslip for each employee
    4. Stores the payslips (currently returns them as base64)

    Args:
        pay_run_id: Pay run ID

    Returns:
        Status and information about generated payslips
    """
    # Fetch pay run
    try:
        pay_run = await PayRun.get(PydanticObjectId(pay_run_id))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pay run {pay_run_id} not found"
        )

    if not pay_run:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pay run {pay_run_id} not found"
        )

    # Check if pay run is calculated or approved
    if pay_run.status not in [PayRunStatus.CALCULATED, PayRunStatus.APPROVED, PayRunStatus.COMPLETED]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Pay run must be calculated before generating payslips. Current status: {pay_run.status}"
        )

    # Check if there are pay periods
    if not pay_run.pay_periods:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No pay periods found in this pay run"
        )

    # Fetch organization details
    organization = await Organization.find_one()
    if not organization:
        # Use default organization data
        org_data = {
            'company_name': 'Your Company Name',
            'street': '',
            'city': '',
            'province': '',
            'postal_code': ''
        }
    else:
        org_data = organization.dict()

    # Initialize payslip generator
    generator = PayslipGenerator(org_data)

    # Generate payslips for each employee
    generated_payslips = []

    for pay_period in pay_run.pay_periods:
        try:
            # Fetch full employee details
            employee = await Employee.get(PydanticObjectId(pay_period.employee_id))
            if not employee:
                print(f"Warning: Employee {pay_period.employee_id} not found, skipping payslip")
                continue

            employee_dict = employee.dict()

            # Generate payslip PDF
            pdf_bytes = generator.generate_payslip(
                pay_period=pay_period.dict(),
                pay_run=pay_run.dict(),
                employee_details=employee_dict
            )

            # Store payslip info
            generated_payslips.append({
                'employee_id': pay_period.employee_id,
                'employee_name': pay_period.employee_name,
                'employee_number': pay_period.employee_number,
                'pdf_size': len(pdf_bytes),
                'generated_at': datetime.utcnow().isoformat()
            })

        except Exception as e:
            print(f"Error generating payslip for employee {pay_period.employee_id}: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error generating payslip for {pay_period.employee_name}: {str(e)}"
            )

    return {
        'status': 'success',
        'pay_run_id': str(pay_run.id),
        'pay_run_number': pay_run.pay_run_number,
        'total_payslips': len(generated_payslips),
        'payslips': generated_payslips,
        'message': f'Successfully generated {len(generated_payslips)} payslips'
    }


@router.get("/{pay_run_id}/payslips/download-all")
async def download_all_payslips(pay_run_id: str):
    """
    Download all payslips as a ZIP file

    Args:
        pay_run_id: Pay run ID

    Returns:
        ZIP file containing all payslips
    """
    # Fetch pay run
    try:
        pay_run = await PayRun.get(PydanticObjectId(pay_run_id))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pay run {pay_run_id} not found"
        )

    if not pay_run:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pay run {pay_run_id} not found"
        )

    if not pay_run.pay_periods:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No pay periods found in this pay run"
        )

    # Fetch organization details
    organization = await Organization.find_one()
    if not organization:
        org_data = {
            'company_name': 'Your Company Name',
            'street': '',
            'city': '',
            'province': '',
            'postal_code': ''
        }
    else:
        org_data = organization.dict()

    # Initialize payslip generator
    generator = PayslipGenerator(org_data)

    # Create ZIP file in memory
    zip_buffer = io.BytesIO()

    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        for pay_period in pay_run.pay_periods:
            try:
                # Fetch employee details
                employee = await Employee.get(PydanticObjectId(pay_period.employee_id))
                if not employee:
                    continue

                # Generate payslip PDF
                pdf_bytes = generator.generate_payslip(
                    pay_period=pay_period.dict(),
                    pay_run=pay_run.dict(),
                    employee_details=employee.dict()
                )

                # Add to ZIP
                filename = f"payslip_{pay_run.pay_run_number}_{employee.employee_number}_{employee.last_name}.pdf"
                zip_file.writestr(filename, pdf_bytes)

            except Exception as e:
                print(f"Error generating payslip for employee {pay_period.employee_id}: {e}")
                continue

    # Prepare ZIP for download
    zip_buffer.seek(0)

    # Create filename for ZIP
    zip_filename = f"payslips_{pay_run.pay_run_number}.zip"

    return StreamingResponse(
        zip_buffer,
        media_type="application/zip",
        headers={
            "Content-Disposition": f"attachment; filename={zip_filename}"
        }
    )


@router.get("/{pay_run_id}/payslips/{employee_id}", response_class=StreamingResponse)
async def download_payslip(pay_run_id: str, employee_id: str):
    """
    Download a single payslip PDF for an employee

    Args:
        pay_run_id: Pay run ID
        employee_id: Employee ID

    Returns:
        PDF file stream
    """
    # Fetch pay run
    try:
        pay_run = await PayRun.get(PydanticObjectId(pay_run_id))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pay run {pay_run_id} not found"
        )

    if not pay_run:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pay run {pay_run_id} not found"
        )

    # Find pay period for employee
    pay_period = None
    for pp in pay_run.pay_periods:
        if pp.employee_id == employee_id:
            pay_period = pp
            break

    if not pay_period:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pay period for employee {employee_id} not found in pay run"
        )

    # Fetch employee details
    try:
        employee = await Employee.get(PydanticObjectId(employee_id))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee {employee_id} not found"
        )

    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee {employee_id} not found"
        )

    # Fetch organization details
    organization = await Organization.find_one()
    if not organization:
        org_data = {
            'company_name': 'Your Company Name',
            'street': '',
            'city': '',
            'province': '',
            'postal_code': ''
        }
    else:
        org_data = organization.dict()

    # Generate payslip PDF
    generator = PayslipGenerator(org_data)
    pdf_bytes = generator.generate_payslip(
        pay_period=pay_period.dict(),
        pay_run=pay_run.dict(),
        employee_details=employee.dict()
    )

    # Create filename
    filename = f"payslip_{pay_run.pay_run_number}_{employee.employee_number}.pdf"

    # Return as streaming response
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        }
    )
