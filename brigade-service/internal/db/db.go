package db

import (
	"context"
	"database/sql"
	"os"
	"time"

	_ "github.com/lib/pq"
)

const ddl = `
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS brigades (
  id   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS addresses (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  raw_address TEXT,
  lat         DOUBLE PRECISION,
  lon         DOUBLE PRECISION,
  service_sec INT DEFAULT 300
);

CREATE TABLE IF NOT EXISTS brigade_addresses (
  brigade_id  UUID REFERENCES brigades(id),
  address_id  UUID REFERENCES addresses(id),
  visit_order INT,
  PRIMARY KEY (brigade_id, address_id)
);
`

func Connect(ctx context.Context) (*sql.DB, error) {
	dsn := os.Getenv("DATABASE_URL") // пример: postgres://user:pass@localhost:5432/db?sslmode=disable
	db, err := sql.Open("postgres", dsn)
	if err != nil {
		return nil, err
	}

	// минимальные настройки пула: нам хватит
	db.SetMaxOpenConns(10)
	db.SetMaxIdleConns(5)
	db.SetConnMaxIdleTime(30 * time.Minute)

	if err = db.PingContext(ctx); err != nil {
		return nil, err
	}
	if _, err = db.ExecContext(ctx, ddl); err != nil {
		db.Close()
		return nil, err
	}
	return db, nil
}
