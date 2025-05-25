package handler

import (
	"encoding/json"
	"net/http"
	"os"
	"risk-service/models"
	"risk-service/repository"
)

type Handler struct {
	Repo    *repository.AddressRepo
	GeoJSON map[string]models.GeoJSONFeature
}

func (h *Handler) LoadGeoJSON(path string) error {
	file, err := os.ReadFile(path)
	if err != nil {
		return err
	}
	var data struct {
		Features []models.GeoJSONFeature `json:"features"`
	}
	if err := json.Unmarshal(file, &data); err != nil {
		return err
	}

	h.GeoJSON = make(map[string]models.GeoJSONFeature)
	for _, f := range data.Features {
		h.GeoJSON[f.Properties.OSMID] = f
	}
	return nil
}

func (h *Handler) GetAddresses(w http.ResponseWriter, r *http.Request) {
	dbAddresses, err := h.Repo.GetAddresses()
	if err != nil {
		http.Error(w, "DB error", http.StatusInternalServerError)
		return
	}

	var result []models.Address
	for _, addr := range dbAddresses {
		feature, ok := h.GeoJSON[addr.OSMID]
		if !ok {
			continue
		}
		coords := extractCentroid(feature.Geometry.Coordinates)

		fullAddr := feature.Properties.Street + " " + feature.Properties.HouseNumber

		result = append(result, models.Address{
			ID:          addr.OSMID,
			Address:     fullAddr,
			Coordinates: coords,
			Properties: models.GeoJSONProperties{
				OSMID:       addr.OSMID,
				City:        feature.Properties.City,
				Country:     feature.Properties.Country,
				Street:      feature.Properties.Street,
				HouseNumber: feature.Properties.HouseNumber,
				Postcode:    feature.Properties.Postcode,
				Building:    feature.Properties.Building,
				Levels:      feature.Properties.Levels,
				StartDate:   feature.Properties.StartDate,
				Type:        feature.Properties.Type,
				Risk:        addr.Risk,
				Exceed:      addr.Exceed,
				Pattern:     addr.Pattern,
			},
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

func extractCentroid(coords interface{}) [2]float64 {
	// Примерно берём первую точку первого полигона
	arr, ok := coords.([]interface{})
	if !ok || len(arr) == 0 {
		return [2]float64{0, 0}
	}
	outer, ok := arr[0].([]interface{})
	if !ok || len(outer) == 0 {
		return [2]float64{0, 0}
	}
	point, ok := outer[0].([]interface{})
	if !ok || len(point) != 2 {
		return [2]float64{0, 0}
	}
	return [2]float64{point[0].(float64), point[1].(float64)}
}
