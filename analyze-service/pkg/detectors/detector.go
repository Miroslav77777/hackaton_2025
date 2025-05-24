// detectors/detector.go
package detectors

import (
	"context"
	"database/sql"
	"fmt"
	"strconv"
	"time"

	"tenivatt/pkg/features"
)

type Detector struct {
	svc *features.Service
	db  *sql.DB
}

func NewDetector(db *sql.DB, svc *features.Service) *Detector {
	return &Detector{db: db, svc: svc}
}

func (d *Detector) Detect(fv *features.FeatureVector) (float64, []string) {
	// рассчитываем базовый скор как отношение среднего потребления к норме
	score := fv.AvgMonthly / fv.NormMonthlyKwh

	var patterns []string

	// пример «паттерна»: если пик > 2× нормы
	if fv.MaxMonthly > fv.NormMonthlyKwh*2 {
		patterns = append(patterns, "MonthlySpike")
	}
	// пример «паттерна»: сильная корреляция с температурой
	if fv.CorrTempCons > 0.5 {
		patterns = append(patterns, "TempCorrelation")
	}
	// пример «паттерна»: среднее > 130% нормы
	if score > 1.3 {
		patterns = append(patterns, "OverNorm")
	}

	return score, patterns
}

// Analyze вытаскивает из БД всё необходимое и возвращает score+patterns.
func (d *Detector) Analyze(userID string) (float64, []string, error) {
	ctx := context.Background()

	// 1) метаданные
	var buildingType string
	var residents int
	var city string
	if err := d.db.QueryRowContext(ctx, `
    SELECT building_type, residents_count, city
    FROM users_metadata
    WHERE user_id = $1
  `, userID).Scan(&buildingType, &residents, &city); err != nil {
		return 0, nil, fmt.Errorf("load metadata: %w", err)
	}

	// 2) помесячные показания
	consRows, err := d.db.QueryContext(ctx, `
    SELECT month, consumption
      FROM monthly_consumption
     WHERE user_id = $1
       AND month BETWEEN $2 AND $3
  `, userID, 1, 12)
	if err != nil {
		return 0, nil, fmt.Errorf("load monthly_consumption: %w", err)
	}
	defer consRows.Close()
	cons := make(map[string]float64)
	for consRows.Next() {
		var m int
		var c float64
		if err := consRows.Scan(&m, &c); err != nil {
			return 0, nil, err
		}
		cons[strconv.Itoa(m)] = c
	}

	// 3) среднемесячная погода
	tempRows, err := d.db.QueryContext(ctx, `
    SELECT month, avg_temp
      FROM weather_monthly_cache
     WHERE city = $1
       AND month BETWEEN $2 AND $3
  `, city, 1, 12)
	if err != nil {
		return 0, nil, fmt.Errorf("load weather_monthly_cache: %w", err)
	}
	defer tempRows.Close()
	temps := make(map[string]float64)
	for tempRows.Next() {
		var m int
		var t float64
		if err := tempRows.Scan(&m, &t); err != nil {
			return 0, nil, err
		}
		temps[strconv.Itoa(m)] = t
	}

	// 4) собираем фичи и считаем скоры
	from := time.Date(time.Now().Year(), 1, 1, 0, 0, 0, 0, time.UTC)
	to := time.Date(time.Now().Year(), 12, 31, 23, 59, 59, 0, time.UTC)
	fv, err := d.svc.ExtractMonthly(ctx, userID, from, to, cons, temps, buildingType, residents)
	if err != nil {
		return 0, nil, fmt.Errorf("compute features: %w", err)
	}
	score, patterns := d.Detect(fv)
	return score, patterns, nil
}
