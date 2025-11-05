"""
Dashboard API Endpoints

Endpoints for dashboard statistics and summary data.
"""

from fastapi import APIRouter

router = APIRouter()


@router.get("/stats")
async def get_dashboard_stats():
    """Get dashboard statistics"""
    return {
        "total_employees": 0,
        "active_employees": 0,
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
