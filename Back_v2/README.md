# Exams Management API (Backend)

FastAPI backend (SQLite) with roles (admin/teacher/student), preloaded streams & subjects (IAA, IMSD), exam creation, and student convocation PDF.

## Quick start (Windows)
```bash
cd backend_complete_v2
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Open: http://127.0.0.1:8000/docs

Default admin:
- email: admin@example.com
- password: admin123
