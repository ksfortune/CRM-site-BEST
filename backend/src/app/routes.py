from fastapi import APIRouter, status
from pydantic import BaseModel, Field

from datetime import datetime
from uuid import uuid4
from typing import Literal


router = APIRouter(prefix="/api/companies", tags=["companies"])

class SocialChannel(BaseModel):
    type: str              #"tg", "vk"...
    value: str = ""

class Contact(BaseModel):
    name: str
    nickname: str = ""
    phone: str = ""
    channels: list[SocialChannel] = []

class CompanyCreate(BaseModel): #фронт передает сюда данные
    name: str = Field(min_length = 1) #валидация с помощью field
    industries: list[str] = Field(min_length = 1)
    status: Literal["warm", "hot"] = "warm"
    contacts: list[Contact] = []

class CompanyOut(CompanyCreate): #Апи должен это вернуть фронту
    id: str
    occupiedBy: str | None = None
    createdAt: datetime

class StubDB: #заглушка вместо БД
    def __init__(self):
        self._companies: list[dict] = []

    def get_companies(self) -> list[dict]:
        return self._companies

    def add_company(self, data: dict) -> dict:
        company = {**data, "id": str(uuid4()), "occupiedBy": None, \
                "createdAt": datetime.now()}
        self._companies.append(company)
        return company

db = StubDB() #заглушка

@router.get("", response_model=list[CompanyOut])
def get_companies():
    return db.get_companies()


@router.post("", response_model=CompanyOut, status_code = status.HTTP_201_CREATED)
def create_company(company: CompanyCreate):
    return db.add_company(company.model_dump())

