package handler

import (
	"github.com/gin-gonic/gin"

	"brigade-service/internal/service"
)

// Handler агрегирует все под-хендлеры.
type Handler struct {
	brigade *service.BrigadeService
	route   *service.RouteService
	task    *service.TaskService
	bucket  *service.BucketService // ← new
}

func New(br *service.BrigadeService, rt *service.RouteService,
	tk *service.TaskService, bk *service.BucketService) *Handler {
	return &Handler{brigade: br, route: rt, task: tk, bucket: bk}
}

// Register навешивает ВСЕ маршруты на переданный Gin-роутер.
// Здесь вызываем приватные регистраторы из других файлов.
func (h *Handler) Register(r *gin.Engine) {
	registerBrigade(r, h.brigade, h.route)
	registerRoute(r, h.route)
	h.registerTask(r, h.task, h.route)
	h.registerInbox(r, h.bucket) // ← новинка
}
