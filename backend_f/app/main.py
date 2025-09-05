from fastapi import FastAPI
from . import models, database
from .routers import streams_router, users_router, auth
from .routers import streams_router, users_router, auth, exams_router


app = FastAPI()

# Create tables
models.Base.metadata.create_all(bind=database.engine)

# Preload streams & subjects
db = next(database.get_db())
streams_router.init_streams(db)

# Register routers
app.include_router(streams_router.router)
app.include_router(users_router.router)
app.include_router(auth.router)
app.include_router(exams_router.router)


# Preload default admin if not exists
db = next(database.get_db())
admin = db.query(models.User).filter(models.User.role == "admin").first()
if not admin:
    from app.routers.auth import get_password_hash
    default_admin = models.User(
        full_name="Default Admin",
        email="admin@example.com",
        hashed_password=get_password_hash("admin123"),
        role="admin"
    )
    db.add(default_admin)
    db.commit()
    db.refresh(default_admin)
