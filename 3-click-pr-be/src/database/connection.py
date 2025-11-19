"""
MongoDB Database Connection

Handles database initialization and connection management using Motor
(async MongoDB driver) and Beanie ODM.
"""

from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from typing import Optional

from src.core.config import settings
from src.schemas.employee import Employee
from src.schemas.pay_run import PayRun
from src.schemas.salary_component import SalaryComponent
from src.schemas.organization import Organization, Department, WorkLocation, Designation
from src.schemas.statutory_setting import StatutorySetting
from src.schemas.timesheet import TimeEntry, TimesheetPeriod


# Global database client
db_client: Optional[AsyncIOMotorClient] = None


async def init_db():
    """
    Initialize MongoDB database connection and Beanie ODM

    This function:
    1. Creates MongoDB connection using Motor
    2. Initializes Beanie with all document models
    3. Sets up indexes
    """
    global db_client

    try:
        # Create MongoDB client
        db_client = AsyncIOMotorClient(settings.MONGODB_URL)

        # Get database
        database = db_client[settings.MONGODB_DB_NAME]

        # Initialize Beanie with document models
        await init_beanie(
            database=database,
            document_models=[
                Employee,
                PayRun,
                SalaryComponent,
                Organization,
                Department,
                WorkLocation,
                Designation,
                StatutorySetting,
                TimeEntry,
                TimesheetPeriod
            ]
        )

        print(f"Connected to MongoDB: {settings.MONGODB_DB_NAME}")

    except Exception as e:
        print(f"Error connecting to MongoDB: {str(e)}")
        raise


async def close_db():
    """Close MongoDB database connection"""
    global db_client

    if db_client:
        db_client.close()
        print("MongoDB connection closed")


def get_database():
    """Get database instance"""
    if db_client is None:
        raise Exception("Database not initialized. Call init_db() first.")
    return db_client[settings.MONGODB_DB_NAME]
