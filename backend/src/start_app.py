# здесь будет запускаться бэк
from fastapi import FastAPI

from app.company_routes import router as company_router
from app.department_routes import router as department_router


app = FastAPI(title="CRM BEST")


app.include_router(company_router)
app.include_router(department_router)
