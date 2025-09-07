# subjects.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, database

router = APIRouter(prefix="/subjects", tags=["Matières"])

@router.get("/", response_model=List[schemas.SubjectOut])
def list_all_subjects(db: Session = Depends(database.get_db)):
    return db.query(models.Subject).all()

@router.get("/stream/{stream_id}", response_model=List[schemas.SubjectOut])
def list_subjects_by_stream(stream_id: int, db: Session = Depends(database.get_db)):
    return db.query(models.Subject).filter(models.Subject.stream_id == stream_id).all()
