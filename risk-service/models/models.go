package models

type Address struct {
	ID          string            `json:"id"`
	Address     string            `json:"address"`
	Coordinates [2]float64        `json:"coordinates"`
	Properties  GeoJSONProperties `json:"properties"`
}

type GeoJSONFeature struct {
	Type       string            `json:"type"`
	ID         string            `json:"id"`
	Properties GeoJSONProperties `json:"properties"`
	Geometry   struct {
		Type        string      `json:"type"`
		Coordinates interface{} `json:"coordinates"`
	} `json:"geometry"`
}

type GeoJSONProperties struct {
	OSMID       string `json:"@id"`
	City        string `json:"addr:city"`
	Country     string `json:"addr:country"`
	Street      string `json:"addr:street"`
	HouseNumber string `json:"addr:housenumber"`
	Postcode    string `json:"addr:postcode"`
	Building    string `json:"building"`
	Levels      string `json:"building:levels"`
	StartDate   string `json:"start_date"`
	Type        string `json:"type"`
	Risk        int    `json:"risk"`
	Exceed      string `json:"exceed"`
	Pattern     string `json:"pattern"`
}
