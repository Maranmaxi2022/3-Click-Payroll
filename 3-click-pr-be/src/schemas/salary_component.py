"""
Salary Component MongoDB Schema

Beanie Document model for configurable salary components including
earnings, deductions, benefits, and reimbursements.
"""

from beanie import Document
from pydantic import Field, BaseModel
from typing import Optional, List
from datetime import datetime
from enum import Enum


class ComponentType(str, Enum):
    """Salary Component Type"""
    EARNING = "earning"
    DEDUCTION = "deduction"
    BENEFIT = "benefit"
    REIMBURSEMENT = "reimbursement"


class CalculationType(str, Enum):
    """Calculation Method"""
    FIXED = "fixed"
    PERCENTAGE_OF_BASIC = "percentage_of_basic"
    PERCENTAGE_OF_GROSS = "percentage_of_gross"
    HOURLY_RATE = "hourly_rate"
    USER_DEFINED = "user_defined"


class SalaryComponent(Document):
    """
    Salary Component Document Model

    Defines configurable salary components like earnings, deductions,
    benefits, and reimbursements with calculation rules.
    """

    # Component Details
    name: str
    display_name: str
    component_type: ComponentType
    calculation_type: CalculationType = CalculationType.FIXED

    # Calculation Parameters
    default_value: Optional[float] = None
    percentage: Optional[float] = None
    min_value: Optional[float] = None
    max_value: Optional[float] = None

    # Tax Treatment
    taxable: bool = True
    affects_cpp: bool = True
    affects_ei: bool = True

    # Status & Configuration
    is_statutory: bool = False  # True for CPP, EI, Income Tax
    is_active: bool = True
    is_default: bool = False
    display_order: int = 0

    # Position/Designation Applicability
    applicable_designations: List[str] = Field(default_factory=list)  # Empty = applies to all
    applies_to_all_designations: bool = True

    # Metadata
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: Optional[str] = None

    class Settings:
        name = "salary_components"
        indexes = [
            "component_type",
            "is_active",
            "name"
        ]

    class Config:
        json_schema_extra = {
            "example": {
                "name": "overtime",
                "display_name": "Overtime Pay",
                "component_type": "earning",
                "calculation_type": "hourly_rate",
                "taxable": True,
                "affects_cpp": True,
                "affects_ei": True,
                "is_active": True,
                "applicable_designations": ["software_engineer", "senior_software_engineer"],
                "applies_to_all_designations": False
            }
        }


class ComponentOverrideValue(BaseModel):
    """Override values for employee-specific component customization"""
    default_value: Optional[float] = None
    percentage: Optional[float] = None
    is_active: bool = True


class EmployeeComponentOverride(Document):
    """
    Employee-specific salary component overrides

    Allows customization of component values or disabling components
    for individual employees, overriding their designation defaults.
    """

    employee_id: str
    component_id: str
    component_name: str
    component_type: ComponentType

    # Override values
    override_values: Optional[ComponentOverrideValue] = None
    is_enabled: bool = True  # False = disable this component for this employee

    # Metadata
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: Optional[str] = None

    class Settings:
        name = "employee_component_overrides"
        indexes = [
            "employee_id",
            "component_id",
            [("employee_id", 1), ("component_id", 1)]  # Compound unique index
        ]


class DesignationComponentMapping(Document):
    """
    Maps salary components to designations with position-specific defaults

    Defines which components apply to which designations and allows
    position-specific default values (e.g., PM gets higher housing allowance).
    """

    designation_id: str
    designation_name: str
    component_id: str
    component_name: str
    component_type: ComponentType

    # Position-specific defaults (override component defaults)
    is_mandatory: bool = True  # Cannot be disabled for this position
    default_value: Optional[float] = None
    percentage: Optional[float] = None

    # Status
    is_active: bool = True
    display_order: int = 0

    # Metadata
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: Optional[str] = None

    class Settings:
        name = "designation_component_mappings"
        indexes = [
            "designation_id",
            "component_id",
            "component_type",
            [("designation_id", 1), ("component_id", 1)]  # Compound unique index
        ]
