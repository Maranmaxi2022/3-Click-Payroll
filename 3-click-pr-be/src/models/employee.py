"""
Employee Pydantic Models

Request and response models for Employee API endpoints.
"""

from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import date

from src.schemas.employee import (
    Province, WorkerCategory, EmploymentType, Gender,
    MaritalStatus, PayFrequency, Address, EmergencyContact,
    BankAccount, StatutoryComponents, TD1Info, YTDCarryIn,
    Education, WorkExperience
)


class EmployeeBase(BaseModel):
    """Base Employee Model with common fields"""
    first_name: str
    last_name: str
    email: EmailStr
    phone: Optional[str] = None
    worker_category: WorkerCategory = WorkerCategory.DIRECT_EMPLOYEE
    employment_type: EmploymentType = EmploymentType.FULL_TIME
    province_of_employment: Province = Province.ON


class EmployeeCreate(EmployeeBase):
    """Employee Creation Model"""
    employee_number: str
    job_title: Optional[str] = None
    department_id: Optional[str] = None
    department_name: Optional[str] = None
    manager_id: Optional[str] = None
    manager_name: Optional[str] = None
    work_location_id: Optional[str] = None
    hire_date: Optional[date] = None
    annual_salary: Optional[float] = None
    hourly_rate: Optional[float] = None
    pay_frequency: PayFrequency = PayFrequency.BIWEEKLY


class EmployeeUpdate(BaseModel):
    """Employee Update Model - all fields optional"""
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[Gender] = None
    sin: Optional[str] = None
    marital_status: Optional[MaritalStatus] = None
    nationality: Optional[str] = None
    language_preference: Optional[str] = None
    residential_address: Optional[Address] = None

    worker_category: Optional[WorkerCategory] = None
    employment_type: Optional[EmploymentType] = None
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
    province_of_employment: Optional[Province] = None

    annual_salary: Optional[float] = None
    hourly_rate: Optional[float] = None
    pay_frequency: Optional[PayFrequency] = None

    statutory: Optional[StatutoryComponents] = None
    td1_federal: Optional[TD1Info] = None
    td1_provincial: Optional[TD1Info] = None
    ytd_carry_in: Optional[YTDCarryIn] = None

    payment_method: Optional[str] = None
    bank_account: Optional[BankAccount] = None
    emergency_contact: Optional[EmergencyContact] = None

    education: Optional[List[Education]] = None
    work_experience: Optional[List[WorkExperience]] = None
    skills: Optional[List[str]] = None
    languages: Optional[List[str]] = None

    status: Optional[str] = None


class EmployeeResponse(EmployeeBase):
    """Employee Response Model"""
    id: str
    employee_number: str
    date_of_birth: Optional[date] = None
    gender: Optional[Gender] = None
    marital_status: Optional[MaritalStatus] = None
    job_title: Optional[str] = None
    department_name: Optional[str] = None
    manager_name: Optional[str] = None
    work_location_name: Optional[str] = None
    hire_date: Optional[date] = None
    annual_salary: Optional[float] = None
    pay_frequency: PayFrequency
    status: str

    class Config:
        from_attributes = True


class EmployeeListResponse(BaseModel):
    """Employee List Response with Pagination"""
    total: int
    page: int
    page_size: int
    employees: List[EmployeeResponse]


class EmployeeEligibilityResponse(BaseModel):
    """Employee Eligibility Check Response"""
    employee_id: str
    employee_name: str
    worker_category: str
    cpp_eligible: bool
    cpp2_eligible: bool
    ei_eligible: bool
    qpip_eligible: bool
    benefits_eligible: bool
    vacation_pay_eligible: bool
    statutory_holidays_eligible: bool
    overtime_eligible: bool
    tax_slip_type: str
