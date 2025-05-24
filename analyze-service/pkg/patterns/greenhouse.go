// pkg/patterns/greenhouse.go
package patterns

import (
	"encoding/json"
	"fmt"
	"tenivatt/pkg/features"
)

type greenhousePattern struct {
	minCorr float64
}

func (p *greenhousePattern) Code() string { return "greenhouse" }
func (p *greenhousePattern) Name() string { return "Greenhouse" }

func (p *greenhousePattern) Score(fv *features.FeatureVector) float64 {
	if fv.CorrTempCons > p.minCorr {
		return fv.CorrTempCons - p.minCorr
	}
	return 0
}

func NewGreenhousePattern(raw json.RawMessage) (Pattern, error) {
	var cfg struct {
		MinCorr float64 `json:"min_corr"`
	}
	if err := json.Unmarshal(raw, &cfg); err != nil {
		return nil, fmt.Errorf("greenhouse params: %w", err)
	}
	return &greenhousePattern{minCorr: cfg.MinCorr}, nil
}

func init() {
	Register("greenhouse", NewGreenhousePattern)
}
