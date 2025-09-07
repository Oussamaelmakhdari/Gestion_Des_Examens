from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from fastapi import Query

from .. import schemas, models
from ..database import get_db
from ..deps import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_user_dep,
    require_admin,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


# ----- LOGIN -----
@router.post("/login", response_model=schemas.Token)
def login(request: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == request.email).first()
    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": user.email, "role": user.role, "id": user.id})
    return {"access_token": token, "token_type": "bearer"}


# ----- REGISTER STUDENT -----
@router.post("/register/student", response_model=schemas.UserOut)
def register_student(payload: schemas.StudentCreate, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already in use")

    user = models.User(
        full_name=payload.full_name,
        email=payload.email,
        hashed_password=get_password_hash(payload.password),
        role="student",
        code_apoge=payload.code_apoge,
        cne=payload.cne,
        stream_id=payload.stream_id,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # return a Pydantic model instance (Pydantic v2)
    return schemas.UserOut.model_validate(user)


# ----- REGISTER TEACHER -----
@router.post("/register/teacher", response_model=schemas.UserOut)
def register_teacher(payload: schemas.TeacherCreate, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already in use")

    user = models.User(
        full_name=payload.full_name,
        email=payload.email,
        hashed_password=get_password_hash(payload.password),
        role="teacher",
        stream_id=payload.stream_id,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return schemas.UserOut.model_validate(user)


# ----- CREATE ADMIN (admins only) -----
@router.post("/create-admin", response_model=schemas.UserOut)
def create_admin(
    payload: schemas.AdminCreate,
    current_user: models.User = Depends(get_current_user_dep),
    db: Session = Depends(get_db),
):
    require_admin(current_user)

    if db.query(models.User).filter(models.User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already in use")

    user = models.User(
        full_name=payload.full_name,
        email=payload.email,
        hashed_password=get_password_hash(payload.password),
        role="admin",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return schemas.UserOut.model_validate(user)


# ----- GET STREAMS (optional for admin dropdowns) -----
@router.get("/streams", response_model=List[schemas.StreamOut])
def get_streams(db: Session = Depends(get_db)):
    rows = db.query(models.Stream).all()
    # convert each ORM to pydantic
    return [schemas.StreamOut.model_validate(r) for r in rows]


# ----- GET SUBJECTS (filterable by stream_id) -----
@router.get("/subjects", response_model=List[schemas.SubjectOut])
def get_subjects(
    stream_id: Optional[int] = Query(None, description="Filter by stream id"),
    db: Session = Depends(get_db),
):
    q = db.query(models.Subject)
    if stream_id is not None:
        q = q.filter(models.Subject.stream_id == stream_id)
    rows = q.all()
    return [schemas.SubjectOut.model_validate(r) for r in rows]


# ----- GET ROOMS -----
@router.get("/rooms", response_model=List[schemas.RoomOut])
def get_rooms(db: Session = Depends(get_db)):
    rows = db.query(models.Room).all()
    return [schemas.RoomOut.model_validate(r) for r in rows]
