from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import FRONTEND_ORIGIN
from .db import init_db, close_db
from .routes.auth import router as auth_router

app = FastAPI(title="3-Click Payroll API")

# Allow both localhost and 127.0.0.1 (handy for Vite)
origins = {FRONTEND_ORIGIN, "http://localhost:5173", "http://127.0.0.1:5173"}

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(origins),
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def on_startup():
    await init_db()

@app.on_event("shutdown")
async def on_shutdown():
    await close_db()

app.include_router(auth_router)

@app.get("/healthz")
def health():
    return {"ok": True}
