import io
import random
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.responses import StreamingResponse
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas

from .. import models, schemas, database

router = APIRouter(prefix="/exams", tags=["Exams"])

# Create exam (admin only)
@router.post("/", response_model=schemas.ExamOut)
def create_exam(exam: schemas.ExamCreate, db: Session = Depends(database.get_db)):
    stream = db.query(models.Stream).filter(models.Stream.id == exam.stream_id).first()
    if not stream:
        raise HTTPException(status_code=404, detail="Stream introuvable")

    new_exam = models.Exam(
        subject=exam.subject,
        date=exam.date,
        time=exam.time,
        room=exam.room,
        stream_id=exam.stream_id,
        teacher_id=exam.teacher_id
    )
    db.add(new_exam)
    db.commit()
    db.refresh(new_exam)
    return new_exam

# List exams per stream
@router.get("/stream/{stream_id}", response_model=list[schemas.ExamOut])
def list_exams(stream_id: int, db: Session = Depends(database.get_db)):
    return db.query(models.Exam).filter(models.Exam.stream_id == stream_id).all()

# Download convocation as PDF
@router.get("/{exam_id}/convocation")
def download_convocation(exam_id: int, student_id: int, db: Session = Depends(database.get_db)):
    exam = db.query(models.Exam).filter(models.Exam.id == exam_id).first()
    student = db.query(models.User).filter(models.User.id == student_id, models.User.role == "student").first()

    if not exam or not student:
        raise HTTPException(status_code=404, detail="Exam ou étudiant introuvable")

    # Check if student already has a table number
    convocation = db.query(models.Convocation).filter_by(student_id=student.id, exam_id=exam.id).first()
    if not convocation:
        # Generate a random table number between 1 and 80
        table_number = random.randint(1, 80)
        convocation = models.Convocation(student_id=student.id, exam_id=exam.id, table_number=table_number)
        db.add(convocation)
        db.commit()
        db.refresh(convocation)

    # Generate PDF
    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    p.setFont("Helvetica-Bold", 18)
    p.drawCentredString(width / 2, height - 80, "Université Ibn Zohr")
    p.setFont("Helvetica", 14)
    p.drawCentredString(width / 2, height - 110, "Convocation d'Examen")

    p.setFont("Helvetica", 12)
    p.drawString(80, height - 160, f"Nom complet : {student.full_name}")
    p.drawString(80, height - 180, f"CNE : {student.cne}")
    p.drawString(80, height - 200, f"Code Apogée : {student.code_apoge}")
    p.drawString(80, height - 220, f"Examen : {exam.subject}")
    p.drawString(80, height - 240, f"Salle : {exam.room}")
    p.drawString(80, height - 260, f"Table : {convocation.table_number}")
    p.drawString(80, height - 280, f"Date : {exam.date.strftime('%d/%m/%Y')} à {exam.time.strftime('%H:%M')}")

    p.showPage()
    p.save()

    buffer.seek(0)
    return StreamingResponse(buffer, media_type="application/pdf", headers={"Content-Disposition": "inline; filename=convocation.pdf"})
