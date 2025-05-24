package features

import (
	"context"
	"database/sql"
	"fmt"
	"sort"
	"strconv"
	"time"
)

// Service собирает FeatureVector из помесячных данных и кэша погоды.
type Service struct {
	db *sql.DB // если нужно читать из БД, иначе пусто
}

// NewService — конструктор.
func NewService(db *sql.DB) *Service {
	return &Service{db: db}
}

// ExtractMonthly строит FeatureVector по помесячным данным:
//
//	consumption: map месяц→kWh,
//	temps:       map месяц→средняя температура.
func (s *Service) ExtractMonthly(
	ctx context.Context,
	userID string,
	from, to time.Time,
	consumption map[string]float64,
	temps map[string]float64,
	buildingType string,
	residents int,
) (*FeatureVector, error) {
	// сортируем по ключам-месяцам, чтобы aligned slices
	var months []int
	for mStr := range consumption {
		m, err := strconv.Atoi(mStr)
		if err != nil {
			return nil, fmt.Errorf("invalid month key %q: %w", mStr, err)
		}
		months = append(months, m)
	}
	sort.Ints(months)

	var consSlice, tempSlice []float64
	for _, m := range months {
		key := strconv.Itoa(m)
		consSlice = append(consSlice, consumption[key])
		if t, ok := temps[key]; ok {
			tempSlice = append(tempSlice, t)
		} else {
			tempSlice = append(tempSlice, 0)
		}
	}

	// базовые агрегаты
	total := 0.0
	for _, v := range consSlice {
		total += v
	}
	mc := len(consSlice)
	avgM := total / float64(mc)
	stdM := computeStd(consSlice)
	maxM := 0.0
	for _, v := range consSlice {
		if v > maxM {
			maxM = v
		}
	}

	// норматив
	monthlyNorm := computeMonthlyNorm(buildingType, residents, "")

	// погода
	avgTemp := 0.0
	for _, t := range tempSlice {
		avgTemp += t
	}
	if mc > 0 {
		avgTemp /= float64(mc)
	}
	hdd, cdd := computeHDDCDD(tempSlice)

	// корреляция
	corr := computeCorr(consSlice, tempSlice)

	fv := &FeatureVector{
		UserID:           userID,
		PeriodStart:      from,
		PeriodEnd:        to,
		TotalConsumption: total,
		MonthCount:       mc,
		AvgMonthly:       avgM,
		StdMonthly:       stdM,
		MaxMonthly:       maxM,
		NormMonthlyKwh:   monthlyNorm,
		AvgTempMonth:     avgTemp,
		HDD:              hdd,
		CDD:              cdd,
		CorrTempCons:     corr,
	}
	return fv, nil
}
