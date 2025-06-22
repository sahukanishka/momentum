# app/models/project.py
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


# Association table for many-to-many relationship between projects and employees
project_employees = Table(
    "project_employees",
    Base.metadata,
    Column("project_id", String, ForeignKey("projects.id"), primary_key=True),
    Column("employee_id", String, ForeignKey("employees.id"), primary_key=True),
    Column("assigned_at", DateTime(timezone=True), default=func.now()),
    Column("is_active", Boolean, default=True),
)


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[str] = mapped_column(
        String, primary_key=True, default=lambda: str(uuid.uuid4())
    )

    # Project details
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    code: Mapped[str] = mapped_column(String(50), nullable=False, unique=True)

    # Organization relationship
    organization_id: Mapped[str] = mapped_column(
        String, ForeignKey("organizations.id"), nullable=False
    )

    # Project status and settings
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_archived: Mapped[bool] = mapped_column(Boolean, default=False)

    # Time logging limits (in hours per week)
    max_hours_per_week: Mapped[int] = mapped_column(Integer, nullable=True)
    max_hours_per_day: Mapped[int] = mapped_column(Integer, nullable=True)

    # Project dates
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
    organization = relationship("Organization", back_populates="projects")
    employees = relationship(
        "Employee",
        secondary=project_employees,
        back_populates="projects",
        lazy="selectin",
    )
