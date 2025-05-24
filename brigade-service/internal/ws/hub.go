package ws

import "github.com/gorilla/websocket"

// Event отправляется фронтам, когда готов новый PDF.
type Event struct {
	BrigadeID string `json:"brigade_id"`
	ReportID  string `json:"report_id"`
	FilePath  string `json:"file_path"`
}

var (
	Register   = make(chan *websocket.Conn, 8)
	Unregister = make(chan *websocket.Conn, 8)
	Broadcast  = make(chan Event, 32)
)

// RunHub — концентратор WebSocket-клиентов.
func RunHub() {
	clients := map[*websocket.Conn]struct{}{}
	for {
		select {
		case c := <-Register:
			clients[c] = struct{}{}
		case c := <-Unregister:
			delete(clients, c)
			c.Close()
		case ev := <-Broadcast:
			for c := range clients {
				_ = c.WriteJSON(ev)
			}
		}
	}
}
