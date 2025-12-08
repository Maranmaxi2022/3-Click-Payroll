"""
Timesheet Aggregation Service

Aggregates approved time entries into earnings items for payroll calculation.
Bridges the gap between time tracking and payroll processing.
"""

from typing import List, Dict, Any, Optional, Tuple
from datetime import date, datetime
from beanie import PydanticObjectId

from ..schemas.timesheet import TimeEntry, TimeEntryStatus, TimeEntryType
from ..schemas.employee import Employee


class TimesheetAggregationService:
    """
    Service for aggregating time entries into payroll earnings.

    Converts approved time entries into the earnings format expected by
    PayrollCalculationService.calculate_pay_period().
    """

    def __init__(self):
        pass

    async def get_approved_time_entries(
        self,
        employee_ids: List[str],
        period_start_date: date,
        period_end_date: date
    ) -> Dict[str, List[TimeEntry]]:
        """
        Fetch all approved time entries for employees within a pay period.

        Args:
            employee_ids: List of employee IDs to fetch entries for
            period_start_date: Start of pay period
            period_end_date: End of pay period

        Returns:
            Dictionary mapping employee_id to list of their time entries
        """
        entries_by_employee = {}

        # Fetch approved entries for the period
        entries = await TimeEntry.find({
            "employee_id": {"$in": employee_ids},
            "work_date": {"$gte": period_start_date, "$lte": period_end_date},
            "status": {"$in": [TimeEntryStatus.APPROVED, TimeEntryStatus.PROCESSED]}
        }).to_list()

        # Group by employee
        for entry in entries:
            if entry.employee_id not in entries_by_employee:
                entries_by_employee[entry.employee_id] = []
            entries_by_employee[entry.employee_id].append(entry)

        return entries_by_employee

    def aggregate_hours(
        self,
        time_entries: List[TimeEntry]
    ) -> Dict[str, float]:
        """
        Aggregate hours from time entries by type.

        Args:
            time_entries: List of time entries for an employee

        Returns:
            Dictionary with aggregated hours:
            {
                "total_hours": float,
                "regular_hours": float,
                "overtime_hours": float,
                "double_time_hours": float,
                "vacation_hours": float,
                "sick_leave_hours": float,
                "stat_holiday_hours": float,
                "unpaid_hours": float
            }
        """
        aggregated = {
            "total_hours": 0.0,
            "regular_hours": 0.0,
            "overtime_hours": 0.0,
            "double_time_hours": 0.0,
            "vacation_hours": 0.0,
            "sick_leave_hours": 0.0,
            "stat_holiday_hours": 0.0,
            "unpaid_hours": 0.0
        }

        for entry in time_entries:
            aggregated["total_hours"] += entry.hours_worked
            aggregated["regular_hours"] += entry.regular_hours
            aggregated["overtime_hours"] += entry.overtime_hours
            aggregated["double_time_hours"] += entry.double_time_hours

            # Aggregate by entry type
            if entry.entry_type == TimeEntryType.VACATION:
                aggregated["vacation_hours"] += entry.hours_worked
            elif entry.entry_type == TimeEntryType.SICK_LEAVE:
                aggregated["sick_leave_hours"] += entry.hours_worked
            elif entry.entry_type == TimeEntryType.STAT_HOLIDAY:
                aggregated["stat_holiday_hours"] += entry.hours_worked
            elif entry.entry_type == TimeEntryType.UNPAID:
                aggregated["unpaid_hours"] += entry.hours_worked

        return aggregated

    def calculate_earnings_from_hours(
        self,
        hours: Dict[str, float],
        hourly_rate: float,
        overtime_rate: Optional[float] = None,
        double_time_rate: Optional[float] = None
    ) -> List[Dict[str, Any]]:
        """
        Calculate earnings items from aggregated hours.

        Args:
            hours: Aggregated hours dictionary
            hourly_rate: Employee's base hourly rate
            overtime_rate: Overtime rate (defaults to 1.5x base)
            double_time_rate: Double-time rate (defaults to 2x base)

        Returns:
            List of earnings items in format expected by PayrollCalculationService
        """
        if overtime_rate is None:
            overtime_rate = hourly_rate * 1.5
        if double_time_rate is None:
            double_time_rate = hourly_rate * 2.0

        earnings = []

        # Regular hours
        if hours["regular_hours"] > 0:
            earnings.append({
                "type": "regular",
                "description": "Regular Hours",
                "hours": hours["regular_hours"],
                "rate": hourly_rate,
                "amount": round(hours["regular_hours"] * hourly_rate, 2),
                "taxable": True,
                "pensionable": True,
                "insurable": True
            })

        # Overtime hours
        if hours["overtime_hours"] > 0:
            earnings.append({
                "type": "overtime",
                "description": "Overtime Hours (1.5x)",
                "hours": hours["overtime_hours"],
                "rate": overtime_rate,
                "amount": round(hours["overtime_hours"] * overtime_rate, 2),
                "taxable": True,
                "pensionable": True,
                "insurable": True
            })

        # Double-time hours
        if hours["double_time_hours"] > 0:
            earnings.append({
                "type": "double_time",
                "description": "Double-Time Hours (2x)",
                "hours": hours["double_time_hours"],
                "rate": double_time_rate,
                "amount": round(hours["double_time_hours"] * double_time_rate, 2),
                "taxable": True,
                "pensionable": True,
                "insurable": True
            })

        # Vacation pay
        if hours["vacation_hours"] > 0:
            earnings.append({
                "type": "vacation",
                "description": "Vacation Pay",
                "hours": hours["vacation_hours"],
                "rate": hourly_rate,
                "amount": round(hours["vacation_hours"] * hourly_rate, 2),
                "taxable": True,
                "pensionable": True,
                "insurable": True
            })

        # Sick leave
        if hours["sick_leave_hours"] > 0:
            earnings.append({
                "type": "sick_leave",
                "description": "Sick Leave",
                "hours": hours["sick_leave_hours"],
                "rate": hourly_rate,
                "amount": round(hours["sick_leave_hours"] * hourly_rate, 2),
                "taxable": True,
                "pensionable": True,
                "insurable": True
            })

        # Statutory holiday
        if hours["stat_holiday_hours"] > 0:
            earnings.append({
                "type": "stat_holiday",
                "description": "Statutory Holiday",
                "hours": hours["stat_holiday_hours"],
                "rate": hourly_rate,
                "amount": round(hours["stat_holiday_hours"] * hourly_rate, 2),
                "taxable": True,
                "pensionable": True,
                "insurable": True
            })

        # Unpaid hours (tracked but no amount)
        if hours["unpaid_hours"] > 0:
            earnings.append({
                "type": "unpaid",
                "description": "Unpaid Hours",
                "hours": hours["unpaid_hours"],
                "rate": 0.0,
                "amount": 0.0,
                "taxable": False,
                "pensionable": False,
                "insurable": False
            })

        return earnings

    async def aggregate_employee_earnings(
        self,
        employee_id: str,
        period_start_date: date,
        period_end_date: date
    ) -> Tuple[Optional[Dict[str, Any]], List[Dict[str, Any]]]:
        """
        Aggregate time entries into earnings for a single employee.

        Args:
            employee_id: Employee ID
            period_start_date: Start of pay period
            period_end_date: End of pay period

        Returns:
            Tuple of (employee_dict, earnings_list)
            Returns (None, []) if no approved entries found
        """
        # Fetch employee
        try:
            employee = await Employee.get(PydanticObjectId(employee_id))
        except Exception:
            return None, []

        if not employee:
            return None, []

        # Fetch approved time entries
        entries_by_employee = await self.get_approved_time_entries(
            employee_ids=[employee_id],
            period_start_date=period_start_date,
            period_end_date=period_end_date
        )

        time_entries = entries_by_employee.get(employee_id, [])

        if not time_entries:
            return None, []

        # Aggregate hours
        hours = self.aggregate_hours(time_entries)

        # Get hourly rate from employee or first time entry
        hourly_rate = employee.hourly_rate or 0.0
        if hourly_rate == 0.0 and time_entries:
            hourly_rate = time_entries[0].hourly_rate or 0.0

        # Calculate earnings
        earnings = self.calculate_earnings_from_hours(
            hours=hours,
            hourly_rate=hourly_rate
        )

        # Convert employee to dict format expected by PayrollCalculationService
        employee_dict = {
            "id": str(employee.id),
            "employee_number": employee.employee_number,
            "first_name": employee.first_name,
            "last_name": employee.last_name,
            "workerCategory": employee.worker_category,
            "province": employee.province_of_employment,
            "dateOfBirth": str(employee.date_of_birth) if employee.date_of_birth else None,
            "hourly_rate": hourly_rate,
            "td1_federal": employee.td1_federal.dict() if employee.td1_federal else None,
            "td1_provincial": employee.td1_provincial.dict() if employee.td1_provincial else None,
            "ytd_totals": employee.ytd_carry_in.dict() if employee.ytd_carry_in else None
        }

        return employee_dict, earnings

    async def aggregate_pay_run_earnings(
        self,
        employee_ids: List[str],
        period_start_date: date,
        period_end_date: date
    ) -> Dict[str, Dict[str, Any]]:
        """
        Aggregate earnings for all employees in a pay run.

        Args:
            employee_ids: List of employee IDs
            period_start_date: Start of pay period
            period_end_date: End of pay period

        Returns:
            Dictionary mapping employee_id to:
            {
                "employee": employee_dict,
                "earnings": earnings_list,
                "time_entries": list of time entry IDs,
                "summary": aggregated hours summary
            }
        """
        pay_run_data = {}

        # Fetch all approved entries
        entries_by_employee = await self.get_approved_time_entries(
            employee_ids=employee_ids,
            period_start_date=period_start_date,
            period_end_date=period_end_date
        )

        # Process each employee
        for employee_id in employee_ids:
            time_entries = entries_by_employee.get(employee_id, [])

            if not time_entries:
                continue

            # Fetch employee
            try:
                employee = await Employee.get(PydanticObjectId(employee_id))
            except Exception:
                continue

            if not employee:
                continue

            # Aggregate hours
            hours = self.aggregate_hours(time_entries)

            # Get hourly rate
            hourly_rate = employee.hourly_rate or 0.0
            if hourly_rate == 0.0 and time_entries:
                hourly_rate = time_entries[0].hourly_rate or 0.0

            # Calculate earnings
            earnings = self.calculate_earnings_from_hours(
                hours=hours,
                hourly_rate=hourly_rate
            )

            # Build employee dict
            employee_dict = {
                "id": str(employee.id),
                "employee_number": employee.employee_number,
                "first_name": employee.first_name,
                "last_name": employee.last_name,
                "workerCategory": employee.worker_category,
                "province": employee.province_of_employment,
                "dateOfBirth": str(employee.date_of_birth) if employee.date_of_birth else None,
                "hourly_rate": hourly_rate,
                "department_id": employee.department_id,
                "department_name": employee.department_name,
                "td1_federal": employee.td1_federal.dict() if employee.td1_federal else None,
                "td1_provincial": employee.td1_provincial.dict() if employee.td1_provincial else None,
                "ytd_totals": employee.ytd_carry_in.dict() if employee.ytd_carry_in else None
            }

            pay_run_data[employee_id] = {
                "employee": employee_dict,
                "earnings": earnings,
                "time_entry_ids": [str(entry.id) for entry in time_entries],
                "summary": hours
            }

        return pay_run_data

    async def mark_entries_as_processed(
        self,
        time_entry_ids: List[str],
        pay_run_id: str
    ) -> int:
        """
        Mark time entries as processed and link to pay run.

        Args:
            time_entry_ids: List of time entry IDs
            pay_run_id: Pay run ID that processed these entries

        Returns:
            Number of entries updated
        """
        updated_count = 0

        for entry_id in time_entry_ids:
            try:
                entry = await TimeEntry.get(PydanticObjectId(entry_id))
                if entry:
                    entry.status = TimeEntryStatus.PROCESSED
                    entry.pay_run_id = pay_run_id
                    entry.processed_at = datetime.utcnow()
                    entry.updated_at = datetime.utcnow()
                    await entry.save()
                    updated_count += 1
            except Exception:
                continue

        return updated_count

    async def get_employee_timesheet_summary(
        self,
        employee_id: str,
        period_start_date: date,
        period_end_date: date
    ) -> Dict[str, Any]:
        """
        Get complete timesheet summary for an employee.

        Args:
            employee_id: Employee ID
            period_start_date: Start of period
            period_end_date: End of period

        Returns:
            Summary with hours, earnings, and entries
        """
        # Fetch employee
        try:
            employee = await Employee.get(PydanticObjectId(employee_id))
        except Exception:
            return {
                "error": "Employee not found",
                "employee_id": employee_id
            }

        if not employee:
            return {
                "error": "Employee not found",
                "employee_id": employee_id
            }

        # Fetch time entries
        entries = await TimeEntry.find({
            "employee_id": employee_id,
            "work_date": {"$gte": period_start_date, "$lte": period_end_date}
        }).sort("work_date").to_list()

        # Aggregate hours
        hours = self.aggregate_hours(entries)

        # Calculate earnings
        hourly_rate = employee.hourly_rate or 0.0
        if hourly_rate == 0.0 and entries:
            hourly_rate = entries[0].hourly_rate or 0.0

        earnings = self.calculate_earnings_from_hours(
            hours=hours,
            hourly_rate=hourly_rate
        )

        # Calculate total earnings
        total_gross = sum(item["amount"] for item in earnings)

        # Group by status
        status_counts = {}
        for entry in entries:
            status = entry.status.value
            status_counts[status] = status_counts.get(status, 0) + 1

        return {
            "employee_id": employee_id,
            "employee_number": employee.employee_number,
            "employee_name": f"{employee.first_name} {employee.last_name}",
            "period_start": period_start_date,
            "period_end": period_end_date,
            "hours_summary": hours,
            "earnings": earnings,
            "total_gross_earnings": round(total_gross, 2),
            "total_entries": len(entries),
            "status_breakdown": status_counts,
            "time_entries": [entry.dict() for entry in entries]
        }
