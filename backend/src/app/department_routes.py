
from typing import Annotated, Literal
from uuid import uuid4
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Response, status
from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel

# База компаний из company_routes
from .company_routes import _db as companies_db


router = APIRouter(prefix="/api/departments", tags=["department"])


# ОБЩИЕ МОДЕЛИ

class CamelModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, str_strip_whitespace=True)


SocialType = Literal["tg", "vk", "fb", "phone", "email", "web", "other"]


class UserSocial(CamelModel):
    type: SocialType
    url: str | None = None
    value: str | None = None


# МОДЕЛИ ПОЛЬЗОВАТЕЛЯ

class UserCreate(CamelModel):
    email: str = Field(min_length=1)
    password: str = Field(min_length=4)
    first_name: str = ""
    last_name: str = ""
    best_email: str = ""
    phone: str = ""
    socials: list[UserSocial] = Field(default_factory=list)


class UserUpdate(CamelModel):
    email: str | None = None
    first_name: str | None = None
    last_name: str | None = None
    best_email: str | None = None
    phone: str | None = None
    socials: list[UserSocial] | None = None


class UserOut(CamelModel):
    id: str
    email: str
    first_name: str
    last_name: str
    best_email: str
    phone: str
    role: Literal["admin", "user"]
    is_approved: bool
    is_blocked: bool
    socials: list[UserSocial] = Field(default_factory=list)
    created_at: datetime


class CurrentUser(CamelModel):
    id: str
    role: Literal["admin", "user"]


# ЗАГЛУШКА БАЗЫ ПОЛЬЗОВАТЕЛЕЙ

class StubUsersDB:
    def __init__(self):
        self._users: dict[str, dict] = {}

        # Временный администратор для тестирования.
        self._users["admin-1"] = {
            "id": "admin-1",
            "email": "admin@example.com",
            "password": "admin",
            "first_name": "Admin",
            "last_name": "",
            "best_email": "admin@example.com",
            "phone": "",
            "role": "admin",
            "is_approved": True,
            "is_blocked": False,
            "socials": [],
            "created_at": datetime.now(timezone.utc),
        }

    def get_users(self) -> list[dict]:
        return list(self._users.values())

    def get_user(self, user_id: str) -> dict | None:
        return self._users.get(user_id)

    def find_by_email(self, email: str) -> dict | None:
        for user in self._users.values():
            if user["email"] == email:
                return user
        return None

    def add_user(self, user_data: UserCreate) -> dict:
        email = user_data.email.strip().lower()

        if self.find_by_email(email):
            raise ValueError("Пользователь с таким email уже существует")

        user_id = str(uuid4())

        user = {
            "id": user_id,
            "email": email,
            "password": user_data.password,
            "first_name": user_data.first_name,
            "last_name": user_data.last_name,
            "best_email": user_data.best_email or email,
            "phone": user_data.phone,
            # Новые пользователи создаются с ролью user.
            # Назначение администратора выполняется отдельно.
            "role": "user",
            "is_approved": True,
            "is_blocked": False,
            "socials": [social.model_dump() for social in user_data.socials],
            "created_at": datetime.now(timezone.utc),
        }

        self._users[user_id] = user
        return user

    def update_user(self, user_id: str, user_data: UserUpdate) -> dict:
        user = self.get_user(user_id)

        if user is None:
            raise ValueError("Пользователь не найден")

        updates = user_data.model_dump(exclude_unset=True)

        # Проверяем email перед обновлением.
        if "email" in updates:
            if updates["email"] is None:
                raise ValueError("Email не может быть пустым")

            email = updates["email"].strip().lower()
            existing_user = self.find_by_email(email)

            if existing_user and existing_user["id"] != user_id:
                raise ValueError("Этот email уже занят")

            updates["email"] = email

        # Не разрешаем записывать None в обязательные поля.
        required_fields = {"first_name", "last_name", "best_email", "phone"}

        for key, value in updates.items():
            if key in required_fields and value is None:
                raise ValueError(f"Поле {key} не может быть пустым")

        # Преобразуем список социальных сетей в словари.
        if "socials" in updates and updates["socials"] is not None:
            updates["socials"] = [social.model_dump() for social in user_data.socials]

        user.update(updates)
        return user

    def block_user(self, user_id: str, blocked: bool) -> dict:
        user = self.get_user(user_id)

        if user is None:
            raise ValueError("Пользователь не найден")

        user["is_blocked"] = blocked
        return user

    def delete_user(self, user_id: str) -> dict:
        user = self._users.pop(user_id, None)

        if user is None:
            raise ValueError("Пользователь не найден")

        return user


users_db = StubUsersDB()


def get_users_db() -> StubUsersDB:
    return users_db


# АВТОРИЗАЦИЯ И ПРОВЕРКА ПРАВ

def get_current_user() -> CurrentUser:
    # Временная заглушка авторизации.
    # Сейчас всегда возвращает администратора admin-1.
    return CurrentUser(id="admin-1", role="admin")


def require_admin(current_user: Annotated[CurrentUser, Depends(get_current_user)]) -> CurrentUser:
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Недостаточно прав")

    return current_user


# ВСПОМОГАТЕЛЬНЫЕ ПРОВЕРКИ

def get_user_or_404(user_id: str, db: StubUsersDB) -> dict:
    user = db.get_user(user_id)

    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Пользователь не найден")

    return user


def check_target_user(target_user: dict, current_user: CurrentUser):
    """
    ЗАПРЕЩЕНО:
    - блокировать самого себя;
    - удалять самого себя;
    - блокировать другого администратора;
    - удалять другого администратора.
    """
    if target_user["id"] == current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Нельзя выполнить это действие над собой")

    if target_user["role"] == "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Нельзя выполнить это действие над администратором")


# ПОЛУЧЕНИЕ СПИСКА ПОЛЬЗОВАТЕЛЕЙ

@router.get("/users", response_model=list[UserOut])
def get_users(current_user: Annotated[CurrentUser, Depends(require_admin)], db: Annotated[StubUsersDB, Depends(get_users_db)]):
    return db.get_users()


# СОЗДАНИЕ ПОЛЬЗОВАТЕЛЯ

@router.post("/users", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_user(user_data: UserCreate, current_user: Annotated[CurrentUser, Depends(require_admin)], db: Annotated[StubUsersDB, Depends(get_users_db)]):
    try:
        return db.add_user(user_data)
    except ValueError as error:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(error))


# РЕДАКТИРОВАНИЕ ПОЛЬЗОВАТЕЛЯ

@router.patch("/users/{user_id}", response_model=UserOut)
def update_user(user_id: str, user_data: UserUpdate, current_user: Annotated[CurrentUser, Depends(require_admin)], db: Annotated[StubUsersDB, Depends(get_users_db)]):
    user = get_user_or_404(user_id, db)

    try:
        return db.update_user(user_id, user_data)
    except ValueError as error:
        message = str(error)
        error_status = status.HTTP_409_CONFLICT if "email" in message.lower() else status.HTTP_400_BAD_REQUEST
        raise HTTPException(status_code=error_status, detail=message)


# БЛОКИРОВКА ПОЛЬЗОВАТЕЛЯ

@router.post("/users/{user_id}/block", response_model=UserOut)
def block_user(user_id: str, current_user: Annotated[CurrentUser, Depends(require_admin)], db: Annotated[StubUsersDB, Depends(get_users_db)]):
    user = get_user_or_404(user_id, db)
    check_target_user(user, current_user)
    return db.block_user(user_id, True)


# РАЗБЛОКИРОВКА ПОЛЬЗОВАТЕЛЯ

@router.post("/users/{user_id}/unblock", response_model=UserOut)
def unblock_user(user_id: str, current_user: Annotated[CurrentUser, Depends(require_admin)], db: Annotated[StubUsersDB, Depends(get_users_db)]):
    user = get_user_or_404(user_id, db)
    check_target_user(user, current_user)
    return db.block_user(user_id, False)


# УДАЛЕНИЕ ПОЛЬЗОВАТЕЛЯ

@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: str, current_user: Annotated[CurrentUser, Depends(require_admin)], db: Annotated[StubUsersDB, Depends(get_users_db)]):
    user = get_user_or_404(user_id, db)
    check_target_user(user, current_user)

    # Освобождаем компании, закреплённые за удаляемым пользователем.
    companies = companies_db.get_companies()

    for company in companies:
        if company.get("occupied_by") == user_id:
            company["occupied_by"] = None
            company["occupied_by_name"] = None

    db.delete_user(user_id)

    return Response(status_code=status.HTTP_204_NO_CONTENT)


# ПОЛУЧЕНИЕ КОМПАНИЙ ПОЛЬЗОВАТЕЛЯ

@router.get("/users/{user_id}/companies")
def get_user_companies(user_id: str, current_user: Annotated[CurrentUser, Depends(require_admin)], db: Annotated[StubUsersDB, Depends(get_users_db)]):
    get_user_or_404(user_id, db)

    companies = companies_db.get_companies()
    user_companies = [company for company in companies if company.get("occupied_by") == user_id]

    return user_companies


# ПЕРЕДАЧА ПРАВ АДМИНИСТРАТОРА

@router.post("/users/{user_id}/transfer-admin", response_model=UserOut)
def transfer_admin(user_id: str, current_user: Annotated[CurrentUser, Depends(require_admin)], db: Annotated[StubUsersDB, Depends(get_users_db)]):
    target_user = get_user_or_404(user_id, db)

    if target_user["id"] == current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Вы уже являетесь администратором")

    if target_user["role"] == "admin":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Этот пользователь уже является администратором")

    if target_user["is_blocked"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Нельзя передать права заблокированному пользователю")

    old_admin = get_user_or_404(current_user.id, db)

    # Сначала понижаем текущего администратора.
    old_admin["role"] = "user"

    # Затем назначаем нового администратора.
    target_user["role"] = "admin"

    return target_user
