// pkg/patterns/mining.go
package patterns

import (
	"encoding/json"
	"fmt"
	"tenivatt/pkg/features"
)

type miningPattern struct {
	minNegCorr float64
}

func (p *miningPattern) Code() string { return "mining" }
func (p *miningPattern) Name() string { return "Mining" }

func (p *miningPattern) Score(fv *features.FeatureVector) float64 {
	// если corr(cons, temp) = CorrTempCons < –minNegCorr, считаем аномалию
	if fv.CorrTempCons < -p.minNegCorr {
		return (-fv.CorrTempCons) - p.minNegCorr
	}
	return 0
}

func NewMiningPattern(raw json.RawMessage) (Pattern, error) {
	var cfg struct {
		MinNegCorr float64 `json:"min_neg_corr"`
	}
	if err := json.Unmarshal(raw, &cfg); err != nil {
		return nil, fmt.Errorf("mining params: %w", err)
	}
	return &miningPattern{minNegCorr: cfg.MinNegCorr}, nil
}

func init() {
	Register("mining", NewMiningPattern)
}
