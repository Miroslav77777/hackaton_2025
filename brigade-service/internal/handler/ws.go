package handler

import (
	"net/http"

	"brigade-service/internal/ws"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

func registerWsRoutes(rg *gin.RouterGroup, hub *ws.Hub) {
	rg.GET("/reports/ws", func(c *gin.Context) {
		conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
		if err != nil {
			return
		}
		hub.Register("all_reports", conn)
	})
}
