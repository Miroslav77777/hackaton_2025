package server

import (
	"fmt"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"

	"tenivatt/pkg/detectors"
	"tenivatt/pkg/ingestion"
)

// NewRouter создаёт и настраивает chi-маршрутизатор
func NewRouter(ingSvc *ingestion.Service, detSvc *detectors.Detector) *chi.Mux {
	r := chi.NewRouter()

	// 1) Middleware
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Timeout(15 * time.Second))

	// 2) Инжест
	ingHandler := ingestion.NewHandler(ingSvc)
	r.Post("/features", ingHandler.PostFeatures)

	// 3) Анализ
	r.Get("/suspects/{userId}", func(w http.ResponseWriter, r *http.Request) {
		userID := chi.URLParam(r, "userId")

		score, patterns, err := detSvc.Analyze(userID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		fmt.Fprintf(w,
			`{"userId":"%s","score":%v,"patterns":%q}`,
			userID, score, patterns,
		)
	})
	return r
}
