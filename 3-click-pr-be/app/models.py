from pydantic import BaseModel, EmailStr, Field

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
