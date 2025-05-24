package server

import (
	"context"
	"database/sql"
	"fmt"
	"net/http"
	"time"

	"tenivatt/pkg/config"
	"tenivatt/pkg/db"
	"tenivatt/pkg/detectors"
	"tenivatt/pkg/features"
	"tenivatt/pkg/ingestion"
)

// Server — обёртка для http.Server + доступ к БД и сервисам.
type Server struct {
	httpServer *http.Server
	db         *sql.DB
}

// DB возвращает внутреннее подключение к базе.
func (s *Server) DB() *sql.DB {
	return s.db
}

// New создаёт HTTP-сервер, подключив БД, сервисы и роутер.
func New(cfg *config.Config) (*Server, error) {
	// 1) Подключаем БД
	conn, err := db.Connect(cfg.DBUrl)
	if err != nil {
		return nil, fmt.Errorf("db connect: %w", err)
	}

	// 2) Инициализируем сервисы ingestion
	ingSvc := ingestion.NewService(conn)

	// 3) Инициализируем сервис фичей
	featSvc := features.NewService(conn)

	// 4) Инициализируем детектор на базе features.Service
	detSvc := detectors.NewDetector(conn, featSvc)

	// 5) Создаём HTTP-роутер с ingestion и детектором
	router := NewRouter(ingSvc, detSvc)

	// 6) Конфигурируем сам http.Server
	srv := &http.Server{
		Addr:         ":" + cfg.HTTPPort,
		Handler:      router,
		ReadTimeout:  5 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  30 * time.Second,
	}

	return &Server{
		httpServer: srv,
		db:         conn,
	}, nil
}

// Run запускает HTTP-сервер и делает graceful-shutdown по ctx.
func (s *Server) Run(ctx context.Context) error {
	errCh := make(chan error, 1)
	go func() {
		errCh <- s.httpServer.ListenAndServe()
	}()

	select {
	case <-ctx.Done():
		// при SIGINT/SIGTERM останавливаемся корректно
		shutdownCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		return s.httpServer.Shutdown(shutdownCtx)
	case err := <-errCh:
		return err
	}
}
