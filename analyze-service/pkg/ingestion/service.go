package ingestion

import (
	"context"
	"database/sql"
	"fmt"
	"strconv"
)

// Service отвечает за приём и сохранение помесячных данных и метаданных.
type Service struct {
	db *sql.DB
}

// NewService создаёт новый ingestion-сервис.
func NewService(db *sql.DB) *Service {
	return &Service{db: db}
}

// Ingest сохраняет metadata + помесячное потребление в транзакции.
func (s *Service) Ingest(ctx context.Context, req *FeatureRequest) error {
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer func() {
		if err != nil {
			tx.Rollback()
		}
	}()

	// 1) Upsert users_metadata c новыми полями
	const metaQ = `
INSERT INTO users_metadata (
  user_id, address, building_type, residents_count, total_area,
  avg_temp_month, dynamic_kwh_month
) VALUES ($1,$2,$3,$4,$5,$6,$7)
ON CONFLICT (user_id) DO UPDATE
  SET
    address          = EXCLUDED.address,
    building_type    = EXCLUDED.building_type,
    residents_count  = EXCLUDED.residents_count,
    total_area       = EXCLUDED.total_area,
    avg_temp_month   = EXCLUDED.avg_temp_month,
    dynamic_kwh_month= EXCLUDED.dynamic_kwh_month
`
	userID := strconv.Itoa(req.AccountID)
	if _, err = tx.ExecContext(ctx, metaQ,
		userID,
		req.Address,
		req.BuildingType,
		req.ResidentsCount,
		req.TotalArea,
		req.AvgTempMonth,
		req.DynamicKWHMonth,
	); err != nil {
		return fmt.Errorf("metadata upsert: %w", err)
	}

	// 2) Upsert monthly_consumption
	const consQ = `
INSERT INTO monthly_consumption (user_id, month, consumption)
VALUES ($1,$2,$3)
ON CONFLICT (user_id, month) DO UPDATE
  SET consumption = EXCLUDED.consumption
`
	for mStr, c := range req.Consumption {
		month, err := strconv.Atoi(mStr)
		if err != nil {
			return fmt.Errorf("invalid month %q: %w", mStr, err)
		}
		if _, err = tx.ExecContext(ctx, consQ, userID, month, c); err != nil {
			return fmt.Errorf("monthly consumption upsert: %w", err)
		}
	}

	return tx.Commit()
}
