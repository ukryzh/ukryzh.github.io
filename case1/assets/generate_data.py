import random
import string
from faker import Faker
import csv
from datetime import datetime, timedelta

# Инициализация Faker
fake = Faker()

# Генерация случайного ClientID
def generate_client_id():
    return ''.join(random.choices(string.ascii_letters + string.digits, k=8))

# Список верификаторов
verifiers = ['Verifier1', 'Verifier2', 'Verifier3', 'Verifier4', 'Verifier5', 'Verifier6', 'Verifier7']

# Бизнес-правила для отказа
def check_rejection(age, income, credit_amount, score, client_info_received, security_check_passed):
    rejection_reasons = []
    
    # Проверка возраста
    if age < 25 or age > 65:
        rejection_reasons.append("Возраст")
    
    # Проверка дохода
    if income < (credit_amount * 0.15):
        rejection_reasons.append("Доход")
    
    # Проверка скорингового балла
    if score < 500:
        rejection_reasons.append("Скоринговый балл")
    
    # Проверка возвращения информации от клиента
    if not client_info_received:
        rejection_reasons.append("Клиент не вернул информацию")
    
    # Проверка службы безопасности
    if not security_check_passed:
        rejection_reasons.append("Отказ службы безопасности")
    
    return rejection_reasons

# Генерация случайной даты подачи заявки
def generate_submission_date():
    today = datetime.today()
    random_days = random.randint(-30, 30)  # случайная дата в пределах последнего месяца
    submission_date = today + timedelta(days=random_days)
    return submission_date.strftime('%Y-%m-%d')  # возвращаем дату в формате YYYY-MM-DD

# Генерация данных
data = []

for _ in range(200):  # генерируем 200 записей
    decision = "Одобрено"
    rejection_reasons = []

    age = random.randint(18, 70)
    income = random.randint(30000, 150000)
    credit_amount = random.randint(100000, 500000)
    score = random.randint(300, 850)
    client_info_received = random.choice([True, False])  # Клиент вернул информацию или нет
    security_check_passed = random.choice([True, False])  # Служба безопасности (пройдена или нет)
    
    # Проверка бизнес-правил для отказа
    rejection_reasons = check_rejection(age, income, credit_amount, score, client_info_received, security_check_passed)
    
    # Если хотя бы одно правило сработало, решение "Отказано"
    if rejection_reasons:
        decision = "Отказано"
    
    # Выбираем случайного верификатора
    verifier = random.choice(verifiers)

    # Генерация даты подачи заявки
    submission_date = generate_submission_date()

    entry = {
        "ID заявки": fake.uuid4(),
        "Client_ID": generate_client_id(),  # Случайный ClientID
        "Возраст": age,
        "Доход в месяц": income,
        "Запрашиваемая сумма кредита": credit_amount,
        "Решение": decision,
        "Скоринговый балл": score,  # Случайный скоринговый балл
        "Информация от клиента возвращена": "Да" if client_info_received else "Нет",  # Статус информации от клиента
        "Верификатор": verifier,  # Выбранный верификатор
        "Проверка службы безопасности": "Пройдена" if security_check_passed else "Не пройдена",  # Статус проверки
        "Дата подачи заявки": submission_date  # Дата подачи заявки
    }

    # Если решение "Отказано", добавляем причину отказа
    if decision == "Отказано":
        entry["Причина отказа"] = ", ".join(rejection_reasons)
    else:
        entry["Причина отказа"] = None  # Если решение "Одобрено", причина отказа пустая

    data.append(entry)

# Сохраняем в CSV файл
with open('credit_applications.csv', mode='w', newline='', encoding='utf-8') as file:
    writer = csv.DictWriter(file, fieldnames=data[0].keys())
    writer.writeheader()  # Пишем заголовки
    writer.writerows(data)  # Пишем данные

print("Данные успешно сохранены в 'credit_applications.csv'")
