import pandas as pd
import random
import numpy as np

# Загружаем файл с заявками
df = pd.read_csv("credit_applications.csv", parse_dates=["Дата подачи заявки"])

# Создаём пустой список для событийного лога
event_log = []

# Определяем среднее время для каждого этапа в секундах
mean_times = {
    "Проверка полноты предоставленной информации": 30,
    "Запрос недостающей информации": 45,
    "Проверка документов на соответствие требованиям": 60,
    "Запрос на доработку документации": 60,
    "Проверка клиента": 2800,
    "Уведомление об отказе": 45,
    "Внесение одобренной заявки на кредитование в учетно-операционную систему": 135,
    "Уведомление об одобрении": 45,
}

# Для каждого этапа определим стандартное отклонение для варьирования времени (в процентах от среднего)
std_devs = {
    "Проверка полноты предоставленной информации": 0.1,  # 10% отклонение
    "Запрос недостающей информации": 0.1,
    "Проверка документов на соответствие требованиям": 0.1,
    "Запрос на доработку документации": 0.1,
    "Проверка клиента": 0.05,  # Меньшее отклонение для долгих процессов
    "Уведомление об отказе": 0.1,
    "Внесение одобренной заявки на кредитование в учетно-операционную систему": 0.05,
    "Уведомление об одобрении": 0.1,
}

# Функция для генерации времени с отклонением от среднего
def generate_time(mean, std_dev):
    return np.random.normal(loc=mean, scale=mean * std_dev)

# Проходим по каждой заявке
for _, row in df.iterrows():
    case_id = row["ID заявки"]
    start_time = row["Дата подачи заявки"]
    
    # 1. Проверка полноты документов
    check_time = start_time + pd.Timedelta(seconds=generate_time(mean_times["Проверка полноты предоставленной информации"], std_devs["Проверка полноты предоставленной информации"]))
    event_log.append([case_id, "Проверка полноты предоставленной информации", check_time])
    doc_status = random.choice(["полный", "неполный", "отсутствует"])  # Случайный статус документов
    
    # 2. Если документов нет — только ожидание 3 дня
    if doc_status == "отсутствует":
        wait_time = check_time + pd.Timedelta(days=3)
        doc_received = random.choice([True, False])  # Успел ли клиент предоставить документы

        if not doc_received:
            event_log.append([case_id, "Процесс завершен (документы не предоставлены)", wait_time])
            continue  # Пропускаем заявку, если документов так и нет
        else:
            received_time = check_time + pd.Timedelta(days=random.uniform(0, 3))  # Случайное время в пределах 3 дней
            event_log.append([case_id, "Документы получены, проверка полноты документов начинается заново", received_time])
            start_time = received_time  # Обновляем стартовую точку

    # 3. Проверка документов (фронт-офис)
    doc_check_time = start_time + pd.Timedelta(seconds=generate_time(mean_times["Проверка документов на соответствие требованиям"], std_devs["Проверка документов на соответствие требованиям"]))
    event_log.append([case_id, "Проверка документов на соответствие требованиям", doc_check_time])
    
    # 4. Возможные ошибки в документации (оставляем только ожидание 1 день)
    doc_errors = random.choice([True, False])  # Ошибки в документах
    if doc_errors:
        fix_time = doc_check_time + pd.Timedelta(seconds=generate_time(mean_times["Запрос на доработку документации"], std_devs["Запрос на доработку документации"]))
        event_log.append([case_id, "Запрос на доработку документации", fix_time])
        client_responded = random.choice([True, False])  # Ответил ли клиент?
    
        if not client_responded:
            event_log.append([case_id, "Процесс завершен (клиент не ответил)", fix_time + pd.Timedelta(days=1)])
            continue  # Если клиент не отвечает, процесс завершен
        else:
            event_log.append([case_id, "Документы исправлены, повторная проверка клиента", fix_time + pd.Timedelta(seconds=generate_time(mean_times["Запрос на доработку документации"], std_devs["Запрос на доработку документации"]))])

    # 5. Проверка клиентской информации
    client_check_time = doc_check_time + pd.Timedelta(seconds=generate_time(mean_times["Проверка клиента"], std_devs["Проверка клиента"]))
    event_log.append([case_id, "Проверка клиента", client_check_time])

    # 6. Заключение (выдавать кредит или нет)
    decision_time = client_check_time + pd.Timedelta(seconds=generate_time(mean_times["Уведомление об одобрении"], std_devs["Уведомление об одобрении"]))
    decision = random.choice(["одобрено", "отказ"])  # Решение по кредиту
    event_log.append([case_id, f"Принятие решения ({decision})", decision_time])

# Создаём DataFrame из событий
event_df = pd.DataFrame(event_log, columns=["case_id", "activity", "timestamp"])
event_df = event_df.sort_values(by=["case_id", "timestamp"])

# Добавим столбец для времени между событиями
event_df["time_diff_sec"] = event_df.groupby("case_id")["timestamp"].diff().dt.total_seconds()

# Заполняем пустые значения (если есть) в колонке "time_diff_sec" для шагов, которые не имеют промежутков
event_df["time_diff_sec"].fillna(0, inplace=True)

# Сохраняем в CSV
event_df.to_csv("process_log.csv", index=False)

# Рассчитываем статистику времени для каждого шага
time_stats = event_df.groupby("activity")["time_diff_sec"].agg(['mean', 'median', 'std', 'min', 'max'])

# Сохраняем статистику в отдельный файл
time_stats.to_csv("time_statistics.csv")

# Выводим статистику в терминал
print("Статистика времени между событиями:")
print(time_stats)
