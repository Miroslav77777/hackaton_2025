// pkg/ingestion/handler.go
package ingestion

import (
	"encoding/json"
	"net/http"
	// импортируем модель из этого же пакета
)

// Handler оборачивает ingestion.Service в HTTP-интерфейс.
type Handler struct {
	svc *Service
}

// NewHandler создаёт HTTP-хэндлер для ingestion.
func NewHandler(svc *Service) *Handler {
	return &Handler{svc: svc}
}

func (h *Handler) PostFeatures(w http.ResponseWriter, r *http.Request) {
	var req FeatureRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid JSON: "+err.Error(), http.StatusBadRequest)
		return
	}
	if err := h.svc.Ingest(r.Context(), &req); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
