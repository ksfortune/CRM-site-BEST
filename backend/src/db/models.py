from sqlalchemy import Column, String, Integer, Date, Text, Boolean, ForeignKey
from sqlalchemy.orm import declarative_base, relationship
import hashlib

# Базовый класс для моделей
Base = declarative_base()

class Role(Base):
    __tablename__ = "roles"

    role_id = Column(Integer, primary_key=True)
    role_name = Column(String(50), nullable=False, unique=True)
    description = Column(Text)

    users = relationship("User", back_populates="role")


# Класс для таблицы пользователей
class User(Base):
    __tablename__ = 'users'

    email = Column(String(255), primary_key=True, nullable=False)
    password_hash = Column(String(64),nullable=False)
    name = Column(String(100), nullable=False) # сократила размеры строк далее
    surname = Column(String(100), nullable=False)
    phone = Column(String(20))
    comment = Column(Text)
    is_active = Column(Boolean, nullable=False, default=True)
    role_id = Column(
        Integer,
        ForeignKey("roles.role_id"),
        nullable=False
    )
    role = relationship("Role", back_populates="users")




