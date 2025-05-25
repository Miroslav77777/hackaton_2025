package main

import (
	"context"
	"log"

	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"

	"brigade-service/internal/db"
	"brigade-service/internal/handler"
	"brigade-service/internal/service"
	"brigade-service/internal/ws"
)

func main() {
	// 1) Подключение к БД
	dbx := sqlx.MustConnect("postgres", "postgres://tenivatt:ZXCghoul1337228@217.198.6.110:5432/brigadier?sslmode=disable")
	repo := db.NewRepo(dbx)
	dbs := sqlx.MustConnect("postgres", "postgres://tenivatt:ZXCghoul1337228@217.198.6.110:5432/tenivatt?sslmode=disable")
	osmRepo := db.NewOSMRepo(dbs)

	// 2) Scheduler (без изменений)
	sched := service.NewScheduler(repo)
	go sched.Run(context.Background())

	// 3) Hub для WebSocket
	hub := ws.NewHub()

	// 4) ReportService (шаблон по пути reports/tmpl/report.tmpl)
	rptSvc, err := service.NewReportService("reports/tmpl/report.tmpl")
	if err != nil {
		log.Fatalf("unable to parse report template: %v", err)
	}

	// 5) HTTP
	r := gin.Default()
	handler.RegisterRoutes(r, repo, osmRepo, hub, rptSvc)

	log.Println("listening on :3001")
	r.Run(":3001")
}
