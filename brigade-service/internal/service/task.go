package service

import (
	"context"
	"database/sql"
)

type Task struct {
	ID        string
	BrigadeID sql.NullString
	State     string
}

type TaskService struct{ db *sql.DB }

func NewTaskService(db *sql.DB) *TaskService { return &TaskService{db: db} }

/* 1. оператор создаёт задачу (state=new) */
func (s *TaskService) Create(ctx context.Context, in AddressInput) (Task, error) {
	var t Task

	brig, _ := s.FreeBrigade(ctx) // "" если нет свободных

	err := s.db.QueryRowContext(ctx, `
		INSERT INTO tasks (brigade_id, raw_address, lat, lon, state)
		VALUES ($1,$2,$3,$4, CASE WHEN $1='' THEN 'unclaimed' ELSE 'assigned' END)
		RETURNING id, brigade_id, state`,
		brig, in.RawAddress, in.Lat, in.Lon).
		Scan(&t.ID, &t.BrigadeID, &t.State)

	return t, err
}

/* 2. ассайним задачу на бригаду */
func (s *TaskService) Claim(ctx context.Context, taskID, brigID string) error {
	_, err := s.db.ExecContext(ctx,
		`UPDATE tasks
		     SET brigade_id=$2, state='assigned'
		   WHERE id=$1 AND state='new'`,
		taskID, brigID)
	return err
}

/* 3. бригада меняет состояние */
func (s *TaskService) SetState(ctx context.Context, taskID, state string) error {
	_, err := s.db.ExecContext(ctx,
		`UPDATE tasks SET state=$2 WHERE id=$1`, taskID, state)
	return err
}

/* 4. выбрать свободную бригаду (ping < 2 мин, <3 активных задач) */
func (s *TaskService) FreeBrigade(ctx context.Context) (string, error) {
	var id string
	err := s.db.QueryRowContext(ctx, `
		SELECT id FROM brigades
		 WHERE now()-last_ping < interval '2 min'
		   AND (SELECT COUNT(*) FROM tasks
		         WHERE brigade_id=id
		           AND state IN ('assigned','accepted','new')) < 3
		 ORDER BY random() LIMIT 1`).Scan(&id)
	return id, err
}

func (s *TaskService) DB() *sql.DB { return s.db }
