// cmd/api/main.go
package main

import (
	"context"
	"log/slog"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"brigade-service/internal/db"
	"brigade-service/internal/handler"
	"brigade-service/internal/report"
	"brigade-service/internal/service"
	"brigade-service/internal/solver"
	"brigade-service/internal/ws"
)

func main() {
	/* ---------- 1. .env ---------- */
	_ = godotenv.Load()

	/* ---------- 2. PostgreSQL ---------- */
	ctx := context.Background()
	pg, err := db.Connect(ctx)
	if err != nil {
		slog.Error("db connect", "err", err)
		return
	}
	defer pg.Close()

	/* ---------- 3. бизнес-сервисы ---------- */
	brigadeSvc := service.NewBrigadeService(pg)

	slv := solver.Wrap(
		solver.NewTSP(os.Getenv("DGIS_KEY")),
		solver.NewNN(),
	)
	routeSvc := service.NewRouteService(pg, slv)

	taskSvc := service.NewTaskService(pg) // ← NEW

	bucketSvc := service.NewBucketService(pg)
	service.StartBucketFlusher(pg, bucketSvc, 10) // timeout 10 мин

	/* ---------- 4. фоновые воркеры ---------- */
	go ws.RunHub()         // WebSocket-хаб
	report.StartWorker(pg) // PDF-репорты

	/* ---------- 5. HTTP ---------- */
	h := handler.New(brigadeSvc, routeSvc, taskSvc, bucketSvc)
	r := gin.New()
	r.Use(gin.Recovery())
	h.Register(r)

	// раздаём PDF
	r.Static("/reports", "./reports")

	addr := ":3001"
	slog.Info("listen", "addr", addr)
	if err := r.Run(addr); err != nil {
		slog.Error("fatal", "err", err)
	}
}
