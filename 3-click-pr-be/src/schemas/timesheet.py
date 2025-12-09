"""
Timesheet/Time Entry MongoDB Schema

Stores employee time entries for payroll calculation including:
- Regular hours
- Overtime hours
- Shift details
- Approval status
"""

from beanie import Document
from pydantic import BaseModel, Field, field_serializer
from typing import Optional, List
from datetime import datetime, date, time
from enum import Enum


class TimeEntryType(str, Enum):
    """Type of time entry"""
    REGULAR = "regular"
    OVERTIME = "overtime"
    DOUBLE_TIME = "double_time"
    VACATION = "vacation"
    SICK_LEAVE = "sick_leave"
    STAT_HOLIDAY = "stat_holiday"
    UNPAID = "unpaid"


class TimeEntryStatus(str, Enum):
    """Status of time entry"""
    DRAFT = "draft"
    SUBMITTED = "submitted"
    APPROVED = "approved"
    REJECTED = "rejected"
    PROCESSED = "processed"  # Included in a pay run


class ShiftDetails(BaseModel):
    """Details about the shift/work period"""
    shift_start: Optional[str] = None  # Stored as HH:MM string (e.g., "09:00")
    shift_end: Optional[str] = None    # Stored as HH:MM string (e.g., "17:00")
    break_duration_minutes: int = 0  # Unpaid break time
    notes: Optional[str] = None


class TimeEntry(Document):
    """
    Individual Time Entry Document

    Represents a single day's work for an employee, including
    hours worked, type of hours, and approval status.
    """

    # Employee reference
    employee_id: str
    employee_number: str
    employee_name: str

    # Date and time information
    work_date: date
    entry_type: TimeEntryType = TimeEntryType.REGULAR

    # Hours worked
    hours_worked: float = 0.0  # Total hours for the day
    regular_hours: float = 0.0
    overtime_hours: float = 0.0
    double_time_hours: float = 0.0

    # Shift details (optional)
    shift_details: Optional[ShiftDetails] = None

    # Pay rate information (captured at time of entry)
    hourly_rate: Optional[float] = None
    overtime_rate: Optional[float] = None  # e.g., 1.5x or 2x

    # Project/cost center tracking (optional)
    department_id: Optional[str] = None
    department_name: Optional[str] = None
    project_code: Optional[str] = None
    location_id: Optional[str] = None

    # Approval workflow
    status: TimeEntryStatus = TimeEntryStatus.DRAFT
    submitted_at: Optional[datetime] = None
    submitted_by: Optional[str] = None
    approved_at: Optional[datetime] = None
    approved_by: Optional[str] = None
    rejection_reason: Optional[str] = None

    # Payroll processing
    pay_run_id: Optional[str] = None  # Set when included in pay run
    processed_at: Optional[datetime] = None

    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: Optional[str] = None
    updated_by: Optional[str] = None

    # Notes/comments
    employee_notes: Optional[str] = None
    manager_notes: Optional[str] = None

    class Settings:
        name = "time_entries"
        indexes = [
            "employee_id",
            "work_date",
            "status",
            "pay_run_id",
            ("employee_id", "work_date"),
            ("status", "work_date"),
        ]

    class Config:
        json_schema_extra = {
            "example": {
                "employee_id": "emp_123",
                "employee_number": "EMP001",
                "employee_name": "John Doe",
                "work_date": "2025-01-15",
                "entry_type": "regular",
                "hours_worked": 8.0,
                "regular_hours": 8.0,
                "overtime_hours": 0.0,
                "hourly_rate": 25.00,
                "status": "approved"
            }
        }


class TimesheetPeriod(Document):
    """
    Timesheet Period Document

    Groups multiple time entries for an employee over a pay period.
    Used for batch submission and approval.
    """

    # Employee reference
    employee_id: str
    employee_number: str
    employee_name: str

    # Period information
    period_start_date: date
    period_end_date: date
    pay_frequency: str  # weekly, biweekly, semi_monthly, monthly

    # Time entries (references)
    time_entry_ids: List[str] = []

    # Summary totals
    total_hours_worked: float = 0.0
    total_regular_hours: float = 0.0
    total_overtime_hours: float = 0.0
    total_double_time_hours: float = 0.0

    # Calculated earnings (for display, not used in final calculation)
    estimated_gross_pay: Optional[float] = None

    # Approval workflow
    status: TimeEntryStatus = TimeEntryStatus.DRAFT
    submitted_at: Optional[datetime] = None
    approved_at: Optional[datetime] = None
    approved_by: Optional[str] = None

    # Payroll processing
    pay_run_id: Optional[str] = None
    processed_at: Optional[datetime] = None

    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "timesheet_periods"
        indexes = [
            "employee_id",
            "period_start_date",
            "period_end_date",
            "status",
            "pay_run_id",
            ("employee_id", "period_start_date"),
        ]

    class Config:
        json_schema_extra = {
            "example": {
                "employee_id": "emp_123",
                "employee_number": "EMP001",
                "employee_name": "John Doe",
                "period_start_date": "2025-01-01",
                "period_end_date": "2025-01-15",
                "pay_frequency": "biweekly",
                "total_hours_worked": 80.0,
                "total_regular_hours": 80.0,
                "status": "approved"
            }
        }


class FileUploadStatus(str, Enum):
    """Status of file upload"""
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    PARTIALLY_COMPLETED = "partially_completed"


class TimesheetFileUpload(Document):
    """
    Timesheet File Upload Document

    Tracks CSV file uploads and their processing status.
    Allows users to view upload history and manage uploaded files.
    """

    # File information
    file_name: str
    file_size: int  # Size in bytes
    file_path: Optional[str] = None  # Path if file is stored

    # Upload information
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)
    uploaded_by: Optional[str] = None  # User ID or username

    # Processing results
    status: FileUploadStatus = FileUploadStatus.PROCESSING
    total_rows: int = 0  # Total data rows (excluding header)
    entries_created: int = 0  # Successfully created entries
    entries_failed: int = 0  # Failed entries

    # Time entry references
    time_entry_ids: List[str] = []  # IDs of created time entries

    # Error tracking
    errors: Optional[List[dict]] = []  # List of errors with row numbers

    # Date range of entries in file
    date_range_start: Optional[date] = None
    date_range_end: Optional[date] = None

    # Employee coverage
    employee_ids: List[str] = []  # Unique employee IDs in the upload
    employee_count: int = 0  # Number of unique employees

    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Processing notes
    processing_notes: Optional[str] = None

    class Settings:
        name = "timesheet_file_uploads"
        indexes = [
            "uploaded_at",
            "status",
            "uploaded_by",
            ("uploaded_at", "status"),
        ]

    class Config:
        json_schema_extra = {
            "example": {
                "file_name": "timesheet_november_2025.csv",
                "file_size": 15360,
                "uploaded_at": "2025-11-30T10:30:00",
                "status": "completed",
                "total_rows": 144,
                "entries_created": 144,
                "entries_failed": 0,
                "employee_count": 2,
                "date_range_start": "2025-11-01",
                "date_range_end": "2025-11-30"
            }
        }
