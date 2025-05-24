package solver

import (
	"context"
	"math"
)

type nnSolver struct{}

func NewNN() Solver { return &nnSolver{} }

func (n *nnSolver) Optimize(_ context.Context, pts []Point) ([]int, error) {
	nPts := len(pts)
	if nPts == 0 {
		return nil, nil
	}
	used := make([]bool, nPts)
	order := make([]int, 0, nPts)

	cur := 0 // начинаем с первой точки
	for len(order) < nPts {
		order = append(order, cur)
		used[cur] = true

		next, best := -1, math.MaxFloat64
		for i := 0; i < nPts; i++ {
			if used[i] {
				continue
			}
			if d := haversine(pts[cur], pts[i]); d < best {
				best = d
				next = i
			}
		}
		if next == -1 {
			break
		}
		cur = next
	}
	return order, nil
}

func haversine(a, b Point) float64 {
	const R = 6371e3 // meters
	lat1, lat2 := a.Lat*math.Pi/180, b.Lat*math.Pi/180
	dLat := (b.Lat - a.Lat) * math.Pi / 180
	dLon := (b.Lon - a.Lon) * math.Pi / 180

	sinDLat := math.Sin(dLat / 2)
	sinDLon := math.Sin(dLon / 2)
	h := sinDLat*sinDLat + math.Cos(lat1)*math.Cos(lat2)*sinDLon*sinDLon
	return 2 * R * math.Asin(math.Sqrt(h))
}
