from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json

db = SQLAlchemy()

class SummaryRecord(db.Model):
    __tablename__ = "summaries"
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    raw_content = db.Column(db.Text, nullable=False)
    summary_text = db.Column(db.Text, nullable=False) # Store JSON string of the structured summary
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        try:
            summary_data = json.loads(self.summary_text)
            if isinstance(summary_data, str):
                summary_data = json.loads(summary_data)
        except Exception:
            summary_data = {"summary": self.summary_text, "key_concepts": [], "bullet_points": []}
            
        return {
            "id": self.id,
            "title": self.title,
            "raw_content": self.raw_content,
            "summary_data": summary_data,
            "created_at": self.created_at.isoformat()
        }

class QuizRecord(db.Model):
    __tablename__ = "quizzes"
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    quiz_text = db.Column(db.Text, nullable=False) # Store JSON string of the list of MCQs
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        try:
            quiz_data = json.loads(self.quiz_text)
            if isinstance(quiz_data, str):
                quiz_data = json.loads(quiz_data)
        except Exception:
            quiz_data = []
            
        return {
            "id": self.id,
            "title": self.title,
            "quiz_data": quiz_data,
            "created_at": self.created_at.isoformat()
        }

class ChatRecord(db.Model):
    __tablename__ = "chats"
    id = db.Column(db.Integer, primary_key=True)
    question = db.Column(db.Text, nullable=False)
    answer = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "question": self.question,
            "answer": self.answer,
            "created_at": self.created_at.isoformat()
        }

class PlannerRecord(db.Model):
    __tablename__ = "planners"
    id = db.Column(db.Integer, primary_key=True)
    exam_date = db.Column(db.String(50), nullable=False)
    subjects = db.Column(db.String(300), nullable=False)
    available_hours = db.Column(db.Integer, nullable=False)
    timetable_text = db.Column(db.Text, nullable=False) # Store JSON string of the structured timetable
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        try:
            timetable_data = json.loads(self.timetable_text)
            if isinstance(timetable_data, str):
                timetable_data = json.loads(timetable_data)
        except Exception:
            timetable_data = []
            
        return {
            "id": self.id,
            "exam_date": self.exam_date,
            "subjects": self.subjects,
            "available_hours": self.available_hours,
            "timetable_data": timetable_data,
            "created_at": self.created_at.isoformat()
        }

class ExamPrepRecord(db.Model):
    __tablename__ = "exam_preps"
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    prep_text = db.Column(db.Text, nullable=False) # Store JSON string of structured exam data
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        try:
            prep_data = json.loads(self.prep_text)
            if isinstance(prep_data, str):
                prep_data = json.loads(prep_data)
        except Exception:
            prep_data = {"extracted_topics": [], "revision_strategy": [], "high_priority_concepts": []}
            
        return {
            "id": self.id,
            "title": self.title,
            "prep_data": prep_data,
            "created_at": self.created_at.isoformat()
        }
