"""
Income Tax Calculation Service

Implements CRA T4127 Payroll Deductions Formulas (2025 Edition)
for federal and provincial income tax calculations.

This service handles:
- TD1 claim amounts to tax credits conversion
- Federal income tax withholding
- Provincial/territorial income tax withholding
- Progressive tax bracket application
- Claim code (0-10) conversion
- Special handling for commission and bonus income

Author: Maran
Version: 1.0.0
Compliance: CRA T4127 (2025)
"""

from typing import Dict, List, Optional, Tuple
from enum import Enum


class Province(str, Enum):
    """Canadian Provinces and Territories"""
    AB = "AB"
    BC = "BC"
    MB = "MB"
    NB = "NB"
    NL = "NL"
    NS = "NS"
    NT = "NT"
    NU = "NU"
    ON = "ON"
    PE = "PE"
    QC = "QC"
    SK = "SK"
    YT = "YT"


class PayFrequency(str, Enum):
    """Pay Frequency Options"""
    WEEKLY = "weekly"
    BIWEEKLY = "biweekly"
    SEMI_MONTHLY = "semi_monthly"
    MONTHLY = "monthly"


# 2025 CRA Constants
FEDERAL_BASIC_PERSONAL_AMOUNT_2025 = 15705.0
FEDERAL_TAX_CONSTANT_K_2025 = 0.15  # Federal constant K
FEDERAL_TAX_CONSTANT_K1_2025 = 15705.0  # Federal constant K1
FEDERAL_TAX_CONSTANT_K2_2025 = 14156.0  # Federal constant K2
FEDERAL_TAX_CONSTANT_K3_2025 = 27564.0  # Federal constant K3
FEDERAL_TAX_CONSTANT_K4_2025 = 165430.0  # Federal constant K4

# Federal Tax Brackets 2025
FEDERAL_TAX_BRACKETS_2025 = [
    {"min": 0, "max": 55867, "rate": 0.15, "base": 0},
    {"min": 55867, "max": 111733, "rate": 0.205, "base": 8380.05},
    {"min": 111733, "max": 173205, "rate": 0.26, "base": 19832.58},
    {"min": 173205, "max": 246752, "rate": 0.29, "base": 35815.30},
    {"min": 246752, "max": float('inf'), "rate": 0.33, "base": 57144.93}
]

# Provincial Basic Personal Amounts 2025
PROVINCIAL_BASIC_PERSONAL_AMOUNTS_2025 = {
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

# Provincial Tax Brackets 2025
PROVINCIAL_TAX_BRACKETS_2025 = {
    "AB": [
        {"min": 0, "max": 148269, "rate": 0.10, "base": 0},
        {"min": 148269, "max": 177922, "rate": 0.12, "base": 14826.90},
        {"min": 177922, "max": 237230, "rate": 0.13, "base": 18384.26},
        {"min": 237230, "max": 355845, "rate": 0.14, "base": 26095.30},
        {"min": 355845, "max": float('inf'), "rate": 0.15, "base": 42701.40}
    ],
    "BC": [
        {"min": 0, "max": 47937, "rate": 0.0506, "base": 0},
        {"min": 47937, "max": 95875, "rate": 0.077, "base": 2425.61},
        {"min": 95875, "max": 110076, "rate": 0.105, "base": 6116.87},
        {"min": 110076, "max": 133664, "rate": 0.1229, "base": 7607.98},
        {"min": 133664, "max": 181232, "rate": 0.147, "base": 10507.85},
        {"min": 181232, "max": 252752, "rate": 0.168, "base": 17499.34},
        {"min": 252752, "max": float('inf'), "rate": 0.205, "base": 29514.70}
    ],
    "MB": [
        {"min": 0, "max": 47000, "rate": 0.108, "base": 0},
        {"min": 47000, "max": 100000, "rate": 0.1275, "base": 5076.00},
        {"min": 100000, "max": float('inf'), "rate": 0.174, "base": 11833.50}
    ],
    "NB": [
        {"min": 0, "max": 49958, "rate": 0.094, "base": 0},
        {"min": 49958, "max": 99916, "rate": 0.14, "base": 4696.05},
        {"min": 99916, "max": 185064, "rate": 0.16, "base": 11690.17},
        {"min": 185064, "max": float('inf'), "rate": 0.195, "base": 25313.85}
    ],
    "NL": [
        {"min": 0, "max": 43198, "rate": 0.087, "base": 0},
        {"min": 43198, "max": 86395, "rate": 0.145, "base": 3758.23},
        {"min": 86395, "max": 154244, "rate": 0.158, "base": 10021.78},
        {"min": 154244, "max": 215943, "rate": 0.178, "base": 20743.00},
        {"min": 215943, "max": 275870, "rate": 0.198, "base": 31721.42},
        {"min": 275870, "max": 551739, "rate": 0.208, "base": 43586.99},
        {"min": 551739, "max": 1103478, "rate": 0.213, "base": 100974.74},
        {"min": 1103478, "max": float('inf'), "rate": 0.218, "base": 218507.98}
    ],
    "NS": [
        {"min": 0, "max": 29590, "rate": 0.0879, "base": 0},
        {"min": 29590, "max": 59180, "rate": 0.1495, "base": 2600.96},
        {"min": 59180, "max": 93000, "rate": 0.1667, "base": 7026.16},
        {"min": 93000, "max": 150000, "rate": 0.175, "base": 12665.42},
        {"min": 150000, "max": float('inf'), "rate": 0.21, "base": 22640.42}
    ],
    "NT": [
        {"min": 0, "max": 50597, "rate": 0.059, "base": 0},
        {"min": 50597, "max": 101198, "rate": 0.086, "base": 2985.22},
        {"min": 101198, "max": 164525, "rate": 0.122, "base": 7336.89},
        {"min": 164525, "max": float('inf'), "rate": 0.1405, "base": 15066.78}
    ],
    "NU": [
        {"min": 0, "max": 53268, "rate": 0.04, "base": 0},
        {"min": 53268, "max": 106537, "rate": 0.07, "base": 2130.72},
        {"min": 106537, "max": 173205, "rate": 0.09, "base": 5859.55},
        {"min": 173205, "max": float('inf'), "rate": 0.115, "base": 11859.67}
    ],
    "ON": [
        {"min": 0, "max": 51446, "rate": 0.0505, "base": 0},
        {"min": 51446, "max": 102894, "rate": 0.0915, "base": 2598.02},
        {"min": 102894, "max": 150000, "rate": 0.1116, "base": 7305.51},
        {"min": 150000, "max": 220000, "rate": 0.1216, "base": 12561.94},
        {"min": 220000, "max": float('inf'), "rate": 0.1316, "base": 21073.94}
    ],
    "PE": [
        {"min": 0, "max": 32656, "rate": 0.098, "base": 0},
        {"min": 32656, "max": 64313, "rate": 0.138, "base": 3200.29},
        {"min": 64313, "max": float('inf'), "rate": 0.167, "base": 7568.95}
    ],
    "QC": [
        {"min": 0, "max": 51780, "rate": 0.14, "base": 0},
        {"min": 51780, "max": 103545, "rate": 0.19, "base": 7249.20},
        {"min": 103545, "max": 126000, "rate": 0.24, "base": 17084.55},
        {"min": 126000, "max": float('inf'), "rate": 0.2575, "base": 22473.75}
    ],
    "SK": [
        {"min": 0, "max": 52057, "rate": 0.105, "base": 0},
        {"min": 52057, "max": 148734, "rate": 0.125, "base": 5465.99},
        {"min": 148734, "max": float('inf'), "rate": 0.145, "base": 17550.61}
    ],
    "YT": [
        {"min": 0, "max": 55867, "rate": 0.064, "base": 0},
        {"min": 55867, "max": 111733, "rate": 0.09, "base": 3575.49},
        {"min": 111733, "max": 173205, "rate": 0.109, "base": 8603.43},
        {"min": 173205, "max": 500000, "rate": 0.128, "base": 15303.88},
        {"min": 500000, "max": float('inf'), "rate": 0.15, "base": 57173.64}
    ]
}

# Federal Claim Code to Annual Exemption (2025)
FEDERAL_CLAIM_CODE_EXEMPTIONS_2025 = {
    0: 0,
    1: 15705,
    2: 31410,
    3: 47115,
    4: 62820,
    5: 78525,
    6: 94230,
    7: 109935,
    8: 125640,
    9: 141345,
    10: 157050
}


class IncomeTaxService:
    """Service for Canadian income tax calculations based on CRA T4127 formulas"""

    def __init__(self, tax_year: int = 2025):
        """Initialize the service with tax year constants"""
        self.tax_year = tax_year
        self.federal_brackets = FEDERAL_TAX_BRACKETS_2025
        self.provincial_brackets = PROVINCIAL_TAX_BRACKETS_2025
        self.federal_bpa = FEDERAL_BASIC_PERSONAL_AMOUNT_2025
        self.provincial_bpa = PROVINCIAL_BASIC_PERSONAL_AMOUNTS_2025

    def calculate_federal_tax(
        self,
        gross_income: float,
        pay_frequency: str,
        td1_total_claim: Optional[float] = None,
        claim_code: Optional[int] = None,
        additional_tax: float = 0.0,
        ytd_federal_tax: float = 0.0,
        ytd_gross_income: float = 0.0
    ) -> float:
        """
        Calculate federal income tax using CRA T4127 formulas

        Args:
            gross_income: Gross income for the pay period
            pay_frequency: Pay frequency (weekly, biweekly, semi_monthly, monthly)
            td1_total_claim: Total claim amount from TD1 (line 13)
            claim_code: Federal claim code (0-10) if not using TD1 totals
            additional_tax: Additional tax requested (TD1 field L)
            ytd_federal_tax: Year-to-date federal tax withheld
            ytd_gross_income: Year-to-date gross income

        Returns:
            Federal tax to withhold for this pay period
        """
        if gross_income <= 0:
            return 0.0

        # Get pay periods per year
        periods_per_year = self._get_periods_per_year(pay_frequency)

        # Annualize the income
        annual_income = gross_income * periods_per_year

        # Determine tax credits
        if td1_total_claim is not None:
            # Use TD1 total claim amount
            annual_tax_credits = td1_total_claim * FEDERAL_TAX_CONSTANT_K_2025
        elif claim_code is not None:
            # Use claim code
            exemption = FEDERAL_CLAIM_CODE_EXEMPTIONS_2025.get(claim_code, 0)
            annual_tax_credits = exemption * FEDERAL_TAX_CONSTANT_K_2025
        else:
            # Use basic personal amount
            annual_tax_credits = self.federal_bpa * FEDERAL_TAX_CONSTANT_K_2025

        # Calculate annual tax using progressive brackets
        annual_tax = self._apply_progressive_tax(annual_income, self.federal_brackets)

        # Subtract tax credits
        annual_tax = max(0, annual_tax - annual_tax_credits)

        # Convert to per-period tax
        period_tax = annual_tax / periods_per_year

        # Add additional tax per period
        period_tax += additional_tax

        # Round to 2 decimal places
        return round(period_tax, 2)

    def calculate_provincial_tax(
        self,
        gross_income: float,
        province: str,
        pay_frequency: str,
        td1_total_claim: Optional[float] = None,
        claim_code: Optional[int] = None,
        additional_tax: float = 0.0,
        ytd_provincial_tax: float = 0.0,
        ytd_gross_income: float = 0.0
    ) -> float:
        """
        Calculate provincial/territorial income tax

        Args:
            gross_income: Gross income for the pay period
            province: Province/territory code (AB, BC, MB, etc.)
            pay_frequency: Pay frequency (weekly, biweekly, semi_monthly, monthly)
            td1_total_claim: Total claim amount from provincial TD1
            claim_code: Provincial claim code (0-10) if not using TD1 totals
            additional_tax: Additional provincial tax requested
            ytd_provincial_tax: Year-to-date provincial tax withheld
            ytd_gross_income: Year-to-date gross income

        Returns:
            Provincial tax to withhold for this pay period
        """
        if gross_income <= 0:
            return 0.0

        # Get provincial brackets
        if province not in self.provincial_brackets:
            return 0.0

        brackets = self.provincial_brackets[province]

        # Get pay periods per year
        periods_per_year = self._get_periods_per_year(pay_frequency)

        # Annualize the income
        annual_income = gross_income * periods_per_year

        # Get provincial basic personal amount
        provincial_bpa = self.provincial_bpa.get(province, 0)

        # Determine tax credits (using lowest provincial rate)
        lowest_rate = brackets[0]["rate"] if brackets else 0.0

        if td1_total_claim is not None:
            # Use TD1 total claim amount
            annual_tax_credits = td1_total_claim * lowest_rate
        elif claim_code is not None:
            # Use claim code (same exemptions as federal)
            exemption = FEDERAL_CLAIM_CODE_EXEMPTIONS_2025.get(claim_code, 0)
            annual_tax_credits = exemption * lowest_rate
        else:
            # Use provincial basic personal amount
            annual_tax_credits = provincial_bpa * lowest_rate

        # Calculate annual tax using progressive brackets
        annual_tax = self._apply_progressive_tax(annual_income, brackets)

        # Subtract tax credits
        annual_tax = max(0, annual_tax - annual_tax_credits)

        # Convert to per-period tax
        period_tax = annual_tax / periods_per_year

        # Add additional tax per period
        period_tax += additional_tax

        # Round to 2 decimal places
        return round(period_tax, 2)

    def calculate_tax_on_bonus(
        self,
        bonus_amount: float,
        cumulative_earnings_ytd: float,
        federal_td1_claim: float,
        provincial_td1_claim: float,
        province: str
    ) -> Tuple[float, float]:
        """
        Calculate tax on bonus/retroactive pay using CRA T4127 Bonus Method

        Args:
            bonus_amount: Bonus or retroactive payment amount
            cumulative_earnings_ytd: Cumulative earnings before this bonus
            federal_td1_claim: Federal TD1 total claim amount
            provincial_td1_claim: Provincial TD1 total claim amount
            province: Province/territory code

        Returns:
            Tuple of (federal_tax_on_bonus, provincial_tax_on_bonus)
        """
        # Step 1: Calculate tax on cumulative earnings without bonus
        federal_tax_without = self._calculate_annual_federal_tax(
            cumulative_earnings_ytd, federal_td1_claim
        )
        provincial_tax_without = self._calculate_annual_provincial_tax(
            cumulative_earnings_ytd, province, provincial_td1_claim
        )

        # Step 2: Calculate tax on cumulative earnings with bonus
        federal_tax_with = self._calculate_annual_federal_tax(
            cumulative_earnings_ytd + bonus_amount, federal_td1_claim
        )
        provincial_tax_with = self._calculate_annual_provincial_tax(
            cumulative_earnings_ytd + bonus_amount, province, provincial_td1_claim
        )

        # Step 3: Tax on bonus is the difference
        federal_tax_on_bonus = max(0, federal_tax_with - federal_tax_without)
        provincial_tax_on_bonus = max(0, provincial_tax_with - provincial_tax_without)

        return round(federal_tax_on_bonus, 2), round(provincial_tax_on_bonus, 2)

    def _apply_progressive_tax(
        self,
        annual_income: float,
        brackets: List[Dict[str, float]]
    ) -> float:
        """Apply progressive tax brackets to annual income"""
        total_tax = 0.0

        for bracket in brackets:
            min_income = bracket["min"]
            max_income = bracket["max"]
            rate = bracket["rate"]

            if annual_income <= min_income:
                break

            # Calculate taxable amount in this bracket
            taxable_in_bracket = min(annual_income, max_income) - min_income

            if taxable_in_bracket > 0:
                total_tax += taxable_in_bracket * rate

        return total_tax

    def _calculate_annual_federal_tax(
        self,
        annual_income: float,
        td1_total_claim: float
    ) -> float:
        """Calculate annual federal tax"""
        # Calculate tax using progressive brackets
        annual_tax = self._apply_progressive_tax(annual_income, self.federal_brackets)

        # Calculate tax credits
        tax_credits = td1_total_claim * FEDERAL_TAX_CONSTANT_K_2025

        # Return net tax
        return max(0, annual_tax - tax_credits)

    def _calculate_annual_provincial_tax(
        self,
        annual_income: float,
        province: str,
        td1_total_claim: float
    ) -> float:
        """Calculate annual provincial tax"""
        if province not in self.provincial_brackets:
            return 0.0

        brackets = self.provincial_brackets[province]

        # Calculate tax using progressive brackets
        annual_tax = self._apply_progressive_tax(annual_income, brackets)

        # Calculate tax credits using lowest provincial rate
        lowest_rate = brackets[0]["rate"] if brackets else 0.0
        tax_credits = td1_total_claim * lowest_rate

        # Return net tax
        return max(0, annual_tax - tax_credits)

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

    def get_tax_breakdown(
        self,
        gross_income: float,
        province: str,
        pay_frequency: str,
        federal_td1_claim: Optional[float] = None,
        provincial_td1_claim: Optional[float] = None,
        federal_claim_code: Optional[int] = None,
        provincial_claim_code: Optional[int] = None,
        additional_federal_tax: float = 0.0,
        additional_provincial_tax: float = 0.0
    ) -> Dict[str, float]:
        """
        Get complete tax breakdown for a pay period

        Returns:
            Dictionary with federal_tax, provincial_tax, and total_tax
        """
        federal_tax = self.calculate_federal_tax(
            gross_income=gross_income,
            pay_frequency=pay_frequency,
            td1_total_claim=federal_td1_claim,
            claim_code=federal_claim_code,
            additional_tax=additional_federal_tax
        )

        provincial_tax = self.calculate_provincial_tax(
            gross_income=gross_income,
            province=province,
            pay_frequency=pay_frequency,
            td1_total_claim=provincial_td1_claim,
            claim_code=provincial_claim_code,
            additional_tax=additional_provincial_tax
        )

        return {
            "federal_tax": federal_tax,
            "provincial_tax": provincial_tax,
            "total_income_tax": round(federal_tax + provincial_tax, 2)
        }
