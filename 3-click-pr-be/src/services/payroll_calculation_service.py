"""
Payroll Calculation Service

Comprehensive service for calculating Canadian payroll including:
- Gross earnings
- Statutory deductions (CPP, CPP2, EI, QPIP)
- Federal and provincial income tax
- Pre-tax and post-tax deductions
- Taxable benefits
- YTD accumulation and enforcement
- Net pay calculation

Author: Maran
Version: 1.0.0
Compliance: CRA T4127 (2025)
"""

from typing import Dict, List, Optional, Any
from datetime import datetime
from .worker_category_service import WorkerCategoryService
from .income_tax_service import IncomeTaxService


class PayrollCalculationService:
    """
    Comprehensive payroll calculation service

    Orchestrates all payroll calculations including statutory deductions,
    income tax, and net pay determination.
    """

    def __init__(self, tax_year: int = 2025):
        """Initialize the service"""
        self.worker_service = WorkerCategoryService()
        self.tax_service = IncomeTaxService(tax_year=tax_year)
        self.tax_year = tax_year

    def calculate_pay_period(
        self,
        employee: Dict[str, Any],
        earnings: List[Dict[str, Any]],
        deductions: List[Dict[str, Any]] = None,
        benefits: List[Dict[str, Any]] = None,
        ytd_totals: Optional[Dict[str, float]] = None,
        pay_frequency: str = "biweekly",
        is_bonus: bool = False
    ) -> Dict[str, Any]:
        """
        Calculate complete pay period for an employee

        Args:
            employee: Employee record with TD1 and statutory settings
            earnings: List of earning items (regular, overtime, vacation, etc.)
            deductions: List of deduction items (RRSP, union dues, etc.)
            benefits: List of benefit items (health, dental, etc.)
            ytd_totals: Year-to-date totals (gross, cpp, ei, tax, etc.)
            pay_frequency: Pay frequency (weekly, biweekly, semi_monthly, monthly)
            is_bonus: Whether this is a bonus payment

        Returns:
            Complete pay calculation breakdown
        """
        if deductions is None:
            deductions = []
        if benefits is None:
            benefits = []
        if ytd_totals is None:
            ytd_totals = {}

        # Extract YTD values
        ytd_gross = ytd_totals.get("gross_earnings", 0.0)
        ytd_cpp = ytd_totals.get("cpp_contributions", 0.0)
        ytd_cpp2 = ytd_totals.get("cpp2_contributions", 0.0)
        ytd_ei = ytd_totals.get("ei_premiums", 0.0)
        ytd_qpip = ytd_totals.get("qpip_premiums", 0.0)
        ytd_federal_tax = ytd_totals.get("federal_tax", 0.0)
        ytd_provincial_tax = ytd_totals.get("provincial_tax", 0.0)

        # Calculate gross earnings
        total_gross = sum(e.get("amount", 0.0) for e in earnings)
        taxable_gross = sum(e.get("amount", 0.0) for e in earnings if e.get("taxable", True))

        # Calculate pre-tax deductions (RRSP, RPP, etc.)
        pre_tax_deductions = [d for d in deductions if d.get("pre_tax", False)]
        pre_tax_amount = sum(d.get("amount", 0.0) for d in pre_tax_deductions)

        # Calculate taxable benefits
        taxable_benefits = sum(
            b.get("employee_contribution", 0.0)
            for b in benefits
            if b.get("taxable", False)
        )

        # Calculate pensionable and insurable earnings for CPP/EI
        pensionable_base = total_gross - pre_tax_amount
        insurable_base = total_gross - pre_tax_amount

        # CPP Calculation
        cpp_contribution = 0.0
        cpp2_contribution = 0.0
        if self.worker_service.is_cpp_eligible(employee):
            pensionable_earnings = self.worker_service.calculate_pensionable_earnings(
                gross_earnings=pensionable_base,
                pay_frequency=pay_frequency,
                ytd_pensionable_earnings=ytd_gross - ytd_cpp - ytd_cpp2
            )
            cpp_contribution = self.worker_service.calculate_cpp_contribution(
                pensionable_earnings=pensionable_earnings,
                ytd_cpp_contributions=ytd_cpp
            )

            # CPP2 Calculation
            cpp2_earnings = self.worker_service.calculate_cpp2_pensionable_earnings(
                gross_earnings=pensionable_base,
                ytd_gross_earnings=ytd_gross
            )
            cpp2_contribution = self.worker_service.calculate_cpp2_contribution(
                cpp2_pensionable_earnings=cpp2_earnings,
                ytd_cpp2_contributions=ytd_cpp2
            )

        # EI Calculation
        ei_premium = 0.0
        if self.worker_service.is_ei_eligible(employee):
            insurable_earnings = self.worker_service.calculate_insurable_earnings(
                gross_earnings=insurable_base,
                ytd_insurable_earnings=ytd_gross
            )
            province = employee.get("province", employee.get("province_of_employment", "ON"))
            ei_premium = self.worker_service.calculate_ei_premium(
                insurable_earnings=insurable_earnings,
                province=province,
                ytd_ei_premiums=ytd_ei
            )

        # QPIP Calculation (Quebec only)
        qpip_premium = 0.0
        if self.worker_service.is_qpip_eligible(employee):
            # QPIP calculation
            qpip_rate = 0.00494  # 0.494% for 2025
            qpip_max_insurable = 94000.0
            qpip_max_premium = qpip_max_insurable * qpip_rate

            remaining_qpip = max(0, qpip_max_premium - ytd_qpip)
            qpip_premium = min(insurable_base * qpip_rate, remaining_qpip)
            qpip_premium = round(qpip_premium, 2)

        # Calculate taxable income for income tax
        # Taxable income = Gross + Taxable Benefits - Pre-tax Deductions
        taxable_income = taxable_gross + taxable_benefits - pre_tax_amount

        # Get TD1 information
        td1_federal = employee.get("td1_federal", {})
        td1_provincial = employee.get("td1_provincial", {})
        province = employee.get("province", employee.get("province_of_employment", "ON"))

        # Federal TD1
        federal_td1_claim = td1_federal.get("total_claim_amount") if td1_federal else None
        federal_additional_tax = td1_federal.get("additional_tax_requested", 0.0) if td1_federal else 0.0

        # Provincial TD1
        provincial_td1_claim = td1_provincial.get("total_claim_amount") if td1_provincial else None
        provincial_additional_tax = td1_provincial.get("additional_tax_requested", 0.0) if td1_provincial else 0.0

        # Calculate income tax
        if is_bonus:
            # Use bonus method
            federal_tax, provincial_tax = self.tax_service.calculate_tax_on_bonus(
                bonus_amount=taxable_income,
                cumulative_earnings_ytd=ytd_gross,
                federal_td1_claim=federal_td1_claim or 15705.0,
                provincial_td1_claim=provincial_td1_claim or 0.0,
                province=province
            )
        else:
            # Regular method
            federal_tax = self.tax_service.calculate_federal_tax(
                gross_income=taxable_income,
                pay_frequency=pay_frequency,
                td1_total_claim=federal_td1_claim,
                additional_tax=federal_additional_tax,
                ytd_federal_tax=ytd_federal_tax,
                ytd_gross_income=ytd_gross
            )

            provincial_tax = self.tax_service.calculate_provincial_tax(
                gross_income=taxable_income,
                province=province,
                pay_frequency=pay_frequency,
                td1_total_claim=provincial_td1_claim,
                additional_tax=provincial_additional_tax,
                ytd_provincial_tax=ytd_provincial_tax,
                ytd_gross_income=ytd_gross
            )

        # Calculate post-tax deductions
        post_tax_deductions = [d for d in deductions if not d.get("pre_tax", False)]
        post_tax_amount = sum(d.get("amount", 0.0) for d in post_tax_deductions)

        # Calculate employee benefit contributions
        employee_benefits = sum(b.get("employee_contribution", 0.0) for b in benefits)

        # Calculate total deductions
        total_statutory = cpp_contribution + cpp2_contribution + ei_premium + qpip_premium
        total_tax = federal_tax + provincial_tax
        total_deductions = pre_tax_amount + total_statutory + total_tax + post_tax_amount + employee_benefits

        # Calculate net pay
        net_pay = total_gross - total_deductions

        # Calculate new YTD totals
        new_ytd_gross = ytd_gross + total_gross
        new_ytd_cpp = ytd_cpp + cpp_contribution
        new_ytd_cpp2 = ytd_cpp2 + cpp2_contribution
        new_ytd_ei = ytd_ei + ei_premium
        new_ytd_qpip = ytd_qpip + qpip_premium
        new_ytd_federal_tax = ytd_federal_tax + federal_tax
        new_ytd_provincial_tax = ytd_provincial_tax + provincial_tax
        new_ytd_net = ytd_totals.get("net_pay", 0.0) + net_pay

        # Return complete calculation
        return {
            "earnings": {
                "items": earnings,
                "gross_earnings": round(total_gross, 2),
                "taxable_earnings": round(taxable_gross, 2)
            },
            "deductions": {
                "pre_tax": {
                    "items": pre_tax_deductions,
                    "total": round(pre_tax_amount, 2)
                },
                "post_tax": {
                    "items": post_tax_deductions,
                    "total": round(post_tax_amount, 2)
                },
                "total": round(pre_tax_amount + post_tax_amount, 2)
            },
            "benefits": {
                "items": benefits,
                "employee_contribution": round(employee_benefits, 2),
                "taxable_benefit_amount": round(taxable_benefits, 2)
            },
            "statutory_deductions": {
                "cpp_contribution": round(cpp_contribution, 2),
                "cpp2_contribution": round(cpp2_contribution, 2),
                "ei_premium": round(ei_premium, 2),
                "qpip_premium": round(qpip_premium, 2),
                "federal_tax": round(federal_tax, 2),
                "provincial_tax": round(provincial_tax, 2),
                "total": round(total_statutory + total_tax, 2)
            },
            "summary": {
                "gross_earnings": round(total_gross, 2),
                "taxable_income": round(taxable_income, 2),
                "total_deductions": round(total_deductions, 2),
                "net_pay": round(net_pay, 2)
            },
            "ytd_totals": {
                "gross_earnings": round(new_ytd_gross, 2),
                "cpp_contributions": round(new_ytd_cpp, 2),
                "cpp2_contributions": round(new_ytd_cpp2, 2),
                "ei_premiums": round(new_ytd_ei, 2),
                "qpip_premiums": round(new_ytd_qpip, 2),
                "federal_tax": round(new_ytd_federal_tax, 2),
                "provincial_tax": round(new_ytd_provincial_tax, 2),
                "net_pay": round(new_ytd_net, 2)
            },
            "eligibility": self.worker_service.get_eligibilities(employee)
        }

    def calculate_pay_run(
        self,
        employees: List[Dict[str, Any]],
        pay_period_start: datetime,
        pay_period_end: datetime,
        pay_date: datetime,
        pay_frequency: str = "biweekly"
    ) -> Dict[str, Any]:
        """
        Calculate payroll for multiple employees

        Args:
            employees: List of employee records with earnings, deductions, ytd
            pay_period_start: Pay period start date
            pay_period_end: Pay period end date
            pay_date: Payment date
            pay_frequency: Pay frequency

        Returns:
            Complete pay run with all employee calculations and totals
        """
        pay_periods = []
        totals = {
            "total_employees": 0,
            "total_gross_earnings": 0.0,
            "total_net_pay": 0.0,
            "total_cpp": 0.0,
            "total_cpp2": 0.0,
            "total_ei": 0.0,
            "total_qpip": 0.0,
            "total_federal_tax": 0.0,
            "total_provincial_tax": 0.0,
            "total_deductions": 0.0
        }

        for employee in employees:
            # Calculate pay period for this employee
            calculation = self.calculate_pay_period(
                employee=employee,
                earnings=employee.get("earnings", []),
                deductions=employee.get("deductions", []),
                benefits=employee.get("benefits", []),
                ytd_totals=employee.get("ytd_totals", {}),
                pay_frequency=pay_frequency,
                is_bonus=employee.get("is_bonus", False)
            )

            # Build pay period record
            pay_period = {
                "employee_id": employee.get("id", employee.get("_id")),
                "employee_number": employee.get("employee_number"),
                "employee_name": f"{employee.get('first_name', '')} {employee.get('last_name', '')}",
                "earnings": calculation["earnings"]["items"],
                "gross_earnings": calculation["earnings"]["gross_earnings"],
                "deductions": calculation["deductions"]["post_tax"]["items"],
                "total_deductions": calculation["deductions"]["total"],
                "benefits": calculation["benefits"]["items"],
                "total_benefits": calculation["benefits"]["employee_contribution"],
                "statutory_deductions": calculation["statutory_deductions"],
                "taxable_income": calculation["summary"]["taxable_income"],
                "net_pay": calculation["summary"]["net_pay"],
                "ytd_gross": calculation["ytd_totals"]["gross_earnings"],
                "ytd_cpp": calculation["ytd_totals"]["cpp_contributions"],
                "ytd_cpp2": calculation["ytd_totals"]["cpp2_contributions"],
                "ytd_ei": calculation["ytd_totals"]["ei_premiums"],
                "ytd_federal_tax": calculation["ytd_totals"]["federal_tax"],
                "ytd_provincial_tax": calculation["ytd_totals"]["provincial_tax"],
                "ytd_net": calculation["ytd_totals"]["net_pay"],
                "status": "pending",
                "payment_date": pay_date,
                "payment_method": employee.get("payment_method", "direct_deposit")
            }

            pay_periods.append(pay_period)

            # Accumulate totals
            totals["total_employees"] += 1
            totals["total_gross_earnings"] += calculation["earnings"]["gross_earnings"] or 0
            totals["total_net_pay"] += calculation["summary"]["net_pay"] or 0
            totals["total_cpp"] += calculation["statutory_deductions"]["cpp_contribution"] or 0
            totals["total_cpp2"] += calculation["statutory_deductions"]["cpp2_contribution"] or 0
            totals["total_ei"] += calculation["statutory_deductions"]["ei_premium"] or 0
            totals["total_qpip"] += calculation["statutory_deductions"]["qpip_premium"] or 0
            totals["total_federal_tax"] += calculation["statutory_deductions"]["federal_tax"] or 0
            totals["total_provincial_tax"] += calculation["statutory_deductions"]["provincial_tax"] or 0
            totals["total_deductions"] += calculation["summary"]["total_deductions"] or 0

        # Round totals
        for key in totals:
            if isinstance(totals[key], float):
                totals[key] = round(totals[key], 2)

        return {
            "pay_period_start_date": pay_period_start,
            "pay_period_end_date": pay_period_end,
            "pay_date": pay_date,
            "pay_frequency": pay_frequency,
            "pay_periods": pay_periods,
            **totals,
            "status": "calculated",
            "calculated_at": datetime.utcnow()
        }

    def validate_ytd_maximums(
        self,
        ytd_totals: Dict[str, float],
        province: str = "ON"
    ) -> Dict[str, bool]:
        """
        Check if YTD amounts have reached statutory maximums

        Args:
            ytd_totals: YTD totals dictionary
            province: Province code

        Returns:
            Dictionary indicating which maximums have been reached
        """
        # 2025 maximums
        cpp_max = 4034.10
        cpp2_max = 396.00
        ei_max = 1077.48 if province != "QC" else 834.39
        qpip_max = 464.36  # 94000 * 0.00494

        return {
            "cpp_maxed_out": ytd_totals.get("cpp_contributions", 0.0) >= cpp_max,
            "cpp2_maxed_out": ytd_totals.get("cpp2_contributions", 0.0) >= cpp2_max,
            "ei_maxed_out": ytd_totals.get("ei_premiums", 0.0) >= ei_max,
            "qpip_maxed_out": ytd_totals.get("qpip_premiums", 0.0) >= qpip_max if province == "QC" else False
        }
