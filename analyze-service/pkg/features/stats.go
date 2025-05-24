package features

import (
	"math"
	"sort"
)

// computeStd — стандартное отклонение сэмпла.
func computeStd(vals []float64) float64 {
	n := float64(len(vals))
	if n == 0 {
		return 0
	}
	var sum, sumsq float64
	for _, v := range vals {
		sum += v
		sumsq += v * v
	}
	mean := sum / n
	var diff2 float64
	for _, v := range vals {
		d := v - mean
		diff2 += d * d
	}
	return math.Sqrt(diff2 / n)
}

// computeCorr — корреляция Пирсона между xs и ys.
func computeCorr(xs, ys []float64) float64 {
	n := len(xs)
	if n == 0 || n != len(ys) {
		return 0
	}
	var sumX, sumY float64
	for i := range xs {
		sumX += xs[i]
		sumY += ys[i]
	}
	meanX := sumX / float64(n)
	meanY := sumY / float64(n)

	var cov, varX, varY float64
	for i := 0; i < n; i++ {
		dx := xs[i] - meanX
		dy := ys[i] - meanY
		cov += dx * dy
		varX += dx * dx
		varY += dy * dy
	}
	if varX == 0 || varY == 0 {
		return 0
	}
	return cov / math.Sqrt(varX*varY)
}

// computeHDDCDD — по среднемесячным температурам считает
// градусо–дни отопления (<18) и охлаждения (>22).
func computeHDDCDD(temps []float64) (hdd, cdd float64) {
	for _, t := range temps {
		if t < 18 {
			hdd += 18 - t
		} else if t > 22 {
			cdd += t - 22
		}
	}
	return
}

// median — медиана для слайса.
func median(vals []float64) float64 {
	if len(vals) == 0 {
		return 0
	}
	s := append([]float64(nil), vals...)
	sort.Float64s(s)
	mid := len(s) / 2
	if len(s)%2 == 1 {
		return s[mid]
	}
	return (s[mid-1] + s[mid]) / 2
}

func computeMonthlyNorm(buildingType string, residents int, stoveType string) float64 {
	switch buildingType {
	case "private_house", "Частный":
		switch {
		case residents <= 1:
			if stoveType == "electric" {
				return 147
			}
			return 97
		case residents == 2:
			if stoveType == "electric" {
				return 182
			}
			return 120
		case residents == 3:
			if stoveType == "electric" {
				return 222
			}
			return 147
		default: // 4+
			if stoveType == "electric" {
				return 228 + 58*float64(residents-3)
			}
			return 152 + 38*float64(residents-3)
		}

	case "garage", "Гараж":
		return 75

	case "multi_apartment", "Многоквартирный":
		switch {
		case residents <= 2:
			return 100
		case residents <= 5:
			return 200
		default:
			return 300
		}

	default:
		return 0
	}
}
