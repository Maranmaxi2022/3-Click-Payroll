"""
Organization MongoDB Schemas

Beanie Document models for organization structure including
departments, work locations, designations, and company settings.
"""

from beanie import Document
from pydantic import Field, EmailStr
from typing import Optional, List
from datetime import datetime
from enum import Enum


class PayFrequency(str, Enum):
    """Pay frequency options"""
    WEEKLY = "weekly"
    BIWEEKLY = "biweekly"
    MONTHLY = "monthly"


class PayRuleType(str, Enum):
    """Pay rule type options"""
    LAST_WORKING = "lastWorking"
    DAY = "day"


class SalaryBasis(str, Enum):
    """Salary calculation basis"""
    ACTUAL = "actual"
    ORG = "org"


class Organization(Document):
    """
    Organization Document Model

    Stores company information and settings.
    """

    # Company Information
    company_name: str
    legal_name: Optional[str] = None
    business_number: Optional[str] = None  # CRA Business Number

    # Contact Information
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    website: Optional[str] = None

    # Address
    street: Optional[str] = None
    city: Optional[str] = None
    province: Optional[str] = None
    postal_code: Optional[str] = None
    country: str = "Canada"

    # Branding
    logo_url: Optional[str] = None
    primary_color: str = "#3B82F6"  # blue-600
    accent_color: str = "blue"
    appearance: str = "light"  # light or dark

    # Profile Settings
    business_location: Optional[str] = None  # Reference to WorkLocation ID
    industry: Optional[str] = None
    legal_structure: Optional[str] = None
    date_format: Optional[str] = None
    field_separator: Optional[str] = None
    filing_location_id: Optional[str] = None  # Reference to WorkLocation for filing

    # Pay Schedule Settings (Default for new employees)
    default_pay_frequency: Optional[PayFrequency] = PayFrequency.MONTHLY
    work_week: List[bool] = Field(default_factory=lambda: [False, True, True, True, True, True, False])  # Sun-Sat
    salary_basis: Optional[SalaryBasis] = SalaryBasis.ACTUAL
    org_days_per_month: int = 26
    pay_rule_type: Optional[PayRuleType] = PayRuleType.DAY
    pay_day_of_month: int = 1  # For monthly: day of month (1-31), For weekly/biweekly: day of week (0-6)
    first_payroll_year: Optional[int] = None
    first_payroll_month: Optional[int] = None  # 1-12
    first_pay_date: Optional[datetime] = None

    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "organization"


class Department(Document):
    """
    Department Document Model

    Stores department information for employee organization.
    """

    # Department Details
    name: str
    code: Optional[str] = None
    description: Optional[str] = None

    # Manager
    manager_id: Optional[str] = None
    manager_name: Optional[str] = None

    # Status
    is_active: bool = True

    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: Optional[str] = None

    class Settings:
        name = "departments"
        indexes = ["name", "code", "is_active"]


class WorkLocation(Document):
    """
    Work Location Document Model

    Stores office/work location information.
    """

    # Location Details
    name: str
    code: Optional[str] = None

    # Address
    street: Optional[str] = None
    city: Optional[str] = None
    province: Optional[str] = None
    postal_code: Optional[str] = None
    country: str = "Canada"

    # Contact
    phone: Optional[str] = None

    # Status
    is_active: bool = True

    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: Optional[str] = None

    class Settings:
        name = "work_locations"
        indexes = ["name", "code", "is_active"]


class Designation(Document):
    """
    Designation Document Model

    Stores job designation/position titles.
    """

    # Designation Details
    title: str
    code: Optional[str] = None
    description: Optional[str] = None
    level: Optional[str] = None  # Junior, Intermediate, Senior, etc.

    # Salary Range
    min_salary: Optional[float] = None
    max_salary: Optional[float] = None

    # Status
    is_active: bool = True

    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: Optional[str] = None

    class Settings:
        name = "designations"
        indexes = ["title", "code", "is_active"]
