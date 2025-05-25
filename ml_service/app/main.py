from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
import joblib, json
import numpy as np
import pandas as pd

app = FastAPI()

# 1. Загрузка моделей и метаданных
stack: LogisticRegression = joblib.load('model_artifacts/stack_model.pkl')
cal:   CalibratedClassifierCV = joblib.load('model_artifacts/calibrator.pkl')
thr:   float = json.load(open('model_artifacts/threshold.json'))['threshold']
features: List[str] = json.load(open('model_artifacts/features.json'))

# 2. Pydantic-схема входа
class PredictRequest(BaseModel):
    # каждый элемент — список признаков в том же порядке, что и features.json
    X: List[List[float]]

# 3. Эндпоинт для предикта
@app.post('/predict')
def predict(req: PredictRequest):
    # 3.1 Собираем DataFrame
    X_df = pd.DataFrame(req.X, columns=features)
    # 3.2 Получаем вероятности
    probs = cal.predict_proba(X_df)[:, 1]
    preds = (probs >= thr).astype(int)
    return {
        'probabilities': probs.tolist(),
        'predictions':    preds.tolist(),
        'threshold':      thr
    }
