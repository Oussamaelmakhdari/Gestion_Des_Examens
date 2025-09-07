from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, database

router = APIRouter(prefix="/rooms", tags=["Rooms"])

@router.get("/", response_model=List[schemas.RoomOut])
def list_rooms(db: Session = Depends(database.get_db)):
    return db.query(models.Room).all()

@router.post("/", response_model=schemas.RoomOut)
def create_room(payload: schemas.RoomCreate, db: Session = Depends(database.get_db)):
    exists = db.query(models.Room).filter(models.Room.name == payload.name).first()
    if exists:
        raise HTTPException(status_code=400, detail="Room exists")
    room = models.Room(name=payload.name, capacity=payload.capacity)
    db.add(room)
    db.commit()
    db.refresh(room)
    return room
