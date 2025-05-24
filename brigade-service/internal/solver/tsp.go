package solver

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"time"
)

type tspSolver struct {
	key  string
	http *http.Client
}

func NewTSP(key string) Solver {
	return &tspSolver{
		key:  key,
		http: &http.Client{Timeout: 10 * time.Second},
	}
}

func (t *tspSolver) Optimize(ctx context.Context, pts []Point) ([]int, error) {
	type tspPoint struct {
		ID   int     `json:"id"`
		Lat  float64 `json:"lat"`
		Lon  float64 `json:"lon"`
		Type string  `json:"type"` // "delivery"
	}

	sp := make([]tspPoint, len(pts))
	for i, p := range pts {
		sp[i] = tspPoint{ID: i + 1, Lat: p.Lat, Lon: p.Lon, Type: "delivery"}
	}

	reqBody := map[string]any{
		"agents": []map[string]any{
			{"id": 1},
		},
		"service_points": sp,
	}

	payload, _ := json.Marshal(reqBody)
	u := "https://routing.api.2gis.com/logistics/vrp/1.1.0/create?key=" + t.key

	r, err := t.http.Post(u, "application/json", bytes.NewReader(payload))
	if err != nil {
		return nil, err
	}
	defer r.Body.Close()

	if r.StatusCode != http.StatusOK {
		return nil, errors.New("2GIS create task failed")
	}
	var cr struct {
		ID string `json:"id"`
	}
	if err = json.NewDecoder(r.Body).Decode(&cr); err != nil {
		return nil, err
	}
	if cr.ID == "" {
		return nil, errors.New("empty task id")
	}

	// Polling status
	statusURL := "https://routing.api.2gis.com/logistics/vrp/1.1.0/status?id=" + cr.ID + "&key=" + t.key
	for {
		select {
		case <-ctx.Done():
			return nil, ctx.Err()
		default:
		}

		time.Sleep(2 * time.Second)
		resp, err := t.http.Get(statusURL)
		if err != nil {
			return nil, err
		}
		var st struct {
			Status string `json:"status"`
			Result struct {
				Routes [][]int `json:"routes"`
			} `json:"result"`
		}
		_ = json.NewDecoder(resp.Body).Decode(&st)
		resp.Body.Close()

		if st.Status == "queued" || st.Status == "running" {
			continue
		}
		if st.Status != "done" || len(st.Result.Routes) == 0 {
			return nil, errors.New("TSP failed: " + st.Status)
		}
		// 2 GIS индексы начинаются с 1 → переводим в 0-based
		order := make([]int, len(st.Result.Routes[0]))
		for i, v := range st.Result.Routes[0] {
			order[i] = v - 1
		}
		return order, nil
	}
}
