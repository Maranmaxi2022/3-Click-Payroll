"""
Dashboard API Endpoints

Endpoints for dashboard statistics and summary data.
"""

from fastapi import APIRouter
from src.schemas.employee import Employee

router = APIRouter()


@router.get("/stats")
async def get_dashboard_stats():
    """Get dashboard statistics"""
    # Fetch real employee counts from database
    total_employees = await Employee.find().count()
    active_employees = await Employee.find({"status": "active"}).count()

    return {
        "total_employees": total_employees,
        "active_employees": active_employees,
        "total_pay_runs": 0,
        "total_gross_earnings_ytd": 0.0,
        "total_net_pay_ytd": 0.0,
        "total_cpp_ytd": 0.0,
        "total_ei_ytd": 0.0,
        "total_tax_ytd": 0.0
    }


@router.get("/recent-payruns")
async def get_recent_payruns():
    """Get recent pay runs"""
    return {
        "pay_runs": []
    }


@router.get("/liabilities")
async def get_liabilities():
    """Get tax and statutory liabilities"""
    return {
        "federal_tax": 0.0,
        "provincial_tax": 0.0,
        "cpp": 0.0,
        "ei": 0.0,
        "total": 0.0
    }
