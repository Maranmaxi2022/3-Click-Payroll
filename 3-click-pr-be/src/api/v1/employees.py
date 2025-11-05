"""
Employee API Endpoints

CRUD operations for employee management including
creation, retrieval, update, deletion, and eligibility checks.
"""

from fastapi import APIRouter, HTTPException, Query, status
from typing import List, Optional
from datetime import datetime

from src.models.employee import (
    EmployeeCreate,
    EmployeeUpdate,
    EmployeeResponse,
    EmployeeListResponse,
    EmployeeEligibilityResponse
)
from src.schemas.employee import Employee
from src.services.worker_category_service import WorkerCategoryService


router = APIRouter()
worker_service = WorkerCategoryService()


@router.post("/", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
async def create_employee(employee_data: EmployeeCreate):
    """
    Create a new employee

    Creates a new employee record with the provided information.
    Employee number must be unique.
    """
    try:
        # Check if employee number already exists
        existing = await Employee.find_one(Employee.employee_number == employee_data.employee_number)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Employee number {employee_data.employee_number} already exists"
            )

        # Check if email already exists
        existing_email = await Employee.find_one(Employee.email == employee_data.email)
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Email {employee_data.email} already exists"
            )

        # Create employee document
        employee = Employee(**employee_data.model_dump())
        await employee.insert()

        # Convert to response model
        response = EmployeeResponse(
            id=str(employee.id),
            **employee.model_dump(exclude={"id"})
        )

        return response

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating employee: {str(e)}"
        )


@router.get("/", response_model=EmployeeListResponse)
async def get_employees(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(50, ge=1, le=100, description="Items per page"),
    status: Optional[str] = Query(None, description="Filter by status"),
    department_id: Optional[str] = Query(None, description="Filter by department"),
    work_location_id: Optional[str] = Query(None, description="Filter by work location"),
    worker_category: Optional[str] = Query(None, description="Filter by worker category"),
    search: Optional[str] = Query(None, description="Search by name or email")
):
    """
    Get all employees with pagination and filtering

    Supports filtering by status, department, location, worker category,
    and searching by name or email.
    """
    try:
        # Build query
        query = {}

        if status:
            query["status"] = status

        if department_id:
            query["department_id"] = department_id

        if work_location_id:
            query["work_location_id"] = work_location_id

        if worker_category:
            query["worker_category"] = worker_category

        # Search functionality
        if search:
            query["$or"] = [
                {"first_name": {"$regex": search, "$options": "i"}},
                {"last_name": {"$regex": search, "$options": "i"}},
                {"email": {"$regex": search, "$options": "i"}},
                {"employee_number": {"$regex": search, "$options": "i"}}
            ]

        # Get total count
        total = await Employee.find(query).count()

        # Get paginated results
        skip = (page - 1) * page_size
        employees = await Employee.find(query).skip(skip).limit(page_size).to_list()

        # Convert to response models
        employee_responses = [
            EmployeeResponse(
                id=str(emp.id),
                **emp.model_dump(exclude={"id"})
            )
            for emp in employees
        ]

        return EmployeeListResponse(
            total=total,
            page=page,
            page_size=page_size,
            employees=employee_responses
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving employees: {str(e)}"
        )


@router.get("/{employee_id}")
async def get_employee(employee_id: str):
    """
    Get employee by ID

    Retrieves a single employee's complete information.
    """
    try:
        employee = await Employee.get(employee_id)

        if not employee:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Employee with ID {employee_id} not found"
            )

        return employee

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving employee: {str(e)}"
        )


@router.put("/{employee_id}")
async def update_employee(employee_id: str, employee_data: EmployeeUpdate):
    """
    Update employee

    Updates an existing employee's information. Only provided fields
    will be updated.
    """
    try:
        employee = await Employee.get(employee_id)

        if not employee:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Employee with ID {employee_id} not found"
            )

        # Update only provided fields
        update_data = employee_data.model_dump(exclude_unset=True)

        # Check email uniqueness if email is being updated
        if "email" in update_data and update_data["email"] != employee.email:
            existing_email = await Employee.find_one(Employee.email == update_data["email"])
            if existing_email:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Email {update_data['email']} already exists"
                )

        # Update employee
        for key, value in update_data.items():
            setattr(employee, key, value)

        employee.updated_at = datetime.utcnow()
        await employee.save()

        return employee

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating employee: {str(e)}"
        )


@router.delete("/{employee_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_employee(employee_id: str):
    """
    Delete employee

    Permanently deletes an employee record. Use with caution.
    Consider setting status to 'inactive' instead for data retention.
    """
    try:
        employee = await Employee.get(employee_id)

        if not employee:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Employee with ID {employee_id} not found"
            )

        await employee.delete()
        return None

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting employee: {str(e)}"
        )


@router.get("/{employee_id}/eligibility", response_model=EmployeeEligibilityResponse)
async def get_employee_eligibility(employee_id: str):
    """
    Get employee eligibility for statutory deductions and benefits

    Returns eligibility status for CPP, EI, benefits, vacation pay,
    overtime, etc. based on worker category and other factors.
    """
    try:
        employee = await Employee.get(employee_id)

        if not employee:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Employee with ID {employee_id} not found"
            )

        # Convert Beanie document to dict for worker service
        employee_dict = employee.model_dump()
        employee_dict['workerCategory'] = employee.worker_category.value
        employee_dict['dateOfBirth'] = employee.date_of_birth
        employee_dict['province'] = employee.province_of_employment.value

        # Get eligibilities from worker category service
        eligibilities = worker_service.get_eligibilities(employee_dict)

        return EmployeeEligibilityResponse(
            employee_id=str(employee.id),
            employee_name=f"{employee.first_name} {employee.last_name}",
            worker_category=employee.worker_category.value,
            cpp_eligible=eligibilities['cpp'],
            cpp2_eligible=eligibilities['cpp2'],
            ei_eligible=eligibilities['ei'],
            qpip_eligible=eligibilities['qpip'],
            benefits_eligible=eligibilities['benefits'],
            vacation_pay_eligible=eligibilities['vacationPay'],
            statutory_holidays_eligible=eligibilities['statutoryHolidays'],
            overtime_eligible=eligibilities['overtime'],
            tax_slip_type=eligibilities['taxSlipType']
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error checking eligibility: {str(e)}"
        )


@router.patch("/{employee_id}/status")
async def update_employee_status(
    employee_id: str,
    status: str = Query(..., description="New status (active, inactive, terminated)")
):
    """
    Update employee status

    Changes employee status to active, inactive, or terminated.
    """
    try:
        valid_statuses = ["active", "inactive", "terminated"]
        if status not in valid_statuses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
            )

        employee = await Employee.get(employee_id)

        if not employee:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Employee with ID {employee_id} not found"
            )

        employee.status = status
        employee.updated_at = datetime.utcnow()

        if status == "terminated":
            employee.termination_date = datetime.utcnow().date()

        await employee.save()

        return {"message": f"Employee status updated to {status}", "employee": employee}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating status: {str(e)}"
        )
