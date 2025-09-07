from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from fastapi.responses import StreamingResponse
import io, random
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas

from .. import models, schemas
from ..database import get_db
from ..deps import get_current_user_dep, require_admin

router = APIRouter(prefix="/exams", tags=["Exams"])


# -------------------------
# Create exam (admins only)
# -------------------------
@router.post("/", response_model=schemas.ExamOut)
def create_exam(
    payload: schemas.ExamCreate,
    current_user: models.User = Depends(get_current_user_dep),
    db: Session = Depends(get_db),
):
    # require admin
    require_admin(current_user)

    subject = db.query(models.Subject).filter(models.Subject.id == payload.subject_id).first()
    room = db.query(models.Room).filter(models.Room.id == payload.room_id).first()
    stream = db.query(models.Stream).filter(models.Stream.id == payload.stream_id).first()

    if not subject or not room or not stream:
        raise HTTPException(status_code=404, detail="Subject/Room/Stream not found")

    exam = models.Exam(
        subject_id=payload.subject_id,
        room_id=payload.room_id,
        stream_id=payload.stream_id,
        date=payload.date,
        time=payload.time,
        teacher_id=payload.teacher_id,
    )
    db.add(exam)
    db.commit()
    db.refresh(exam)

    # return Pydantic model
    return schemas.ExamOut.model_validate(exam)


# -------------------------
# List all exams (public/admin)
# -------------------------
@router.get("/", response_model=List[schemas.ExamOut])
def list_all_exams(db: Session = Depends(get_db)):
    exams = db.query(models.Exam).all()
    return [schemas.ExamOut.model_validate(e) for e in exams]


# -------------------------
# List exams for current student
# -------------------------
@router.get("/student", response_model=List[schemas.ExamOut])
def list_exams_for_student(
    current_user: models.User = Depends(get_current_user_dep),
    db: Session = Depends(get_db),
):
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Students only")

    exams = db.query(models.Exam).filter(models.Exam.stream_id == current_user.stream_id).all()
    return [schemas.ExamOut.model_validate(e) for e in exams]


# -------------------------
# List exams for current teacher
# -------------------------
@router.get("/teacher", response_model=List[schemas.ExamOut])
def list_exams_for_teacher(
    current_user: models.User = Depends(get_current_user_dep),
    db: Session = Depends(get_db),
):
    if current_user.role != "teacher":
        raise HTTPException(status_code=403, detail="Teachers only")

    exams = db.query(models.Exam).filter(models.Exam.teacher_id == current_user.id).all()
    return [schemas.ExamOut.model_validate(e) for e in exams]


# -------------------------
# Convocation PDF for students (download)
# -------------------------
@router.get("/{exam_id}/convocation")
def download_convocation(
    exam_id: int,
    current_user: models.User = Depends(get_current_user_dep),
    db: Session = Depends(get_db),
):
    # only students can download their convocation
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Students only")

    exam = db.query(models.Exam).filter(models.Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")

    # check or create convocation record
    conv = db.query(models.Convocation).filter_by(student_id=current_user.id, exam_id=exam.id).first()
    if not conv:
        conv = models.Convocation(
            student_id=current_user.id,
            exam_id=exam.id,
            table_number=random.randint(1, 80),
        )
        db.add(conv)
        db.commit()
        db.refresh(conv)

    # build PDF
    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    p.setFont("Helvetica-Bold", 18)
    p.drawCentredString(width / 2, height - 80, "Université Ibn Zohr")
    p.setFont("Helvetica", 14)
    p.drawCentredString(width / 2, height - 110, "Convocation d'Examen")

    y = height - 160
    p.setFont("Helvetica", 12)
    p.drawString(80, y, f"Nom complet : {current_user.full_name}"); y -= 20
    p.drawString(80, y, f"CNE : {current_user.cne or '-'}"); y -= 20
    p.drawString(80, y, f"Code Apogée : {current_user.code_apoge or '-'}"); y -= 20
    p.drawString(80, y, f"Filière : {exam.stream.nom}"); y -= 20
    p.drawString(80, y, f"Matière : {exam.subject.name}"); y -= 20
    p.drawString(80, y, f"Salle : {exam.room.name}"); y -= 20
    p.drawString(80, y, f"Table : {conv.table_number}"); y -= 20
    p.drawString(80, y, f"Date : {exam.date.strftime('%d/%m/%Y')} à {exam.time.strftime('%H:%M')}")

    p.showPage()
    p.save()
    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": "inline; filename=convocation.pdf"},
    )


# -------------------------
# Endpoints to populate admin dropdowns
# -------------------------
@router.get("/streams", response_model=List[schemas.StreamOut])
def get_streams(db: Session = Depends(get_db)):
    rows = db.query(models.Stream).all()
    return [schemas.StreamOut.model_validate(r) for r in rows]


@router.get("/subjects", response_model=List[schemas.SubjectOut])
def get_subjects(stream_id: Optional[int] = None, db: Session = Depends(get_db)):
    q = db.query(models.Subject)
    if stream_id is not None:
        q = q.filter(models.Subject.stream_id == stream_id)
    rows = q.all()
    return [schemas.SubjectOut.model_validate(r) for r in rows]


@router.get("/rooms", response_model=List[schemas.RoomOut])
def get_rooms(db: Session = Depends(get_db)):
    rows = db.query(models.Room).all()
    return [schemas.RoomOut.model_validate(r) for r in rows]
