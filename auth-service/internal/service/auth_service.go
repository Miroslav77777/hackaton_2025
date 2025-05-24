package service

import (
	"auth-service/internal/repository"
	"auth-service/internal/utils"
	"errors"
	"time"

	"github.com/golang-jwt/jwt"
)

var ErrInvalidCreds = errors.New("invalid credentials")

type AuthService struct {
	repo          *repository.UserRepo
	accessSecret  []byte
	refreshSecret []byte
	accessTTL     int64
	refreshTTL    int64
}

func NewAuthService(r *repository.UserRepo, aS, rS []byte, aTTL, rTTL int64) *AuthService {
	return &AuthService{
		repo:          r,
		accessSecret:  aS,
		refreshSecret: rS,
		accessTTL:     aTTL,
		refreshTTL:    rTTL,
	}
}

func (s *AuthService) Login(username, password string) (access, refresh string, err error) {
	u, err := s.repo.GetByUsername(username)
	if err != nil {
		return "", "", ErrInvalidCreds
	}
	if err := utils.ComparePassword(u.PasswordHash, password); err != nil {
		return "", "", ErrInvalidCreds
	}
	access, err = utils.CreateToken(u.ID, s.accessSecret, time.Duration(s.accessTTL)*time.Second)
	if err != nil {
		return "", "", err
	}
	refresh, err = utils.CreateToken(u.ID, s.refreshSecret, time.Duration(s.refreshTTL)*time.Second)
	return
}

func (s *AuthService) Refresh(token string) (newAccess, newRefresh string, err error) {
	tok, err := utils.ParseToken(token, s.refreshSecret)
	if err != nil || !tok.Valid {
		return "", "", ErrInvalidCreds
	}
	claims := tok.Claims.(jwt.MapClaims)
	userID := int(claims["sub"].(float64))

	newAccess, err = utils.CreateToken(userID, s.accessSecret, time.Duration(s.accessTTL)*time.Second)
	if err != nil {
		return
	}
	newRefresh, err = utils.CreateToken(userID, s.refreshSecret, time.Duration(s.refreshTTL)*time.Second)
	return
}
