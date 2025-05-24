package ingestion

import "time"

// Metadata — расширенные метаданные пользователя
type Metadata struct {
	AreaM2         float64 `json:"area"` // Площадь, м²
	ResidentsCount int     `json:"residentsCount"`
	BuildingType   string  `json:"buildingType"` // 'multi_apartment','private_house','garage'
	StoveType      string  `json:"stoveType"`    // 'electric' или 'gas'
	City           string  `json:"city"`
	TariffID       int     `json:"tariffId"`
}

// Reading — одна точка измерения
type Reading struct {
	Timestamp   time.Time `json:"timestamp"`
	Consumption float64   `json:"consumption"`
}

// FeatureRequest — тело POST /features
type FeatureRequest struct {
	AccountID       int                `json:"accountId"`
	Address         string             `json:"address"`
	BuildingType    string             `json:"buildingType"`
	ResidentsCount  int                `json:"residentsCount"`
	TotalArea       float64            `json:"totalArea"`
	AvgTempMonth    float64            `json:"sr_temp_month"`
	DynamicKWHMonth float64            `json:"dynamicKWH_month"`
	Consumption     map[string]float64 `json:"consumption"`
}
