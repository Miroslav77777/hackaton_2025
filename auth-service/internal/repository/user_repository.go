package repository

import (
	"database/sql"
	"errors"

	"auth-service/internal/models"
)

var ErrUserNotFound = errors.New("user not found")

type UserRepo struct {
	db *sql.DB
}

func NewUserRepo(db *sql.DB) *UserRepo {
	return &UserRepo{db: db}
}

func (r *UserRepo) GetByUsername(username string) (*models.User, error) {
	u := &models.User{}
	err := r.db.QueryRow(
		"SELECT id, password FROM users WHERE username=$1",
		username,
	).Scan(&u.ID, &u.PasswordHash)
	if err == sql.ErrNoRows {
		return nil, ErrUserNotFound
	}
	if err != nil {
		return nil, err
	}
	u.Username = username
	return u, nil
}
