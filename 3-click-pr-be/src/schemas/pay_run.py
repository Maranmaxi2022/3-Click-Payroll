"""
Pay Run MongoDB Schema

Beanie Document model for payroll runs including individual pay periods,
statutory deductions, and net pay calculations.
"""

from beanie import Document
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, date
from enum import Enum


class PayRunStatus(str, Enum):
    """Pay Run Status"""
    DRAFT = "draft"
    CALCULATED = "calculated"
    APPROVED = "approved"
    PROCESSED = "processed"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class PayPeriodType(str, Enum):
    """Pay Period Type"""
    REGULAR = "regular"
    OFF_CYCLE = "off_cycle"
    BONUS = "bonus"
    FINAL = "final"


class Earning(BaseModel):
    """Individual Earning Line Item"""
    type: str  # regular, overtime, vacation, bonus, commission, etc.
    description: Optional[str] = None
    hours: Optional[float] = None
    rate: Optional[float] = None
    amount: float
    taxable: bool = True


class Deduction(BaseModel):
    """Individual Deduction Line Item"""
    type: str  # union_dues, garnishment, rrsp, etc.
    description: Optional[str] = None
    amount: float
    pre_tax: bool = False


class Benefit(BaseModel):
    """Individual Benefit Line Item"""
    type: str  # health, dental, life_insurance, etc.
    description: Optional[str] = None
    employee_contribution: float = 0.0
    employer_contribution: float = 0.0
    taxable: bool = False


class StatutoryDeductions(BaseModel):
    """Statutory Deduction Breakdown"""
    cpp_contribution: float = 0.0
    cpp2_contribution: float = 0.0
    ei_premium: float = 0.0
    qpip_premium: float = 0.0
    federal_tax: float = 0.0
    provincial_tax: float = 0.0
    total: float = 0.0


class PayPeriod(BaseModel):
    """
    Individual Employee Pay Period

    Represents one employee's pay for a specific pay period including
    earnings, deductions, statutory calculations, and net pay.
    """
    employee_id: str
    employee_number: str
    employee_name: str

    # Earnings
    earnings: List[Earning] = []
    gross_earnings: float = 0.0

    # Deductions
    deductions: List[Deduction] = []
    total_deductions: float = 0.0

    # Benefits
    benefits: List[Benefit] = []
    total_benefits: float = 0.0

    # Statutory Deductions
    statutory_deductions: StatutoryDeductions = Field(default_factory=StatutoryDeductions)

    # Taxable Income
    taxable_income: float = 0.0

    # Net Pay
    net_pay: float = 0.0

    # Year-to-Date Totals
    ytd_gross: float = 0.0
    ytd_cpp: float = 0.0
    ytd_cpp2: float = 0.0
    ytd_ei: float = 0.0
    ytd_federal_tax: float = 0.0
    ytd_provincial_tax: float = 0.0
    ytd_net: float = 0.0

    # Status
    status: str = "pending"  # pending, approved, paid
    payment_date: Optional[date] = None
    payment_method: str = "direct_deposit"


class PayRun(Document):
    """
    Pay Run Document Model

    Represents a complete payroll run for a specific pay period,
    containing multiple employee pay periods and summary totals.
    """

    # Pay Run Identification
    pay_run_number: str
    pay_run_name: Optional[str] = None
    pay_period_type: PayPeriodType = PayPeriodType.REGULAR

    # Pay Period Dates
    period_start_date: date
    period_end_date: date
    pay_date: date

    # Pay Periods (Individual Employee Payments)
    pay_periods: List[PayPeriod] = []

    # Summary Totals
    total_employees: int = 0
    total_gross_earnings: float = 0.0
    total_net_pay: float = 0.0
    total_cpp: float = 0.0
    total_cpp2: float = 0.0
    total_ei: float = 0.0
    total_federal_tax: float = 0.0
    total_provincial_tax: float = 0.0
    total_deductions: float = 0.0

    # Status & Workflow
    status: PayRunStatus = PayRunStatus.DRAFT
    calculated_at: Optional[datetime] = None
    approved_at: Optional[datetime] = None
    approved_by: Optional[str] = None
    processed_at: Optional[datetime] = None
    processed_by: Optional[str] = None

    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: Optional[str] = None
    updated_by: Optional[str] = None

    # Notes
    notes: Optional[str] = None

    class Settings:
        name = "pay_runs"
        indexes = [
            "pay_run_number",
            "status",
            "period_start_date",
            "period_end_date",
            "pay_date"
        ]

    class Config:
        json_schema_extra = {
            "example": {
                "pay_run_number": "PR-2025-001",
                "pay_run_name": "January 15, 2025 - Biweekly",
                "pay_period_type": "regular",
                "period_start_date": "2025-01-01",
                "period_end_date": "2025-01-15",
                "pay_date": "2025-01-20",
                "total_employees": 30,
                "total_gross_earnings": 75000.00,
                "total_net_pay": 55000.00,
                "status": "calculated"
            }
        }
