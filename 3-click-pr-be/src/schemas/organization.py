"""
Organization MongoDB Schemas

Beanie Document models for organization structure including
departments, work locations, designations, and company settings.
"""

from beanie import Document
from pydantic import Field, EmailStr
from typing import Optional
from datetime import datetime


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
