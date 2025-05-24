// pkg/patterns/workshop.go
package patterns

import (
	"encoding/json"
	"fmt"
	"tenivatt/pkg/features"
)

type workshopPattern struct {
	minRelStd float64
}

func (p *workshopPattern) Code() string { return "workshop" }
func (p *workshopPattern) Name() string { return "Workshop" }

func (p *workshopPattern) Score(fv *features.FeatureVector) float64 {
	if fv.AvgMonthly == 0 {
		return 0
	}
	rel := fv.StdMonthly / fv.AvgMonthly
	if rel > p.minRelStd {
		return rel - p.minRelStd
	}
	return 0
}

func NewWorkshopPattern(raw json.RawMessage) (Pattern, error) {
	var cfg struct {
		MinRelStd float64 `json:"min_rel_std"`
	}
	if err := json.Unmarshal(raw, &cfg); err != nil {
		return nil, fmt.Errorf("workshop params: %w", err)
	}
	return &workshopPattern{minRelStd: cfg.MinRelStd}, nil
}

func init() {
	Register("workshop", NewWorkshopPattern)
}
