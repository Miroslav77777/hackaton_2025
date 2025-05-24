package config

import (
	"log"
	"os"
	"strconv"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	DBHost        string
	DBPort        string
	DBUser        string
	DBPassword    string
	DBName        string
	AccessSecret  []byte
	RefreshSecret []byte
	AccessTTL     time.Duration
	RefreshTTL    time.Duration
}

func Load() *Config {
	// загружаем .env (для локалки)
	_ = godotenv.Load()

	aExp, err := strconv.Atoi(os.Getenv("ACCESS_EXPIRE"))
	if err != nil {
		log.Fatalf("ACCESS_EXPIRE: %v", err)
	}
	rExp, err := strconv.Atoi(os.Getenv("REFRESH_EXPIRE"))
	if err != nil {
		log.Fatalf("REFRESH_EXPIRE: %v", err)
	}

	return &Config{
		DBHost:        os.Getenv("DB_HOST"),
		DBPort:        os.Getenv("DB_PORT"),
		DBUser:        os.Getenv("DB_USER"),
		DBPassword:    os.Getenv("DB_PASSWORD"),
		DBName:        os.Getenv("DB_NAME"),
		AccessSecret:  []byte(os.Getenv("ACCESS_SECRET")),
		RefreshSecret: []byte(os.Getenv("REFRESH_SECRET")),
		AccessTTL:     time.Second * time.Duration(aExp),
		RefreshTTL:    time.Second * time.Duration(rExp),
	}
}
