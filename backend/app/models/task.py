# app/models/task.py
from datetime import datetime
from sqlalchemy import (
    String,
    Boolean,
    DateTime,
    func,
    ForeignKey,
    Text,
    Integer,
    Table,
    Column,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.database import Base
import uuid


# Association table for many-to-many relationship between tasks and employees
task_employees = Table(
    "task_employees",
    Base.metadata,
    Column("task_id", String, ForeignKey("tasks.id"), primary_key=True),
    Column("employee_id", String, ForeignKey("employees.id"), primary_key=True),
    Column("assigned_at", DateTime(timezone=True), default=func.now()),
    Column("is_active", Boolean, default=True),
)


class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[str] = mapped_column(
        String, primary_key=True, default=lambda: str(uuid.uuid4())
    )

    # Task details
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    code: Mapped[str] = mapped_column(String(50), nullable=False)

    # Project relationship (tasks always belong to a project)
    project_id: Mapped[str] = mapped_column(
        String, ForeignKey("projects.id"), nullable=False
    )

    # Task status and settings
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_default: Mapped[bool] = mapped_column(
        Boolean, default=False
    )  # Default task for project

    # Time logging limits (in hours per week)
    max_hours_per_week: Mapped[int] = mapped_column(Integer, nullable=True)
    max_hours_per_day: Mapped[int] = mapped_column(Integer, nullable=True)

    # Task dates
    start_date: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    end_date: Mapped[datetime] = mapped_column(DateTime, nullable=True)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), onupdate=func.now(), default=func.now()
    )

    # Relationships
    project = relationship("Project", back_populates="tasks")
    employees = relationship(
        "Employee", secondary=task_employees, back_populates="tasks", lazy="selectin"
    )
    time_logs = relationship("TimeTracking", back_populates="task")
    screenshots = relationship("Screenshot", back_populates="task")
