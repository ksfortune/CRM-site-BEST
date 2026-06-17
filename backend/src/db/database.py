import sqlalchemy
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, MetaData, Table, Column, String, Date, Integer, LargeBinary, select
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
# from .models import User, Vacation, AuthEntry, Department


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
        metadata = MetaData()

        # Создаём таблицы здесь
        # ...
        # пример:
        # создание таблицы пользователей
        self.users_table = Table('users', metadata,
                                 Column('email', String, primary_key=True, nullable=False),
                                 Column('name', String, nullable=False),
                                 Column('surname', String, nullable=False),
                                 Column('middlename', String, nullable=False),
                                 Column('department', Integer),
                                 Column('position', String),
                                 Column('image', LargeBinary))

        # Инициализируем таблицы
        metadata.create_all(engine)
        self.engine = engine


    # Дальше добавляем всякие методы уже для БД
    def add_company(self):
        pass

    def add_contact_to_company(self):
        pass
