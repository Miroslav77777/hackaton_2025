import pandas as pd
import json

def json_to_csv(input_json: str, output_csv: str):
    """
    Читает массив объектов из input_json, расплющивает вложенный объект 'consumption'
    и сохраняет результат в CSV файл output_csv.
    """
    with open(input_json, 'r', encoding='utf-8') as f:
        data = json.load(f)
    # Преобразуем список записей в DataFrame
    df = pd.json_normalize(data)
    # Переименуем столбцы consumption.<month> → consumption_<month>
    df.columns = [col.replace('consumption.', 'consumption_') for col in df.columns]
    # Сохраняем в CSV
    df.to_csv(output_csv, index=False, encoding='utf-8')
    print(f"Saved {output_csv}")

# Конвертация тренировочного и тестового JSON
json_to_csv('dataset_control.json', 'features_control.csv')
