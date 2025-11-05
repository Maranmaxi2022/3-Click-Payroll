"""
Worker Category Service

Handles eligibility determination and calculations for different worker categories
in compliance with Canadian federal and provincial employment laws.

Worker Categories:
- DIRECT_EMPLOYEE: Full-time or part-time employees with benefits and statutory deductions
- CONTRACT_WORKER: Temporary workers eligible for CPP/EI but limited/no benefits
- AGENT_WORKER: Independent contractors, typically CPP/EI exempt, no benefits

Author: Maran
Version: 1.0.0
Compliance: CRA T4127 (2025), Provincial Employment Standards
"""

from typing import Dict, Any, Optional
from datetime import datetime, date
from enum import Enum


class WorkerCategory(str, Enum):
    """Worker Category Types"""
    DIRECT_EMPLOYEE = "direct_employee"
    CONTRACT_WORKER = "contract_worker"
    AGENT_WORKER = "agent_worker"


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


# 2025 CRA Constants
CPP_CONSTANTS_2025 = {
    "RATE": 0.0595,  # 5.95%
    "BASIC_EXEMPTION": 3500,  # Annual
    "YMPE": 71300,  # Year's Maximum Pensionable Earnings
    "MAX_CONTRIBUTION": 4034.10  # Maximum annual employee contribution
}

CPP2_CONSTANTS_2025 = {
    "RATE": 0.04,  # 4%
    "YAMPE": 81200,  # Year's Additional Maximum Pensionable Earnings
    "MAX_CONTRIBUTION": 396  # Maximum annual employee contribution
}

EI_CONSTANTS_2025 = {
    "RATE": 0.0164,  # 1.64% (federal)
    "RATE_QC": 0.0127,  # 1.27% (Quebec)
    "MAX_INSURABLE": 65700,  # Maximum insurable earnings
    "MAX_PREMIUM": 1077.48,  # Maximum annual premium (federal)
    "MAX_PREMIUM_QC": 834.39  # Maximum annual premium (Quebec)
}

# Provincial Overtime Rules
OVERTIME_RULES = {
    "AB": {"daily": None, "weekly": 44, "rate": 1.5},
    "BC": {"daily": 8, "weekly": 40, "rate": 1.5, "doubleTimeDaily": 12},
    "MB": {"daily": 8, "weekly": 40, "rate": 1.5},
    "NB": {"daily": None, "weekly": 44, "rate": 1.5},
    "NL": {"daily": None, "weekly": 40, "rate": 1.5},
    "NS": {"daily": None, "weekly": 48, "rate": 1.5},
    "NT": {"daily": 8, "weekly": 40, "rate": 1.5},
    "NU": {"daily": 8, "weekly": 40, "rate": 1.5},
    "ON": {"daily": None, "weekly": 44, "rate": 1.5},
    "PE": {"daily": None, "weekly": 48, "rate": 1.5},
    "QC": {"daily": None, "weekly": 40, "rate": 1.5},
    "SK": {"daily": 8, "weekly": 40, "rate": 1.5},
    "YT": {"daily": 8, "weekly": 40, "rate": 1.5}
}

# Provincial Vacation Pay Rules
VACATION_PAY_RULES = {
    "AB": {"years0to5": 0.04, "years5plus": 0.06},
    "BC": {"years0to5": 0.04, "years5plus": 0.06},
    "MB": {"years0to5": 0.04, "years5plus": 0.06},
    "NB": {"years0to8": 0.04, "years8plus": 0.06},
    "NL": {"years0to15": 0.04, "years15plus": 0.06},
    "NS": {"years0to8": 0.04, "years8plus": 0.06},
    "NT": {"years0to1": 0.04, "years1plus": 0.06},
    "NU": {"years0to1": 0.04, "years1plus": 0.06},
    "ON": {"years0to5": 0.04, "years5plus": 0.06},
    "PE": {"years0to8": 0.04, "years8plus": 0.06},
    "QC": {"years0to1": 0.04, "years1to5": 0.04, "years5plus": 0.06},
    "SK": {"years0to10": 0.05263, "years10plus": 0.07692},
    "YT": {"years0to1": 0.04, "years1plus": 0.06}
}


class WorkerCategoryService:
    """Service for worker category eligibility and calculations"""

    def is_cpp_eligible(self, employee: Dict[str, Any]) -> bool:
        """
        Determine if a worker is eligible for CPP contributions

        Rules:
        - Direct Employees: Always eligible (if age 18-70)
        - Contract Workers: Always eligible (if age 18-70)
        - Agent Workers: Exempt (self-employed, remit their own CPP)
        """
        worker_category = employee.get('workerCategory', employee.get('worker_category'))

        # Agent workers are CPP exempt
        if worker_category == WorkerCategory.AGENT_WORKER.value:
            return False

        # Check age eligibility (18-70 years)
        date_of_birth = employee.get('dateOfBirth', employee.get('date_of_birth'))
        if date_of_birth:
            age = self._calculate_age(date_of_birth)
            if age < 18 or age > 70:
                return False

        return True

    def is_ei_eligible(self, employee: Dict[str, Any]) -> bool:
        """
        Determine if a worker is eligible for EI premiums

        Rules:
        - Direct Employees: Always eligible
        - Contract Workers: Eligible if insurable employment
        - Agent Workers: Exempt (self-employed)
        """
        worker_category = employee.get('workerCategory', employee.get('worker_category'))

        # Agent workers are EI exempt
        if worker_category == WorkerCategory.AGENT_WORKER.value:
            return False

        return True

    def is_qpip_eligible(self, employee: Dict[str, Any]) -> bool:
        """
        Determine if a worker is eligible for QPIP (Quebec Parental Insurance Plan)

        Rules:
        - Only applies in Quebec
        - All worker categories in Quebec are QPIP eligible
        """
        province = employee.get('province', employee.get('province_of_employment'))

        # QPIP only applies in Quebec
        if province != 'QC' and province != Province.QC.value:
            return False

        return True

    def is_benefits_eligible(self, employee: Dict[str, Any]) -> bool:
        """
        Determine if a worker is eligible for company benefits

        Rules:
        - Direct Employees: Eligible
        - Contract Workers: Not eligible
        - Agent Workers: Not eligible
        """
        worker_category = employee.get('workerCategory', employee.get('worker_category'))
        return worker_category == WorkerCategory.DIRECT_EMPLOYEE.value

    def is_vacation_pay_eligible(self, employee: Dict[str, Any]) -> bool:
        """Determine if a worker is eligible for vacation pay"""
        worker_category = employee.get('workerCategory', employee.get('worker_category'))
        return worker_category != WorkerCategory.AGENT_WORKER.value

    def is_statutory_holiday_eligible(self, employee: Dict[str, Any]) -> bool:
        """Determine if a worker is eligible for statutory holiday pay"""
        worker_category = employee.get('workerCategory', employee.get('worker_category'))
        return worker_category == WorkerCategory.DIRECT_EMPLOYEE.value

    def is_overtime_eligible(self, employee: Dict[str, Any]) -> bool:
        """Determine if a worker is eligible for overtime pay"""
        worker_category = employee.get('workerCategory', employee.get('worker_category'))
        return worker_category != WorkerCategory.AGENT_WORKER.value

    def get_tax_slip_type(self, employee: Dict[str, Any]) -> str:
        """
        Get the appropriate tax slip type

        Rules:
        - Direct Employees: T4
        - Contract Workers: T4
        - Agent Workers: T4A
        """
        worker_category = employee.get('workerCategory', employee.get('worker_category'))

        if worker_category == WorkerCategory.AGENT_WORKER.value:
            return 'T4A'

        return 'T4'

    def calculate_pensionable_earnings(
        self,
        gross_earnings: float,
        pay_frequency: str,
        ytd_pensionable_earnings: float = 0.0
    ) -> float:
        """Calculate CPP pensionable earnings for a pay period"""
        periods_per_year = self._get_periods_per_year(pay_frequency)
        basic_exemption_per_period = CPP_CONSTANTS_2025["BASIC_EXEMPTION"] / periods_per_year

        # Pensionable earnings = gross - basic exemption (per period)
        pensionable_earnings = max(0, gross_earnings - basic_exemption_per_period)

        # Check if we've exceeded YMPE
        max_pensionable = CPP_CONSTANTS_2025["YMPE"] - ytd_pensionable_earnings
        pensionable_earnings = min(pensionable_earnings, max(0, max_pensionable))

        return round(pensionable_earnings, 2)

    def calculate_cpp2_pensionable_earnings(
        self,
        gross_earnings: float,
        ytd_gross_earnings: float = 0.0
    ) -> float:
        """Calculate CPP2 pensionable earnings (earnings between YMPE and YAMPE)"""
        new_ytd_gross = ytd_gross_earnings + gross_earnings

        # CPP2 only applies between YMPE and YAMPE
        if new_ytd_gross <= CPP_CONSTANTS_2025["YMPE"]:
            return 0.0

        if ytd_gross_earnings >= CPP2_CONSTANTS_2025["YAMPE"]:
            return 0.0

        # Calculate portion subject to CPP2
        earnings_above_ympe = max(0, new_ytd_gross - CPP_CONSTANTS_2025["YMPE"])
        previous_earnings_above_ympe = max(0, ytd_gross_earnings - CPP_CONSTANTS_2025["YMPE"])

        cpp2_earnings = earnings_above_ympe - previous_earnings_above_ympe
        max_cpp2_earnings = CPP2_CONSTANTS_2025["YAMPE"] - CPP_CONSTANTS_2025["YMPE"]

        return min(cpp2_earnings, max_cpp2_earnings)

    def calculate_insurable_earnings(
        self,
        gross_earnings: float,
        ytd_insurable_earnings: float = 0.0
    ) -> float:
        """Calculate EI insurable earnings for a pay period"""
        max_insurable = EI_CONSTANTS_2025["MAX_INSURABLE"] - ytd_insurable_earnings
        insurable_earnings = min(gross_earnings, max(0, max_insurable))

        return round(insurable_earnings, 2)

    def calculate_cpp_contribution(
        self,
        pensionable_earnings: float,
        ytd_cpp_contributions: float = 0.0
    ) -> float:
        """Calculate CPP contribution for a pay period"""
        contribution = pensionable_earnings * CPP_CONSTANTS_2025["RATE"]

        # Check maximum contribution limit
        max_contribution = CPP_CONSTANTS_2025["MAX_CONTRIBUTION"] - ytd_cpp_contributions
        contribution = min(contribution, max(0, max_contribution))

        return round(contribution, 2)

    def calculate_cpp2_contribution(
        self,
        cpp2_pensionable_earnings: float,
        ytd_cpp2_contributions: float = 0.0
    ) -> float:
        """Calculate CPP2 contribution for a pay period"""
        contribution = cpp2_pensionable_earnings * CPP2_CONSTANTS_2025["RATE"]

        # Check maximum contribution limit
        max_contribution = CPP2_CONSTANTS_2025["MAX_CONTRIBUTION"] - ytd_cpp2_contributions
        contribution = min(contribution, max(0, max_contribution))

        return round(contribution, 2)

    def calculate_ei_premium(
        self,
        insurable_earnings: float,
        province: str,
        ytd_ei_premiums: float = 0.0
    ) -> float:
        """Calculate EI premium for a pay period"""
        rate = EI_CONSTANTS_2025["RATE_QC"] if province == "QC" else EI_CONSTANTS_2025["RATE"]
        max_premium = EI_CONSTANTS_2025["MAX_PREMIUM_QC"] if province == "QC" else EI_CONSTANTS_2025["MAX_PREMIUM"]

        premium = insurable_earnings * rate

        # Check maximum premium limit
        max_allowed = max_premium - ytd_ei_premiums
        premium = min(premium, max(0, max_allowed))

        return round(premium, 2)

    def get_vacation_pay_rate(self, employee: Dict[str, Any]) -> float:
        """Get vacation pay rate based on years of service and province"""
        province = employee.get('province', employee.get('province_of_employment', 'ON'))
        hire_date = employee.get('hireDate', employee.get('hire_date'))

        if not hire_date or province not in VACATION_PAY_RULES:
            return 0.04  # Default 4%

        years_of_service = self._calculate_years_of_service(hire_date)
        rules = VACATION_PAY_RULES[province]

        # Saskatchewan has unique structure
        if province == "SK":
            return rules["years10plus"] if years_of_service >= 10 else rules["years0to10"]

        # Quebec has three tiers
        if province == "QC":
            if years_of_service >= 5:
                return rules["years5plus"]
            return rules["years0to1"]

        # Check various provincial thresholds
        if "years15plus" in rules and years_of_service >= 15:
            return rules["years15plus"]
        if "years10plus" in rules and years_of_service >= 10:
            return rules["years10plus"]
        if "years8plus" in rules and years_of_service >= 8:
            return rules["years8plus"]
        if "years5plus" in rules and years_of_service >= 5:
            return rules["years5plus"]
        if "years1plus" in rules and years_of_service >= 1:
            return rules["years1plus"]

        return rules.get("years0to5", rules.get("years0to8", rules.get("years0to15", rules.get("years0to1", 0.04))))

    def get_eligibilities(self, employee: Dict[str, Any]) -> Dict[str, Any]:
        """Get comprehensive eligibilities for a worker"""
        return {
            "cpp": self.is_cpp_eligible(employee),
            "cpp2": self.is_cpp_eligible(employee),  # Same eligibility as CPP
            "ei": self.is_ei_eligible(employee),
            "qpip": self.is_qpip_eligible(employee),
            "benefits": self.is_benefits_eligible(employee),
            "vacationPay": self.is_vacation_pay_eligible(employee),
            "statutoryHolidays": self.is_statutory_holiday_eligible(employee),
            "overtime": self.is_overtime_eligible(employee),
            "taxSlipType": self.get_tax_slip_type(employee)
        }

    # Private helper methods

    def _calculate_age(self, date_of_birth) -> int:
        """Calculate age from date of birth"""
        if isinstance(date_of_birth, str):
            date_of_birth = datetime.fromisoformat(date_of_birth).date()
        elif isinstance(date_of_birth, datetime):
            date_of_birth = date_of_birth.date()

        today = date.today()
        age = today.year - date_of_birth.year

        if (today.month, today.day) < (date_of_birth.month, date_of_birth.day):
            age -= 1

        return age

    def _calculate_years_of_service(self, hire_date) -> int:
        """Calculate years of service from hire date"""
        if isinstance(hire_date, str):
            hire_date = datetime.fromisoformat(hire_date).date()
        elif isinstance(hire_date, datetime):
            hire_date = hire_date.date()

        today = date.today()
        years = today.year - hire_date.year

        if (today.month, today.day) < (hire_date.month, hire_date.day):
            years -= 1

        return max(0, years)

    def _get_periods_per_year(self, pay_frequency: str) -> int:
        """Get number of pay periods per year"""
        periods = {
            "weekly": 52,
            "biweekly": 26,
            "semi_monthly": 24,
            "semi-monthly": 24,
            "monthly": 12
        }

        return periods.get(pay_frequency.lower(), 26)  # Default to biweekly
