"""
Statutory Setting MongoDB Schema

Beanie Document model for statutory deduction settings and constants
including CPP, CPP2, EI, and provincial tax rates.
"""

from beanie import Document
from pydantic import Field
from typing import Optional, Dict
from datetime import datetime


class StatutorySetting(Document):
    """
    Statutory Setting Document Model

    Stores Canadian statutory deduction rates and constants for
    CPP, CPP2, EI, QPIP, and tax calculations.
    """

    # Year
    tax_year: int

    # CPP Constants
    cpp_rate: float = 0.0595  # 5.95% for 2025
    cpp_basic_exemption: float = 3500.0
    cpp_ympe: float = 71300.0  # Year's Maximum Pensionable Earnings
    cpp_max_contribution: float = 4034.10

    # CPP2 Constants (Additional CPP)
    cpp2_rate: float = 0.04  # 4% for 2025
    cpp2_yampe: float = 81200.0  # Year's Additional Maximum Pensionable Earnings
    cpp2_max_contribution: float = 396.0

    # EI Constants
    ei_rate: float = 0.0164  # 1.64% for 2025 (federal)
    ei_rate_quebec: float = 0.0127  # 1.27% for Quebec
    ei_max_insurable: float = 65700.0
    ei_max_premium: float = 1077.48
    ei_max_premium_quebec: float = 834.39

    # QPIP Constants (Quebec Parental Insurance Plan)
    qpip_employee_rate: float = 0.00494  # 0.494%
    qpip_max_insurable: float = 94000.0

    # Federal Tax Brackets (simplified - actual implementation needs all brackets)
    federal_tax_brackets: Dict[str, float] = {
        "0-55867": 0.15,
        "55867-111733": 0.205,
        "111733-173205": 0.26,
        "173205-246752": 0.29,
        "246752+": 0.33
    }

    # Provincial Tax Rates (by province code)
    provincial_tax_rates: Dict[str, Dict[str, float]] = {}

    # Basic Personal Amount (Federal)
    federal_basic_personal_amount: float = 15705.0  # 2025

    # Provincial Basic Personal Amounts
    provincial_basic_personal_amounts: Dict[str, float] = {
        "AB": 21885.0,
        "BC": 12580.0,
        "MB": 10855.0,
        "NB": 13044.0,
        "NL": 10382.0,
        "NS": 8744.0,
        "NT": 16593.0,
        "NU": 17925.0,
        "ON": 11865.0,
        "PE": 13500.0,
        "QC": 18056.0,
        "SK": 18491.0,
        "YT": 15705.0
    }

    # Status
    is_active: bool = True
    effective_date: Optional[datetime] = None

    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: Optional[str] = None

    class Settings:
        name = "statutory_settings"
        indexes = ["tax_year", "is_active"]

    class Config:
        json_schema_extra = {
            "example": {
                "tax_year": 2025,
                "cpp_rate": 0.0595,
                "cpp_ympe": 71300.0,
                "ei_rate": 0.0164,
                "is_active": True
            }
        }
