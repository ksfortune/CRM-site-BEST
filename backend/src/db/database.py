from psycopg2 import connect, errors, sql
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session

from models import Base, User, Role
from validation import Validator


class Database:

    def __init__(self, db_name: str, user: str, password: str):

        connection = connect(user=user, password=password)
        connection.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = connection.cursor()

        try:
            cursor.execute(sql.SQL("CREATE DATABASE {}").format(sql.Identifier(db_name)))
        except errors.DuplicateDatabase:
            pass

        finally:
            cursor.close()
            connection.close()

        connection_link = f"postgresql+psycopg2://{user}:{password}@localhost/{db_name}"
        self.engine = create_engine(connection_link,pool_pre_ping=True)
        Base.metadata.create_all(self.engine)

    #создать нового пользователя
    def create_user(self, email: str, password: str, name: str, surname: str) -> User:
        with Session(self.engine) as session:
            try:
                stmt = select(User).where(User.email == email)
                if session.scalar(stmt):
                    raise ValueError("Почта недоступна.")

                new_user = User(
                    email=email,
                    password_hash=Validator.hash_password(password),
                    name=name,
                    surname=surname,
                    role_id=1
                )

                session.add(new_user)
                session.commit()
                session.refresh(new_user)

                return new_user

            except Exception:
                session.rollback()
                raise

    # изменение данных пользователя
    def update_user_field(self, email: str, **kwargs) -> User:
        allowed_fields = {"name", "surname", "phone", "comment", "is_active", "role_id"}

        with Session(self.engine) as session:
            try:
                stmt = select(User).where(User.email == email)
                user = session.scalar(stmt)

                if user is None:
                    raise ValueError("Пользователь не найден.")

                for field, value in kwargs.items():

                    if field not in allowed_fields:
                        raise ValueError(
                            f"Поле '{field}' нельзя изменить."
                        )

                    setattr(user, field, value)

                session.commit()
                session.refresh(user)

                return user

            except Exception:
                session.rollback()
                raise

    #взять юзера по имейлу
    def get_user(self, email: str) -> User | None:

        with Session(self.engine) as session:
            stmt = select(User).where(User.email == email)
            return session.scalar(stmt)


    def get_all_users(self) -> list[User]:
        with Session(self.engine) as session:

            stmt = select(User)
            return list(session.scalars(stmt).all())


    def get_all_admins(self) -> list[User]:

        with Session(self.engine) as session:

            stmt = select(User).join(Role).where(Role.role_name == "admin")
            return list(session.scalars(stmt).all())


    def get_all_not_admins(self) -> list[User]:

        with Session(self.engine) as session:

            stmt = select(User).join(Role).where(Role.role_name != "admin")

            return list(
                session.scalars(stmt).all()
            )

