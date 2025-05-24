package service

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"brigade-service/internal/solver"
)

/* ------------------------------------------------------------------
   DI-контейнер
------------------------------------------------------------------*/

type RouteService struct {
	db     *sql.DB
	solver solver.Solver
}

func NewRouteService(db *sql.DB, s solver.Solver) *RouteService {
	return &RouteService{db: db, solver: s}
}

/* ------------------------------------------------------------------
   Public API
------------------------------------------------------------------*/

// BuildRoute — вернёт slice UUID-ов адресов в оптимальном порядке.
func (r *RouteService) BuildRoute(ctx context.Context, brigadeID string) ([]string, error) {
	order, _, ids, err := r.build(ctx, brigadeID)
	if err != nil {
		return nil, err
	}
	result := make([]string, len(order))
	for i, idx := range order {
		result[i] = ids[idx]
	}
	return result, nil
}

// BuildRouteGeo — та же оптимизация, но ответом GeoJSON FeatureCollection.
func (r *RouteService) BuildRouteGeo(ctx context.Context, brigadeID string) (map[string]any, error) {
	order, pts, ids, err := r.build(ctx, brigadeID)
	if err != nil {
		return nil, err
	}

	features := make([]map[string]any, 0, len(order)+1)
	line := make([][]float64, 0, len(order))

	for i, pos := range order {
		p := pts[pos]
		line = append(line, []float64{p.Lon, p.Lat})

		features = append(features, map[string]any{
			"type": "Feature",
			"geometry": map[string]any{
				"type":        "Point",
				"coordinates": []float64{p.Lon, p.Lat},
			},
			"properties": map[string]any{
				"id":    ids[pos],
				"order": i,
			},
		})
	}

	// Добавляем линию маршрута
	features = append(features, map[string]any{
		"type": "Feature",
		"geometry": map[string]any{
			"type":        "LineString",
			"coordinates": line,
		},
		"properties": map[string]any{},
	})

	return map[string]any{
		"type":     "FeatureCollection",
		"features": features,
	}, nil
}

/* ------------------------------------------------------------------
   private: выборка + solver + update visit_order
------------------------------------------------------------------*/

func (r *RouteService) build(
	ctx context.Context,
	brigadeID string,
) (order []int, pts []solver.Point, ids []string, err error) {

	type addr struct {
		ID       string
		Lat, Lon float64
	}

	rows, err := r.db.QueryContext(ctx, `
		SELECT a.id, a.lat, a.lon
		  FROM addresses a
		  JOIN brigade_addresses ba ON ba.address_id = a.id
		 WHERE ba.brigade_id = $1
 			 AND ba.completed = false          -- ⬅︎ только невыполненные
		ORDER BY a.id;
	`, brigadeID)
	if err != nil {
		return nil, nil, nil, err
	}
	defer rows.Close()

	var list []addr
	for rows.Next() {
		var a addr
		if err = rows.Scan(&a.ID, &a.Lat, &a.Lon); err != nil {
			return nil, nil, nil, err
		}
		if a.Lat == 0 || a.Lon == 0 {
			return nil, nil, nil, errors.New("address without coordinates")
		}
		list = append(list, a)
	}
	if len(list) == 0 {
		return nil, nil, nil, fmt.Errorf("brigade %s has no addresses", brigadeID)
	}

	// ↓ формируем данные для solver
	pts = make([]solver.Point, len(list))
	ids = make([]string, len(list))
	for i, a := range list {
		pts[i] = solver.Point{Lat: a.Lat, Lon: a.Lon}
		ids[i] = a.ID
	}

	order, err = r.solver.Optimize(ctx, pts)
	if err != nil {
		return nil, nil, nil, err
	}
	if len(order) != len(list) {
		return nil, nil, nil, fmt.Errorf("solver returned inconsistent length")
	}

	// ↓ пишем visit_order
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, nil, nil, err
	}
	for pos, idx := range order {
		if _, err = tx.ExecContext(ctx, `
			UPDATE brigade_addresses
			   SET visit_order = $1
			 WHERE brigade_id = $2
			   AND address_id = $3`,
			pos, brigadeID, ids[idx]); err != nil {
			tx.Rollback()
			return nil, nil, nil, err
		}
	}
	if err = tx.Commit(); err != nil {
		return nil, nil, nil, err
	}

	return order, pts, ids, nil
}
