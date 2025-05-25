import pandas as pd
import numpy as np
import json
from catboost import CatBoostClassifier
from tsfresh.feature_extraction import extract_features
from tsfresh.feature_extraction.settings import MinimalFCParameters
import os
import warnings

warnings.filterwarnings("ignore")
np.random.seed(42)

def feature_engineering(df):
    df = df.copy()
    cons_cols = [f'consumption_{i}' for i in range(1, 13)]
    num_impute = cons_cols + ['roomsCount', 'residentsCount', 'totalArea']
    for col in num_impute:
        if col in df.columns:
            df[col] = df[col].fillna(df[col].median())

    df.rename(columns={f'consumption_{i}': f'c{i}' for i in range(1, 13)}, inplace=True)
    mths = [f'c{i}' for i in range(1, 13)]

    df['total']    = df[mths].sum(axis=1)
    df['mean']     = df[mths].mean(axis=1)
    df['std']      = df[mths].std(axis=1)
    df['max2mean'] = df[mths].max(axis=1) / (df['mean'] + 1e-6)

    df['sum_summer']   = df[['c6','c7','c8']].sum(axis=1)
    df['sum_winter']   = df[['c12','c1','c2']].sum(axis=1)
    df['ratio_summer'] = df['sum_summer'] / (df['total'] + 1e-6)
    df['ratio_winter'] = df['sum_winter'] / (df['total'] + 1e-6)

    idx = np.arange(1, 13)
    df['trend_slope'] = df[mths].apply(lambda r: np.polyfit(idx, r.values, 1)[0], axis=1)
    fft = df[mths].apply(lambda r: np.abs(np.fft.rfft(r.values)[1:4]), axis=1, result_type='expand')
    fft.columns = ['fft1','fft2','fft3']
    df = pd.concat([df, fft], axis=1)

    df['zero_months'] = (df[mths] == 0).sum(axis=1)
    df['max_month']   = df[mths].idxmax(axis=1).str.extract(r'(\d+)').astype(int)
    df['min_month']   = df[mths].idxmin(axis=1).str.extract(r'(\d+)').astype(int)
    df['autocorr1']   = df[mths].apply(lambda r: pd.Series(r).autocorr(lag=1), axis=1)

    for w in [2, 3, 4, 6]:
        df[f'roll_mean_{w}'] = df[mths].apply(lambda r: r.rolling(w).mean().iloc[-1], axis=1)
        df[f'roll_std_{w}']  = df[mths].apply(lambda r: r.rolling(w).std().iloc[-1], axis=1)

    deltas = df[mths].diff(axis=1).iloc[:, 1:]
    df['delta_mean'] = deltas.mean(axis=1)
    df['delta_std']  = deltas.std(axis=1)
    df['delta_max']  = deltas.max(axis=1)

    df['region'] = df['address'].apply(
        lambda x: x.split(',')[1].strip() if isinstance(x, str) and ',' in x else 'Unknown'
    )

    # TSFresh
    long = df[['accountId'] + mths].melt(id_vars=['accountId'], var_name='month', value_name='value')
    long['month'] = long['month'].str.extract(r'(\d+)').astype(int)

    tsf = extract_features(
        long,
        column_id='accountId',
        column_sort='month',
        default_fc_parameters=MinimalFCParameters(),
        disable_progressbar=True,
        n_jobs=0
    )
    tsf.index.name = 'accountId'
    tsf = tsf.reset_index()
    df = df.merge(tsf, on='accountId', how='left')

    # Fill NaNs
    num_cols = [c for c in df.columns if c.startswith((
        'total','mean','std','trend','fft','sum_','ratio_','zero_',
        'autocorr','roll_','delta_','value__'
    ))]
    df[num_cols] = df[num_cols].fillna(df[num_cols].median())

    df.columns = (
        df.columns
        .str.replace(r'[\n\r\t"\'\\]', '_', regex=True)
        .str.replace(r'[{}\[\]:,]', '_', regex=True)
    )

    df.drop(columns=['address'], errors='ignore', inplace=True)
    return df

def load_region_te_map(train_csv):
    df = pd.read_csv(train_csv)
    df['region'] = df['address'].apply(
        lambda x: x.split(',')[1].strip() if isinstance(x, str) and ',' in x else 'Unknown'
    )
    return df.groupby("region")["isCommercial"].mean().to_dict()

def predict_control_file(csv_path, model_path, output_json="predictions.json"):
    df = pd.read_csv(csv_path)
    account_ids = df["accountId"].values

    # Добавляем регион
    df["region"] = df["address"].apply(
        lambda x: x.split(',')[1].strip() if isinstance(x, str) and ',' in x else "Unknown"
    )

    # Загружаем или восстанавливаем region_te_map
    te_path = "model_artifacts/region_te_map.json"
    if os.path.exists(te_path):
        with open(te_path, "r", encoding="utf-8") as f:
            region_te_map = json.load(f)
    else:
        print("⚠️ region_te_map.json не найден, восстанавливаем из dataset_train.csv")
        region_te_map = load_region_te_map("dataset_train.csv")
        os.makedirs("model_artifacts", exist_ok=True)
        with open(te_path, "w", encoding="utf-8") as f:
            json.dump(region_te_map, f, ensure_ascii=False, indent=2)

    # Применяем region_te
    df["region_te"] = df["region"].map(region_te_map).fillna(np.mean(list(region_te_map.values())))

    # Признаки
    df = feature_engineering(df)

    # Загружаем модель
    model = CatBoostClassifier()
    model.load_model(model_path)

    # Оставляем только нужные фичи
    X = df[model.feature_names_]

    # Предсказание
    proba = model.predict_proba(X)[:, 1]
    preds = (proba >= 0.5).astype(bool)

    # 🎯 Формат строго под нужный вывод
    result = [
        {
            "accountId": int(aid),
            "isCommercial": bool(pred)
        }
        for aid, pred in zip(account_ids, preds)
    ]
    with open(output_json, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2, ensure_ascii=False)

    print(f"✅ Predictions saved to {output_json}")


# Run
if __name__ == "__main__":
    predict_control_file(
        csv_path="dataset_control.csv",
        model_path="catboost.cbm"
    )
