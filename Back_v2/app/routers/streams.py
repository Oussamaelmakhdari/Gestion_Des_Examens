from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, database

router = APIRouter(prefix="/streams", tags=["Filières"])

@router.get("/", response_model=List[schemas.StreamOut])
def list_streams(db: Session = Depends(database.get_db)):
    return db.query(models.Stream).all()

@router.get("/{stream_id}/subjects", response_model=List[schemas.SubjectOut])
def list_subjects(stream_id: int, db: Session = Depends(database.get_db)):
    return db.query(models.Subject).filter(models.Subject.stream_id == stream_id).all()
