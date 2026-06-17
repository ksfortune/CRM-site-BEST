from sqlalchemy import Column, String, Integer, Date, LargeBinary
from sqlalchemy.orm import declarative_base

# Базовый класс для моделей
Base = declarative_base()

# Пример тоже:
# Класс для таблицы пользователей
class User(Base):
    __tablename__ = 'users'

    email = Column(String, primary_key=True, nullable=False)
    name = Column(String, nullable=False)
    surname = Column(String, nullable=False)
    middlename = Column(String, nullable=False)
    department = Column(Integer, nullable=True)
    position = Column(String, nullable=True)
    image = Column(LargeBinary, nullable=True)

    def __init__(self, email, name, surname, middlename, department=None, position=None, image=None):
        self.email = email
        self.name = name
        self.surname = surname
        self.middlename = middlename
        self.department = department
        self.position = position
        self.image = image