// cmd/generate_payments/main.go
package main

import (
	"context"
	"database/sql"
	"flag"
	"log"
	"math/rand"
	"time"

	"github.com/lib/pq"
)

var (
	connStr    = flag.String("db", "postgres://tenivatt:ZXCghoul1337228@217.198.6.110:5432/tenivatt?sslmode=disable", "DB connection string")
	city       = flag.String("city", "Краснодар", "город для генерации")
	monthsBack = flag.Int("months", 3, "сколько месяцев назад генерить")
)

func main() {
	flag.Parse()
	rand.Seed(time.Now().UnixNano())

	db, err := sql.Open("postgres", *connStr)
	if err != nil {
		log.Fatalf("connect db: %v", err)
	}
	defer db.Close()

	ctx := context.Background()

	// 1) подтягиваем всех пользователей из нужного города
	rows, err := db.QueryContext(ctx, `
    SELECT user_id
      FROM users_metadata
     WHERE city = $1
  `, *city)
	if err != nil {
		log.Fatalf("load users: %v", err)
	}
	var uids []string
	for rows.Next() {
		var uid string
		rows.Scan(&uid)
		uids = append(uids, uid)
	}
	rows.Close()
	log.Printf("found %d users in %s", len(uids), *city)

	// 2) Начинаем COPY батч
	tx, err := db.BeginTx(ctx, nil)
	if err != nil {
		log.Fatalf("begin tx: %v", err)
	}
	stmt, err := tx.PrepareContext(ctx, pq.CopyIn("payments", "user_id", "due_at", "paid_at"))
	if err != nil {
		log.Fatalf("prepare copy: %v", err)
	}

	now := time.Now().UTC()
	for _, uid := range uids {
		// для каждого пользователя генерим платежи за последние monthsBack месяцев
		for m := 0; m < *monthsBack; m++ {
			// фиксируем due_at на 1-е число месяца m месяцев назад
			monthStart := time.Date(now.Year(), now.Month()-time.Month(m), 1, 0, 0, 0, 0, time.UTC)
			// делаем 1–3 платежа за месяц
			count := rand.Intn(3) + 1
			for i := 0; i < count; i++ {
				// due_at прибавляем случайный день в пределах месяца
				due := monthStart.Add(time.Duration(rand.Intn(30*24)) * time.Hour)
				// paid_at: с вероятностью 80% вовремя, иначе с запозданием до 7 дней
				var paid time.Time
				if rand.Float64() < 0.8 {
					// в пределах 2 дней до/после due
					paid = due.Add(time.Duration(rand.Intn(96)-48) * time.Hour)
				} else {
					paid = due.Add(time.Duration(rand.Intn(7*24)) * time.Hour)
				}
				// вставляем в COPY
				if _, err := stmt.ExecContext(ctx, uid, due, paid); err != nil {
					log.Fatalf("copy exec: %v", err)
				}
			}
		}
	}

	// завершаем COPY
	if _, err := stmt.ExecContext(ctx); err != nil {
		log.Fatalf("copy finish: %v", err)
	}
	if err := stmt.Close(); err != nil {
		log.Fatalf("copy close: %v", err)
	}
	if err := tx.Commit(); err != nil {
		log.Fatalf("tx commit: %v", err)
	}

	log.Println("✔ payments generated successfully")
}

/* go run cmd/generate_payments/main.go \
-db="postgres://tenivatt:pass@localhost/tenivatt?sslmode=disable" \
-city="Краснодар" \
-months=3 */
