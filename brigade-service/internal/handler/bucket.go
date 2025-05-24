package handler

import (
	"brigade-service/internal/service"

	"github.com/gin-gonic/gin"
)

func (h *Handler) registerInbox(r *gin.Engine, bsvc *service.BucketService) {
	r.POST("/addresses/inbox", func(c *gin.Context) {
		var in addressJSON
		if err := c.ShouldBindJSON(&in); err != nil {
			c.JSON(400, gin.H{"error": err.Error()})
			return
		}
		if err := bsvc.AddIncoming(c, toAddrInput(in)); err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		c.Status(202)
	})
}
