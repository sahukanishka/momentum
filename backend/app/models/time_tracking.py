from datetime import datetime
from sqlalchemy import (
    String,
    Boolean,
    DateTime,
    func,
    ForeignKey,
    Text,
    Integer,
    Numeric,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.database import Base
import uuid


class TimeTracking(Base):
    __tablename__ = "time_tracking"

    id: Mapped[str] = mapped_column(
        String, primary_key=True, default=lambda: str(uuid.uuid4())
    )

    employee_id: Mapped[str] = mapped_column(
        String, ForeignKey("employees.id"), nullable=False
    )

    task_id: Mapped[str] = mapped_column(String, ForeignKey("tasks.id"), nullable=True)

    project_id: Mapped[str] = mapped_column(
        String, ForeignKey("projects.id"), nullable=True
    )

    clock_in: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    clock_out: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)

    total_hours: Mapped[float] = mapped_column(Numeric(5, 2), nullable=True)
    total_minutes: Mapped[int] = mapped_column(Integer, nullable=True)

    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    notes: Mapped[str] = mapped_column(Text, nullable=True)

    break_start: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    break_end: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    break_duration_minutes: Mapped[int] = mapped_column(Integer, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), onupdate=func.now(), default=func.now()
    )

    employee = relationship("Employee", back_populates="time_logs")
    task = relationship("Task", back_populates="time_logs")
    project = relationship("Project", back_populates="time_logs")
    screenshots = relationship("Screenshot", back_populates="time_tracking")
