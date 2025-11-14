"""
Settings API Endpoints

Endpoints for managing payroll settings, salary components,
statutory settings, and organization configuration.
"""

from fastapi import APIRouter, HTTPException, status
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from src.schemas.organization import WorkLocation, Organization

router = APIRouter()


# Work Location Schemas
class WorkLocationCreate(BaseModel):
    """Schema for creating a work location"""
    name: str
    code: Optional[str] = None
    street: Optional[str] = None
    city: Optional[str] = None
    province: Optional[str] = None
    postal_code: Optional[str] = None
    country: str = "Canada"
    phone: Optional[str] = None


class WorkLocationUpdate(BaseModel):
    """Schema for updating a work location"""
    name: Optional[str] = None
    code: Optional[str] = None
    street: Optional[str] = None
    city: Optional[str] = None
    province: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None
    phone: Optional[str] = None
    is_active: Optional[bool] = None


class WorkLocationResponse(BaseModel):
    """Schema for work location response"""
    id: str
    name: str
    code: Optional[str] = None
    street: Optional[str] = None
    city: Optional[str] = None
    province: Optional[str] = None
    postal_code: Optional[str] = None
    country: str
    phone: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Organization Schemas
class OrganizationUpdate(BaseModel):
    """Schema for updating organization settings"""
    company_name: Optional[str] = None
    legal_name: Optional[str] = None
    business_number: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    street: Optional[str] = None
    city: Optional[str] = None
    province: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None
    logo_url: Optional[str] = None
    primary_color: Optional[str] = None
    accent_color: Optional[str] = None
    appearance: Optional[str] = None
    # Additional fields for Profile settings
    business_location: Optional[str] = None  # Reference to WorkLocation ID
    industry: Optional[str] = None
    date_format: Optional[str] = None
    field_separator: Optional[str] = None
    filing_location_id: Optional[str] = None  # Reference to WorkLocation for filing


class OrganizationResponse(BaseModel):
    """Schema for organization response"""
    id: str
    company_name: str
    legal_name: Optional[str] = None
    business_number: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    street: Optional[str] = None
    city: Optional[str] = None
    province: Optional[str] = None
    postal_code: Optional[str] = None
    country: str
    logo_url: Optional[str] = None
    primary_color: str
    accent_color: str
    appearance: str
    business_location: Optional[str] = None
    industry: Optional[str] = None
    date_format: Optional[str] = None
    field_separator: Optional[str] = None
    filing_location_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


@router.get("/salary-components")
async def get_salary_components():
    """Get all salary components"""
    return {
        "message": "Salary components endpoint - coming soon",
        "components": []
    }


@router.post("/salary-components")
async def create_salary_component():
    """Create a salary component"""
    return {
        "message": "Create salary component - coming soon"
    }


@router.get("/statutory")
async def get_statutory_settings():
    """Get statutory settings"""
    return {
        "message": "Statutory settings endpoint - coming soon"
    }


@router.put("/statutory")
async def update_statutory_settings():
    """Update statutory settings"""
    return {
        "message": "Update statutory settings - coming soon"
    }


@router.get("/organization", response_model=OrganizationResponse)
async def get_organization():
    """Get organization settings"""
    # Get the first (and should be only) organization
    org = await Organization.find_one()

    if not org:
        # Create a default organization if none exists
        org = Organization(
            company_name="My Company",
            country="Canada",
            primary_color="#3B82F6",
            accent_color="blue",
            appearance="light",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        await org.insert()

    return OrganizationResponse(
        id=str(org.id),
        company_name=org.company_name,
        legal_name=org.legal_name,
        business_number=org.business_number,
        email=org.email,
        phone=org.phone,
        website=org.website,
        street=org.street,
        city=org.city,
        province=org.province,
        postal_code=org.postal_code,
        country=org.country,
        logo_url=org.logo_url,
        primary_color=org.primary_color,
        accent_color=org.accent_color,
        appearance=org.appearance,
        business_location=org.business_location,
        industry=org.industry,
        date_format=org.date_format,
        field_separator=org.field_separator,
        filing_location_id=org.filing_location_id,
        created_at=org.created_at,
        updated_at=org.updated_at
    )


@router.put("/organization", response_model=OrganizationResponse)
async def update_organization(org_data: OrganizationUpdate):
    """Update organization settings"""
    # Get the first (and should be only) organization
    org = await Organization.find_one()

    if not org:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found. Please create one first."
        )

    # Update only provided fields
    update_dict = org_data.dict(exclude_unset=True)
    update_dict["updated_at"] = datetime.utcnow()

    for field, value in update_dict.items():
        setattr(org, field, value)

    await org.save()

    return OrganizationResponse(
        id=str(org.id),
        company_name=org.company_name,
        legal_name=org.legal_name,
        business_number=org.business_number,
        email=org.email,
        phone=org.phone,
        website=org.website,
        street=org.street,
        city=org.city,
        province=org.province,
        postal_code=org.postal_code,
        country=org.country,
        logo_url=org.logo_url,
        primary_color=org.primary_color,
        accent_color=org.accent_color,
        appearance=org.appearance,
        business_location=org.business_location,
        industry=org.industry,
        date_format=org.date_format,
        field_separator=org.field_separator,
        filing_location_id=org.filing_location_id,
        created_at=org.created_at,
        updated_at=org.updated_at
    )


# Work Location Endpoints
@router.get("/work-locations", response_model=List[WorkLocationResponse])
async def get_work_locations(
    is_active: Optional[bool] = None
):
    """Get all work locations"""
    query = {}
    if is_active is not None:
        query["is_active"] = is_active

    locations = await WorkLocation.find(query).to_list()

    return [
        WorkLocationResponse(
            id=str(location.id),
            name=location.name,
            code=location.code,
            street=location.street,
            city=location.city,
            province=location.province,
            postal_code=location.postal_code,
            country=location.country,
            phone=location.phone,
            is_active=location.is_active,
            created_at=location.created_at,
            updated_at=location.updated_at
        )
        for location in locations
    ]


@router.get("/work-locations/{location_id}", response_model=WorkLocationResponse)
async def get_work_location(location_id: str):
    """Get a specific work location by ID"""
    location = await WorkLocation.get(location_id)

    if not location:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Work location with ID {location_id} not found"
        )

    return WorkLocationResponse(
        id=str(location.id),
        name=location.name,
        code=location.code,
        street=location.street,
        city=location.city,
        province=location.province,
        postal_code=location.postal_code,
        country=location.country,
        phone=location.phone,
        is_active=location.is_active,
        created_at=location.created_at,
        updated_at=location.updated_at
    )


@router.post("/work-locations", response_model=WorkLocationResponse, status_code=status.HTTP_201_CREATED)
async def create_work_location(location_data: WorkLocationCreate):
    """Create a new work location"""
    # Create the work location document
    location = WorkLocation(
        name=location_data.name,
        code=location_data.code,
        street=location_data.street,
        city=location_data.city,
        province=location_data.province,
        postal_code=location_data.postal_code,
        country=location_data.country,
        phone=location_data.phone,
        is_active=True,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )

    await location.insert()

    return WorkLocationResponse(
        id=str(location.id),
        name=location.name,
        code=location.code,
        street=location.street,
        city=location.city,
        province=location.province,
        postal_code=location.postal_code,
        country=location.country,
        phone=location.phone,
        is_active=location.is_active,
        created_at=location.created_at,
        updated_at=location.updated_at
    )


@router.put("/work-locations/{location_id}", response_model=WorkLocationResponse)
async def update_work_location(location_id: str, location_data: WorkLocationUpdate):
    """Update an existing work location"""
    location = await WorkLocation.get(location_id)

    if not location:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Work location with ID {location_id} not found"
        )

    # Update only provided fields
    update_dict = location_data.dict(exclude_unset=True)
    update_dict["updated_at"] = datetime.utcnow()

    for field, value in update_dict.items():
        setattr(location, field, value)

    await location.save()

    return WorkLocationResponse(
        id=str(location.id),
        name=location.name,
        code=location.code,
        street=location.street,
        city=location.city,
        province=location.province,
        postal_code=location.postal_code,
        country=location.country,
        phone=location.phone,
        is_active=location.is_active,
        created_at=location.created_at,
        updated_at=location.updated_at
    )


@router.delete("/work-locations/{location_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_work_location(location_id: str):
    """Delete a work location"""
    location = await WorkLocation.get(location_id)

    if not location:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Work location with ID {location_id} not found"
        )

    await location.delete()
    return None
