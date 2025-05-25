package ws

import (
	"sync"

	"github.com/gorilla/websocket"
)

// Hub теперь хранит и per-brigade, и глобальные подключениями
type Hub struct {
	mu    sync.RWMutex
	conns map[string]map[*websocket.Conn]bool // ключ — любая категория, для глобальных — "all"
}

// NewHub инициализирует оба
func NewHub() *Hub {
	return &Hub{
		conns: make(map[string]map[*websocket.Conn]bool),
	}
}

// Register по произвольному ключу
func (h *Hub) Register(key string, conn *websocket.Conn) {
	h.mu.Lock()
	defer h.mu.Unlock()
	if h.conns[key] == nil {
		h.conns[key] = make(map[*websocket.Conn]bool)
	}
	h.conns[key][conn] = true
}

// Broadcast всем, кто зареган на key
func (h *Hub) Broadcast(key string, msg interface{}) {
	h.mu.RLock()
	defer h.mu.RUnlock()
	for conn := range h.conns[key] {
		conn.WriteJSON(msg)
	}
}
