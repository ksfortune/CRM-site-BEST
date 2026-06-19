# здесь будет валидация данных, которые будут приходить с фронтенда.
# хз стоит ли на БД саму писать всякие чеккеры и триггеры, мб всё здесь в коде проверять будем
import re


@staticmethod
def validate_email(email): # почта
    email = email.strip().lower()
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(pattern, email):
        raise ValueError(f"некорректный формат")

    if len(email) > 255:
        raise ValueError("слишком длинный имейл")

    return email


@staticmethod
def validate_name(name): # имя собственное
    name = name.strip()

    if len(name) < 2:
        raise ValueError(f"имя должно содержать минимум 2 символа")
    if len(name) > 100:
        raise ValueError(f"слишком длинное имя")
    # только буквы, пробелы, дефисы и апострофы
    if not re.match(r'^[a-zA-Zа-яА-ЯёЁ\s\-\.\']+$', name):
        raise ValueError(f"имя имеет некорректный формат")

    return name.title()


@staticmethod
def validate_phone(phone): # номер телефона
    phone = phone.strip()
    digits_only = re.sub(r'\D', '', phone)

    if len(digits_only) < 10:
        raise ValueError("телефон должен содержать минимум 10 цифр")
    if len(digits_only) > 15:
        raise ValueError("телефон не может содержать больше 15 цифр")

    if not re.match(r'^(\+7|8|7)?\d{10}$', digits_only):
        raise ValueError("некорректный формат телефона")

    return phone
