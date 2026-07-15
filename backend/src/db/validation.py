# здесь будет валидация данных, которые будут приходить с фронтенда.
# хз стоит ли на БД саму писать всякие чеккеры и триггеры, мб всё здесь в коде проверять будем
import re
from typing import Optional

from email_validator import validate_email, EmailNotValidError
from passlib.context import CryptContext

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


class ValidationError(Exception):

    def __init__(self, errors: dict):
        self.errors = errors
        super().__init__(str(errors))


class Validator:

    @staticmethod
    def validate_email(email: str) -> str:
        if not email:
            raise ValueError("Email не может быть пустым")

        if len(email) > 255:
            raise ValueError("Email слишком длинный")

        try:
            result = validate_email(
                email.strip(),
                check_deliverability=False
            )
            return result.normalized
        except EmailNotValidError as e:
            raise ValueError(str(e))

    @staticmethod
    def validate_password(password: str) -> str:
        if not password:
            raise ValueError("Пароль не может быть пустым")

        if len(password) < 8:
            raise ValueError("Пароль должен содержать минимум 8 символов")
        if len(password) > 128:
            raise ValueError("Пароль не может быть длиннее 128 символов")
        if not re.search(r"[A-Z]", password):
            raise ValueError("Пароль должен содержать заглавную букву")
        if not re.search(r"[a-z]", password):
            raise ValueError("Пароль должен содержать строчную букву")
        if not re.search(r"\d", password):
            raise ValueError("Пароль должен содержать цифру")

        return password

    @staticmethod
    def validate_name(name: str, field_name: str = "Имя") -> str:
        if not name:
            raise ValueError(f"{field_name} не может быть пустым")

        name = name.strip()

        if len(name) < 2:
            raise ValueError(f"{field_name} должно содержать минимум 2 символа")

        if len(name) > 100:
            raise ValueError(f"{field_name} слишком длинное")

        if not re.fullmatch(r"[A-Za-zА-Яа-яЁё\s\-'.]+", name):
            raise ValueError(f"{field_name} содержит недопустимые символы")

        return name

    @staticmethod
    def validate_phone(phone: Optional[str]) -> str:
        if phone is None or phone.strip() == "":
            return ""

        digits = re.sub(r"\D", "", phone)

        if not re.fullmatch(r"(7|8)?\d{10}", digits):
            raise ValueError("Некорректный формат номера телефона")

        if len(digits) == 10:
            digits = "7" + digits
        elif digits.startswith("8"):
            digits = "7" + digits[1:]

        return (
            f"+7 ({digits[1:4]}) "
            f"{digits[4:7]}-"
            f"{digits[7:9]}-"
            f"{digits[9:11]}"
        )

    @classmethod
    def validate_user_data(
        cls,
        email: str,
        password: str,
        name: str,
        surname: str,
        phone: Optional[str] = None,
    ) -> dict:

        validators = {
            "email": lambda: cls.validate_email(email),
            "password": lambda: cls.validate_password(password),
            "name": lambda: cls.validate_name(name, "Имя"),
            "surname": lambda: cls.validate_name(surname, "Фамилия"),
            "phone": lambda: cls.validate_phone(phone),
        }

        validated = {}
        errors = {}

        for field, validator in validators.items():
            try:
                validated[field] = validator()
            except ValueError as e:
                errors[field] = str(e)

        if errors:
            raise ValidationError(errors)

        return validated

    @staticmethod
    def hash_password(password: str) -> str:
        return pwd_context.hash(password)

    @staticmethod
    def verify_password(
        plain_password: str,
        hashed_password: str
    ) -> bool:
        return pwd_context.verify(
            plain_password,
            hashed_password
        )