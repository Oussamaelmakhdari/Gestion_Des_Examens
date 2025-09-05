
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import date, time

class StreamBase(BaseModel):
    nom: str

class StreamOut(StreamBase):
    id: int
    class Config:
        orm_mode = True

class UserBase(BaseModel):
    full_name: str
    email: EmailStr
    role: str
    stream_id: Optional[int] = None

class StudentCreate(UserBase):
    code_apoge: str
    cne: str
    password: str

class TeacherCreate(UserBase):
    password: str

class AdminCreate(UserBase):
    password: str

class UserOut(UserBase):
    id: int
    class Config:
        orm_mode = True

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class SubjectBase(BaseModel):
    name: str
    stream_id: int

class SubjectOut(SubjectBase):
    id: int
    class Config:
        orm_mode = True

class RoomBase(BaseModel):
    name: str
    capacity: int

class RoomOut(RoomBase):
    id: int
    class Config:
        orm_mode = True

class ExamCreate(BaseModel):
    subject_id: int
    teacher_id: Optional[int]
    room_id: int
    stream_id: int
    date: date
    time: time

class ExamOut(ExamCreate):
    id: int
    class Config:
        orm_mode = True

class ConvocationOut(BaseModel):
    exam: ExamOut
    table_number: int
    class Config:
        orm_mode = True
