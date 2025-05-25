package service

import (
	"context"
	"database/sql"
)

type TaskService struct {
	db *sql.DB
}

func NewTaskService(db *sql.DB) *TaskService { return &TaskService{db: db} }

// MarkDone помечает задачу выполненной.
func (s *TaskService) MarkDone(ctx context.Context, taskID string) error {
	_, err := s.db.ExecContext(ctx,
		`UPDATE tasks SET state='done' WHERE id=$1`, taskID)
	return err
}

// DB даёт доступ к *sql.DB для хэндлеров.
func (s *TaskService) DB() *sql.DB { return s.db }
