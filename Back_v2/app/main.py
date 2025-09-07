from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from . import models
from .database import engine, get_db
from .routers import auth, streams, exams, users, rooms
from .routers import subjects

from .seeds import seed_streams_subjects, seed_rooms, seed_default_admin

# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Exams Management API")

# CORS
origins = ["http://localhost:5173"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router)
app.include_router(streams.router)
app.include_router(exams.router)
app.include_router(users.router)
app.include_router(rooms.router)
app.include_router(subjects.router)


# Seed data on startup
@app.on_event("startup")
def startup_event():
    db = next(get_db())
    seed_streams_subjects(db)
    seed_rooms(db)
    seed_default_admin(db)

@app.get("/")
def root():
    return {"status": "ok"}
