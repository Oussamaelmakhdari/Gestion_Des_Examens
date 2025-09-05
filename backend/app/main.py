
from fastapi import FastAPI
from . import models, database
from sqlalchemy.orm import Session

from .routers import exams_router

app = FastAPI()
models.Base.metadata.create_all(bind=database.engine)

# Preload streams and subjects
from sqlalchemy.orm import Session
db = next(database.get_db())

if not db.query(models.Stream).first():
    iaa = models.Stream(nom="IAA")
    imsd = models.Stream(nom="IMSD")
    db.add_all([iaa, imsd])
    db.commit()

    iaa_subjects = ["Deep learning", "Optimization", "NoSql et ETL", "SMA", "Langues", "Digital skills", "Python pour le web"]
    imsd_subjects = ["Deep learning", "Apprentissage automatique", "Introduction aux EDP et Contrôle des systèmes linéaires",
                     "Langues", "Optimisation numérique", "Droit et éthique de l’IA", "Culture digitale"]

    for s in iaa_subjects:
        db.add(models.Subject(name=s, stream_id=iaa.id))
    for s in imsd_subjects:
        db.add(models.Subject(name=s, stream_id=imsd.id))
    db.commit()

app.include_router(exams_router.router)

# Default admin
admin = db.query(models.User).filter(models.User.role == "admin").first()
if not admin:
    from .routers.auth import get_password_hash
    default_admin = models.User(
        full_name="Default Admin",
        email="admin@example.com",
        hashed_password=get_password_hash("admin123"),
        role="admin"
    )
    db.add(default_admin)
    db.commit()
