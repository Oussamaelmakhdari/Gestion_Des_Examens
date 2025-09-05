from pydantic import BaseModel
from typing import Optional, List
from pydantic import BaseModel
from datetime import date, time
from typing import List
from pydantic import BaseModel, EmailStr
from typing import Optional

# Base User schema
class UserBase(BaseModel):
    full_name: str
    email: EmailStr
    role: str
    stream_id: Optional[int] = None

# Student registration
class StudentCreate(UserBase):
    code_apoge: str
    cne: str
    password: str

# Teacher registration
class TeacherCreate(UserBase):
    password: str

# Admin creation (by other admins)
class AdminCreate(UserBase):
    password: str

# User output schema
class UserOut(UserBase):
    id: int

    class Config:
        orm_mode = True

# Login schema
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

# Token schema
class Token(BaseModel):
    access_token: str
    token_type: str

class StreamBase(BaseModel):
    nom: str

class StreamCreate(StreamBase):
    pass

class StreamUpdate(StreamBase):
    pass

class StreamOut(StreamBase):
    id: int

    class Config:
        orm_mode = True


# --- USERS ---
class UserBase(BaseModel):
    full_name: str
    email: str
    role: str  # admin | teacher | student
    stream_id: Optional[int] = None

class UserCreate(UserBase):
    password: str
    code_apoge: Optional[str] = None
    CNE: Optional[str] = None

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None
    stream_id: Optional[int] = None

class UserOut(UserBase):
    id: int
    class Config:
        orm_mode = True

# --- SUBJECTS ---
class SubjectBase(BaseModel):
    name: str
    stream_id: int

class SubjectCreate(SubjectBase):
    pass

class SubjectOut(SubjectBase):
    id: int
    class Config:
        orm_mode = True

# --- ROOMS ---
class RoomBase(BaseModel):
    name: str
    capacity: int

class RoomCreate(RoomBase):
    pass

class RoomOut(RoomBase):
    id: int
    class Config:
        orm_mode = True

# --- EXAMS ---
class ExamBase(BaseModel):
    name: str
    subject_id: int
    teacher_id: int
    room_id: int
    stream_id: int
    date: Optional[str] = None
    time: Optional[str] = None

class ExamCreate(ExamBase):
    pass

class ExamUpdate(BaseModel):
    name: Optional[str] = None
    subject_id: Optional[int] = None
    teacher_id: Optional[int] = None
    room_id: Optional[int] = None
    stream_id: Optional[int] = None
    date: Optional[str] = None
    time: Optional[str] = None

class ExamOut(ExamBase):
    id: int
    class Config:
        orm_mode = True


# Exam creation schema
class ExamCreate(BaseModel):
    subject: str
    date: date
    time: time
    room: str
    stream_id: int
    teacher_id: int | None = None

# Exam output schema
class ExamOut(ExamCreate):
    id: int

    class Config:
        orm_mode = True

# Convocation output schema
class ConvocationOut(BaseModel):
    exam: ExamOut
    table_number: int

    class Config:
        orm_mode = True
