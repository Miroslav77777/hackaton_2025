package solver

import "context"

// compositeSolver сначала пытается primary, а если тот вернул ошибку —
// запускает fallback (Nearest-Neighbor, к примеру).
type compositeSolver struct {
	primary  Solver
	fallback Solver
}

// Wrap возвращает Solver, уже умеющий аварийно переключаться.
func Wrap(primary, fallback Solver) Solver {
	return &compositeSolver{primary: primary, fallback: fallback}
}

func (c *compositeSolver) Optimize(ctx context.Context, pts []Point) ([]int, error) {
	if order, err := c.primary.Optimize(ctx, pts); err == nil {
		return order, nil
	}
	// primary не справился — используем запасной алгоритм
	return c.fallback.Optimize(ctx, pts)
}
