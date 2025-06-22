from datetime import datetime
from sqlalchemy import (
    String,
    Boolean,
    DateTime,
    func,
    ForeignKey,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.database import Base
import uuid


class Screenshot(Base):
    __tablename__ = "screenshots"

    id: Mapped[str] = mapped_column(
        String, primary_key=True, default=lambda: str(uuid.uuid4())
    )

    employee_id: Mapped[str] = mapped_column(
        String, ForeignKey("employees.id"), nullable=False
    )

    organization_id: Mapped[str] = mapped_column(
        String, ForeignKey("organizations.id"), nullable=False
    )

    tracking_id: Mapped[str] = mapped_column(
        String, ForeignKey("time_tracking.id"), nullable=True
    )

    project_id: Mapped[str] = mapped_column(
        String, ForeignKey("projects.id"), nullable=True
    )

    task_id: Mapped[str] = mapped_column(String, ForeignKey("tasks.id"), nullable=True)

    path: Mapped[str] = mapped_column(String, nullable=False)
    permission: Mapped[bool] = mapped_column(Boolean, default=False)
    os: Mapped[str] = mapped_column(String, nullable=True)
    geo_location: Mapped[str] = mapped_column(String, nullable=True)
    ip_address: Mapped[str] = mapped_column(String, nullable=True)
    app: Mapped[str] = mapped_column(String, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=func.now(), nullable=False
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), onupdate=func.now(), default=func.now()
    )

    # Relationships
    employee = relationship("Employee", back_populates="screenshots")
    organization = relationship("Organization", back_populates="screenshots")
    time_tracking = relationship("TimeTracking", back_populates="screenshots")
    project = relationship("Project", back_populates="screenshots")
    task = relationship("Task", back_populates="screenshots")
