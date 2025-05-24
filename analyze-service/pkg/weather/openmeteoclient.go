// pkg/weather/weather.go
package weather

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"time"
)

// Location — гео-координаты для запросов.
type Location struct {
	Latitude  float64
	Longitude float64
}

// Client умеет брать часовые температуры из Open-Meteo ERA5 Archive API.
type Client struct {
	http *http.Client
}

// NewClient создаёт клиента без API-ключа (Open-Meteo бесплатно).
func NewClient() *Client {
	return &Client{
		http: &http.Client{Timeout: 10 * time.Second},
	}
}

// omResponse — упрощённая структура ответа Open-Meteo Archive API.
type omResponse struct {
	Hourly struct {
		Time          []string  `json:"time"`
		Temperature2m []float64 `json:"temperature_2m"`
	} `json:"hourly"`
}

// GetHourlyTemps запрашивает сразу весь диапазон [from, to) одним API-вызовом.
// Из returned.Hourly.Time/Temperature2m берёт только те точки, что попадают в интервал.
func (c *Client) GetHourlyTemps(
	ctx context.Context,
	loc Location,
	from, to time.Time,
) ([]float64, error) {
	// Формируем URL с нужными параметрами
	u, _ := url.Parse("https://archive-api.open-meteo.com/v1/era5")
	q := u.Query()
	q.Set("latitude", fmt.Sprintf("%f", loc.Latitude))
	q.Set("longitude", fmt.Sprintf("%f", loc.Longitude))
	q.Set("start_date", from.Format("2006-01-02"))
	q.Set("end_date", to.Add(-time.Nanosecond).Format("2006-01-02"))
	q.Set("hourly", "temperature_2m")

	// ← добавляем здесь
	q.Set("timezone", "Europe/Moscow")
	fmt.Println("URL:", u.String())
	u.RawQuery = q.Encode()

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, u.String(), nil)
	if err != nil {
		return nil, err
	}
	resp, err := c.http.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("open-meteo API status: %s", resp.Status)
	}

	var data omResponse
	if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
		return nil, err
	}

	// Фильтруем точки по from ≤ t < to
	var temps []float64
	for i, ts := range data.Hourly.Time {
		t, err := time.Parse("2006-01-02T15:04", ts)
		if err != nil {
			continue
		}
		if !t.Before(from) && t.Before(to) {
			temps = append(temps, data.Hourly.Temperature2m[i])
		}
	}
	return temps, nil
}
