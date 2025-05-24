package features

import "time"

// FeatureVector — все фичи, которые нам нужны для помесячного анализа.
type FeatureVector struct {
	UserID      string
	PeriodStart time.Time
	PeriodEnd   time.Time

	// помесячные признаки
	TotalConsumption float64 // ∑ c_i
	MonthCount       int     // len(c_i)
	AvgMonthly       float64 // TotalConsumption/MonthCount
	StdMonthly       float64 // σ(c_i)
	MaxMonthly       float64 // max(c_i)

	NormMonthlyKwh float64 // норматив на месяц

	// погода
	AvgTempMonth float64 // среднемесячная температура
	HDD          float64 // градусо–дни отопления
	CDD          float64 // градусо–дни охлаждения

	CorrTempCons float64 // корреляция между [c_i] и [t_i]
}
