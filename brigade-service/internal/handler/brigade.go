package handler

import (
	"net/http"

	"brigade-service/internal/db"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type BrigadeHandler struct {
	repo *db.Repo
}

func NewBrigadeHandler(repo *db.Repo) *BrigadeHandler {
	return &BrigadeHandler{repo: repo}
}

// POST (или GET) /api/v1/brigades/:id/poll
func (h *BrigadeHandler) Poll(c *gin.Context) {
	// 1. Парсим ID
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid brigade ID"})
		return
	}

	// 2. Обновляем last_seen
	if err := h.repo.UpdateBrigadeLastSeen(c, id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// 3. Читаем обновлённую бригаду
	brig, err := h.repo.GetBrigade(c, id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "brigade not found"})
		return
	}

	// 4. Возвращаем статус (и, при желании, весь объект)
	c.JSON(http.StatusOK, gin.H{
		"id":        brig.ID,
		"status":    brig.Status,
		"last_seen": brig.LastSeen,
	})
}

func registerBrigadeRoutes(rg *gin.RouterGroup, repo *db.Repo) {
	h := NewBrigadeHandler(repo)
	rg.POST("/brigades/:id/poll", h.Poll)
	rg.GET("/brigades/:id/poll", h.Poll)
}
