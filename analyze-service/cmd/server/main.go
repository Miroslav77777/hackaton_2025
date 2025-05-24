// cmd/server/main.go
package main

import (
	"context"
	"database/sql"
	"flag"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/joho/godotenv"

	"tenivatt/pkg/config"
	"tenivatt/pkg/server"

	_ "github.com/lib/pq"
)

func main() {
	// флажок для опциональной одноразовой работы (не используется сейчас)
	flag.Parse()
	_ = godotenv.Load()

	// 1) Загружаем конфиг
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("config load: %v", err)
	}

	// 2) Подключаемся к БД
	db, err := sql.Open("postgres", cfg.DBUrl)
	if err != nil {
		log.Fatalf("db connect: %v", err)
	}
	defer db.Close()
	// настраиваем пул
	db.SetMaxOpenConns(cfg.Concurrency)
	db.SetMaxIdleConns(cfg.Concurrency / 2)
	db.SetConnMaxLifetime(30 * time.Minute)

	// 4) Собираем HTTP-сервер
	srv, err := server.New(cfg)
	if err != nil {
		log.Fatalf("server init: %v", err)
	}

	// 5) Запуск с graceful-shutdown
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	log.Printf("🚀 HTTP listening on :%s", cfg.HTTPPort)
	if err := srv.Run(ctx); err != nil && err != http.ErrServerClosed {
		log.Fatalf("server error: %v", err)
	}
}
