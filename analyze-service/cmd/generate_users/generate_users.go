// cmd/generate-users/main.go
package main

import (
	"context"
	"database/sql"
	"flag"
	"fmt"
	"log"

	_ "github.com/lib/pq"
)

func main() {
	var (
		dsn    = flag.String("db", "postgres://tenivatt:ZXCghoul1337228@217.198.6.110:5432/tenivatt?sslmode=disable", "Postgres DSN, e.g. postgres://user:pass@localhost/db?sslmode=disable")
		city   = flag.String("city", "Краснодар", "город для записи")
		count  = flag.Int("count", 100000, "сколько пользователей сгенерить")
		latMin = flag.Float64("latmin", 45.02, "минимальная широта")
		latMax = flag.Float64("latmax", 45.22, "максимальная широта")
		lonMin = flag.Float64("lonmin", 38.94, "минимальная долгота")
		lonMax = flag.Float64("lonmax", 39.14, "максимальная долгота")
	)
	flag.Parse()

	if *dsn == "" {
		log.Fatal("–db обязательный флаг")
	}

	db, err := sql.Open("postgres", *dsn)
	if err != nil {
		log.Fatalf("connect to db: %v", err)
	}
	defer db.Close()

	ctx := context.Background()

	// Собираем SQL, подставляя count
	insertSQL := fmt.Sprintf(`
INSERT INTO users_metadata (
	user_id,
	area_m2,
	residents_count,
	building_type,
	stove_type,
	latitude,
	longitude,
	city,
	tariff_id,
	created_at,
	updated_at
)
SELECT
  md5(random()::text || clock_timestamp()::text) AS user_id,
  (random()*100 + 20)::double precision AS area_m2,
  (floor(random()*5) + 1)::int          AS residents_count,
  (ARRAY['private_house','multi_apartment','garage'])[floor(random()*3)+1] AS building_type,
  (ARRAY['electric','gas'])[floor(random()*2)+1]                    AS stove_type,
  (%[1]f + random()*(%[2]f - %[1]f))::double precision            AS latitude,
  (%[3]f + random()*(%[4]f - %[3]f))::double precision            AS longitude,
  $1::text                                                        AS city,
  (SELECT tariff_id FROM tariffs ORDER BY random() LIMIT 1)       AS tariff_id,
  now()                                                           AS created_at,
  now()                                                           AS updated_at
FROM generate_series(1, %[5]d) AS g(i);
`, *latMin, *latMax, *lonMin, *lonMax, *count)

	log.Printf("↻ Generating %d users in %q …", *count, *city)
	if _, err := db.ExecContext(ctx, insertSQL, *city); err != nil {
		log.Fatalf("insert users: %v", err)
	}
	log.Printf("✔ Done")
}

/* go build -o bin/generate-users ./cmd/generate-users
bin/generate-users \
  -db "postgres://tenivatt:pass@localhost/tenivatt?sslmode=disable" \
  -city "Краснодар" \
  -count 500 \
  -latmin 45.02 -latmax 45.22 \
  -lonmin 38.94 -lonmax 39.14 */
