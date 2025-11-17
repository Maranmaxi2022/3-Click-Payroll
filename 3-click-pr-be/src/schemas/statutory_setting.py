"""
Statutory Setting MongoDB Schema

Beanie Document model for statutory deduction settings and constants
including CPP, CPP2, EI, and provincial tax rates.
"""

from beanie import Document
from pydantic import Field
from typing import Optional, Dict, List
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

    # Federal Tax Brackets (2025)
    federal_tax_brackets: List[Dict[str, float]] = [
        {"min": 0, "max": 55867, "rate": 0.15},
        {"min": 55867, "max": 111733, "rate": 0.205},
        {"min": 111733, "max": 173205, "rate": 0.26},
        {"min": 173205, "max": 246752, "rate": 0.29},
        {"min": 246752, "max": float('inf'), "rate": 0.33}
    ]

    # Provincial Tax Brackets (2025) - by province code
    provincial_tax_brackets: Dict[str, List[Dict[str, float]]] = {
        "AB": [
            {"min": 0, "max": 148269, "rate": 0.10},
            {"min": 148269, "max": 177922, "rate": 0.12},
            {"min": 177922, "max": 237230, "rate": 0.13},
            {"min": 237230, "max": 355845, "rate": 0.14},
            {"min": 355845, "max": float('inf'), "rate": 0.15}
        ],
        "BC": [
            {"min": 0, "max": 47937, "rate": 0.0506},
            {"min": 47937, "max": 95875, "rate": 0.077},
            {"min": 95875, "max": 110076, "rate": 0.105},
            {"min": 110076, "max": 133664, "rate": 0.1229},
            {"min": 133664, "max": 181232, "rate": 0.147},
            {"min": 181232, "max": 252752, "rate": 0.168},
            {"min": 252752, "max": float('inf'), "rate": 0.205}
        ],
        "MB": [
            {"min": 0, "max": 47000, "rate": 0.108},
            {"min": 47000, "max": 100000, "rate": 0.1275},
            {"min": 100000, "max": float('inf'), "rate": 0.174}
        ],
        "NB": [
            {"min": 0, "max": 49958, "rate": 0.094},
            {"min": 49958, "max": 99916, "rate": 0.14},
            {"min": 99916, "max": 185064, "rate": 0.16},
            {"min": 185064, "max": float('inf'), "rate": 0.195}
        ],
        "NL": [
            {"min": 0, "max": 43198, "rate": 0.087},
            {"min": 43198, "max": 86395, "rate": 0.145},
            {"min": 86395, "max": 154244, "rate": 0.158},
            {"min": 154244, "max": 215943, "rate": 0.178},
            {"min": 215943, "max": 275870, "rate": 0.198},
            {"min": 275870, "max": 551739, "rate": 0.208},
            {"min": 551739, "max": 1103478, "rate": 0.213},
            {"min": 1103478, "max": float('inf'), "rate": 0.218}
        ],
        "NS": [
            {"min": 0, "max": 29590, "rate": 0.0879},
            {"min": 29590, "max": 59180, "rate": 0.1495},
            {"min": 59180, "max": 93000, "rate": 0.1667},
            {"min": 93000, "max": 150000, "rate": 0.175},
            {"min": 150000, "max": float('inf'), "rate": 0.21}
        ],
        "NT": [
            {"min": 0, "max": 50597, "rate": 0.059},
            {"min": 50597, "max": 101198, "rate": 0.086},
            {"min": 101198, "max": 164525, "rate": 0.122},
            {"min": 164525, "max": float('inf'), "rate": 0.1405}
        ],
        "NU": [
            {"min": 0, "max": 53268, "rate": 0.04},
            {"min": 53268, "max": 106537, "rate": 0.07},
            {"min": 106537, "max": 173205, "rate": 0.09},
            {"min": 173205, "max": float('inf'), "rate": 0.115}
        ],
        "ON": [
            {"min": 0, "max": 51446, "rate": 0.0505},
            {"min": 51446, "max": 102894, "rate": 0.0915},
            {"min": 102894, "max": 150000, "rate": 0.1116},
            {"min": 150000, "max": 220000, "rate": 0.1216},
            {"min": 220000, "max": float('inf'), "rate": 0.1316}
        ],
        "PE": [
            {"min": 0, "max": 32656, "rate": 0.098},
            {"min": 32656, "max": 64313, "rate": 0.138},
            {"min": 64313, "max": float('inf'), "rate": 0.167}
        ],
        "QC": [
            {"min": 0, "max": 51780, "rate": 0.14},
            {"min": 51780, "max": 103545, "rate": 0.19},
            {"min": 103545, "max": 126000, "rate": 0.24},
            {"min": 126000, "max": float('inf'), "rate": 0.2575}
        ],
        "SK": [
            {"min": 0, "max": 52057, "rate": 0.105},
            {"min": 52057, "max": 148734, "rate": 0.125},
            {"min": 148734, "max": float('inf'), "rate": 0.145}
        ],
        "YT": [
            {"min": 0, "max": 55867, "rate": 0.064},
            {"min": 55867, "max": 111733, "rate": 0.09},
            {"min": 111733, "max": 173205, "rate": 0.109},
            {"min": 173205, "max": 500000, "rate": 0.128},
            {"min": 500000, "max": float('inf'), "rate": 0.15}
        ]
    }

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
