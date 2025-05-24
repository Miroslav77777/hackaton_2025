package db

import (
	"context"
	"database/sql"

	_ "github.com/lib/pq"
)

// Connect открывает соединение и пингует БД
func Connect(dsn string) (*sql.DB, error) {
	db, err := sql.Open("postgres", dsn)
	if err != nil {
		return nil, err
	}
	if err := db.PingContext(context.Background()); err != nil {
		return nil, err
	}
	return db, nil
}
