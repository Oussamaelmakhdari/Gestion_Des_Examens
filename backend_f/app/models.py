from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base
from sqlalchemy import Date, Time, UniqueConstraint

class Stream(Base):
    __tablename__ = "streams"
    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String, unique=True, index=True, nullable=False)

    users = relationship("User", back_populates="stream")
    exams = relationship("Exam", back_populates="stream")

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, nullable=False)  # admin | teacher | student
    code_apoge = Column(String, nullable=True)
    CNE = Column(String, nullable=True)
    stream_id = Column(Integer, ForeignKey("streams.id"), nullable=True)

    stream = relationship("Stream", back_populates="users")
    exams_as_teacher = relationship("Exam", back_populates="teacher", foreign_keys="Exam.teacher_id")

class Subject(Base):
    __tablename__ = "subjects"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    stream_id = Column(Integer, ForeignKey("streams.id"))

    stream = relationship("Stream")
    exams = relationship("Exam", back_populates="subject")

class Room(Base):
    __tablename__ = "rooms"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    capacity = Column(Integer, nullable=False, default=30)

    exams = relationship("Exam", back_populates="room")

class Exam(Base):
    __tablename__ = "exams"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"))
    teacher_id = Column(Integer, ForeignKey("users.id"))
    room_id = Column(Integer, ForeignKey("rooms.id"))
    stream_id = Column(Integer, ForeignKey("streams.id"))
    date = Column(String, nullable=True)
    time = Column(String, nullable=True)

    subject = relationship("Subject", back_populates="exams")
    teacher = relationship("User", back_populates="exams_as_teacher", foreign_keys=[teacher_id])
    room = relationship("Room", back_populates="exams")
    stream = relationship("Stream", back_populates="exams")


class Exam(Base):
    __tablename__ = "exams"

    id = Column(Integer, primary_key=True, index=True)
    subject = Column(String, nullable=False)
    date = Column(Date, nullable=False)
    time = Column(Time, nullable=False)
    room = Column(String, nullable=False)

    # Link to stream
    stream_id = Column(Integer, ForeignKey("streams.id"), nullable=False)
    stream = relationship("Stream", back_populates="exams")

    # Link to supervising teacher (optional)
    teacher_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    teacher = relationship("User", back_populates="exams_as_teacher")

    convocations = relationship("Convocation", back_populates="exam")


class Convocation(Base):
    __tablename__ = "convocations"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    exam_id = Column(Integer, ForeignKey("exams.id"), nullable=False)
    table_number = Column(Integer, nullable=False)

    student = relationship("User")
    exam = relationship("Exam", back_populates="convocations")

    # Ensure one student cannot have multiple convocations for the same exam
    __table_args__ = (UniqueConstraint('student_id', 'exam_id', name='_student_exam_uc'),)
