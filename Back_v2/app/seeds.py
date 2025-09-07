from sqlalchemy.orm import Session
from . import models
from .deps import get_password_hash

def seed_streams_subjects(db: Session):
    streams = {
        "IAA": ["Deep learning","Optimization","NoSql et ETL","SMA","Langues","Digital skills","python pour le web"],
        "IMSD": ["Deep learning","Apprentissage automatique","Introduction aux EDP et Contrôle des systèmes linéaires","langues","Optimisation numérique","Droit et éthique de l’IA","Culture digitale"],
    }

    for s_name, subjects in streams.items():
        stream = db.query(models.Stream).filter(models.Stream.nom == s_name).first()
        if not stream:
            stream = models.Stream(nom=s_name)
            db.add(stream)
            db.commit()
            db.refresh(stream)
        for sub_name in subjects:
            exists = db.query(models.Subject).filter(models.Subject.stream_id == stream.id, models.Subject.name == sub_name).first()
            if not exists:
                db.add(models.Subject(name=sub_name, stream_id=stream.id))
        db.commit()

def seed_rooms(db: Session):
    for r in [("Amphi A", 100), ("Salle 1", 40), ("Salle 2", 40)]:
        name, cap = r
        exists = db.query(models.Room).filter(models.Room.name == name).first()
        if not exists:
            db.add(models.Room(name=name, capacity=cap))
    db.commit()

def seed_default_admin(db: Session):
    admin = db.query(models.User).filter(models.User.role == "admin").first()
    if not admin:
        admin = models.User(
            full_name="Default Admin",
            email="admin@example.com",
            hashed_password=get_password_hash("admin123"),
            role="admin",
        )
        db.add(admin)
        db.commit()
