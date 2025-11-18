"""
Timesheet API Endpoints

Endpoints for managing employee time entries and timesheets.
"""

from fastapi import APIRouter, HTTPException, status, Query
from typing import List, Optional
from datetime import datetime, date
from pydantic import BaseModel
from beanie import PydanticObjectId

from ...schemas.timesheet import TimeEntry, TimesheetPeriod, TimeEntryType, TimeEntryStatus, ShiftDetails
from ...schemas.employee import Employee

router = APIRouter()


# Request/Response Models
class CreateTimeEntryRequest(BaseModel):
    """Request model for creating a time entry"""
    employee_id: str
    work_date: date
    entry_type: TimeEntryType = TimeEntryType.REGULAR
    hours_worked: float
    regular_hours: float = 0.0
    overtime_hours: float = 0.0
    double_time_hours: float = 0.0
    shift_start: Optional[str] = None  # HH:MM format
    shift_end: Optional[str] = None
    break_duration_minutes: int = 0
    hourly_rate: Optional[float] = None
    department_id: Optional[str] = None
    project_code: Optional[str] = None
    employee_notes: Optional[str] = None


class BulkTimeEntryRequest(BaseModel):
    """Request model for creating multiple time entries"""
    entries: List[CreateTimeEntryRequest]


class UpdateTimeEntryRequest(BaseModel):
    """Request model for updating a time entry"""
    hours_worked: Optional[float] = None
    regular_hours: Optional[float] = None
    overtime_hours: Optional[float] = None
    double_time_hours: Optional[float] = None
    shift_start: Optional[str] = None
    shift_end: Optional[str] = None
    break_duration_minutes: Optional[int] = None
    employee_notes: Optional[str] = None
    status: Optional[TimeEntryStatus] = None


class ApproveTimeEntriesRequest(BaseModel):
    """Request model for approving time entries"""
    time_entry_ids: List[str]
    approved_by: str
    manager_notes: Optional[str] = None


# ============================================================================
# TIME ENTRY ENDPOINTS
# ============================================================================

@router.post("/entries", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_time_entry(request: CreateTimeEntryRequest):
    """
    Create a new time entry for an employee

    Args:
        request: Time entry details

    Returns:
        Created time entry
    """
    # Fetch employee details
    try:
        employee = await Employee.get(PydanticObjectId(request.employee_id))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee {request.employee_id} not found"
        )

    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee {request.employee_id} not found"
        )

    # Use employee's hourly rate if not provided
    hourly_rate = request.hourly_rate or employee.hourly_rate or 0.0

    # Calculate overtime rate (1.5x for regular overtime)
    overtime_rate = hourly_rate * 1.5

    # Create shift details if provided
    shift_details = None
    if request.shift_start and request.shift_end:
        shift_details = ShiftDetails(
            shift_start=request.shift_start,
            shift_end=request.shift_end,
            break_duration_minutes=request.break_duration_minutes
        )

    # Create time entry
    time_entry = TimeEntry(
        employee_id=str(employee.id),
        employee_number=employee.employee_number,
        employee_name=f"{employee.first_name} {employee.last_name}",
        work_date=request.work_date,
        entry_type=request.entry_type,
        hours_worked=request.hours_worked,
        regular_hours=request.regular_hours,
        overtime_hours=request.overtime_hours,
        double_time_hours=request.double_time_hours,
        shift_details=shift_details,
        hourly_rate=hourly_rate,
        overtime_rate=overtime_rate,
        department_id=request.department_id or employee.department_id,
        department_name=employee.department_name,
        project_code=request.project_code,
        employee_notes=request.employee_notes,
        status=TimeEntryStatus.DRAFT
    )

    await time_entry.insert()

    return time_entry.dict()


@router.post("/entries/bulk", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_bulk_time_entries(request: BulkTimeEntryRequest):
    """
    Create multiple time entries at once

    Useful for importing time data or batch entry

    Args:
        request: List of time entries to create

    Returns:
        Summary of created entries
    """
    created_entries = []
    errors = []

    for entry_request in request.entries:
        try:
            # Fetch employee
            employee = await Employee.get(PydanticObjectId(entry_request.employee_id))
            if not employee:
                errors.append({
                    "employee_id": entry_request.employee_id,
                    "work_date": str(entry_request.work_date),
                    "error": "Employee not found"
                })
                continue

            hourly_rate = entry_request.hourly_rate or employee.hourly_rate or 0.0

            # Create time entry
            time_entry = TimeEntry(
                employee_id=str(employee.id),
                employee_number=employee.employee_number,
                employee_name=f"{employee.first_name} {employee.last_name}",
                work_date=entry_request.work_date,
                entry_type=entry_request.entry_type,
                hours_worked=entry_request.hours_worked,
                regular_hours=entry_request.regular_hours,
                overtime_hours=entry_request.overtime_hours,
                double_time_hours=entry_request.double_time_hours,
                hourly_rate=hourly_rate,
                overtime_rate=hourly_rate * 1.5,
                department_id=entry_request.department_id or employee.department_id,
                employee_notes=entry_request.employee_notes,
                status=TimeEntryStatus.DRAFT
            )

            await time_entry.insert()
            created_entries.append(time_entry.dict())

        except Exception as e:
            errors.append({
                "employee_id": entry_request.employee_id,
                "work_date": str(entry_request.work_date),
                "error": str(e)
            })

    return {
        "total_requested": len(request.entries),
        "created": len(created_entries),
        "failed": len(errors),
        "entries": created_entries,
        "errors": errors
    }


@router.get("/entries", response_model=List[dict])
async def get_time_entries(
    employee_id: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    status: Optional[TimeEntryStatus] = None,
    pay_run_id: Optional[str] = None,
    limit: int = 100,
    skip: int = 0
):
    """
    Get time entries with optional filtering

    Args:
        employee_id: Filter by employee
        start_date: Filter by work date >= start_date
        end_date: Filter by work date <= end_date
        status: Filter by status
        pay_run_id: Filter by pay run
        limit: Maximum results
        skip: Skip results

    Returns:
        List of time entries
    """
    query = {}

    if employee_id:
        query["employee_id"] = employee_id

    if start_date or end_date:
        query["work_date"] = {}
        if start_date:
            query["work_date"]["$gte"] = start_date
        if end_date:
            query["work_date"]["$lte"] = end_date

    if status:
        query["status"] = status

    if pay_run_id:
        query["pay_run_id"] = pay_run_id

    entries = await TimeEntry.find(query).skip(skip).limit(limit).sort("-work_date").to_list()

    return [entry.dict() for entry in entries]


@router.get("/entries/{entry_id}", response_model=dict)
async def get_time_entry(entry_id: str):
    """Get time entry by ID"""
    try:
        entry = await TimeEntry.get(PydanticObjectId(entry_id))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Time entry {entry_id} not found"
        )

    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Time entry {entry_id} not found"
        )

    return entry.dict()


@router.put("/entries/{entry_id}", response_model=dict)
async def update_time_entry(entry_id: str, request: UpdateTimeEntryRequest):
    """
    Update a time entry

    Only allowed if status is DRAFT or SUBMITTED

    Args:
        entry_id: Time entry ID
        request: Updated fields

    Returns:
        Updated time entry
    """
    try:
        entry = await TimeEntry.get(PydanticObjectId(entry_id))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Time entry {entry_id} not found"
        )

    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Time entry {entry_id} not found"
        )

    # Only allow updates if not processed
    if entry.status == TimeEntryStatus.PROCESSED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot update processed time entry"
        )

    # Update fields
    if request.hours_worked is not None:
        entry.hours_worked = request.hours_worked
    if request.regular_hours is not None:
        entry.regular_hours = request.regular_hours
    if request.overtime_hours is not None:
        entry.overtime_hours = request.overtime_hours
    if request.double_time_hours is not None:
        entry.double_time_hours = request.double_time_hours
    if request.employee_notes is not None:
        entry.employee_notes = request.employee_notes
    if request.status is not None:
        entry.status = request.status

    entry.updated_at = datetime.utcnow()

    await entry.save()

    return entry.dict()


@router.post("/entries/approve", response_model=dict)
async def approve_time_entries(request: ApproveTimeEntriesRequest):
    """
    Approve multiple time entries at once

    Args:
        request: List of entry IDs to approve

    Returns:
        Summary of approved entries
    """
    approved = []
    errors = []

    for entry_id in request.time_entry_ids:
        try:
            entry = await TimeEntry.get(PydanticObjectId(entry_id))
            if not entry:
                errors.append({"entry_id": entry_id, "error": "Not found"})
                continue

            if entry.status == TimeEntryStatus.PROCESSED:
                errors.append({"entry_id": entry_id, "error": "Already processed"})
                continue

            entry.status = TimeEntryStatus.APPROVED
            entry.approved_at = datetime.utcnow()
            entry.approved_by = request.approved_by
            if request.manager_notes:
                entry.manager_notes = request.manager_notes
            entry.updated_at = datetime.utcnow()

            await entry.save()
            approved.append(entry_id)

        except Exception as e:
            errors.append({"entry_id": entry_id, "error": str(e)})

    return {
        "total_requested": len(request.time_entry_ids),
        "approved": len(approved),
        "failed": len(errors),
        "approved_ids": approved,
        "errors": errors
    }


@router.delete("/entries/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_time_entry(entry_id: str):
    """
    Delete a time entry (only if DRAFT status)

    Args:
        entry_id: Time entry ID
    """
    try:
        entry = await TimeEntry.get(PydanticObjectId(entry_id))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Time entry {entry_id} not found"
        )

    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Time entry {entry_id} not found"
        )

    if entry.status != TimeEntryStatus.DRAFT:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete time entry with status: {entry.status}"
        )

    await entry.delete()

    return None


# ============================================================================
# TIMESHEET SUMMARY ENDPOINTS
# ============================================================================

@router.get("/summary/{employee_id}", response_model=dict)
async def get_employee_timesheet_summary(
    employee_id: str,
    start_date: date,
    end_date: date
):
    """
    Get summary of time entries for an employee over a date range

    Useful for displaying timesheet totals

    Args:
        employee_id: Employee ID
        start_date: Period start date
        end_date: Period end date

    Returns:
        Summary with total hours and breakdown
    """
    # Fetch time entries for the period
    entries = await TimeEntry.find({
        "employee_id": employee_id,
        "work_date": {"$gte": start_date, "$lte": end_date}
    }).to_list()

    # Calculate totals
    total_hours = sum(e.hours_worked for e in entries)
    total_regular = sum(e.regular_hours for e in entries)
    total_overtime = sum(e.overtime_hours for e in entries)
    total_double_time = sum(e.double_time_hours for e in entries)

    # Group by status
    status_counts = {}
    for entry in entries:
        status_counts[entry.status] = status_counts.get(entry.status, 0) + 1

    return {
        "employee_id": employee_id,
        "period_start": start_date,
        "period_end": end_date,
        "total_entries": len(entries),
        "total_hours_worked": round(total_hours, 2),
        "total_regular_hours": round(total_regular, 2),
        "total_overtime_hours": round(total_overtime, 2),
        "total_double_time_hours": round(total_double_time, 2),
        "status_breakdown": status_counts,
        "entries": [e.dict() for e in entries]
    }
