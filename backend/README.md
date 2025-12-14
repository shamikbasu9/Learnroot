# Learnroot Backend (FastAPI)

This is the FastAPI backend for the Learnroot school management system.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set up environment variables in `.env`:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=learnroot_db
JWT_SECRET=your-secret-key
PORT=5000
```

3. Initialize the database:
```bash
python scripts/init_db.py
```

4. Create admin user:
```bash
python scripts/create_admin.py
```

5. Run the server:
```bash
python main.py
```

Or with uvicorn:
```bash
uvicorn main:app --reload
```

## API Documentation

Once running, visit `http://localhost:5000/docs` for interactive API documentation.

## Routes

- `/api/auth` - Authentication
- `/api/teachers` - Teacher management
- `/api/students` - Student management
- `/api/classes` - Class management
- `/api/subjects` - Subject management
- `/api/timetable` - Timetable management
- `/api/calendar` - Calendar events
- `/api/announcements` - Announcements
- `/api/reports` - Reports
- `/api/settings` - Settings