package repository

import (
	"database/sql"
)

type AddressRepo struct {
	DB *sql.DB
}

type DBAddress struct {
	ID      string
	OSMID   string
	Risk    int
	Exceed  string
	Pattern string // новое поле
}

func (r *AddressRepo) GetAddresses() ([]DBAddress, error) {
	rows, err := r.DB.Query(`
        SELECT id, osm_id, risk, exceed, pattern FROM address_risks
    `)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var res []DBAddress
	for rows.Next() {
		var a DBAddress
		if err := rows.Scan(
			&a.ID,
			&a.OSMID,
			&a.Risk,
			&a.Exceed,
			&a.Pattern, // сканим сюда
		); err != nil {
			return nil, err
		}
		res = append(res, a)
	}
	return res, nil
}
