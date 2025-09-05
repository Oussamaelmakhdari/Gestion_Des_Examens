from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from .. import models, schemas, database

router = APIRouter(prefix="/streams", tags=["Filières"])

get_db = database.get_db

# --- Get all streams ---
@router.get("/", response_model=List[schemas.StreamOut])
def get_streams(db: Session = Depends(get_db)):
    return db.query(models.Stream).all()

# --- Get a stream by ID ---
@router.get("/{stream_id}", response_model=schemas.StreamOut)
def get_stream(stream_id: int, db: Session = Depends(get_db)):
    stream = db.query(models.Stream).filter(models.Stream.id == stream_id).first()
    if not stream:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="Filière introuvable")
    return stream

# --- Create a new stream ---
@router.post("/", response_model=schemas.StreamOut)
def create_stream(stream: schemas.StreamCreate, db: Session = Depends(get_db)):
    existing = db.query(models.Stream).filter(models.Stream.nom == stream.nom).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Cette filière existe déjà")
    new_stream = models.Stream(**stream.dict())
    db.add(new_stream)
    db.commit()
    db.refresh(new_stream)
    return new_stream

# --- Update a stream ---
@router.put("/{stream_id}", response_model=schemas.StreamOut)
def update_stream(stream_id: int, updated_stream: schemas.StreamUpdate, db: Session = Depends(get_db)):
    stream = db.query(models.Stream).filter(models.Stream.id == stream_id).first()
    if not stream:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="Filière introuvable")
    stream.nom = updated_stream.nom
    db.commit()
    db.refresh(stream)
    return stream

# --- Delete a stream ---
@router.delete("/{stream_id}")
def delete_stream(stream_id: int, db: Session = Depends(get_db)):
    stream = db.query(models.Stream).filter(models.Stream.id == stream_id).first()
    if not stream:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="Filière introuvable")
    db.delete(stream)
    db.commit()
    return {"message": "Filière supprimée avec succès"}


# --- Preload default streams & subjects ---
def init_streams(db: Session):
    streams_data = {
        "IAA": ["Deep learning", "Optimization", "NoSql et ETL", "SMA", "Langues", "Digital skills", "Python pour le web"],
        "IMSD": ["Deep learning", "Apprentissage automatique", "Introduction aux EDP et Contrôle des systèmes linéaires", 
                 "Langues", "Optimisation numérique", "Droit et éthique de l’IA", "Culture digitale"]
    }

    for s_name, subjects in streams_data.items():
        stream = db.query(models.Stream).filter(models.Stream.nom == s_name).first()
        if not stream:
            stream = models.Stream(nom=s_name)
            db.add(stream)
            db.commit()
            db.refresh(stream)
        
        # Add subjects
        for subj_name in subjects:
            subj = db.query(models.Subject).filter(models.Subject.name == subj_name, models.Subject.stream_id == stream.id).first()
            if not subj:
                new_subj = models.Subject(name=subj_name, stream_id=stream.id)
                db.add(new_subj)
    db.commit()
