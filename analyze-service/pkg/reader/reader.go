package reader

import (
	"context"
	"database/sql"
	"time"

	"github.com/lib/pq"
)

// SaveDailyResult сохраняет анализ за N-дней в таблицу monthly_analysis.
func SaveDailyResult(ctx context.Context, db *sql.DB,
	userID string, periodEnd time.Time, score float64, patterns []string,
) error {
	// <-- именно тут!
	if patterns == nil {
		patterns = []string{}
	}

	_, err := db.ExecContext(ctx, `
        INSERT INTO monthly_analysis
            (user_id, period_end, score, patterns, created_at)
        VALUES ($1, $2, $3, $4, NOW())
        ON CONFLICT (user_id, period_end) DO UPDATE
          SET score      = EXCLUDED.score,
              patterns   = EXCLUDED.patterns,
              created_at = NOW()
    `, userID, periodEnd, score, pq.Array(patterns))
	return err
}

// SaveHourlyResult сохраняет анализ почасово в hourly_detection_results.
func SaveHourlyResult(ctx context.Context, db *sql.DB,
	userID string, periodEnd time.Time, score float64, patterns []string,
) error {
	if patterns == nil {
		patterns = []string{}
	}

	_, err := db.ExecContext(ctx, `
        INSERT INTO hourly_detection_results
            (user_id, period_end, score, patterns, created_at)
        VALUES ($1, $2, $3, $4, NOW())
        ON CONFLICT (user_id, period_end) DO UPDATE
          SET score      = EXCLUDED.score,
              patterns   = EXCLUDED.patterns,
              created_at = NOW()
    `, userID, periodEnd, score, pq.Array(patterns))
	return err
}

// LoadUserIDs не меняется
func LoadUserIDs(ctx context.Context, db *sql.DB, city string) ([]string, error) {
	rows, err := db.QueryContext(ctx, `
        SELECT user_id 
          FROM users_metadata
         WHERE city = $1
    `, city)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []string
	for rows.Next() {
		var uid string
		if err := rows.Scan(&uid); err != nil {
			return nil, err
		}
		out = append(out, uid)
	}
	return out, rows.Err()
}

func LoadAllUserMeta(ctx context.Context, db *sql.DB, city string) ([]UserMeta, error) {
	const q = `
        SELECT user_id, residents_count, building_type, stove_type, city, tariff_id
          FROM users_metadata
         WHERE city = $1
    `
	rows, err := db.QueryContext(ctx, q, city)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var metas []UserMeta
	for rows.Next() {
		var u UserMeta
		if err := rows.Scan(
			&u.UserID,
			&u.Residents,
			&u.BuildingType,
			&u.StoveType,
			&u.City,
			&u.TariffID,
		); err != nil {
			return nil, err
		}
		metas = append(metas, u)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return metas, nil
}
