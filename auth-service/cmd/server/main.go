package main

import (
	"log"
	"net/http"
	"time"

	"auth-service/config"
	"auth-service/internal/handler"
	"auth-service/internal/middleware"
	"auth-service/internal/repository"
	"auth-service/internal/service"
	"auth-service/pkg/db"

	"github.com/gorilla/mux"
)

func main() {
	cfg := config.Load()

	// БД
	pg := db.NewPostgres(
		cfg.DBHost, cfg.DBPort, cfg.DBUser, cfg.DBPassword, cfg.DBName,
	)
	userRepo := repository.NewUserRepo(pg)

	// Сервис
	authSvc := service.NewAuthService(
		userRepo,
		cfg.AccessSecret,
		cfg.RefreshSecret,
		int64(cfg.AccessTTL.Seconds()),
		int64(cfg.RefreshTTL.Seconds()),
	)

	// Хендлеры и маршруты
	authH := handler.NewAuthHandler(authSvc)
	r := mux.NewRouter()
	r.HandleFunc("/login", authH.Login).Methods("POST")
	r.HandleFunc("/refresh", authH.Refresh).Methods("POST")
	r.Handle("/protected",
		middleware.JWTAuth(cfg.AccessSecret)(http.HandlerFunc(authH.Protected)),
	).Methods("GET")

	srv := &http.Server{
		Handler:      r,
		Addr:         ":3000",
		ReadTimeout:  5 * time.Second,
		WriteTimeout: 5 * time.Second,
	}

	log.Println("Starting server on :3000")
	log.Fatal(srv.ListenAndServe())
}
