import sqlalchemy
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, MetaData, Table, Column, String, Date, Integer, Text, Boolean, ForeignKey, select
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from models import Base, User, Role
from validation import hash_password


class Database:
    def __init__(self, db_name, user, password):
        # Создаём временное подключение к postgres
        connection = psycopg2.connect(user=user, password=password)
        connection.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)  # без автокоммита нельзя создавать БД, т.к. открыта одна транзакция

        # Создаём БД, если ещё не создана
        cursor = connection.cursor()
        try:
            cursor.execute('create database ' + db_name)
        except psycopg2.errors.DuplicateDatabase:  # база данных уже создана
            pass
        finally:  # гарантированно закрываем временное подключение
            cursor.close()
            connection.close()

        # Создаём движок и подключение
        # дефолтные параметры: echo=False, pool_size=5, max_overflow=10, encoding='UTF-8'
        connection_link = "postgresql+psycopg2://" + user + ":" + password + "@localhost/" + db_name
        engine = create_engine(connection_link)
        Base.metadata.create_all(engine)
        self.engine = engine

    #создать нового пользователя
    def create_user(self, email, password, name, surname):
        session = Session(self.engine)
        try:
            user = session.query(User).filter(User.email == email).first()
            if user:
                raise ValueError(
                    "пользователь уже существует"
                )

            new_user = User(
                email=email,
                password_hash=hash_password(password),
                name=name,
                surname=surname,
                phone='',
                role_id=1,
                is_active=True,
                comment=''
            )

            session.add(new_user)
            session.commit()
            return new_user
        finally:
            session.close()


    # изменение данных пользователя
    def update_user_field(self, email, **kwargs):
        session = Session(self.engine)

        try:
            user = session.query(User).filter(User.email == email).first()
            if not user:
                raise ValueError("пользователь не найден")

            for field, value in kwargs.items():
                setattr(user, field, value)
            session.commit()

        finally:
            session.close()


    # вернуть пользователя
    def get_user(self, email):
        session = Session(self.engine)

        try:
            user = session.query(User).filter(User.email == email).first()
            if not user:
                raise ValueError("пользователь не найден")
            return user

        finally:
            session.close()


    # вернуть всех пользователей
    def get_all_users(self):
        session = Session(self.engine)

        try:
            return session.query(User).all()

        finally:
            session.close()


    # список админов
    def get_all_admins(self):
        session = Session(self.engine)

        try:
            return session.query(User).join(Role).filter(Role.role_name == "admin").all()

        finally:
            session.close()


    # все не админы
    def get_all_not_admins(self):
        session = Session(self.engine)

        try:
            return session.query(User).join(Role).filter(Role.role_name != "admin").all()

        finally:
            session.close()


    # Дальше добавляем всякие методы уже для БД
    def add_company(self):
        pass

    def add_contact_to_company(self):
        pass
