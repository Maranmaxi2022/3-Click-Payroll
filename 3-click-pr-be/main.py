"""
Canadian Payroll Management System with automated calculations,
tax compliance, and statutory deduction processing.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn

from src.core.config import settings
from src.database.connection import init_db, close_db
from src.api.v1 import employees, payruns, settings_api, reports, dashboard, departments, designations, timesheets


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events - startup and shutdown"""
    # Startup
    print("Starting 3-Click Payroll API...")
    await init_db()
    print("Database connected successfully")
    yield
    # Shutdown
    print("Shutting down 3-Click Payroll API...")
    await close_db()
    print("Database connection closed")


# Initialize FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Canadian Payroll Management System with automated tax calculations and compliance",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Health check endpoint
@app.get("/")
async def root():
    """Root endpoint - API health check"""
    return {
        "message": "3-Click Payroll API",
        "version": settings.APP_VERSION,
        "status": "operational"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "database": "connected"
    }


# Register API routes
app.include_router(
    employees.router,
    prefix=f"{settings.API_V1_PREFIX}/employees",
    tags=["Employees"]
)

app.include_router(
    payruns.router,
    prefix=f"{settings.API_V1_PREFIX}/payruns",
    tags=["Pay Runs"]
)

app.include_router(
    settings_api.router,
    prefix=f"{settings.API_V1_PREFIX}/settings",
    tags=["Settings"]
)

app.include_router(
    reports.router,
    prefix=f"{settings.API_V1_PREFIX}/reports",
    tags=["Reports"]
)

app.include_router(
    dashboard.router,
    prefix=f"{settings.API_V1_PREFIX}/dashboard",
    tags=["Dashboard"]
)

app.include_router(
    departments.router,
    prefix=f"{settings.API_V1_PREFIX}/departments",
    tags=["Departments"]
)

app.include_router(
    designations.router,
    prefix=f"{settings.API_V1_PREFIX}/designations",
    tags=["Designations"]
)

app.include_router(
    timesheets.router,
    prefix=f"{settings.API_V1_PREFIX}/timesheets",
    tags=["Timesheets"]
)


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )
