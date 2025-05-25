package db

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	"github.com/lib/pq"
)

type Repo struct {
	db *sqlx.DB
}

func NewRepo(db *sqlx.DB) *Repo { return &Repo{db: db} }

func (r *Repo) UpdateAddressCoords(ctx context.Context, id uuid.UUID, lat, lon float64) error {
	_, err := r.db.ExecContext(ctx,
		`UPDATE addresses SET lat=$1, lon=$2 WHERE id=$3`,
		lat, lon, id,
	)
	return err
}

// 1. Создать «сырой» адрес
func (r *Repo) CreateAddress(ctx context.Context, raw *string, osmID *int64, lat, lon *float64) (Address, error) {
	var a Address
	const q = `
    INSERT INTO addresses(raw_address, osm_id, lat, lon)
    VALUES($1,$2,$3,$4)
    RETURNING *
  `
	err := r.db.GetContext(ctx, &a, q, raw, osmID, lat, lon)
	return a, err
}

// 2. Взять до N не-batched адресов, отсортированных по created_at
func (r *Repo) ListPendingAddresses(ctx context.Context, limit int) ([]Address, error) {
	var out []Address
	q := `SELECT * FROM addresses WHERE batched = false ORDER BY created_at LIMIT $1`
	err := r.db.SelectContext(ctx, &out, q, limit)
	return out, err
}

// 4. Создать batch на данных адресах
func (r *Repo) CreateBatch(ctx context.Context, addrIDs []uuid.UUID) (Batch, error) {
	tx := r.db.MustBeginTx(ctx, nil)
	var b Batch
	tx.GetContext(ctx, &b, `INSERT INTO batches DEFAULT VALUES RETURNING *`)
	for _, aid := range addrIDs {
		tx.ExecContext(ctx,
			`INSERT INTO batch_addresses(batch_id,address_id) VALUES($1,$2)`,
			b.ID, aid,
		)
	}
	tx.Commit()
	return b, nil
}

// 5. Найти первую свободную бригаду
func (r *Repo) FindIdleBrigade(ctx context.Context) (Brigade, error) {
	var br Brigade
	q := `SELECT * FROM brigades WHERE status='idle' ORDER BY last_seen DESC LIMIT 1`
	err := r.db.GetContext(ctx, &br, q)
	return br, err
}

// 6. Назначить batch бригаде
func (r *Repo) AssignBatch(ctx context.Context, batchID, brigID uuid.UUID) error {
	now := time.Now()
	tx := r.db.MustBeginTx(ctx, nil)
	tx.ExecContext(ctx, `UPDATE batches SET brigade_id=$1,assigned_at=$2,status='assigned' WHERE id=$3`, brigID, now, batchID)
	tx.ExecContext(ctx, `UPDATE brigades SET status='busy' WHERE id=$1`, brigID)
	return tx.Commit()
}

// 7. Получить batch+адреса для конкретной бригады
func (r *Repo) GetAssignedBatch(ctx context.Context, brigID uuid.UUID) (Batch, []Address, error) {
	var b Batch
	err := r.db.GetContext(ctx, &b,
		`SELECT * FROM batches WHERE brigade_id=$1 AND status='assigned'`, brigID,
	)
	if err != nil {
		return b, nil, err
	}
	var addrs []Address
	err = r.db.SelectContext(ctx, &addrs,
		`SELECT a.* FROM addresses a
     JOIN batch_addresses ba ON ba.address_id=a.id
     WHERE ba.batch_id=$1 AND ba.state='pending'`, b.ID,
	)
	return b, addrs, err
}

// 8. Отметить посещение
func (r *Repo) MarkAddressVisited(ctx context.Context, batchID, addrID uuid.UUID) error {
	now := time.Now()
	_, err := r.db.ExecContext(ctx,
		`UPDATE batch_addresses SET state='visited',visited_at=$1
     WHERE batch_id=$2 AND address_id=$3`, now, batchID, addrID)
	return err
}

// 9. Когда все точки visited — закрыть batch & вернуть бригаду в idle
func (r *Repo) CloseBatchIfDone(ctx context.Context, batchID uuid.UUID) error {
	var cnt int
	r.db.GetContext(ctx, &cnt,
		`SELECT count(*) FROM batch_addresses WHERE batch_id=$1 AND state!='visited'`, batchID,
	)
	if cnt == 0 {
		tx := r.db.MustBeginTx(ctx, nil)
		tx.ExecContext(ctx, `UPDATE batches SET status='done' WHERE id=$1`, batchID)
		tx.ExecContext(ctx, `UPDATE brigades SET status='idle' WHERE id=(
      SELECT brigade_id FROM batches WHERE id=$1
    )`, batchID)
		return tx.Commit()
	}
	return nil
}

func (r *Repo) GetPendingAddressesByBatchID(ctx context.Context, batchID uuid.UUID) ([]Address, error) {
	var addrs []Address
	const q = `
      SELECT a.*
      FROM addresses a
      JOIN batch_addresses ba ON ba.address_id = a.id
      WHERE ba.batch_id = $1 AND ba.state = 'pending'
      ORDER BY a.created_at
    `
	err := r.db.SelectContext(ctx, &addrs, q, batchID)
	return addrs, err
}

func (r *Repo) UpdateBrigadeLastSeen(ctx context.Context, brigadeID uuid.UUID) error {
	_, err := r.db.ExecContext(ctx,
		`UPDATE brigades SET last_seen = $1 WHERE id = $2`, time.Now(), brigadeID)
	return err
}

// Прочитать бригаду (чтобы вернуть её статус)
func (r *Repo) GetBrigade(ctx context.Context, brigadeID uuid.UUID) (Brigade, error) {
	var b Brigade
	err := r.db.GetContext(ctx, &b, `SELECT * FROM brigades WHERE id = $1`, brigadeID)
	return b, err
}

func (r *Repo) GetCoordsByOSM(ctx context.Context, osmID int64) (lat, lon float64, err error) {
	// planet_osm_polygon — стандартная таблица, в ней поле way — геометрия
	const q = `
      SELECT 
        ST_Y(ST_Centroid(way)) AS lat,
        ST_X(ST_Centroid(way)) AS lon
      FROM osm_buildings
      WHERE osm_id = $1
        AND building IS NOT NULL
      LIMIT 1
    `
	err = r.db.QueryRowContext(ctx, q, osmID).Scan(&lat, &lon)
	return
}

func (r *Repo) MarkAddressesBatched(ctx context.Context, ids []uuid.UUID) error {
	const q = `
      UPDATE addresses
         SET batched = true
       WHERE id = ANY($1::uuid[])
    `
	// pq.Array конвертирует Go-срез в pg массив
	_, err := r.db.ExecContext(ctx, q, pq.Array(ids))
	return err
}
func (r *Repo) SaveReport(ctx context.Context, rpt Report) error {
	const q = `
      INSERT INTO reports(id,batch_id,address_id,content,file_path,created_at)
      VALUES($1,$2,$3,$4,$5,$6)
    `
	if rpt.ID == uuid.Nil {
		rpt.ID = uuid.New()
	}
	if rpt.CreatedAt.IsZero() {
		rpt.CreatedAt = time.Now()
	}
	_, err := r.db.ExecContext(ctx, q,
		rpt.ID, rpt.BatchID, rpt.AddressID, rpt.Content, rpt.FilePath, rpt.CreatedAt,
	)
	return err
}

func (r *Repo) ListReportsByBatch(ctx context.Context, batchID uuid.UUID) ([]Report, error) {
	var out []Report
	const q = `SELECT * FROM reports WHERE batch_id=$1 ORDER BY created_at`
	err := r.db.SelectContext(ctx, &out, q, batchID)
	return out, err
}

type ReportMeta struct {
	ID        uuid.UUID `db:"id" json:"id"`
	BatchID   uuid.UUID `db:"batch_id" json:"batch_id"`
	AddressID uuid.UUID `db:"address_id" json:"address_id"`
	FilePath  *string   `db:"file_path" json:"file_path,omitempty"`
	CreatedAt time.Time `db:"created_at" json:"created_at"`
}

func (r *Repo) ListReportMeta(ctx context.Context) ([]ReportMeta, error) {
	var out []ReportMeta
	err := r.db.SelectContext(ctx, &out, `
        SELECT id, batch_id, address_id, file_path, created_at
          FROM reports
         ORDER BY created_at DESC`)
	return out, err
}

func (r *Repo) GetRawAddressByID(ctx context.Context, id uuid.UUID) (*string, error) {
	var raw *string
	err := r.db.GetContext(ctx, &raw, `
		SELECT raw_address FROM addresses WHERE id = $1
	`, id)
	return raw, err
}

func (r *Repo) GetReportByID(ctx context.Context, id uuid.UUID) (*Report, error) {
	var rpt Report
	err := r.db.GetContext(ctx, &rpt, `SELECT * FROM reports WHERE id = $1`, id)
	if err != nil {
		return nil, err
	}
	return &rpt, nil
}
