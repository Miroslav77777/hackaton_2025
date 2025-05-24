package solver

import "context"

// Point — координаты адреса.
type Point struct{ Lat, Lon float64 }

// Solver — абстракция над любым алгоритмом VRP/TSP.
type Solver interface {
	// Optimize возвращает permutation-индексы point-ов (длина n).
	Optimize(ctx context.Context, points []Point) ([]int, error)
}
