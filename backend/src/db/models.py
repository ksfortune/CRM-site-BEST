from sqlalchemy import Column, String, Integer, Date, LargeBinary, Boolean, Text
from sqlalchemy.orm import declarative_base

# Базовый класс для моделей
Base = declarative_base()

class Users(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(Text, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    best_email = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    role = Column(String, nullable=False)
    is_approved = Column(Boolean, nullable=False)
    is_blocked = Column(Boolean, nullable=False)
    created_at = Column(Date, nullable=False)

    def __init__(self, email, best_email, password_hash, phone, role, first_name=None, last_name=None):
        self.best_email = best_email
        self.email = email
        self.password_hash = password_hash
        self.first_name = first_name
        self.last_name = last_name
        self.phone = phone
        self.role = role


class Company(Base):
    __tablename__ = 'companies'

    id = Column(Integer, primary_key=True, nullable=False)
    name = Column(String, nullable=False)
    status = Column(String, nullable=False)
    occupied_by = Column(String, foreign_key='users.id', nullable=False)
    created_by = Column(String, foreign_key='users.id', nullable=False)
    updated_by = Column(String, foreign_key='users.id', nullable=False)
    created_at = Column(Date, nullable=False)
    updated_at = Column(Date, nullable=False)
    deleted_at = Column(Date, nullable=False)

    def __init__(self, name, status, created_by=None):
        self.name = name
        self.status = status
        self.created_by = created_by
        self.updated_by = created_by