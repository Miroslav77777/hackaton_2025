package service

import (
	"context"
	"log"
	"time"

	"brigade-service/internal/db"

	"github.com/google/uuid"
)

type Scheduler struct {
	repo *db.Repo
}

func NewScheduler(r *db.Repo) *Scheduler { return &Scheduler{repo: r} }
func (s *Scheduler) Run(ctx context.Context) {
	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			// 1) Собираем не-batched адреса
			addrs, err := s.repo.ListPendingAddresses(ctx, 5)
			if err != nil {
				log.Printf("[sched] list pending error: %v", err)
				continue
			}
			if len(addrs) == 0 {
				continue
			}

			// 2) Проверяем условие «5 штук или старше 2 мин»
			oldest := time.Since(addrs[0].CreatedAt) > 2*time.Minute
			if len(addrs) < 5 && !oldest {
				continue
			}

			// 3) Ищем первую свободную бригаду
			br, err := s.repo.FindIdleBrigade(ctx)
			if err != nil {
				// нет свободных — пропускаем, не создаём batch
				log.Printf("[sched] no idle brigade, skipping (have %d addrs)", len(addrs))
				continue
			}

			// 4) Есть бригада — забираем до 5 адресов
			take := addrs
			if len(addrs) > 5 {
				take = addrs[:5]
			}

			// 5) Собираем их ID
			ids := make([]uuid.UUID, len(take))
			for i, a := range take {
				ids[i] = a.ID
			}

			// 6) Создаём batch и назначаем бригаде
			batch, err := s.repo.CreateBatch(ctx, ids)
			if err != nil {
				log.Printf("[sched] create batch error: %v", err)
				continue
			}
			if err := s.repo.AssignBatch(ctx, batch.ID, br.ID); err != nil {
				log.Printf("[sched] assign batch error: %v", err)
				continue
			}

			// 7) Помечаем адреса, чтобы они не попали в новый batch
			log.Printf("[sched] marking %d addresses batched", len(ids))
			if err := s.repo.MarkAddressesBatched(ctx, ids); err != nil {
				log.Printf("[sched] mark batched error: %v", err)
			} else {
				log.Printf("[sched] batch %s created and assigned to %s", batch.ID, br.ID)
			}
		}
	}
}
