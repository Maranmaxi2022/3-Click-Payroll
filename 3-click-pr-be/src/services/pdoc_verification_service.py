"""
PDOC Verification Service

Utility for comparing calculated payroll deductions with CRA's
Payroll Deductions Online Calculator (PDOC) for verification purposes.

Since PDOC doesn't have a public API, this service provides:
- Formatted calculation summaries for manual PDOC verification
- Comparison helpers for PDOC results
- Discrepancy detection and reporting

Author: Maran
Version: 1.0.0
"""

from typing import Dict, Any, Optional
from datetime import date


class PDOCVerificationService:
    """Service for PDOC verification and comparison"""

    PDOC_URL = "https://apps.cra-arc.gc.ca/ebci/rhpd/start"

    def generate_pdoc_verification_report(
        self,
        employee: Dict[str, Any],
        gross_income: float,
        pay_frequency: str,
        calculated_deductions: Dict[str, float],
        pay_date: date
    ) -> Dict[str, Any]:
        """
        Generate a verification report for manual PDOC checking

        Args:
            employee: Employee information
            gross_income: Gross income for the period
            pay_frequency: Pay frequency
            calculated_deductions: Calculated statutory deductions
            pay_date: Payment date

        Returns:
            Verification report with PDOC input parameters and comparison template
        """
        # Extract employee info
        first_name = employee.get("first_name", "")
        last_name = employee.get("last_name", "")
        province = employee.get("province", employee.get("province_of_employment", "ON"))

        # Extract TD1 information
        td1_federal = employee.get("td1_federal", {})
        td1_provincial = employee.get("td1_provincial", {})

        federal_claim = td1_federal.get("total_claim_amount", 0) if td1_federal else 0
        provincial_claim = td1_provincial.get("total_claim_amount", 0) if td1_provincial else 0

        # Extract YTD
        ytd = employee.get("ytd_totals", {})

        # Build PDOC input parameters
        pdoc_inputs = {
            "pay_period_ending": pay_date.strftime("%Y-%m-%d"),
            "pay_frequency": self._format_pay_frequency(pay_frequency),
            "gross_income": f"${gross_income:,.2f}",
            "province_of_employment": province,
            "federal_td1_claim": f"${federal_claim:,.2f}" if federal_claim else "Basic Personal Amount",
            "provincial_td1_claim": f"${provincial_claim:,.2f}" if provincial_claim else "Basic Personal Amount",
            "cpp_ytd": f"${ytd.get('cpp_contributions', 0):,.2f}",
            "ei_ytd": f"${ytd.get('ei_premiums', 0):,.2f}",
            "income_tax_ytd": f"${ytd.get('federal_tax', 0) + ytd.get('provincial_tax', 0):,.2f}"
        }

        # Build calculated results
        calculated = {
            "cpp_contribution": f"${calculated_deductions.get('cpp_contribution', 0):,.2f}",
            "cpp2_contribution": f"${calculated_deductions.get('cpp2_contribution', 0):,.2f}",
            "ei_premium": f"${calculated_deductions.get('ei_premium', 0):,.2f}",
            "federal_tax": f"${calculated_deductions.get('federal_tax', 0):,.2f}",
            "provincial_tax": f"${calculated_deductions.get('provincial_tax', 0):,.2f}",
            "total_deductions": f"${calculated_deductions.get('total', 0):,.2f}"
        }

        return {
            "employee": {
                "name": f"{first_name} {last_name}",
                "employee_number": employee.get("employee_number", "N/A")
            },
            "pdoc_url": self.PDOC_URL,
            "pdoc_inputs": pdoc_inputs,
            "calculated_results": calculated,
            "instructions": self._get_verification_instructions(),
            "comparison_template": {
                "pdoc_cpp": None,
                "pdoc_cpp2": None,
                "pdoc_ei": None,
                "pdoc_federal_tax": None,
                "pdoc_provincial_tax": None,
                "pdoc_total": None
            }
        }

    def compare_with_pdoc(
        self,
        calculated_deductions: Dict[str, float],
        pdoc_results: Dict[str, float],
        tolerance: float = 0.01
    ) -> Dict[str, Any]:
        """
        Compare calculated deductions with PDOC results

        Args:
            calculated_deductions: Our calculated values
            pdoc_results: Values from PDOC
            tolerance: Acceptable difference threshold (default $0.01)

        Returns:
            Comparison results with discrepancies
        """
        comparisons = {}
        discrepancies = []
        total_difference = 0.0

        fields_to_compare = [
            ("cpp_contribution", "CPP Contribution"),
            ("cpp2_contribution", "CPP2 Contribution"),
            ("ei_premium", "EI Premium"),
            ("federal_tax", "Federal Tax"),
            ("provincial_tax", "Provincial Tax")
        ]

        for field, label in fields_to_compare:
            calculated = calculated_deductions.get(field, 0.0)
            pdoc = pdoc_results.get(field, 0.0)
            difference = abs(calculated - pdoc)

            comparison = {
                "calculated": calculated,
                "pdoc": pdoc,
                "difference": difference,
                "matches": difference <= tolerance
            }

            comparisons[field] = comparison

            if not comparison["matches"]:
                discrepancies.append({
                    "field": label,
                    "calculated": f"${calculated:.2f}",
                    "pdoc": f"${pdoc:.2f}",
                    "difference": f"${difference:.2f}"
                })

            total_difference += difference

        # Overall comparison
        has_discrepancies = len(discrepancies) > 0
        status = "PASS" if not has_discrepancies else "FAIL"

        return {
            "status": status,
            "total_difference": round(total_difference, 2),
            "comparisons": comparisons,
            "discrepancies": discrepancies,
            "summary": f"{len(discrepancies)} field(s) with discrepancies" if has_discrepancies else "All calculations match PDOC"
        }

    def generate_batch_verification_report(
        self,
        pay_run: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Generate verification report for entire pay run

        Args:
            pay_run: Pay run with all employee calculations

        Returns:
            Batch verification report
        """
        pay_periods = pay_run.get("pay_periods", [])

        verification_items = []
        for pay_period in pay_periods:
            employee_info = {
                "employee_id": pay_period.get("employee_id"),
                "employee_number": pay_period.get("employee_number"),
                "employee_name": pay_period.get("employee_name"),
                "gross_earnings": pay_period.get("gross_earnings", 0)
            }

            statutory = pay_period.get("statutory_deductions", {})

            verification_items.append({
                **employee_info,
                "cpp": statutory.get("cpp_contribution", 0),
                "cpp2": statutory.get("cpp2_contribution", 0),
                "ei": statutory.get("ei_premium", 0),
                "federal_tax": statutory.get("federal_tax", 0),
                "provincial_tax": statutory.get("provincial_tax", 0),
                "total": statutory.get("total", 0)
            })

        return {
            "pay_run_number": pay_run.get("pay_run_number"),
            "pay_period": {
                "start": pay_run.get("period_start_date"),
                "end": pay_run.get("period_end_date"),
                "pay_date": pay_run.get("pay_date")
            },
            "total_employees": len(verification_items),
            "verification_items": verification_items,
            "totals": {
                "gross_earnings": pay_run.get("total_gross_earnings", 0),
                "cpp": pay_run.get("total_cpp", 0),
                "cpp2": pay_run.get("total_cpp2", 0),
                "ei": pay_run.get("total_ei", 0),
                "federal_tax": pay_run.get("total_federal_tax", 0),
                "provincial_tax": pay_run.get("total_provincial_tax", 0),
                "total_deductions": pay_run.get("total_deductions", 0)
            },
            "pdoc_url": self.PDOC_URL,
            "instructions": "Verify each employee's calculations using PDOC. Compare the results and note any discrepancies."
        }

    def _format_pay_frequency(self, pay_frequency: str) -> str:
        """Format pay frequency for PDOC"""
        mapping = {
            "weekly": "Weekly (52 pay periods)",
            "biweekly": "Bi-weekly (26 pay periods)",
            "semi_monthly": "Semi-monthly (24 pay periods)",
            "semi-monthly": "Semi-monthly (24 pay periods)",
            "monthly": "Monthly (12 pay periods)"
        }
        return mapping.get(pay_frequency.lower(), pay_frequency)

    def _get_verification_instructions(self) -> list:
        """Get step-by-step PDOC verification instructions"""
        return [
            "1. Open PDOC at the provided URL",
            "2. Select the pay period ending date",
            "3. Enter the gross income for the period",
            "4. Select the province of employment",
            "5. Enter federal and provincial TD1 claim amounts",
            "6. Enter year-to-date CPP, EI, and income tax amounts",
            "7. Click 'Calculate' in PDOC",
            "8. Compare PDOC results with the calculated results below",
            "9. Report any discrepancies greater than $0.01"
        ]

    def format_discrepancy_report(
        self,
        employee_name: str,
        pay_date: date,
        discrepancies: list
    ) -> str:
        """
        Format discrepancy report as readable text

        Args:
            employee_name: Employee name
            pay_date: Pay date
            discrepancies: List of discrepancies

        Returns:
            Formatted report text
        """
        if not discrepancies:
            return f"✓ No discrepancies found for {employee_name} ({pay_date})"

        report = f"⚠ Discrepancies found for {employee_name} ({pay_date}):\n\n"

        for disc in discrepancies:
            report += f"  {disc['field']}:\n"
            report += f"    Calculated: {disc['calculated']}\n"
            report += f"    PDOC:       {disc['pdoc']}\n"
            report += f"    Difference: {disc['difference']}\n\n"

        return report

    def get_pdoc_url_with_params(
        self,
        pay_date: date,
        province: str = "ON",
        pay_frequency: str = "biweekly"
    ) -> str:
        """
        Generate PDOC URL (note: PDOC doesn't support URL parameters,
        but this provides a consistent starting point)

        Args:
            pay_date: Payment date
            province: Province code
            pay_frequency: Pay frequency

        Returns:
            PDOC URL
        """
        # PDOC doesn't accept URL parameters, so just return base URL
        return f"{self.PDOC_URL}?request_locale=en"
