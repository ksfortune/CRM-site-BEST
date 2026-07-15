from sqlalchemy import Boolean, ForeignKey, Integer, String, Text, Column
from sqlalchemy.orm import declarative_base, relationship

# Базовый класс для всех ORM-моделей
Base = declarative_base()


class Role(Base):
    __tablename__ = "roles"

    role_id = Column(Integer, primary_key=True)
    role_name = Column(String(50), unique=True, nullable=False)
    description = Column(Text)

    # Один Role -> много User
    users = relationship("User", back_populates="role")

    def __repr__(self) -> str:
        return (
            f"Role("
            f"id={self.role_id}, "
            f"name='{self.role_name}')"
        )


class User(Base):
    __tablename__ = "users"

    email = Column(String(255), primary_key=True)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(100), nullable=False)
    surname = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=False, default="")
    comment = Column(Text, default="")
    is_active = Column(Boolean, nullable=False, default=True)
    role_id = Column(Integer, ForeignKey("roles.role_id"), nullable=False, default=1)

    # Многие User -> одна Role
    role = relationship(
        "Role",
        back_populates="users"
    )

    def __repr__(self) -> str:
        return (
            f"User("
            f"email='{self.email}', "
            f"name='{self.name}', "
            f"surname='{self.surname}', "
            f"role_id={self.role_id})"
        )

