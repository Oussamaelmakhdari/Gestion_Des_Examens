from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, database
from .auth import get_password_hash

router = APIRouter(prefix="/users", tags=["Users"])

# --- Student registration ---
@router.post("/register/student", response_model=schemas.UserOut)
def register_student(student: schemas.StudentCreate, db: Session = Depends(database.get_db)):
    existing_user = db.query(models.User).filter(models.User.email == student.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email déjà utilisé")

    hashed_password = get_password_hash(student.password)
    new_user = models.User(
        full_name=student.full_name,
        email=student.email,
        hashed_password=hashed_password,
        role="student",
        code_apoge=student.code_apoge,
        cne=student.cne,
        stream_id=student.stream_id
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

# --- Teacher registration ---
@router.post("/register/teacher", response_model=schemas.UserOut)
def register_teacher(teacher: schemas.TeacherCreate, db: Session = Depends(database.get_db)):
    existing_user = db.query(models.User).filter(models.User.email == teacher.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email déjà utilisé")

    hashed_password = get_password_hash(teacher.password)
    new_user = models.User(
        full_name=teacher.full_name,
        email=teacher.email,
        hashed_password=hashed_password,
        role="teacher",
        stream_id=teacher.stream_id
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

# --- Admin creation (by admin only) ---
@router.post("/create-admin", response_model=schemas.UserOut)
def create_admin(admin: schemas.AdminCreate, db: Session = Depends(database.get_db)):
    hashed_password = get_password_hash(admin.password)
    new_admin = models.User(
        full_name=admin.full_name,
        email=admin.email,
        hashed_password=hashed_password,
        role="admin"
    )
    db.add(new_admin)
    db.commit()
    db.refresh(new_admin)
    return new_admin
