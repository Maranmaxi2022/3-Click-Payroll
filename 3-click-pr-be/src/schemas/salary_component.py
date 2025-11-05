"""
Salary Component MongoDB Schema

Beanie Document model for configurable salary components including
earnings, deductions, benefits, and reimbursements.
"""

from beanie import Document
from pydantic import Field
from typing import Optional
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
                "is_active": True
            }
        }
