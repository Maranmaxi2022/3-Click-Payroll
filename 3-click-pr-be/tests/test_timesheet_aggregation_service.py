"""
Tests for Timesheet Aggregation Service

Tests the aggregation of time entries into payroll earnings.
"""

import pytest
from datetime import date, datetime
from src.services.timesheet_aggregation_service import TimesheetAggregationService
from src.schemas.timesheet import TimeEntry, TimeEntryType, TimeEntryStatus


class TestTimesheetAggregation:
    """Test timesheet aggregation functionality"""

    def setup_method(self):
        """Set up test fixtures"""
        self.service = TimesheetAggregationService()

    def test_aggregate_hours_regular_only(self):
        """Test aggregation with regular hours only"""
        time_entries = [
            TimeEntry(
                employee_id="emp_001",
                employee_number="EMP001",
                employee_name="John Doe",
                work_date=date(2025, 1, 6),
                entry_type=TimeEntryType.REGULAR,
                hours_worked=8.0,
                regular_hours=8.0,
                overtime_hours=0.0,
                double_time_hours=0.0,
                hourly_rate=25.0,
                status=TimeEntryStatus.APPROVED
            ),
            TimeEntry(
                employee_id="emp_001",
                employee_number="EMP001",
                employee_name="John Doe",
                work_date=date(2025, 1, 7),
                entry_type=TimeEntryType.REGULAR,
                hours_worked=8.0,
                regular_hours=8.0,
                overtime_hours=0.0,
                double_time_hours=0.0,
                hourly_rate=25.0,
                status=TimeEntryStatus.APPROVED
            )
        ]

        result = self.service.aggregate_hours(time_entries)

        assert result["total_hours"] == 16.0
        assert result["regular_hours"] == 16.0
        assert result["overtime_hours"] == 0.0
        assert result["double_time_hours"] == 0.0

    def test_aggregate_hours_with_overtime(self):
        """Test aggregation with overtime hours"""
        time_entries = [
            TimeEntry(
                employee_id="emp_001",
                employee_number="EMP001",
                employee_name="John Doe",
                work_date=date(2025, 1, 6),
                entry_type=TimeEntryType.REGULAR,
                hours_worked=10.0,
                regular_hours=8.0,
                overtime_hours=2.0,
                double_time_hours=0.0,
                hourly_rate=25.0,
                status=TimeEntryStatus.APPROVED
            ),
            TimeEntry(
                employee_id="emp_001",
                employee_number="EMP001",
                employee_name="John Doe",
                work_date=date(2025, 1, 7),
                entry_type=TimeEntryType.OVERTIME,
                hours_worked=3.0,
                regular_hours=0.0,
                overtime_hours=3.0,
                double_time_hours=0.0,
                hourly_rate=25.0,
                status=TimeEntryStatus.APPROVED
            )
        ]

        result = self.service.aggregate_hours(time_entries)

        assert result["total_hours"] == 13.0
        assert result["regular_hours"] == 8.0
        assert result["overtime_hours"] == 5.0
        assert result["double_time_hours"] == 0.0

    def test_aggregate_hours_with_vacation(self):
        """Test aggregation with vacation hours"""
        time_entries = [
            TimeEntry(
                employee_id="emp_001",
                employee_number="EMP001",
                employee_name="John Doe",
                work_date=date(2025, 1, 6),
                entry_type=TimeEntryType.VACATION,
                hours_worked=8.0,
                regular_hours=0.0,
                overtime_hours=0.0,
                double_time_hours=0.0,
                hourly_rate=25.0,
                status=TimeEntryStatus.APPROVED
            )
        ]

        result = self.service.aggregate_hours(time_entries)

        assert result["total_hours"] == 8.0
        assert result["vacation_hours"] == 8.0
        assert result["regular_hours"] == 0.0

    def test_calculate_earnings_regular_only(self):
        """Test earnings calculation with regular hours only"""
        hours = {
            "total_hours": 80.0,
            "regular_hours": 80.0,
            "overtime_hours": 0.0,
            "double_time_hours": 0.0,
            "vacation_hours": 0.0,
            "sick_leave_hours": 0.0,
            "stat_holiday_hours": 0.0,
            "unpaid_hours": 0.0
        }

        earnings = self.service.calculate_earnings_from_hours(
            hours=hours,
            hourly_rate=25.0
        )

        assert len(earnings) == 1
        assert earnings[0]["type"] == "regular"
        assert earnings[0]["hours"] == 80.0
        assert earnings[0]["rate"] == 25.0
        assert earnings[0]["amount"] == 2000.0
        assert earnings[0]["taxable"] is True

    def test_calculate_earnings_with_overtime(self):
        """Test earnings calculation with overtime"""
        hours = {
            "total_hours": 90.0,
            "regular_hours": 80.0,
            "overtime_hours": 10.0,
            "double_time_hours": 0.0,
            "vacation_hours": 0.0,
            "sick_leave_hours": 0.0,
            "stat_holiday_hours": 0.0,
            "unpaid_hours": 0.0
        }

        earnings = self.service.calculate_earnings_from_hours(
            hours=hours,
            hourly_rate=25.0
        )

        assert len(earnings) == 2

        # Regular hours
        regular = next(e for e in earnings if e["type"] == "regular")
        assert regular["hours"] == 80.0
        assert regular["rate"] == 25.0
        assert regular["amount"] == 2000.0

        # Overtime hours (1.5x rate)
        overtime = next(e for e in earnings if e["type"] == "overtime")
        assert overtime["hours"] == 10.0
        assert overtime["rate"] == 37.5  # 25 * 1.5
        assert overtime["amount"] == 375.0

    def test_calculate_earnings_with_double_time(self):
        """Test earnings calculation with double-time"""
        hours = {
            "total_hours": 92.0,
            "regular_hours": 80.0,
            "overtime_hours": 8.0,
            "double_time_hours": 4.0,
            "vacation_hours": 0.0,
            "sick_leave_hours": 0.0,
            "stat_holiday_hours": 0.0,
            "unpaid_hours": 0.0
        }

        earnings = self.service.calculate_earnings_from_hours(
            hours=hours,
            hourly_rate=25.0
        )

        assert len(earnings) == 3

        # Double-time hours (2x rate)
        double_time = next(e for e in earnings if e["type"] == "double_time")
        assert double_time["hours"] == 4.0
        assert double_time["rate"] == 50.0  # 25 * 2
        assert double_time["amount"] == 200.0

    def test_calculate_earnings_with_vacation(self):
        """Test earnings calculation with vacation hours"""
        hours = {
            "total_hours": 8.0,
            "regular_hours": 0.0,
            "overtime_hours": 0.0,
            "double_time_hours": 0.0,
            "vacation_hours": 8.0,
            "sick_leave_hours": 0.0,
            "stat_holiday_hours": 0.0,
            "unpaid_hours": 0.0
        }

        earnings = self.service.calculate_earnings_from_hours(
            hours=hours,
            hourly_rate=25.0
        )

        assert len(earnings) == 1
        assert earnings[0]["type"] == "vacation"
        assert earnings[0]["hours"] == 8.0
        assert earnings[0]["rate"] == 25.0
        assert earnings[0]["amount"] == 200.0
        assert earnings[0]["taxable"] is True
        assert earnings[0]["pensionable"] is True
        assert earnings[0]["insurable"] is True

    def test_calculate_earnings_with_unpaid_hours(self):
        """Test earnings calculation with unpaid hours"""
        hours = {
            "total_hours": 8.0,
            "regular_hours": 0.0,
            "overtime_hours": 0.0,
            "double_time_hours": 0.0,
            "vacation_hours": 0.0,
            "sick_leave_hours": 0.0,
            "stat_holiday_hours": 0.0,
            "unpaid_hours": 8.0
        }

        earnings = self.service.calculate_earnings_from_hours(
            hours=hours,
            hourly_rate=25.0
        )

        assert len(earnings) == 1
        assert earnings[0]["type"] == "unpaid"
        assert earnings[0]["hours"] == 8.0
        assert earnings[0]["rate"] == 0.0
        assert earnings[0]["amount"] == 0.0
        assert earnings[0]["taxable"] is False
        assert earnings[0]["pensionable"] is False
        assert earnings[0]["insurable"] is False

    def test_calculate_earnings_mixed_types(self):
        """Test earnings calculation with mixed hour types"""
        hours = {
            "total_hours": 100.0,
            "regular_hours": 80.0,
            "overtime_hours": 10.0,
            "double_time_hours": 2.0,
            "vacation_hours": 8.0,
            "sick_leave_hours": 0.0,
            "stat_holiday_hours": 0.0,
            "unpaid_hours": 0.0
        }

        earnings = self.service.calculate_earnings_from_hours(
            hours=hours,
            hourly_rate=30.0
        )

        # Should have 4 earning types
        assert len(earnings) == 4

        # Calculate total
        total = sum(e["amount"] for e in earnings)
        expected_total = (80 * 30) + (10 * 45) + (2 * 60) + (8 * 30)
        assert total == expected_total

    def test_calculate_earnings_with_custom_overtime_rate(self):
        """Test earnings calculation with custom overtime rate"""
        hours = {
            "total_hours": 90.0,
            "regular_hours": 80.0,
            "overtime_hours": 10.0,
            "double_time_hours": 0.0,
            "vacation_hours": 0.0,
            "sick_leave_hours": 0.0,
            "stat_holiday_hours": 0.0,
            "unpaid_hours": 0.0
        }

        # Use custom overtime rate (1.8x instead of default 1.5x)
        earnings = self.service.calculate_earnings_from_hours(
            hours=hours,
            hourly_rate=25.0,
            overtime_rate=45.0  # 25 * 1.8
        )

        overtime = next(e for e in earnings if e["type"] == "overtime")
        assert overtime["rate"] == 45.0
        assert overtime["amount"] == 450.0

    def test_aggregate_hours_empty_list(self):
        """Test aggregation with empty time entries list"""
        result = self.service.aggregate_hours([])

        assert result["total_hours"] == 0.0
        assert result["regular_hours"] == 0.0
        assert result["overtime_hours"] == 0.0

    def test_calculate_earnings_zero_hours(self):
        """Test earnings calculation with zero hours"""
        hours = {
            "total_hours": 0.0,
            "regular_hours": 0.0,
            "overtime_hours": 0.0,
            "double_time_hours": 0.0,
            "vacation_hours": 0.0,
            "sick_leave_hours": 0.0,
            "stat_holiday_hours": 0.0,
            "unpaid_hours": 0.0
        }

        earnings = self.service.calculate_earnings_from_hours(
            hours=hours,
            hourly_rate=25.0
        )

        # Should return empty list when no hours worked
        assert len(earnings) == 0

    def test_earnings_rounding(self):
        """Test that earnings are properly rounded to 2 decimal places"""
        hours = {
            "total_hours": 80.5,
            "regular_hours": 80.5,
            "overtime_hours": 0.0,
            "double_time_hours": 0.0,
            "vacation_hours": 0.0,
            "sick_leave_hours": 0.0,
            "stat_holiday_hours": 0.0,
            "unpaid_hours": 0.0
        }

        earnings = self.service.calculate_earnings_from_hours(
            hours=hours,
            hourly_rate=25.33
        )

        # 80.5 * 25.33 = 2039.065, should round to 2039.07
        assert earnings[0]["amount"] == 2039.07

    def test_all_earning_types_present(self):
        """Test that all possible earning types can be generated"""
        hours = {
            "total_hours": 120.0,
            "regular_hours": 80.0,
            "overtime_hours": 10.0,
            "double_time_hours": 5.0,
            "vacation_hours": 8.0,
            "sick_leave_hours": 8.0,
            "stat_holiday_hours": 8.0,
            "unpaid_hours": 1.0
        }

        earnings = self.service.calculate_earnings_from_hours(
            hours=hours,
            hourly_rate=25.0
        )

        # Should have 7 earning types
        assert len(earnings) == 7

        earning_types = {e["type"] for e in earnings}
        expected_types = {
            "regular", "overtime", "double_time",
            "vacation", "sick_leave", "stat_holiday", "unpaid"
        }
        assert earning_types == expected_types


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
