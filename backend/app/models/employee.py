from datetime import datetime
from sqlalchemy import String, Boolean, DateTime, func, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.database import Base
import uuid


class Employee(Base):
    __tablename__ = "employees"

    id: Mapped[str] = mapped_column(
        String, primary_key=True, default=lambda: str(uuid.uuid4())
    )

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)

    organization_id: Mapped[str] = mapped_column(
        String, ForeignKey("organizations.id"), nullable=False
    )

    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    email_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    otp: Mapped[str] = mapped_column(String, nullable=True, default=None)
    otp_expiry: Mapped[datetime] = mapped_column(DateTime, nullable=True, default=None)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), onupdate=func.now(), default=func.now()
    )

    organization = relationship("Organization", back_populates="employees")

    projects = relationship(
        "Project",
        secondary="project_employees",
        back_populates="employees",
        lazy="selectin",
    )

    tasks = relationship(
        "Task", secondary="task_employees", back_populates="employees", lazy="selectin"
    )

    time_logs = relationship("TimeTracking", back_populates="employee")
    screenshots = relationship("Screenshot", back_populates="employee")
