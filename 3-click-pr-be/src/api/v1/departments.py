"""
Departments API Endpoints

Endpoints for managing departments within the organization.
"""

from fastapi import APIRouter, HTTPException, status
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from src.schemas.organization import Department

router = APIRouter()


# Department Schemas
class DepartmentCreate(BaseModel):
    """Schema for creating a department"""
    name: str
    code: Optional[str] = None
    description: Optional[str] = None
    manager_id: Optional[str] = None
    manager_name: Optional[str] = None


class DepartmentUpdate(BaseModel):
    """Schema for updating a department"""
    name: Optional[str] = None
    code: Optional[str] = None
    description: Optional[str] = None
    manager_id: Optional[str] = None
    manager_name: Optional[str] = None
    is_active: Optional[bool] = None


class DepartmentResponse(BaseModel):
    """Schema for department response"""
    id: str
    name: str
    code: Optional[str] = None
    description: Optional[str] = None
    manager_id: Optional[str] = None
    manager_name: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime
    total_employees: int = 0

    class Config:
        from_attributes = True


# Department Endpoints
@router.get("/", response_model=List[DepartmentResponse])
async def get_departments(
    is_active: Optional[bool] = None
):
    """Get all departments"""
    query = {}
    if is_active is not None:
        query["is_active"] = is_active

    departments = await Department.find(query).to_list()

    # TODO: Calculate total_employees by querying Employee collection
    # For now, returning 0 as placeholder
    return [
        DepartmentResponse(
            id=str(dept.id),
            name=dept.name,
            code=dept.code,
            description=dept.description,
            manager_id=dept.manager_id,
            manager_name=dept.manager_name,
            is_active=dept.is_active,
            created_at=dept.created_at,
            updated_at=dept.updated_at,
            total_employees=0
        )
        for dept in departments
    ]


@router.get("/{department_id}", response_model=DepartmentResponse)
async def get_department(department_id: str):
    """Get a specific department by ID"""
    department = await Department.get(department_id)

    if not department:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Department with ID {department_id} not found"
        )

    return DepartmentResponse(
        id=str(department.id),
        name=department.name,
        code=department.code,
        description=department.description,
        manager_id=department.manager_id,
        manager_name=department.manager_name,
        is_active=department.is_active,
        created_at=department.created_at,
        updated_at=department.updated_at,
        total_employees=0
    )


@router.post("/", response_model=DepartmentResponse, status_code=status.HTTP_201_CREATED)
async def create_department(department_data: DepartmentCreate):
    """Create a new department"""
    # Check if department with same name already exists
    existing = await Department.find_one({"name": department_data.name})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Department with name '{department_data.name}' already exists"
        )

    # Check if department code is unique (if provided)
    if department_data.code:
        existing_code = await Department.find_one({"code": department_data.code})
        if existing_code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Department with code '{department_data.code}' already exists"
            )

    # Create the department document
    department = Department(
        name=department_data.name,
        code=department_data.code,
        description=department_data.description,
        manager_id=department_data.manager_id,
        manager_name=department_data.manager_name,
        is_active=True,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )

    await department.insert()

    return DepartmentResponse(
        id=str(department.id),
        name=department.name,
        code=department.code,
        description=department.description,
        manager_id=department.manager_id,
        manager_name=department.manager_name,
        is_active=department.is_active,
        created_at=department.created_at,
        updated_at=department.updated_at,
        total_employees=0
    )


@router.put("/{department_id}", response_model=DepartmentResponse)
async def update_department(department_id: str, department_data: DepartmentUpdate):
    """Update an existing department"""
    department = await Department.get(department_id)

    if not department:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Department with ID {department_id} not found"
        )

    # Check if updating name and it conflicts with another department
    if department_data.name and department_data.name != department.name:
        existing = await Department.find_one({"name": department_data.name})
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Department with name '{department_data.name}' already exists"
            )

    # Check if updating code and it conflicts with another department
    if department_data.code and department_data.code != department.code:
        existing_code = await Department.find_one({"code": department_data.code})
        if existing_code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Department with code '{department_data.code}' already exists"
            )

    # Update only provided fields
    update_dict = department_data.dict(exclude_unset=True)
    update_dict["updated_at"] = datetime.utcnow()

    for field, value in update_dict.items():
        setattr(department, field, value)

    await department.save()

    return DepartmentResponse(
        id=str(department.id),
        name=department.name,
        code=department.code,
        description=department.description,
        manager_id=department.manager_id,
        manager_name=department.manager_name,
        is_active=department.is_active,
        created_at=department.created_at,
        updated_at=department.updated_at,
        total_employees=0
    )


@router.delete("/{department_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_department(department_id: str):
    """Delete a department"""
    department = await Department.get(department_id)

    if not department:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Department with ID {department_id} not found"
        )

    # TODO: Check if department has employees and prevent deletion
    # or cascade update employees to set department_id to None

    await department.delete()
    return None
