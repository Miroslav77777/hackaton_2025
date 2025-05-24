package service

import (
	"context"
	"database/sql"
	"fmt"
	"time"
)

/* timeoutMin — сколько минут корзина может «лежат» без пятого адреса */
func StartBucketFlusher(db *sql.DB, svc *BucketService, timeoutMin int) {
	go func() {
		t := time.NewTicker(1 * time.Minute)
		for range t.C {
			rows, _ := db.Query(`
			  SELECT b.id
			    FROM buckets b
			    JOIN LATERAL (
			         SELECT COUNT(*) cnt
			           FROM bucket_addresses ba
			          WHERE ba.bucket_id=b.id) c ON true
			   WHERE b.locked=false
			     AND (c.cnt=5 OR  b.created_at <
			         now() - $1::interval)`,
				fmt.Sprintf("%d minutes", timeoutMin))
			for rows.Next() {
				var bid string
				_ = rows.Scan(&bid)
				tx, _ := db.BeginTx(context.Background(), nil)
				_ = svc.assignBucket(context.Background(), tx, bid)
				_ = tx.Commit()
			}
			rows.Close()
		}
	}()
}
