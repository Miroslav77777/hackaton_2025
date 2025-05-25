package handler

import (
	"net/http"

	"brigade-service/internal/db"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type BatchHandler struct {
	repo    *db.Repo
	osmRepo *db.OSMRepo
}

func NewBatchHandler(
	repo *db.Repo,
	osmRepo *db.OSMRepo,
) *BatchHandler {
	return &BatchHandler{
		repo:    repo,
		osmRepo: osmRepo,
	}
}

// POST /api/v1/addresses
func (h *BatchHandler) CreateAddress(c *gin.Context) {
	var req struct {
		OsmID      *int64  `json:"osm_id"`
		RawAddress *string `json:"raw_address"`
	}
	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var lat, lon *float64
	if req.OsmID != nil {
		la, lo, err := h.osmRepo.GetCoordsByOSM(c, *req.OsmID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "OSM building not found"})
			return
		}
		lat, lon = &la, &lo
	}

	addr, err := h.repo.CreateAddress(c, req.RawAddress, req.OsmID, lat, lon)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, addr)
}

// GET /api/v1/batches/assigned?brigadeId=…
func (h *BatchHandler) GetAssigned(c *gin.Context) {
	bid, err := uuid.Parse(c.Query("brigadeId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid brigadeId"})
		return
	}
	batch, addrs, err := h.repo.GetAssignedBatch(c, bid)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "no batch"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"batch": batch, "addresses": addrs})
}

// PATCH /api/v1/batches/:batchId/addresses/:addressId
func (h *BatchHandler) VisitAddress(c *gin.Context) {
	bID, _ := uuid.Parse(c.Param("batchId"))
	aID, _ := uuid.Parse(c.Param("addressId"))
	h.repo.MarkAddressVisited(c, bID, aID)
	h.repo.CloseBatchIfDone(c, bID)
	c.Status(http.StatusNoContent)
}

func registerBatchRoutes(
	rg *gin.RouterGroup,
	repo *db.Repo,
	osmRepo *db.OSMRepo,
) {
	h := NewBatchHandler(repo, osmRepo)
	rg.POST("/addresses", h.CreateAddress)
	rg.GET("/batches/assigned", h.GetAssigned)
	rg.PATCH("/batches/:batchId/addresses/:addressId", h.VisitAddress)
}
