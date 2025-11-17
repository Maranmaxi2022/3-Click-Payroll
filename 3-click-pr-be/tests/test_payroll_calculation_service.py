"""
Tests for Payroll Calculation Service

Comprehensive test suite for complete payroll calculations including
CPP, EI, income tax, and net pay calculations.
"""

import pytest
from src.services.payroll_calculation_service import PayrollCalculationService


class TestPayPeriodCalculation:
    """Test individual pay period calculations"""

    def setup_method(self):
        """Setup test fixtures"""
        self.payroll_service = PayrollCalculationService(tax_year=2025)

        # Sample employee
        self.employee = {
            "id": "test_emp_001",
            "employee_number": "EMP001",
            "first_name": "John",
            "last_name": "Doe",
            "workerCategory": "direct_employee",
            "worker_category": "direct_employee",
            "province": "ON",
            "province_of_employment": "ON",
            "dateOfBirth": "1990-01-01",
            "date_of_birth": "1990-01-01",
            "td1_federal": {
                "total_claim_amount": 15705.0
            },
            "td1_provincial": {
                "total_claim_amount": 11865.0
            },
            "payment_method": "direct_deposit"
        }

    def test_basic_pay_calculation(self):
        """Test basic pay period calculation"""
        earnings = [
            {
                "type": "regular",
                "description": "Regular Pay",
                "hours": 80,
                "rate": 25.0,
                "amount": 2000.0,
                "taxable": True
            }
        ]

        result = self.payroll_service.calculate_pay_period(
            employee=self.employee,
            earnings=earnings,
            pay_frequency="biweekly"
        )

        # Verify structure
        assert "earnings" in result
        assert "deductions" in result
        assert "statutory_deductions" in result
        assert "summary" in result
        assert "ytd_totals" in result

        # Verify gross
        assert result["earnings"]["gross_earnings"] == 2000.0

        # Verify statutory deductions exist
        assert result["statutory_deductions"]["cpp_contribution"] > 0
        assert result["statutory_deductions"]["ei_premium"] > 0
        assert result["statutory_deductions"]["federal_tax"] > 0
        assert result["statutory_deductions"]["provincial_tax"] > 0

        # Verify net pay
        assert result["summary"]["net_pay"] < result["summary"]["gross_earnings"]
        assert result["summary"]["net_pay"] > 0

    def test_cpp_calculation_with_ytd(self):
        """Test CPP calculation respects YTD maximum"""
        earnings = [{"type": "regular", "amount": 10000.0, "taxable": True}]

        # Near CPP maximum
        ytd_totals = {
            "cpp_contributions": 4000.0  # Near $4,034.10 max
        }

        result = self.payroll_service.calculate_pay_period(
            employee=self.employee,
            earnings=earnings,
            ytd_totals=ytd_totals,
            pay_frequency="biweekly"
        )

        # CPP should be capped
        cpp = result["statutory_deductions"]["cpp_contribution"]
        assert cpp <= 34.10, f"CPP {cpp} should be capped near maximum"

    def test_ei_calculation_with_ytd(self):
        """Test EI calculation respects YTD maximum"""
        earnings = [{"type": "regular", "amount": 10000.0, "taxable": True}]

        # Near EI maximum
        ytd_totals = {
            "ei_premiums": 1070.0  # Near $1,077.48 max
        }

        result = self.payroll_service.calculate_pay_period(
            employee=self.employee,
            earnings=earnings,
            ytd_totals=ytd_totals,
            pay_frequency="biweekly"
        )

        # EI should be capped
        ei = result["statutory_deductions"]["ei_premium"]
        assert ei <= 7.48, f"EI {ei} should be capped near maximum"

    def test_pre_tax_deductions(self):
        """Test pre-tax deductions reduce taxable income"""
        earnings = [{"type": "regular", "amount": 2000.0, "taxable": True}]

        deductions = [
            {
                "type": "rrsp",
                "description": "RRSP Contribution",
                "amount": 200.0,
                "pre_tax": True
            }
        ]

        result_with_pretax = self.payroll_service.calculate_pay_period(
            employee=self.employee,
            earnings=earnings,
            deductions=deductions,
            pay_frequency="biweekly"
        )

        result_without_pretax = self.payroll_service.calculate_pay_period(
            employee=self.employee,
            earnings=earnings,
            pay_frequency="biweekly"
        )

        # Taxes should be lower with pre-tax deduction
        tax_with = result_with_pretax["statutory_deductions"]["federal_tax"]
        tax_without = result_without_pretax["statutory_deductions"]["federal_tax"]

        assert tax_with < tax_without, "Pre-tax deduction should reduce income tax"

    def test_post_tax_deductions(self):
        """Test post-tax deductions don't affect tax"""
        earnings = [{"type": "regular", "amount": 2000.0, "taxable": True}]

        deductions = [
            {
                "type": "union_dues",
                "description": "Union Dues",
                "amount": 50.0,
                "pre_tax": False
            }
        ]

        result_with_posttax = self.payroll_service.calculate_pay_period(
            employee=self.employee,
            earnings=earnings,
            deductions=deductions,
            pay_frequency="biweekly"
        )

        result_without = self.payroll_service.calculate_pay_period(
            employee=self.employee,
            earnings=earnings,
            pay_frequency="biweekly"
        )

        # Taxes should be the same
        tax_with = result_with_posttax["statutory_deductions"]["federal_tax"]
        tax_without = result_without["statutory_deductions"]["federal_tax"]

        assert tax_with == tax_without, "Post-tax deduction should not affect income tax"

        # But net pay should be lower
        net_with = result_with_posttax["summary"]["net_pay"]
        net_without = result_without["summary"]["net_pay"]

        assert net_with < net_without, "Post-tax deduction should reduce net pay"

    def test_taxable_benefits(self):
        """Test taxable benefits increase taxable income"""
        earnings = [{"type": "regular", "amount": 2000.0, "taxable": True}]

        benefits = [
            {
                "type": "life_insurance",
                "description": "Life Insurance",
                "employee_contribution": 0.0,
                "employer_contribution": 50.0,
                "taxable": True
            }
        ]

        result_with_benefit = self.payroll_service.calculate_pay_period(
            employee=self.employee,
            earnings=earnings,
            benefits=benefits,
            pay_frequency="biweekly"
        )

        result_without = self.payroll_service.calculate_pay_period(
            employee=self.employee,
            earnings=earnings,
            pay_frequency="biweekly"
        )

        # Taxes should be higher with taxable benefit
        tax_with = result_with_benefit["statutory_deductions"]["federal_tax"]
        tax_without = result_without["statutory_deductions"]["federal_tax"]

        assert tax_with > tax_without, "Taxable benefit should increase income tax"

    def test_bonus_payment(self):
        """Test bonus payment calculation"""
        earnings = [{"type": "bonus", "amount": 5000.0, "taxable": True}]

        ytd_totals = {
            "gross_earnings": 25000.0,
            "cpp_contributions": 1000.0,
            "ei_premiums": 400.0,
            "federal_tax": 3000.0,
            "provincial_tax": 1000.0
        }

        result = self.payroll_service.calculate_pay_period(
            employee=self.employee,
            earnings=earnings,
            ytd_totals=ytd_totals,
            pay_frequency="biweekly",
            is_bonus=True
        )

        # Should have deductions
        assert result["statutory_deductions"]["federal_tax"] > 0
        assert result["summary"]["net_pay"] < 5000.0


class TestAgentWorkerCalculation:
    """Test calculations for agent workers (independent contractors)"""

    def setup_method(self):
        """Setup test fixtures"""
        self.payroll_service = PayrollCalculationService(tax_year=2025)

        self.agent_worker = {
            "id": "agent_001",
            "employee_number": "AGT001",
            "first_name": "Jane",
            "last_name": "Agent",
            "workerCategory": "agent_worker",
            "worker_category": "agent_worker",
            "province": "ON",
            "dateOfBirth": "1985-01-01"
        }

    def test_agent_worker_no_cpp_ei(self):
        """Test that agent workers don't have CPP/EI deductions"""
        earnings = [{"type": "commission", "amount": 5000.0, "taxable": True}]

        result = self.payroll_service.calculate_pay_period(
            employee=self.agent_worker,
            earnings=earnings,
            pay_frequency="monthly"
        )

        # Should have zero CPP and EI
        assert result["statutory_deductions"]["cpp_contribution"] == 0.0
        assert result["statutory_deductions"]["ei_premium"] == 0.0

        # Should still have income tax (if TD1 info provided)
        # For agent workers, this would typically be handled differently


class TestQuebecPayroll:
    """Test Quebec-specific payroll calculations"""

    def setup_method(self):
        """Setup test fixtures"""
        self.payroll_service = PayrollCalculationService(tax_year=2025)

        self.qc_employee = {
            "id": "qc_emp_001",
            "employee_number": "QC001",
            "first_name": "Pierre",
            "last_name": "Québécois",
            "workerCategory": "direct_employee",
            "worker_category": "direct_employee",
            "province": "QC",
            "province_of_employment": "QC",
            "dateOfBirth": "1988-05-15",
            "td1_federal": {"total_claim_amount": 15705.0},
            "td1_provincial": {"total_claim_amount": 18056.0}
        }

    def test_quebec_ei_rate(self):
        """Test that Quebec has lower EI rate"""
        earnings = [{"type": "regular", "amount": 2000.0, "taxable": True}]

        result = self.payroll_service.calculate_pay_period(
            employee=self.qc_employee,
            earnings=earnings,
            pay_frequency="biweekly"
        )

        # Quebec EI rate is 1.27% vs 1.64% federal
        # $2000 * 0.0127 = $25.40
        ei_premium = result["statutory_deductions"]["ei_premium"]

        assert 24.0 <= ei_premium <= 26.0, f"Quebec EI {ei_premium} not in expected range"

    def test_quebec_qpip(self):
        """Test QPIP deduction for Quebec employees"""
        earnings = [{"type": "regular", "amount": 2000.0, "taxable": True}]

        result = self.payroll_service.calculate_pay_period(
            employee=self.qc_employee,
            earnings=earnings,
            pay_frequency="biweekly"
        )

        # QPIP rate is 0.494%
        # $2000 * 0.00494 = $9.88
        qpip_premium = result["statutory_deductions"]["qpip_premium"]

        assert 9.0 <= qpip_premium <= 11.0, f"QPIP {qpip_premium} not in expected range"


class TestYTDAccumulation:
    """Test YTD accumulation"""

    def setup_method(self):
        """Setup test fixtures"""
        self.payroll_service = PayrollCalculationService(tax_year=2025)

        self.employee = {
            "id": "emp_ytd_001",
            "employee_number": "YTD001",
            "first_name": "Test",
            "last_name": "YTD",
            "workerCategory": "direct_employee",
            "province": "ON",
            "dateOfBirth": "1990-01-01",
            "td1_federal": {"total_claim_amount": 15705.0},
            "td1_provincial": {"total_claim_amount": 11865.0}
        }

    def test_ytd_accumulation(self):
        """Test that YTD values accumulate correctly"""
        earnings = [{"type": "regular", "amount": 2000.0, "taxable": True}]

        ytd_start = {
            "gross_earnings": 10000.0,
            "cpp_contributions": 500.0,
            "ei_premiums": 150.0,
            "federal_tax": 1200.0,
            "provincial_tax": 400.0
        }

        result = self.payroll_service.calculate_pay_period(
            employee=self.employee,
            earnings=earnings,
            ytd_totals=ytd_start,
            pay_frequency="biweekly"
        )

        # YTD should have increased
        assert result["ytd_totals"]["gross_earnings"] > 10000.0
        assert result["ytd_totals"]["cpp_contributions"] > 500.0
        assert result["ytd_totals"]["ei_premiums"] > 150.0
        assert result["ytd_totals"]["federal_tax"] > 1200.0
        assert result["ytd_totals"]["provincial_tax"] > 400.0

    def test_ytd_maximum_enforcement(self):
        """Test YTD maximum validation"""
        ytd_totals = {
            "cpp_contributions": 4034.10,  # At maximum
            "ei_premiums": 1077.48,  # At maximum
            "qpip_premiums": 0
        }

        validation = self.payroll_service.validate_ytd_maximums(
            ytd_totals=ytd_totals,
            province="ON"
        )

        assert validation["cpp_maxed_out"] is True
        assert validation["ei_maxed_out"] is True


class TestPayRunCalculation:
    """Test pay run calculations for multiple employees"""

    def setup_method(self):
        """Setup test fixtures"""
        self.payroll_service = PayrollCalculationService(tax_year=2025)

    def test_multi_employee_pay_run(self):
        """Test calculating pay run for multiple employees"""
        from datetime import datetime

        employees = [
            {
                "id": "emp_001",
                "first_name": "John",
                "last_name": "Doe",
                "employee_number": "001",
                "workerCategory": "direct_employee",
                "province": "ON",
                "dateOfBirth": "1990-01-01",
                "earnings": [{"type": "regular", "amount": 2000.0, "taxable": True}],
                "ytd_totals": {}
            },
            {
                "id": "emp_002",
                "first_name": "Jane",
                "last_name": "Smith",
                "employee_number": "002",
                "workerCategory": "direct_employee",
                "province": "ON",
                "dateOfBirth": "1992-05-15",
                "earnings": [{"type": "regular", "amount": 2500.0, "taxable": True}],
                "ytd_totals": {}
            }
        ]

        result = self.payroll_service.calculate_pay_run(
            employees=employees,
            pay_period_start=datetime(2025, 1, 1),
            pay_period_end=datetime(2025, 1, 15),
            pay_date=datetime(2025, 1, 20),
            pay_frequency="biweekly"
        )

        # Verify structure
        assert "pay_periods" in result
        assert "total_employees" in result
        assert len(result["pay_periods"]) == 2
        assert result["total_employees"] == 2

        # Verify totals
        assert result["total_gross_earnings"] == 4500.0
        assert result["total_net_pay"] > 0
        assert result["total_net_pay"] < 4500.0


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
