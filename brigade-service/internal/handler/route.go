package handler

import (
	"brigade-service/internal/service"
	"net/http"

	"github.com/gin-gonic/gin"
)

func registerRoute(r *gin.Engine, routeSvc *service.RouteService) {
	h := &Handler{route: routeSvc}

	r.GET("/brigades/:id/route", h.GetRoute)
}

// GetRoute  GET /brigades/:id/route
func (h *Handler) GetRoute(c *gin.Context) {
	brigID := c.Param("id")

	// 1. ГеоJSON (включает точки + линию)
	fc, err := h.route.BuildRouteGeo(c.Request.Context(), brigID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// 2. Просто порядок UUID, чтобы было удобно фронту
	order, err := h.route.BuildRoute(c.Request.Context(), brigID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"order":   order,
		"geojson": fc,
	})
}
