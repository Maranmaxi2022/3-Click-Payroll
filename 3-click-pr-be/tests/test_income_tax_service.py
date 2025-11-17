"""
Tests for Income Tax Calculation Service

Comprehensive test suite for federal and provincial income tax calculations
based on CRA T4127 formulas (2025 Edition).
"""

import pytest
from src.services.income_tax_service import IncomeTaxService


class TestFederalTaxCalculation:
    """Test federal income tax calculations"""

    def setup_method(self):
        """Setup test fixtures"""
        self.tax_service = IncomeTaxService(tax_year=2025)

    def test_basic_federal_tax_biweekly(self):
        """Test federal tax calculation for biweekly pay"""
        # $50,000 annual salary = $1,923.08 biweekly
        gross_biweekly = 1923.08

        federal_tax = self.tax_service.calculate_federal_tax(
            gross_income=gross_biweekly,
            pay_frequency="biweekly",
            td1_total_claim=15705.0  # 2025 basic personal amount
        )

        # Expected: approx $195-205 biweekly
        assert 190.0 <= federal_tax <= 210.0, f"Federal tax {federal_tax} outside expected range"

    def test_federal_tax_with_claim_code(self):
        """Test federal tax with claim code instead of TD1"""
        gross_biweekly = 2000.0

        federal_tax = self.tax_service.calculate_federal_tax(
            gross_income=gross_biweekly,
            pay_frequency="biweekly",
            claim_code=1  # Basic personal amount
        )

        assert federal_tax > 0, "Federal tax should be positive"
        assert federal_tax < gross_biweekly, "Federal tax should be less than gross"

    def test_federal_tax_zero_income(self):
        """Test federal tax with zero income"""
        federal_tax = self.tax_service.calculate_federal_tax(
            gross_income=0.0,
            pay_frequency="biweekly"
        )

        assert federal_tax == 0.0, "Federal tax should be zero for zero income"

    def test_federal_tax_low_income(self):
        """Test federal tax for low income (below basic personal amount)"""
        # $15,000 annual = $576.92 biweekly (below basic personal amount)
        gross_biweekly = 576.92

        federal_tax = self.tax_service.calculate_federal_tax(
            gross_income=gross_biweekly,
            pay_frequency="biweekly",
            td1_total_claim=15705.0
        )

        # Should be zero or very minimal
        assert federal_tax == 0.0 or federal_tax < 5.0, f"Federal tax {federal_tax} too high for low income"

    def test_federal_tax_high_income(self):
        """Test federal tax for high income (top bracket)"""
        # $300,000 annual = $11,538.46 biweekly
        gross_biweekly = 11538.46

        federal_tax = self.tax_service.calculate_federal_tax(
            gross_income=gross_biweekly,
            pay_frequency="biweekly",
            td1_total_claim=15705.0
        )

        # Should be in highest bracket (33%)
        # Approximate: $3,500-3,700 biweekly
        assert federal_tax > 3000.0, f"Federal tax {federal_tax} too low for high income"

    def test_federal_tax_additional_withholding(self):
        """Test federal tax with additional withholding requested"""
        gross_biweekly = 2000.0
        additional_tax = 50.0

        federal_tax = self.tax_service.calculate_federal_tax(
            gross_income=gross_biweekly,
            pay_frequency="biweekly",
            td1_total_claim=15705.0,
            additional_tax=additional_tax
        )

        federal_tax_without_additional = self.tax_service.calculate_federal_tax(
            gross_income=gross_biweekly,
            pay_frequency="biweekly",
            td1_total_claim=15705.0
        )

        assert federal_tax == federal_tax_without_additional + additional_tax


class TestProvincialTaxCalculation:
    """Test provincial income tax calculations"""

    def setup_method(self):
        """Setup test fixtures"""
        self.tax_service = IncomeTaxService(tax_year=2025)

    def test_ontario_provincial_tax(self):
        """Test Ontario provincial tax calculation"""
        gross_biweekly = 2000.0

        provincial_tax = self.tax_service.calculate_provincial_tax(
            gross_income=gross_biweekly,
            province="ON",
            pay_frequency="biweekly",
            td1_total_claim=11865.0  # Ontario BPA 2025
        )

        # Should be positive and less than federal
        assert provincial_tax > 0, "Ontario tax should be positive"
        assert provincial_tax < 200.0, "Ontario tax seems too high"

    def test_quebec_provincial_tax(self):
        """Test Quebec provincial tax calculation (highest rate)"""
        gross_biweekly = 2000.0

        provincial_tax = self.tax_service.calculate_provincial_tax(
            gross_income=gross_biweekly,
            province="QC",
            pay_frequency="biweekly",
            td1_total_claim=18056.0  # Quebec BPA 2025
        )

        # Quebec has higher rates
        assert provincial_tax > 0, "Quebec tax should be positive"

    def test_alberta_provincial_tax(self):
        """Test Alberta provincial tax calculation (low rate)"""
        gross_biweekly = 2000.0

        provincial_tax = self.tax_service.calculate_provincial_tax(
            gross_income=gross_biweekly,
            province="AB",
            pay_frequency="biweekly",
            td1_total_claim=21885.0  # Alberta BPA 2025 (highest)
        )

        # Alberta has low rates and high BPA
        assert provincial_tax >= 0, "Alberta tax should be non-negative"

    def test_all_provinces_calculate(self):
        """Test that all provinces can calculate tax without errors"""
        gross_biweekly = 2000.0
        provinces = ["AB", "BC", "MB", "NB", "NL", "NS", "NT", "NU", "ON", "PE", "QC", "SK", "YT"]

        for province in provinces:
            provincial_tax = self.tax_service.calculate_provincial_tax(
                gross_income=gross_biweekly,
                province=province,
                pay_frequency="biweekly"
            )

            assert provincial_tax >= 0, f"{province} tax should be non-negative"
            assert isinstance(provincial_tax, float), f"{province} tax should be float"


class TestBonusTaxCalculation:
    """Test bonus tax calculation using cumulative method"""

    def setup_method(self):
        """Setup test fixtures"""
        self.tax_service = IncomeTaxService(tax_year=2025)

    def test_bonus_tax_calculation(self):
        """Test tax on bonus payment"""
        ytd_earnings = 25000.0  # Earnings so far this year
        bonus_amount = 5000.0

        federal_tax, provincial_tax = self.tax_service.calculate_tax_on_bonus(
            bonus_amount=bonus_amount,
            cumulative_earnings_ytd=ytd_earnings,
            federal_td1_claim=15705.0,
            provincial_td1_claim=11865.0,
            province="ON"
        )

        # Bonus tax should be positive
        assert federal_tax > 0, "Federal bonus tax should be positive"
        assert provincial_tax >= 0, "Provincial bonus tax should be non-negative"

        # Bonus tax should be less than bonus amount
        total_tax = federal_tax + provincial_tax
        assert total_tax < bonus_amount, "Total tax should be less than bonus"

    def test_large_bonus_higher_rate(self):
        """Test that large bonus hits higher tax brackets"""
        ytd_earnings = 50000.0
        small_bonus = 1000.0
        large_bonus = 50000.0

        # Small bonus tax
        fed_small, prov_small = self.tax_service.calculate_tax_on_bonus(
            bonus_amount=small_bonus,
            cumulative_earnings_ytd=ytd_earnings,
            federal_td1_claim=15705.0,
            provincial_td1_claim=11865.0,
            province="ON"
        )

        # Large bonus tax
        fed_large, prov_large = self.tax_service.calculate_tax_on_bonus(
            bonus_amount=large_bonus,
            cumulative_earnings_ytd=ytd_earnings,
            federal_td1_claim=15705.0,
            provincial_td1_claim=11865.0,
            province="ON"
        )

        # Effective rate on large bonus should be higher
        small_rate = (fed_small + prov_small) / small_bonus
        large_rate = (fed_large + prov_large) / large_bonus

        assert large_rate > small_rate, "Large bonus should have higher effective rate"


class TestPayFrequencies:
    """Test different pay frequencies"""

    def setup_method(self):
        """Setup test fixtures"""
        self.tax_service = IncomeTaxService(tax_year=2025)

    def test_all_pay_frequencies(self):
        """Test tax calculation for all pay frequencies"""
        annual_salary = 52000.0

        frequencies = {
            "weekly": 52,
            "biweekly": 26,
            "semi_monthly": 24,
            "monthly": 12
        }

        for freq, periods in frequencies.items():
            gross_per_period = annual_salary / periods

            federal_tax = self.tax_service.calculate_federal_tax(
                gross_income=gross_per_period,
                pay_frequency=freq,
                td1_total_claim=15705.0
            )

            # Annualized tax should be roughly the same regardless of frequency
            annual_tax = federal_tax * periods

            # Allow for small rounding differences
            assert 6000.0 <= annual_tax <= 8000.0, f"Annual tax {annual_tax} for {freq} outside expected range"

    def test_weekly_vs_biweekly_consistency(self):
        """Test that weekly and biweekly produce consistent annual results"""
        annual_salary = 50000.0

        # Weekly
        weekly_gross = annual_salary / 52
        weekly_tax = self.tax_service.calculate_federal_tax(
            gross_income=weekly_gross,
            pay_frequency="weekly",
            td1_total_claim=15705.0
        )
        annual_from_weekly = weekly_tax * 52

        # Biweekly
        biweekly_gross = annual_salary / 26
        biweekly_tax = self.tax_service.calculate_federal_tax(
            gross_income=biweekly_gross,
            pay_frequency="biweekly",
            td1_total_claim=15705.0
        )
        annual_from_biweekly = biweekly_tax * 26

        # Should be within $50 of each other
        difference = abs(annual_from_weekly - annual_from_biweekly)
        assert difference < 50.0, f"Annual tax difference {difference} too large between frequencies"


class TestTaxBreakdown:
    """Test complete tax breakdown functionality"""

    def setup_method(self):
        """Setup test fixtures"""
        self.tax_service = IncomeTaxService(tax_year=2025)

    def test_get_tax_breakdown(self):
        """Test getting complete tax breakdown"""
        breakdown = self.tax_service.get_tax_breakdown(
            gross_income=2000.0,
            province="ON",
            pay_frequency="biweekly",
            federal_td1_claim=15705.0,
            provincial_td1_claim=11865.0
        )

        assert "federal_tax" in breakdown
        assert "provincial_tax" in breakdown
        assert "total_income_tax" in breakdown

        # Total should equal sum
        assert breakdown["total_income_tax"] == breakdown["federal_tax"] + breakdown["provincial_tax"]

    def test_breakdown_with_claim_codes(self):
        """Test breakdown using claim codes"""
        breakdown = self.tax_service.get_tax_breakdown(
            gross_income=2000.0,
            province="ON",
            pay_frequency="biweekly",
            federal_claim_code=1,
            provincial_claim_code=1
        )

        assert breakdown["federal_tax"] >= 0
        assert breakdown["provincial_tax"] >= 0
        assert breakdown["total_income_tax"] >= 0


class TestEdgeCases:
    """Test edge cases and boundary conditions"""

    def setup_method(self):
        """Setup test fixtures"""
        self.tax_service = IncomeTaxService(tax_year=2025)

    def test_negative_income(self):
        """Test that negative income returns zero tax"""
        federal_tax = self.tax_service.calculate_federal_tax(
            gross_income=-1000.0,
            pay_frequency="biweekly"
        )

        assert federal_tax == 0.0, "Negative income should result in zero tax"

    def test_very_high_td1_claim(self):
        """Test with TD1 claim higher than income"""
        federal_tax = self.tax_service.calculate_federal_tax(
            gross_income=1000.0,
            pay_frequency="biweekly",
            td1_total_claim=100000.0  # Unrealistically high
        )

        assert federal_tax == 0.0, "Tax should be zero when TD1 claim exceeds income"

    def test_exact_bracket_boundary(self):
        """Test income exactly at bracket boundary"""
        # $55,867 is first federal bracket boundary
        # Biweekly equivalent: 55867 / 26 = 2148.73
        gross_biweekly = 2148.73

        federal_tax = self.tax_service.calculate_federal_tax(
            gross_income=gross_biweekly,
            pay_frequency="biweekly",
            td1_total_claim=15705.0
        )

        # Should calculate without error
        assert federal_tax >= 0, "Tax at bracket boundary should be valid"

    def test_rounding_precision(self):
        """Test that results are properly rounded to 2 decimals"""
        federal_tax = self.tax_service.calculate_federal_tax(
            gross_income=1234.567,
            pay_frequency="biweekly",
            td1_total_claim=15705.0
        )

        # Check it's rounded to 2 decimal places
        assert federal_tax == round(federal_tax, 2), "Tax should be rounded to 2 decimals"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
