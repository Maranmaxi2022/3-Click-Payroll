from typing import Optional, Literal
from pydantic import BaseModel, EmailStr, Field

# ---------- Auth / Admin ----------

class AdminCreate(BaseModel):
    name: str = Field(min_length=2)
    email: EmailStr
    password: str = Field(min_length=8)

class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)

class ResetRequest(BaseModel):
    email: EmailStr

class UserOut(BaseModel):
    id: str
    email: EmailStr
    name: str
    role: str = "admin"

class TokenResponse(BaseModel):
    token: str
    user: UserOut


# ---------- Workers ----------

WorkerType = Literal["direct", "contract", "agent"]
EmploymentType = Literal["full_time", "part_time", "contract"]
PayUnit = Literal["hourly", "salary", "flat"]

class WorkerCreate(BaseModel):
    # core
    workerType: WorkerType
    firstName: str = Field(min_length=1)
    lastName: str = Field(min_length=1)

    # contacts (optional)
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    sin: Optional[str] = None

    # employment (optional)
    jobTitle: Optional[str] = None
    department: Optional[str] = None
    employmentType: Optional[EmploymentType] = None
    payRate: Optional[float] = None
    payUnit: Optional[PayUnit] = None

    # type-specific (optional)
    companyName: Optional[str] = None
    project: Optional[str] = None
    agencyFee: Optional[float] = None

class WorkerOut(BaseModel):
    id: str
