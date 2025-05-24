// cmd/generate-readings/main.go
// cmd/generate-readings/main.go
package main

import (
	"context"
	"database/sql"
	"flag"
	"fmt"
	"log"
	"math"
	"math/rand"
	"time"

	"github.com/lib/pq"
)

// User — данные абонента
type User struct {
	ID           string
	Residents    int
	BuildingType string
	StoveType    string
}

func main() {
	// флаги
	dsn := flag.String("db", "", "Postgres DSN, e.g. postgres://user:pass@host/db?sslmode=disable")
	city := flag.String("city", "Краснодар", "город для генерации")
	start := flag.String("start", "", "начало периода в RFC3339, например 2025-05-01T00:00:00Z")
	end := flag.String("end", "", "конец периода в RFC3339, например 2025-06-01T00:00:00Z")
	flag.Parse()

	if *dsn == "" || *start == "" || *end == "" {
		log.Fatal("flags -db, -start и -end обязательны")
	}

	// парсим даты
	from, err := time.Parse(time.RFC3339, *start)
	if err != nil {
		log.Fatalf("invalid -start: %v", err)
	}
	to, err := time.Parse(time.RFC3339, *end)
	if err != nil {
		log.Fatalf("invalid -end: %v", err)
	}
	if !to.After(from) {
		log.Fatalf("-end должно быть позже -start")
	}

	// формируем срез часов
	hours := makeHours(from, int(to.Sub(from).Hours()))

	// подключаемся к БД
	db, err := sql.Open("postgres", *dsn)
	if err != nil {
		log.Fatalf("connect db: %v", err)
	}
	defer db.Close()
	ctx := context.Background()

	// 1) читаем пользователей (без тарифов!)
	users, err := loadUsers(ctx, db, *city)
	if err != nil {
		log.Fatalf("loadUsers: %v", err)
	}
	log.Printf("→ users: %d", len(users))

	// 2) назначаем ~5% пользователей каждому паттерну
	patternFor := assignPatterns(users, []string{
		"asic_mining", "bakery", "hostel", "home_dc",
		"manicure", "tattoo", "tyre_service",
		"garage_mining", "greenhouse", "guest_house",
	})

	// 3) batch-COPY в readings
	tx, err := db.BeginTx(ctx, nil)
	if err != nil {
		log.Fatalf("begin tx: %v", err)
	}
	stmt, err := tx.Prepare(pq.CopyIn(
		"readings", "user_id", "ts", "consumption", "granularity", "inserted_at",
	))
	if err != nil {
		tx.Rollback()
		log.Fatalf("prepare copy: %v", err)
	}

	for _, u := range users {
		// месячный норматив (кВт⋅ч в месяц) → кВт⋅ч/час
		base := monthlyNorm(u.BuildingType, u.Residents, u.StoveType) / (30.0 * 24.0)
		pat := patternFor[u.ID]

		for _, ts := range hours {
			// суточная кривая
			h := ts.Hour()
			var dayF float64 = 1.0
			switch {
			case h >= 7 && h <= 9:
				dayF = 1.3
			case h >= 17 && h <= 20:
				dayF = 1.4
			case h >= 22 || h < 6:
				dayF = 0.7
			}
			// шум ±5%
			noise := 1 + (rand.Float64()-0.5)*0.1
			c0 := base * dayF * noise

			// с паттерном (если есть)
			c1 := simulatePattern(c0, pat, ts)

			if _, err := stmt.Exec(
				u.ID,
				ts,
				math.Round(c1*1000)/1000,
				"hourly",
				time.Now(),
			); err != nil {
				stmt.Close()
				tx.Rollback()
				log.Fatalf("copy exec: %v", err)
			}
		}
	}

	if _, err := stmt.Exec(); err != nil {
		stmt.Close()
		tx.Rollback()
		log.Fatalf("copy finish: %v", err)
	}
	stmt.Close()
	if err := tx.Commit(); err != nil {
		log.Fatalf("tx commit: %v", err)
	}

	fmt.Println("✔ Generation complete")
}

// makeHours создаёт срез timestamp-ов длиной length шагом 1 час, начиная с start.
func makeHours(start time.Time, length int) []time.Time {
	out := make([]time.Time, length)
	for i := 0; i < length; i++ {
		out[i] = start.Add(time.Duration(i) * time.Hour)
	}
	return out
}

// loadUsers читает только метаданные и пропускает тарифы.
func loadUsers(ctx context.Context, db *sql.DB, city string) ([]User, error) {
	rows, err := db.QueryContext(ctx, `
        SELECT user_id, residents_count, building_type, stove_type
          FROM users_metadata
         WHERE city = $1
    `, city)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []User
	for rows.Next() {
		var u User
		if err := rows.Scan(&u.ID, &u.Residents, &u.BuildingType, &u.StoveType); err != nil {
			return nil, err
		}
		out = append(out, u)
	}
	return out, rows.Err()
}

// assignPatterns случайно распределяет ~5% пользователей на каждый код паттерна.
func assignPatterns(users []User, pats []string) map[string]string {
	rand.Seed(time.Now().UnixNano())
	N := len(users) / 20
	if N < 1 {
		N = 1
	}
	avail := make([]User, len(users))
	copy(avail, users)
	m := make(map[string]string, len(users))
	for _, pat := range pats {
		idxs := rand.Perm(len(avail))[:N]
		picked := make(map[int]bool, N)
		for _, i := range idxs {
			picked[i] = true
			m[avail[i].ID] = pat
		}
		newAvail := avail[:0]
		for i, u := range avail {
			if !picked[i] {
				newAvail = append(newAvail, u)
			}
		}
		avail = newAvail
	}
	return m
}

// monthlyNorm — норматив в кВт⋅ч в месяц
func monthlyNorm(building string, residents int, stove string) float64 {
	switch building {
	case "private_house":
		switch {
		case residents <= 1:
			if stove == "electric" {
				return 147
			}
			return 97
		case residents == 2:
			if stove == "electric" {
				return 182
			}
			return 120
		case residents == 3:
			if stove == "electric" {
				return 222
			}
			return 147
		default:
			if stove == "electric" {
				return 228 + 58*float64(residents-3)
			}
			return 152 + 38*float64(residents-3)
		}
	case "multi_apartment":
		switch {
		case residents <= 2:
			return 100
		case residents <= 5:
			return 200
		default:
			return 300
		}
	case "garage":
		return 75
	default:
		return 0
	}
}

// simulatePattern изменяет c0 для заданного pat и часа ts.
func simulatePattern(base float64, pat string, ts time.Time) float64 {
	h := ts.Hour()
	switch pat {
	case "asic_mining":
		if h < 6 {
			return base*3 + rand.Float64()*base*0.5
		}
	case "bakery":
		if h >= 6 && h <= 10 {
			return base + base*rand.Float64()*3 + base*2
		}
	case "hostel":
		if h >= 8 && h <= 20 {
			return base * (1 + rand.Float64())
		}
	case "home_dc":
		return base * (1 + rand.Float64()*0.5)
	case "manicure":
		if h >= 10 && h <= 18 && rand.Float64() < 0.1 {
			return base * (1 + rand.Float64()*3)
		}
	case "tattoo":
		if h >= 12 && h <= 20 && rand.Float64() < 0.05 {
			return base * (1 + rand.Float64()*5)
		}
	case "tyre_service":
		if h >= 8 && h <= 18 && rand.Float64() < 0.2 {
			return base + rand.Float64()*base*2
		}
	case "garage_mining":
		if h < 6 {
			return base * (1 + rand.Float64()*2)
		}
	case "greenhouse":
		if h >= 20 || h < 4 {
			return base * (1 + rand.Float64())
		}
	case "guest_house":
		if (ts.Weekday() == time.Friday || ts.Weekday() == time.Saturday || ts.Weekday() == time.Sunday) &&
			h >= 14 && h <= 16 {
			return base * (1 + rand.Float64()*4)
		}
	}
	return base
}

/* go run cmd/generate-readings/main.go \
-db "postgres://user:pass@localhost/teniv	att?sslmode=disable" \
-city "Краснодар" \
-start "2025-05-01T00:00Z" \
-end   "2025-08-01T00:00Z" */
