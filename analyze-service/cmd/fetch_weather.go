// cmd/fetch_weather.go
package main

import (
	"context"
	"database/sql"
	"flag"
	"log"
	"time"

	"tenivatt/pkg/config"
	"tenivatt/pkg/weather"

	_ "github.com/lib/pq"
)

func main() {
	// Сколько дней назад бэкафиллить (по умолчанию 365)
	days := flag.Int("days", 365, "how many days to backfill")
	flag.Parse()

	// Загружаем конфиг (DB_URL)
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("load config: %v", err)
	}

	// Открываем соединение с БД
	db, err := sql.Open("postgres", cfg.DBUrl)
	if err != nil {
		log.Fatalf("connect db: %v", err)
	}
	defer db.Close()

	// Настройки для Краснодара
	city := "Краснодар"
	loc := weather.Location{Latitude: 45.0355, Longitude: 38.9753}

	// Клиент Open-Meteo
	wc := weather.NewClient()

	// Диапазон: [start, end)
	end := time.Now().Truncate(time.Hour)
	start := end.Add(-time.Duration(*days) * 24 * time.Hour)

	log.Printf("Backfilling weather for %q from %s to %s",
		city, start.Format(time.RFC3339), end.Format(time.RFC3339),
	)

	ctx := context.Background()
	// Один запрос за весь период
	temps, err := wc.GetHourlyTemps(ctx, loc, start, end)
	if err != nil {
		log.Fatalf("failed to fetch weather: %v", err)
	}

	expected := int(end.Sub(start).Hours())
	log.Printf("Fetched %d points (expected ~%d)", len(temps), expected)

	// Записываем все точки в weather_cache
	for i, tmp := range temps {
		ts := start.Add(time.Duration(i) * time.Hour)
		if _, err := db.ExecContext(ctx, `
            INSERT INTO weather_cache(city, ts, temp)
            VALUES ($1, $2, $3)
            ON CONFLICT (city, ts) DO NOTHING
        `, city, ts, tmp); err != nil {
			log.Printf("error insert %s: %v", ts.Format(time.RFC3339), err)
		}
	}

	log.Println("Done.")
}
