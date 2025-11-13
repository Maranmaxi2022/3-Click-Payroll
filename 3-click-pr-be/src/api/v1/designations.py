"""
Designations API Endpoints

Endpoints for managing designations within the organization.
"""

from fastapi import APIRouter, HTTPException, status
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from src.schemas.organization import Designation
from src.schemas.employee import Employee

router = APIRouter()


# Designation Schemas
class DesignationCreate(BaseModel):
    """Schema for creating a designation"""
    title: str
    code: Optional[str] = None
    description: Optional[str] = None
    level: Optional[str] = None
    min_salary: Optional[float] = None
    max_salary: Optional[float] = None


class DesignationUpdate(BaseModel):
    """Schema for updating a designation"""
    title: Optional[str] = None
    code: Optional[str] = None
    description: Optional[str] = None
    level: Optional[str] = None
    min_salary: Optional[float] = None
    max_salary: Optional[float] = None
    is_active: Optional[bool] = None


class DesignationResponse(BaseModel):
    """Schema for designation response"""
    id: str
    title: str
    code: Optional[str] = None
    description: Optional[str] = None
    level: Optional[str] = None
    min_salary: Optional[float] = None
    max_salary: Optional[float] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime
    total_employees: int = 0

    class Config:
        from_attributes = True


# Designation Endpoints
@router.get("/", response_model=List[DesignationResponse])
async def get_designations(
    is_active: Optional[bool] = None
):
    """Get all designations"""
    query = {}
    if is_active is not None:
        query["is_active"] = is_active

    designations = await Designation.find(query).to_list()

    # Calculate total_employees for each designation
    result = []
    for desig in designations:
        # Count employees with this job_title (designation)
        employee_count = await Employee.find({"job_title": desig.title}).count()

        result.append(DesignationResponse(
            id=str(desig.id),
            title=desig.title,
            code=desig.code,
            description=desig.description,
            level=desig.level,
            min_salary=desig.min_salary,
            max_salary=desig.max_salary,
            is_active=desig.is_active,
            created_at=desig.created_at,
            updated_at=desig.updated_at,
            total_employees=employee_count
        ))

    return result


@router.get("/{designation_id}", response_model=DesignationResponse)
async def get_designation(designation_id: str):
    """Get a specific designation by ID"""
    designation = await Designation.get(designation_id)

    if not designation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Designation with ID {designation_id} not found"
        )

    # Count employees with this designation
    employee_count = await Employee.find({"job_title": designation.title}).count()

    return DesignationResponse(
        id=str(designation.id),
        title=designation.title,
        code=designation.code,
        description=designation.description,
        level=designation.level,
        min_salary=designation.min_salary,
        max_salary=designation.max_salary,
        is_active=designation.is_active,
        created_at=designation.created_at,
        updated_at=designation.updated_at,
        total_employees=employee_count
    )


@router.post("/", response_model=DesignationResponse, status_code=status.HTTP_201_CREATED)
async def create_designation(designation_data: DesignationCreate):
    """Create a new designation"""
    # Check if designation with same title already exists
    existing = await Designation.find_one({"title": designation_data.title})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Designation with title '{designation_data.title}' already exists"
        )

    # Check if designation code is unique (if provided)
    if designation_data.code:
        existing_code = await Designation.find_one({"code": designation_data.code})
        if existing_code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Designation with code '{designation_data.code}' already exists"
            )

    # Create the designation document
    designation = Designation(
        title=designation_data.title,
        code=designation_data.code,
        description=designation_data.description,
        level=designation_data.level,
        min_salary=designation_data.min_salary,
        max_salary=designation_data.max_salary,
        is_active=True,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )

    await designation.insert()

    return DesignationResponse(
        id=str(designation.id),
        title=designation.title,
        code=designation.code,
        description=designation.description,
        level=designation.level,
        min_salary=designation.min_salary,
        max_salary=designation.max_salary,
        is_active=designation.is_active,
        created_at=designation.created_at,
        updated_at=designation.updated_at,
        total_employees=0
    )


@router.put("/{designation_id}", response_model=DesignationResponse)
async def update_designation(designation_id: str, designation_data: DesignationUpdate):
    """Update an existing designation"""
    designation = await Designation.get(designation_id)

    if not designation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Designation with ID {designation_id} not found"
        )

    # Check if updating title and it conflicts with another designation
    if designation_data.title and designation_data.title != designation.title:
        existing = await Designation.find_one({"title": designation_data.title})
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Designation with title '{designation_data.title}' already exists"
            )

    # Check if updating code and it conflicts with another designation
    if designation_data.code and designation_data.code != designation.code:
        existing_code = await Designation.find_one({"code": designation_data.code})
        if existing_code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Designation with code '{designation_data.code}' already exists"
            )

    # Update only provided fields
    update_dict = designation_data.dict(exclude_unset=True)
    update_dict["updated_at"] = datetime.utcnow()

    for field, value in update_dict.items():
        setattr(designation, field, value)

    await designation.save()

    # Count employees with this designation
    employee_count = await Employee.find({"job_title": designation.title}).count()

    return DesignationResponse(
        id=str(designation.id),
        title=designation.title,
        code=designation.code,
        description=designation.description,
        level=designation.level,
        min_salary=designation.min_salary,
        max_salary=designation.max_salary,
        is_active=designation.is_active,
        created_at=designation.created_at,
        updated_at=designation.updated_at,
        total_employees=employee_count
    )


@router.delete("/{designation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_designation(designation_id: str):
    """Delete a designation"""
    designation = await Designation.get(designation_id)

    if not designation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Designation with ID {designation_id} not found"
        )

    # TODO: Check if designation has employees and prevent deletion
    # or cascade update employees to set job_title to None

    await designation.delete()
    return None
