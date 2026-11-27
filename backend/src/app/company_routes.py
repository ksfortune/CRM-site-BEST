
from datetime import datetime, timezone
from typing import Annotated, Literal
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel


router = APIRouter(prefix="/api/companies", tags=["companies"])


# СХЕМЫ
class CamelModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, str_strip_whitespace=True)


SocialType = Literal["tg", "vk", "fb", "phone", "email", "web", "other"]


class SocialChannel(CamelModel):
    type: SocialType
    value: str = ""


class ContactIn(CamelModel):
    #id выдает сервер
    name: str = Field(min_length=1)
    phone: str = ""
    channels: list[SocialChannel] = []


class ContactOut(ContactIn):
    id: str


class CompanyIn(CamelModel):
    #Что фронт присылает для создания компании.
    name: str = Field(min_length=1, max_length=200)
    industries: list[Annotated[str, Field(min_length=1)]] = Field(min_length=1)
    status: Literal["warm", "hot"] = "warm"
    contacts: list[ContactIn] = []


class CompanyOut(CompanyIn):
    #Что API возвращает фронту
    id: str
    contacts: list[ContactOut] = []
    occupied_by: str | None = None
    occupied_by_name: str | None = None
    created_by: str
    updated_by: str
    created_at: datetime
    updated_at: datetime


class CurrentUser(BaseModel):
    id: str
    full_name: str
    role: Literal["admin", "user"]



# ЗАГЛУШКА БАЗЫ ДАННЫХ И АВТОРИЗАЦИИ
class StubDB:
    def __init__(self):
        self._companies: dict[str, dict] = {}

    def get_companies(self) -> list[dict]:
        return list(self._companies.values())

    def add_company(self, data: dict, user_id: str) -> dict:
        now = datetime.now(timezone.utc)

        company = {
            **data,
            "id": str(uuid4()),
            "contacts": [{**contact, "id": str(uuid4())} for contact in data["contacts"]],
            "occupied_by": None,
            "occupied_by_name": None,
            "created_by": user_id,
            "updated_by": user_id,
            "created_at": now,
            "updated_at": now,
        }

        self._companies[company["id"]] = company
        return company


_db = StubDB()


def get_db() -> StubDB:
    return _db


def get_current_user() -> CurrentUser:
    #ЗАГЛУШКА.
    return CurrentUser(id="user-1", full_name="Иван Иванов", role="user")


# ЭНДПОИНТЫ
ERRORS = {
    401: {"description": "Пользователь не вошёл или сессия недействительна"},
    403: {"description": "Недостаточно прав"},
}


@router.get("", response_model=list[CompanyOut], summary="Получить список компаний", responses=ERRORS)
def get_companies(user: CurrentUser = Depends(get_current_user), db: StubDB = Depends(get_db)):
    return db.get_companies()


@router.post("", response_model=CompanyOut, status_code=status.HTTP_201_CREATED, summary="Создать компанию", responses={**ERRORS, 422: {"description": "Данные не прошли проверку"}})
def create_company(company: CompanyIn, user: CurrentUser = Depends(get_current_user), db: StubDB = Depends(get_db)):
    return db.add_company(company.model_dump(), user_id=user.id)
