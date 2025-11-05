"""
Employee MongoDB Schema

Beanie Document model for employee records with comprehensive
Canadian payroll fields including statutory components, compensation,
and personal information.
"""

from beanie import Document, Indexed
from pydantic import EmailStr, Field
from typing import Optional, List
from datetime import datetime, date
from enum import Enum


class Province(str, Enum):
    """Canadian Provinces and Territories"""
    AB = "Alberta"
    BC = "British Columbia"
    MB = "Manitoba"
    NB = "New Brunswick"
    NL = "Newfoundland and Labrador"
    NS = "Nova Scotia"
    NT = "Northwest Territories"
    NU = "Nunavut"
    ON = "Ontario"
    PE = "Prince Edward Island"
    QC = "Quebec"
    SK = "Saskatchewan"
    YT = "Yukon"


class WorkerCategory(str, Enum):
    """Worker Category Types"""
    DIRECT_EMPLOYEE = "direct_employee"
    CONTRACT_WORKER = "contract_worker"
    AGENT_WORKER = "agent_worker"


class EmploymentType(str, Enum):
    """Employment Types"""
    FULL_TIME = "full_time"
    PART_TIME = "part_time"
    SEASONAL = "seasonal"
    TEMPORARY = "temporary"


class Gender(str, Enum):
    """Gender Options"""
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"
    PREFER_NOT_TO_SAY = "prefer_not_to_say"


class MaritalStatus(str, Enum):
    """Marital Status Options"""
    SINGLE = "single"
    MARRIED = "married"
    COMMON_LAW = "common_law"
    SEPARATED = "separated"
    DIVORCED = "divorced"
    WIDOWED = "widowed"


class PayFrequency(str, Enum):
    """Pay Frequency Options"""
    WEEKLY = "weekly"
    BIWEEKLY = "biweekly"
    SEMI_MONTHLY = "semi_monthly"
    MONTHLY = "monthly"


class Address(BaseModel):
    """Address Information"""
    street: Optional[str] = None
    city: Optional[str] = None
    province: Optional[Province] = None
    postal_code: Optional[str] = None
    country: str = "Canada"


class EmergencyContact(BaseModel):
    """Emergency Contact Information"""
    name: Optional[str] = None
    relationship: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None


class BankAccount(BaseModel):
    """Bank Account Details for Direct Deposit"""
    institution_number: Optional[str] = None
    transit_number: Optional[str] = None
    account_number: Optional[str] = None
    account_type: Optional[str] = "checking"  # checking or savings


class StatutoryComponents(BaseModel):
    """Statutory Deduction Eligibility"""
    cpp_eligible: bool = True
    ei_eligible: bool = True
    qpip_eligible: bool = False  # Quebec only
    income_tax_exempt: bool = False


class TD1Info(BaseModel):
    """Federal TD1 Tax Form Information"""
    basic_personal_amount: Optional[float] = None
    age_amount: Optional[float] = None
    pension_income_amount: Optional[float] = None
    disability_amount: Optional[float] = None
    caregiver_amount: Optional[float] = None
    dependant_amount: Optional[float] = None
    canada_employment_amount: Optional[float] = None
    total_claim_amount: Optional[float] = None
    additional_tax_requested: Optional[float] = None


class YTDCarryIn(BaseModel):
    """Year-to-Date Carry-In Values"""
    gross_earnings: float = 0.0
    cpp_contributions: float = 0.0
    cpp2_contributions: float = 0.0
    ei_premiums: float = 0.0
    federal_tax: float = 0.0
    provincial_tax: float = 0.0


class Education(BaseModel):
    """Education Record"""
    institution: Optional[str] = None
    degree: Optional[str] = None
    field_of_study: Optional[str] = None
    graduation_year: Optional[int] = None


class WorkExperience(BaseModel):
    """Work Experience Record"""
    company: Optional[str] = None
    position: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    description: Optional[str] = None


from pydantic import BaseModel


class Employee(Document):
    """
    Employee Document Model

    Stores comprehensive employee information including personal details,
    job information, compensation, statutory settings, and banking details.
    """

    # Personal Information
    first_name: Indexed(str)
    last_name: Indexed(str)
    email: Indexed(EmailStr, unique=True)
    phone: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[Gender] = None
    sin: Optional[str] = None  # Social Insurance Number (encrypted in production)
    marital_status: Optional[MaritalStatus] = None
    nationality: str = "Canadian"
    language_preference: str = "English"
    residential_address: Optional[Address] = None

    # Job Information
    employee_number: Indexed(str, unique=True)
    worker_category: WorkerCategory = WorkerCategory.DIRECT_EMPLOYEE
    employment_type: EmploymentType = EmploymentType.FULL_TIME
    job_title: Optional[str] = None
    department_id: Optional[str] = None
    department_name: Optional[str] = None
    manager_id: Optional[str] = None
    manager_name: Optional[str] = None
    work_location_id: Optional[str] = None
    work_location_name: Optional[str] = None
    designation_id: Optional[str] = None
    designation_name: Optional[str] = None
    hire_date: Optional[date] = None
    termination_date: Optional[date] = None
    province_of_employment: Province = Province.ON

    # Compensation & Benefits
    annual_salary: Optional[float] = None
    hourly_rate: Optional[float] = None
    pay_frequency: PayFrequency = PayFrequency.BIWEEKLY

    # Statutory Components
    statutory: StatutoryComponents = Field(default_factory=StatutoryComponents)

    # Tax Information
    td1_federal: Optional[TD1Info] = None
    td1_provincial: Optional[TD1Info] = None
    ytd_carry_in: YTDCarryIn = Field(default_factory=YTDCarryIn)

    # Payment Information
    payment_method: str = "direct_deposit"
    bank_account: Optional[BankAccount] = None

    # Emergency Contact
    emergency_contact: Optional[EmergencyContact] = None

    # Experience & Education
    education: List[Education] = []
    work_experience: List[WorkExperience] = []
    skills: List[str] = []
    languages: List[str] = ["English"]

    # Status & Metadata
    status: str = "active"  # active, inactive, terminated
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: Optional[str] = None
    updated_by: Optional[str] = None

    class Settings:
        name = "employees"
        indexes = [
            "employee_number",
            "email",
            "first_name",
            "last_name",
            "status",
            "worker_category",
            "department_id",
            "work_location_id"
        ]

    class Config:
        json_schema_extra = {
            "example": {
                "first_name": "John",
                "last_name": "Smith",
                "email": "john.smith@example.com",
                "phone": "+1-416-555-0123",
                "employee_number": "EMP001",
                "worker_category": "direct_employee",
                "employment_type": "full_time",
                "job_title": "Software Developer",
                "province_of_employment": "Ontario",
                "annual_salary": 85000.00,
                "pay_frequency": "biweekly",
                "status": "active"
            }
        }
