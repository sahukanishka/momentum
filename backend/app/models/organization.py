from datetime import datetime
from sqlalchemy import String, Boolean, DateTime, func, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.database import Base
import uuid


class Organization(Base):
    __tablename__ = "organizations"

    id: Mapped[str] = mapped_column(
        String, primary_key=True, default=lambda: str(uuid.uuid4())
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    domain: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)

    # Foreign key to the user who created the organization
    created_by: Mapped[str] = mapped_column(
        String, ForeignKey("users.id"), nullable=False
    )

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), onupdate=func.now(), default=func.now()
    )

    # Status
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # Relationship
    creator = relationship("User", back_populates="organizations")
    employees = relationship("Employee", back_populates="organization")
    projects = relationship("Project", back_populates="organization")
