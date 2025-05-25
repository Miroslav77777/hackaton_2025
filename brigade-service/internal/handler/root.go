package handler

import (
	"brigade-service/internal/db"
	"brigade-service/internal/service"
	"brigade-service/internal/ws"

	"github.com/gin-gonic/gin"
)

func RegisterRoutes(r *gin.Engine, repo *db.Repo, osmRepo *db.OSMRepo, hub *ws.Hub, rptSvc *service.ReportService) {
	v1 := r.Group("/v1")

	// регистрируем роуты по модулям
	registerBrigadeRoutes(v1, repo)
	registerBatchRoutes(v1, repo, osmRepo)
	registerWsRoutes(v1, hub)
	registerReportRoutes(v1, repo, rptSvc, hub)
}
