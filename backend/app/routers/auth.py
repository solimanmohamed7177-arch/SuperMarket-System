from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.user import LoginRequest, TokenResponse
from app.core.security import verify_password, create_access_token, hash_password

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    from app.models.user import Employee
    user = db.query(Employee).filter(
        Employee.email == payload.email,
        Employee.is_active == 1
    ).first()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if user.password:
        if not verify_password(payload.password, user.password):
            raise HTTPException(status_code=401, detail="Invalid email or password")
    else:
        user.password = hash_password(payload.password)
        db.commit()

    token = create_access_token({"sub": user.email})

    return {
        "access_token": token,
        "token_type":   "bearer",
        "user": {
            "id":    user.emp_id,
            "name":  user.full_name,
            "email": user.email,
            "role":  user.role.r_name if user.role else "Staff",
        }
    }