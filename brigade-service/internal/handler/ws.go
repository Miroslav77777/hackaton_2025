package handler

import (
	"net/http"

	"brigade-service/internal/ws"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(*http.Request) bool { return true },
}

func (h *Handler) websocketReports(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		return
	}
	ws.Register <- conn
	defer func() { ws.Unregister <- conn }()

	// читаем, чтобы связь не закрылась (пинг-понт)
	for {
		if _, _, err := conn.ReadMessage(); err != nil {
			return
		}
	}
}
