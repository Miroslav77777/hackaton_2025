package handler

import (
	"net/http"

	"brigade-service/internal/report"
	"brigade-service/internal/service"

	"github.com/gin-gonic/gin"
)

func registerBrigade(r *gin.Engine,
	brigadeSvc *service.BrigadeService,
	routeSvc *service.RouteService) {
	h := &Handler{brigade: brigadeSvc, route: routeSvc}

	r.POST("/brigades", h.CreateBrigade)
	r.POST("/brigades/:id/addresses", h.AssignAddresses)
	r.DELETE("/brigades/:id/addresses/:aid", h.DeleteAddress) // ← NEW
	r.POST("/brigades/:id/addresses/:aid/complete", h.CompleteAddress)
	r.GET("/ws/reports", h.websocketReports) // ← новинка
}

/* ---------- /brigades ---------- */

type createBrigadeReq struct {
	Name string `json:"name" binding:"required"`
}

func (h *Handler) CreateBrigade(c *gin.Context) {
	var req createBrigadeReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	id, err := h.brigade.CreateBrigade(c.Request.Context(), req.Name)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"id": id})
}

/* ---------- /brigades/:id/addresses ---------- */

type addressJSON struct {
	RawAddress string  `json:"raw_address" binding:"required"`
	Lat        float64 `json:"lat"`
	Lon        float64 `json:"lon"`
	ServiceSec int     `json:"service_sec"`
}

func (h *Handler) AssignAddresses(c *gin.Context) {
	brigadeID := c.Param("id")

	var in []addressJSON
	if err := c.ShouldBindJSON(&in); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if len(in) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "empty list"})
		return
	}

	conv := make([]service.AddressInput, len(in))
	for i, v := range in {
		conv[i] = service.AddressInput{
			RawAddress: v.RawAddress,
			Lat:        v.Lat,
			Lon:        v.Lon,
			ServiceSec: v.ServiceSec,
		}
	}
	if err := h.brigade.AssignAddresses(c.Request.Context(), brigadeID, conv); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.Status(http.StatusNoContent)
}

/* -------- DELETE /brigades/:id/addresses/:aid -------- */

func (h *Handler) DeleteAddress(c *gin.Context) {
	brigID := c.Param("id")
	addrID := c.Param("aid")

	if err := h.brigade.RemoveAddress(c, brigID, addrID); err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	// пересчитываем порядок и отдаем geojson
	fc, err := h.route.BuildRouteGeo(c, brigID)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, fc)
}
func (h *Handler) CompleteAddress(c *gin.Context) {
	brigID, addrID := c.Param("id"), c.Param("aid")

	last, err := h.brigade.MarkDone(c, brigID, addrID)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	// формируем отчёт ПЕРЕД очисткой — всегда
	report.Jobs <- report.Job{BrigadeID: brigID}

	if last {
		// маршрут закончен, журнал очищен
		c.JSON(200, gin.H{
			"message": "route finished, all addresses completed",
			"geojson": gin.H{
				"type":     "FeatureCollection",
				"features": []any{},
			},
		})
		return
	}

	// ещё остались точки → пересчёт маршрута
	geo, err := h.route.BuildRouteGeo(c, brigID)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, gin.H{
		"message": "address completed, route updated",
		"geojson": geo,
	})
}
