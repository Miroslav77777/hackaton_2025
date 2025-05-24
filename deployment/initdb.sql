-- === Справочник тарифов ===
CREATE TABLE IF NOT EXISTS tariffs (
  tariff_id     SERIAL       PRIMARY KEY,
  name          TEXT         NOT NULL,
  zones_count   INT          NOT NULL,
  threshold_kwh DOUBLE PRECISION NOT NULL,
  rate_day      DOUBLE PRECISION NOT NULL,
  rate_night    DOUBLE PRECISION NOT NULL,
  rate_peak     DOUBLE PRECISION,
  rate_halfpeak DOUBLE PRECISION,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- === Метаданные пользователей ===
CREATE TABLE IF NOT EXISTS users_metadata (
  user_id         TEXT            PRIMARY KEY,
  area_m2         DOUBLE PRECISION NOT NULL,
  residents_count INT             NOT NULL,
  building_type   TEXT            NOT NULL,
  tariff_id       INT             NOT NULL REFERENCES tariffs(tariff_id),
  created_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),
  CONSTRAINT chk_building_type
    CHECK (building_type IN ('multi_apartment','garage', 'private_house')),
);

-- === Таблица норм потребления ===
CREATE TABLE IF NOT EXISTS consumption_norms (
  building_type   TEXT            NOT NULL,
  residents_min   INT             NOT NULL,
  residents_max   INT             NOT NULL,
  monthly_norm_kwh DOUBLE PRECISION NOT NULL,
  PRIMARY KEY (building_type, residents_min, residents_max),
  CONSTRAINT chk_bt_norm
    CHECK (building_type IN ('multi_apartment','garage','private_house')),
);

-- === Показания ===
CREATE TABLE IF NOT EXISTS readings (
  id           SERIAL        PRIMARY KEY,
  user_id      TEXT          NOT NULL REFERENCES users_metadata(user_id),
  ts           TIMESTAMPTZ   NOT NULL,
  consumption  DOUBLE PRECISION NOT NULL,
  granularity  TEXT          NOT NULL DEFAULT 'hourly',
  inserted_at  TIMESTAMPTZ   NOT NULL DEFAULT now(),
  CONSTRAINT chk_granularity
    CHECK (granularity IN ('hourly','daily','monthly')),
  CONSTRAINT uq_reading_identity
    UNIQUE (user_id, ts, granularity)
);

-- === Сохранённые результаты анализа ===
CREATE TABLE IF NOT EXISTS user_analyses (
  user_id        TEXT           PRIMARY KEY REFERENCES users_metadata(user_id),
  analyzed_at    TIMESTAMPTZ    NOT NULL,
  score          DOUBLE PRECISION NOT NULL,
  patterns       TEXT[]         NOT NULL
);

-- === Индексы для ускорения опросов ===
CREATE INDEX IF NOT EXISTS idx_readings_user_ts ON readings(user_id, ts DESC);
CREATE INDEX IF NOT EXISTS idx_readings_gran ON readings(granularity);
