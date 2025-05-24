// pkg/patterns/pattern.go
package patterns

import (
	"encoding/json"
	"fmt"

	"tenivatt/pkg/features"
)

type Pattern interface {
	Code() string
	Name() string
	Score(fv *features.FeatureVector) float64
}

type FactoryFunc func(raw json.RawMessage) (Pattern, error)

var registry = map[string]FactoryFunc{}

func Register(code string, fn FactoryFunc) {
	registry[code] = fn
}

func PatternFactory(code string, raw json.RawMessage) (Pattern, error) {
	fn, ok := registry[code]
	if !ok {
		return nil, fmt.Errorf("unknown pattern code: %q", code)
	}
	return fn(raw)
}
