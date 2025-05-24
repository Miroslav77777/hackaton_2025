package handler

import (
	"brigade-service/internal/service"

	"github.com/gin-gonic/gin"
)

type taskHandler struct {
	task  *service.TaskService
	route *service.RouteService
}

func toAddrInput(j addressJSON) service.AddressInput {
	return service.AddressInput{
		RawAddress: j.RawAddress,
		Lat:        j.Lat,
		Lon:        j.Lon,
		ServiceSec: j.ServiceSec,
	}
}

func (h *Handler) registerTask(r *gin.Engine, taskSvc *service.TaskService, routeSvc *service.RouteService) {
	th := &taskHandler{task: taskSvc, route: routeSvc}

	r.POST("/brigades/:id/ping", th.ping)  // бригада keep-alive
	r.GET("/tasks", th.list)               // бригада polling
	r.PATCH("/tasks/:tid", th.updateState) // бригада меняет state
}

/* --- мобильный ping --- */
func (th *taskHandler) ping(c *gin.Context) {
	brigID := c.Param("id")
	db := th.task.DB()

	// 1. отметим ping
	_, _ = db.Exec(`UPDATE brigades SET last_ping = now() WHERE id=$1`, brigID)

	// 2. в той же транзакции забираем полную корзину (cnt = 5)
	tx, _ := db.BeginTx(c, nil)

	var bucketID string
	err := tx.QueryRow(`
	    SELECT b.id
	      FROM buckets b
	      JOIN bucket_addresses ba ON ba.bucket_id = b.id
	     WHERE b.locked = false
	     GROUP BY b.id
	    HAVING COUNT(*) = 5
	     LIMIT 1
	     FOR UPDATE SKIP LOCKED`).Scan(&bucketID)

	if err == nil {
		// назначаем корзину через сервис-метод (он уже умеет всё делать без агрегаций и FOR UPDATE)
		if svcErr := th.task.BucketSvc.AssignExisting(c, tx, bucketID, brigID); svcErr == nil {
			_ = tx.Commit()
			c.Status(204)
			return
		}
	}
	tx.Rollback()
	c.Status(204)
}

/* --- бригада запрашивает assigned/new --- */
func (th *taskHandler) list(c *gin.Context) {
	brigID := c.Query("brigade_id")
	since := c.DefaultQuery("since", "1970-01-01T00:00:00Z")
	rows, err := th.task.DB().Query(`
		SELECT id, raw_address, lat, lon, state
		  FROM tasks
		 WHERE brigade_id=$1 AND updated_at > $2`, brigID, since)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var out []map[string]any
	for rows.Next() {
		var id, addr, state string
		var lat, lon float64
		_ = rows.Scan(&id, &addr, &lat, &lon, &state)
		out = append(out, gin.H{
			"id": id, "address": addr, "lat": lat, "lon": lon, "state": state,
		})
	}
	c.JSON(200, out)
}

/* --- PATCH /tasks/:tid --- */
func (th *taskHandler) updateState(c *gin.Context) {
	tid := c.Param("tid")
	var body struct {
		State string `json:"state" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	if err := th.task.SetState(c, tid, body.State); err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	if body.State == "accepted" {
		brigID := c.Query("brigade_id")
		geo, _ := th.route.BuildRouteGeo(c, brigID)
		c.JSON(200, gin.H{"geojson": geo})
		return
	}
	c.Status(204)
}
