"""
Settings API Endpoints

Endpoints for managing payroll settings, salary components,
statutory settings, and organization configuration.
"""

from fastapi import APIRouter, HTTPException, status, UploadFile, File
from fastapi.responses import FileResponse
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import os
import uuid
from pathlib import Path

from src.schemas.organization import WorkLocation, Organization
from src.schemas.salary_component import (
    SalaryComponent,
    ComponentType,
    CalculationType,
    DesignationComponentMapping,
    EmployeeComponentOverride
)
from src.services.component_resolution_service import ComponentResolutionService

router = APIRouter()

# Base directory for file uploads
UPLOAD_DIR = Path("uploads/logos")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Allowed file extensions
ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg"}
MAX_FILE_SIZE = 1 * 1024 * 1024  # 1MB


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


# Salary Component Schemas
class SalaryComponentCreate(BaseModel):
    """Schema for creating a salary component"""
    name: str
    display_name: str
    component_type: ComponentType
    calculation_type: CalculationType = CalculationType.FIXED
    default_value: Optional[float] = None
    percentage: Optional[float] = None
    min_value: Optional[float] = None
    max_value: Optional[float] = None
    taxable: bool = True
    affects_cpp: bool = True
    affects_ei: bool = True
    is_statutory: bool = False
    is_default: bool = False
    display_order: int = 0
    description: Optional[str] = None
    applicable_designations: List[str] = []
    applies_to_all_designations: bool = True


class SalaryComponentUpdate(BaseModel):
    """Schema for updating a salary component"""
    name: Optional[str] = None
    display_name: Optional[str] = None
    calculation_type: Optional[CalculationType] = None
    default_value: Optional[float] = None
    percentage: Optional[float] = None
    min_value: Optional[float] = None
    max_value: Optional[float] = None
    taxable: Optional[bool] = None
    affects_cpp: Optional[bool] = None
    affects_ei: Optional[bool] = None
    is_active: Optional[bool] = None
    is_default: Optional[bool] = None
    display_order: Optional[int] = None
    description: Optional[str] = None
    applicable_designations: Optional[List[str]] = None
    applies_to_all_designations: Optional[bool] = None


class SalaryComponentResponse(BaseModel):
    """Schema for salary component response"""
    id: str
    name: str
    display_name: str
    component_type: str
    calculation_type: str
    default_value: Optional[float] = None
    percentage: Optional[float] = None
    min_value: Optional[float] = None
    max_value: Optional[float] = None
    taxable: bool
    affects_cpp: bool
    affects_ei: bool
    is_statutory: bool
    is_active: bool
    is_default: bool
    display_order: int
    description: Optional[str] = None
    applicable_designations: List[str]
    applies_to_all_designations: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class DesignationComponentMappingCreate(BaseModel):
    """Schema for creating designation-component mapping"""
    designation_id: str
    component_id: str
    is_mandatory: bool = True
    default_value: Optional[float] = None
    percentage: Optional[float] = None
    notes: Optional[str] = None


class DesignationComponentMappingUpdate(BaseModel):
    """Schema for updating designation-component mapping"""
    is_mandatory: Optional[bool] = None
    default_value: Optional[float] = None
    percentage: Optional[float] = None
    is_active: Optional[bool] = None
    notes: Optional[str] = None


class EmployeeComponentOverrideCreate(BaseModel):
    """Schema for creating employee component override"""
    employee_id: str
    component_id: str
    is_enabled: bool = True
    override_default_value: Optional[float] = None
    override_percentage: Optional[float] = None
    notes: Optional[str] = None


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
    legal_structure: Optional[str] = None
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
    legal_structure: Optional[str] = None
    date_format: Optional[str] = None
    field_separator: Optional[str] = None
    filing_location_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


@router.get("/salary-components", response_model=List[SalaryComponentResponse])
async def get_salary_components(
    component_type: Optional[ComponentType] = None,
    is_active: Optional[bool] = None
):
    """Get all salary components"""
    query = {}
    if component_type:
        query["component_type"] = component_type
    if is_active is not None:
        query["is_active"] = is_active

    components = await SalaryComponent.find(query).sort("+display_order").to_list()

    return [
        SalaryComponentResponse(
            id=str(comp.id),
            name=comp.name,
            display_name=comp.display_name,
            component_type=comp.component_type.value,
            calculation_type=comp.calculation_type.value,
            default_value=comp.default_value,
            percentage=comp.percentage,
            min_value=comp.min_value,
            max_value=comp.max_value,
            taxable=comp.taxable,
            affects_cpp=comp.affects_cpp,
            affects_ei=comp.affects_ei,
            is_statutory=comp.is_statutory,
            is_active=comp.is_active,
            is_default=comp.is_default,
            display_order=comp.display_order,
            description=comp.description,
            applicable_designations=comp.applicable_designations,
            applies_to_all_designations=comp.applies_to_all_designations,
            created_at=comp.created_at,
            updated_at=comp.updated_at
        )
        for comp in components
    ]


@router.get("/salary-components/{component_id}", response_model=SalaryComponentResponse)
async def get_salary_component(component_id: str):
    """Get a specific salary component"""
    comp = await SalaryComponent.get(component_id)

    if not comp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Salary component with ID {component_id} not found"
        )

    return SalaryComponentResponse(
        id=str(comp.id),
        name=comp.name,
        display_name=comp.display_name,
        component_type=comp.component_type.value,
        calculation_type=comp.calculation_type.value,
        default_value=comp.default_value,
        percentage=comp.percentage,
        min_value=comp.min_value,
        max_value=comp.max_value,
        taxable=comp.taxable,
        affects_cpp=comp.affects_cpp,
        affects_ei=comp.affects_ei,
        is_statutory=comp.is_statutory,
        is_active=comp.is_active,
        is_default=comp.is_default,
        display_order=comp.display_order,
        description=comp.description,
        applicable_designations=comp.applicable_designations,
        applies_to_all_designations=comp.applies_to_all_designations,
        created_at=comp.created_at,
        updated_at=comp.updated_at
    )


@router.post("/salary-components", response_model=SalaryComponentResponse, status_code=status.HTTP_201_CREATED)
async def create_salary_component(component_data: SalaryComponentCreate):
    """Create a salary component"""
    # Check if component with same name already exists
    existing = await SalaryComponent.find_one({"name": component_data.name})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Component with name '{component_data.name}' already exists"
        )

    component = SalaryComponent(
        name=component_data.name,
        display_name=component_data.display_name,
        component_type=component_data.component_type,
        calculation_type=component_data.calculation_type,
        default_value=component_data.default_value,
        percentage=component_data.percentage,
        min_value=component_data.min_value,
        max_value=component_data.max_value,
        taxable=component_data.taxable,
        affects_cpp=component_data.affects_cpp,
        affects_ei=component_data.affects_ei,
        is_statutory=component_data.is_statutory,
        is_default=component_data.is_default,
        display_order=component_data.display_order,
        description=component_data.description,
        applicable_designations=component_data.applicable_designations,
        applies_to_all_designations=component_data.applies_to_all_designations,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )

    await component.insert()

    return SalaryComponentResponse(
        id=str(component.id),
        name=component.name,
        display_name=component.display_name,
        component_type=component.component_type.value,
        calculation_type=component.calculation_type.value,
        default_value=component.default_value,
        percentage=component.percentage,
        min_value=component.min_value,
        max_value=component.max_value,
        taxable=component.taxable,
        affects_cpp=component.affects_cpp,
        affects_ei=component.affects_ei,
        is_statutory=component.is_statutory,
        is_active=component.is_active,
        is_default=component.is_default,
        display_order=component.display_order,
        description=component.description,
        applicable_designations=component.applicable_designations,
        applies_to_all_designations=component.applies_to_all_designations,
        created_at=component.created_at,
        updated_at=component.updated_at
    )


@router.put("/salary-components/{component_id}", response_model=SalaryComponentResponse)
async def update_salary_component(component_id: str, component_data: SalaryComponentUpdate):
    """Update a salary component"""
    component = await SalaryComponent.get(component_id)

    if not component:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Salary component with ID {component_id} not found"
        )

    # Prevent updating statutory components
    if component.is_statutory:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot modify statutory components"
        )

    # Update only provided fields
    update_dict = component_data.dict(exclude_unset=True)
    update_dict["updated_at"] = datetime.utcnow()

    for field, value in update_dict.items():
        setattr(component, field, value)

    await component.save()

    return SalaryComponentResponse(
        id=str(component.id),
        name=component.name,
        display_name=component.display_name,
        component_type=component.component_type.value,
        calculation_type=component.calculation_type.value,
        default_value=component.default_value,
        percentage=component.percentage,
        min_value=component.min_value,
        max_value=component.max_value,
        taxable=component.taxable,
        affects_cpp=component.affects_cpp,
        affects_ei=component.affects_ei,
        is_statutory=component.is_statutory,
        is_active=component.is_active,
        is_default=component.is_default,
        display_order=component.display_order,
        description=component.description,
        applicable_designations=component.applicable_designations,
        applies_to_all_designations=component.applies_to_all_designations,
        created_at=component.created_at,
        updated_at=component.updated_at
    )


@router.delete("/salary-components/{component_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_salary_component(component_id: str):
    """Delete a salary component"""
    component = await SalaryComponent.get(component_id)

    if not component:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Salary component with ID {component_id} not found"
        )

    # Prevent deleting statutory components
    if component.is_statutory:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete statutory components"
        )

    await component.delete()
    return None


# Designation-Component Mapping Endpoints
@router.get("/designations/{designation_id}/components")
async def get_designation_components(designation_id: str):
    """Get all components for a designation with resolved values"""
    try:
        resolved = await ComponentResolutionService.get_components_for_designation(designation_id)
        return {"components": [rc.to_dict() for rc in resolved]}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.post("/designations/{designation_id}/components")
async def assign_component_to_designation(
    designation_id: str,
    mapping_data: DesignationComponentMappingCreate
):
    """Assign a component to a designation"""
    try:
        mapping = await ComponentResolutionService.assign_component_to_designation(
            designation_id=mapping_data.designation_id,
            component_id=mapping_data.component_id,
            is_mandatory=mapping_data.is_mandatory,
            default_value=mapping_data.default_value,
            percentage=mapping_data.percentage
        )
        return {
            "id": str(mapping.id),
            "designation_id": mapping.designation_id,
            "component_id": mapping.component_id,
            "is_mandatory": mapping.is_mandatory,
            "default_value": mapping.default_value,
            "percentage": mapping.percentage
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.delete("/designations/{designation_id}/components/{component_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_component_from_designation(designation_id: str, component_id: str):
    """Remove a component from a designation"""
    removed = await ComponentResolutionService.remove_component_from_designation(
        designation_id, component_id
    )

    if not removed:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mapping not found"
        )

    return None


# Employee Component Override Endpoints
@router.get("/employees/{employee_id}/components")
async def get_employee_components(employee_id: str):
    """Get all components for an employee with resolved values"""
    try:
        resolved = await ComponentResolutionService.get_components_for_employee(employee_id)
        return {"components": [rc.to_dict() for rc in resolved]}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.post("/employees/{employee_id}/component-overrides")
async def create_employee_component_override(
    employee_id: str,
    override_data: EmployeeComponentOverrideCreate
):
    """Create or update an employee component override"""
    try:
        override = await ComponentResolutionService.set_employee_component_override(
            employee_id=override_data.employee_id,
            component_id=override_data.component_id,
            is_enabled=override_data.is_enabled,
            override_default_value=override_data.override_default_value,
            override_percentage=override_data.override_percentage,
            notes=override_data.notes
        )
        return {
            "id": str(override.id),
            "employee_id": override.employee_id,
            "component_id": override.component_id,
            "is_enabled": override.is_enabled,
            "override_values": override.override_values
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.delete("/employees/{employee_id}/component-overrides/{component_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_employee_component_override(employee_id: str, component_id: str):
    """Delete an employee component override"""
    removed = await ComponentResolutionService.remove_employee_component_override(
        employee_id, component_id
    )

    if not removed:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Override not found"
        )

    return None


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
        # Create an empty organization if none exists
        org = Organization(
            company_name="",
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
        legal_structure=org.legal_structure,
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
        legal_structure=org.legal_structure,
        date_format=org.date_format,
        field_separator=org.field_separator,
        filing_location_id=org.filing_location_id,
        created_at=org.created_at,
        updated_at=org.updated_at
    )


@router.post("/organization/logo")
async def upload_organization_logo(file: UploadFile = File(...)):
    """Upload organization logo"""
    # Validate file extension
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    # Read file content to check size
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File size exceeds maximum allowed size of 1MB"
        )

    # Get organization
    org = await Organization.find_one()
    if not org:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found"
        )

    # Delete old logo if exists
    if org.logo_url:
        old_logo_path = Path(org.logo_url)
        if old_logo_path.exists():
            old_logo_path.unlink()

    # Generate unique filename
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = UPLOAD_DIR / unique_filename

    # Save file
    with open(file_path, "wb") as f:
        f.write(contents)

    # Update organization with logo URL
    org.logo_url = str(file_path)
    org.updated_at = datetime.utcnow()
    await org.save()

    return {
        "message": "Logo uploaded successfully",
        "logo_url": f"/api/v1/settings/organization/logo/{unique_filename}"
    }


@router.get("/organization/logo/{filename}")
async def get_organization_logo(filename: str):
    """Get organization logo file"""
    file_path = UPLOAD_DIR / filename

    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Logo not found"
        )

    return FileResponse(file_path)


@router.delete("/organization/logo")
async def delete_organization_logo():
    """Delete organization logo"""
    org = await Organization.find_one()

    if not org:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found"
        )

    if not org.logo_url:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No logo to delete"
        )

    # Delete file
    logo_path = Path(org.logo_url)
    if logo_path.exists():
        logo_path.unlink()

    # Update organization
    org.logo_url = None
    org.updated_at = datetime.utcnow()
    await org.save()

    return {"message": "Logo deleted successfully"}


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
