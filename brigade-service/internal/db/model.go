package db

import (
	"time"

	"github.com/google/uuid"
)

type Brigade struct {
	ID       uuid.UUID `db:"id" json:"id"`
	Name     string    `db:"name" json:"name"`
	Status   string    `db:"status" json:"status"`
	LastSeen time.Time `db:"last_seen" json:"last_seen"`
}

type Address struct {
	ID        uuid.UUID `db:"id"         json:"id"`
	OsmID     *int64    `db:"osm_id"     json:"osm_id,omitempty"`
	Raw       *string   `db:"raw_address" json:"raw_address,omitempty"`
	Lat       *float64  `db:"lat"        json:"lat,omitempty"`
	Lon       *float64  `db:"lon"        json:"lon,omitempty"`
	CreatedAt time.Time `db:"created_at" json:"created_at"`
	Batched   bool      `db:"batched"    json:"batched"`
}

type Batch struct {
	ID         uuid.UUID  `db:"id" json:"id"`
	CreatedAt  time.Time  `db:"created_at" json:"created_at"`
	AssignedAt *time.Time `db:"assigned_at" json:"assigned_at,omitempty"`
	BrigadeID  *uuid.UUID `db:"brigade_id" json:"brigade_id,omitempty"`
	Status     string     `db:"status" json:"status"`
}

type BatchAddress struct {
	BatchID   uuid.UUID  `db:"batch_id" json:"batch_id"`
	AddressID uuid.UUID  `db:"address_id" json:"address_id"`
	State     string     `db:"state" json:"state"`
	VisitedAt *time.Time `db:"visited_at" json:"visited_at,omitempty"`
}

type Report struct {
	ID        uuid.UUID `db:"id" json:"id"`
	BatchID   uuid.UUID `db:"batch_id" json:"batch_id"`
	AddressID uuid.UUID `db:"address_id" json:"address_id"`
	Content   string    `db:"content" json:"content"`
	FilePath  *string   `db:"file_path" json:"file_path,omitempty"` // ← новое поле
	CreatedAt time.Time `db:"created_at" json:"created_at"`
}
