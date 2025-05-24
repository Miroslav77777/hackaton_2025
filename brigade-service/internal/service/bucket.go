package service

import (
	"context"
	"database/sql"
	"fmt"
)

type BucketService struct{ db *sql.DB }

func NewBucketService(db *sql.DB) *BucketService { return &BucketService{db: db} }

/* ---------- API для handler ---------- */

// Добавляем единичный адрес в «входящую трубу»
func (s *BucketService) AddIncoming(ctx context.Context, in AddressInput) error {
	tx, _ := s.db.BeginTx(ctx, nil)

	bid, err := s.pickOrCreateOpenBucket(ctx, tx)
	if err != nil {
		tx.Rollback()
		return err
	}

	idx, err := s.insertAddr(ctx, tx, bid, in)
	if err != nil {
		tx.Rollback()
		return err
	}

	// если добавили 5-й адрес — сразу назначаем
	if idx == 4 {
		if err = s.assignBucket(ctx, tx, bid); err != nil {
			tx.Rollback()
			return err
		}
	}
	return tx.Commit()
}

/* ---------- helpers ---------- */

func (s *BucketService) pickOrCreateOpenBucket(ctx context.Context, tx *sql.Tx) (string, error) {
	var bid string
	err := tx.QueryRowContext(ctx, `
	    SELECT b.id
	      FROM buckets b
	      JOIN LATERAL (
	             SELECT COUNT(*) cnt
	               FROM bucket_addresses ba
	              WHERE ba.bucket_id=b.id) c ON true
	     WHERE b.locked=false AND c.cnt<5
	     ORDER BY b.created_at
	     LIMIT 1
	     FOR UPDATE SKIP LOCKED`).Scan(&bid)

	if err == sql.ErrNoRows {
		_ = tx.QueryRowContext(ctx,
			`INSERT INTO buckets DEFAULT VALUES RETURNING id`).Scan(&bid)
		return bid, nil
	}
	return bid, err
}

func (s *BucketService) insertAddr(ctx context.Context, tx *sql.Tx, bid string, in AddressInput) (int, error) {
	var idx int
	if err := tx.QueryRowContext(ctx,
		`SELECT COALESCE(MAX(idx),-1)+1
		   FROM bucket_addresses
		  WHERE bucket_id=$1
		  FOR UPDATE`, bid).Scan(&idx); err != nil {
		return -1, err
	}
	if idx > 4 {
		return -1, fmt.Errorf("bucket full")
	}
	_, err := tx.ExecContext(ctx,
		`INSERT INTO bucket_addresses(bucket_id,idx,raw_address,lat,lon)
		     VALUES ($1,$2,$3,$4,$5)`,
		bid, idx, in.RawAddress, in.Lat, in.Lon)
	return idx, err
}

func (s *BucketService) freeBrigade(ctx context.Context, tx *sql.Tx) (string, error) {
	var id string
	err := tx.QueryRowContext(ctx, `
	    SELECT id FROM brigades
	     WHERE now()-last_ping < interval '2 min'
	       AND (SELECT COUNT(*) FROM tasks
	            WHERE brigade_id=id
	              AND state IN ('assigned','accepted')) < 3
	     ORDER BY random() LIMIT 1`).Scan(&id)
	return id, err
}

/* ---------- назначаем корзину бригаде ---------- */

func (s *BucketService) assignBucket(ctx context.Context, tx *sql.Tx, bucket string) error {
	brig, _ := s.freeBrigade(ctx, tx)
	if brig == "" {
		// нет свободных — корзина останется unlocked=false,
		// flusher попробует позже
		return nil
	}

	// 1. переносим в tasks сразу как accepted
	_, err := tx.ExecContext(ctx, `
	  INSERT INTO tasks(id,brigade_id,raw_address,lat,lon,state)
	    SELECT uuid_generate_v4(), $1, raw_address, lat, lon, 'accepted'
	      FROM bucket_addresses
	      WHERE bucket_id=$2`, brig, bucket)
	if err != nil {
		return err
	}

	// 2. копируем в рабочий маршрут
	_, err = tx.ExecContext(ctx, `
	  INSERT INTO brigade_addresses(brigade_id,address_id,visit_order,completed)
	    SELECT $1, t.id,
	           row_number() OVER (), false
	      FROM tasks t
	      WHERE t.brigade_id=$1 AND t.state='accepted'
	        AND NOT EXISTS (
	            SELECT 1 FROM brigade_addresses b
	             WHERE b.brigade_id=$1 AND b.address_id=t.id)`, brig)
	if err != nil {
		return err
	}

	// 3. архивируем в history и очищаем содержимое корзины
	_, err = tx.ExecContext(ctx, `
	  INSERT INTO brigade_addresses_history
	        (brigade_id, raw_address, lat, lon, bucket_id, sent_at)
	    SELECT $1, raw_address, lat, lon, $2, now()
	      FROM bucket_addresses
	      WHERE bucket_id=$2`, brig, bucket)
	if err != nil {
		return err
	}
	_, _ = tx.ExecContext(ctx,
		`DELETE FROM bucket_addresses WHERE bucket_id=$1`, bucket)

	// 4. помечаем корзину закрытой
	_, err = tx.ExecContext(ctx,
		`UPDATE buckets SET locked=true WHERE id=$1`, bucket)
	return err
}
