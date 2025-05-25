package db

import (
	"context"

	"github.com/jmoiron/sqlx"
)

type OSMRepo struct{ db *sqlx.DB }

func NewOSMRepo(db *sqlx.DB) *OSMRepo { return &OSMRepo{db} }

func (r *OSMRepo) GetCoordsByOSM(ctx context.Context, osmID int64) (lat, lon float64, err error) {
	const q = `
      SELECT
        ST_Y(ST_Centroid(geom)) AS lat,
        ST_X(ST_Centroid(geom)) AS lon
      FROM osm_buildings
      WHERE osm_id = $1
      LIMIT 1
    `
	err = r.db.QueryRowContext(ctx, q, osmID).Scan(&lat, &lon)
	return
}

func (r *OSMRepo) GetDisplayName(ctx context.Context, osmID int64) (string, error) {
	var name string
	err := r.db.GetContext(ctx, &name,
		`SELECT display_name FROM osm_table WHERE id=$1`, osmID)
	return name, err
}
