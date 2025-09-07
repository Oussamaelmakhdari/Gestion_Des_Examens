from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional, List
from datetime import date, time

class StreamBase(BaseModel):
    nom: str

class StreamCreate(StreamBase):
    pass

class StreamOut(StreamBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class SubjectBase(BaseModel):
    name: str
    stream_id: int

class SubjectCreate(SubjectBase):
    pass

class SubjectOut(SubjectBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class RoomBase(BaseModel):
    name: str
    capacity: int

class RoomCreate(RoomBase):
    pass

class RoomOut(RoomBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

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
    code_apoge: Optional[str] = None
    cne: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class ExamCreate(BaseModel):
    subject_id: int
    stream_id: int
    room_id: int
    date: date
    time: time
    teacher_id: Optional[int] = None

class ExamOut(BaseModel):
    id: int
    subject: SubjectOut
    stream: StreamOut
    room: RoomOut
    date: date
    time: time
    teacher_id: Optional[int] = None
    model_config = ConfigDict(from_attributes=True)

class ConvocationOut(BaseModel):
    exam: ExamOut
    table_number: int
    model_config = ConfigDict(from_attributes=True)
