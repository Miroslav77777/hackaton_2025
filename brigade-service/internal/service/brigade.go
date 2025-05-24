package service

import (
	"context"
	"database/sql"
)

// AddressInput – DTO, которое handler передаёт в сервис.
type AddressInput struct {
	RawAddress string
	Lat, Lon   float64
	ServiceSec int
}

// BrigadeService отвечает за CRUD бригад и назначение адресов.
type BrigadeService struct {
	db *sql.DB
}

// NewBrigadeService DI-конструктор.
func NewBrigadeService(db *sql.DB) *BrigadeService { return &BrigadeService{db: db} }

/* ---------- Public API ---------- */

// CreateBrigade вставляет запись и возвращает её UUID.
func (s *BrigadeService) CreateBrigade(ctx context.Context, name string) (string, error) {
	var id string
	if err := s.db.
		QueryRowContext(ctx, `INSERT INTO brigades(name) VALUES($1) RETURNING id`, name).
		Scan(&id); err != nil {
		return "", err
	}
	return id, nil
}

// AssignAddresses добавляет адреса и связывает их с бригадой.
func (s *BrigadeService) AssignAddresses(
	ctx context.Context,
	brigadeID string,
	addrs []AddressInput,
) error {

	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	for _, a := range addrs {
		if a.ServiceSec == 0 {
			a.ServiceSec = 300
		}

		var addrID string
		err = tx.QueryRowContext(ctx, `
			INSERT INTO addresses(raw_address,lat,lon,service_sec)
			     VALUES ($1,$2,$3,$4)
			ON CONFLICT (raw_address) DO UPDATE
			    SET lat = COALESCE(EXCLUDED.lat, addresses.lat),
			        lon = COALESCE(EXCLUDED.lon, addresses.lon)
			RETURNING id
		`, a.RawAddress, a.Lat, a.Lon, a.ServiceSec).Scan(&addrID)
		if err != nil {
			return err
		}

		_, err = tx.ExecContext(ctx, `
			INSERT INTO brigade_addresses(brigade_id,address_id)
			     VALUES ($1,$2)
			ON CONFLICT DO NOTHING
		`, brigadeID, addrID)
		if err != nil {
			return err
		}
	}
	return tx.Commit()
}

func (s *BrigadeService) RemoveAddress(ctx context.Context, brigadeID, addressID string) error {
	_, err := s.db.ExecContext(ctx,
		`DELETE FROM brigade_addresses
		  WHERE brigade_id = $1 AND address_id = $2`,
		brigadeID, addressID)
	return err
}

func (s *BrigadeService) MarkDone(ctx context.Context, brigID, addrID string) (last bool, err error) {
	// 1. помечаем адрес выполненным
	_, err = s.db.ExecContext(ctx, `
		UPDATE brigade_addresses
		   SET completed = TRUE
		 WHERE brigade_id = $1 AND address_id = $2`, brigID, addrID)
	if err != nil {
		return false, err
	}

	// 2. сколько точек ещё осталось?
	var remain int
	if err = s.db.QueryRowContext(ctx, `
		SELECT COUNT(*) FROM brigade_addresses
		 WHERE brigade_id = $1 AND completed = FALSE`, brigID).Scan(&remain); err != nil {
		return false, err
	}

	// 3. если 0 — переносим всю бригаду в историю
	if remain == 0 {
		err = s.archiveAndClear(ctx, brigID)
	}
	return remain == 0, err
}

func (s *BrigadeService) archiveAndClear(ctx context.Context, brigID string) error {
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	// копируем
	_, err = tx.ExecContext(ctx, `
		INSERT INTO brigade_addresses_history (brigade_id, address_id,
		                                        visit_order, finished_at)
		     SELECT brigade_id, address_id, visit_order, NOW()
		       FROM brigade_addresses
		      WHERE brigade_id = $1`, brigID)
	if err != nil {
		tx.Rollback()
		return err
	}
	// очищаем боевую таблицу
	_, err = tx.ExecContext(ctx,
		`DELETE FROM brigade_addresses WHERE brigade_id = $1`, brigID)
	if err != nil {
		tx.Rollback()
		return err
	}
	return tx.Commit()
}
