package report

import (
	"bytes"
	"context"
	"database/sql"
	"fmt"
	"log/slog"
	"os"
	"path/filepath"

	"brigade-service/internal/ws"

	"github.com/google/uuid"
	"github.com/jung-kurt/gofpdf"
)

// StartWorker запускает вечную горутину, слушающую канал Jobs.
func StartWorker(db *sql.DB) {
	go func() {
		for j := range Jobs {
			id, path, err := buildAndSave(db, j)
			if err != nil {
				slog.Error("report", "brigade", j.BrigadeID, "err", err)
				continue
			}
			// уведомляем всех WS-клиентов
			ws.Broadcast <- ws.Event{
				BrigadeID: j.BrigadeID,
				ReportID:  id,
				FilePath:  path,
			}
		}
	}()
}

// buildAndSave рендерит PDF-отчёт и пишет запись в таблицу reports.
// Возвращает reportID и filePath.
func buildAndSave(db *sql.DB, j Job) (string, string, error) {
	ctx := context.Background()

	/* ----- 1. вычисляем очередной seq для этой бригады ----- */
	var seq int
	if err := db.QueryRowContext(ctx,
		`SELECT COALESCE(MAX(seq),0)+1 FROM reports WHERE brigade_id=$1`,
		j.BrigadeID,
	).Scan(&seq); err != nil {
		return "", "", err
	}

	/* ----- 2. собираем адреса и их статусы ----- */
	rows, err := db.QueryContext(ctx, `
		SELECT a.raw_address, ba.visit_order, ba.completed
		  FROM addresses a
		  JOIN brigade_addresses ba ON ba.address_id = a.id
		 WHERE ba.brigade_id = $1
	  ORDER BY ba.visit_order`, j.BrigadeID)
	if err != nil {
		return "", "", err
	}
	defer rows.Close()

	type item struct {
		Row  int
		Addr string
		Done bool
	}
	var list []item
	for rows.Next() {
		var it item
		if err = rows.Scan(&it.Addr, &it.Row, &it.Done); err != nil {
			return "", "", err
		}
		list = append(list, it)
	}

	/* ----- 3. рендерим PDF ----- */
	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.AddPage()
	pdf.SetFont("Arial", "B", 16)

	title := fmt.Sprintf("Brigade %s — report #%d", j.BrigadeID, seq)
	pdf.CellFormat(0, 10, title, "", 1, "C", false, 0, "")
	pdf.Ln(4)
	pdf.SetFont("Arial", "", 12)

	for _, it := range list {
		status := "❌"
		if it.Done {
			status = "✅"
		}
		pdf.CellFormat(10, 8, fmt.Sprint(it.Row), "", 0, "L", false, 0, "")
		pdf.CellFormat(120, 8, it.Addr, "", 0, "L", false, 0, "")
		pdf.CellFormat(10, 8, status, "", 1, "C", false, 0, "")
	}

	var buf bytes.Buffer
	if err := pdf.Output(&buf); err != nil {
		return "", "", err
	}

	/* ----- 4. сохраняем файл на диск (reports/<brigade>-<seq>.pdf) ----- */
	dir := "reports"
	_ = os.MkdirAll(dir, 0o755)

	fileName := fmt.Sprintf("%s-%02d.pdf", j.BrigadeID, seq)
	filePath := filepath.Join(dir, fileName)

	if err := os.WriteFile(filePath, buf.Bytes(), 0o644); err != nil {
		return "", "", err
	}

	/* ----- 5. вставляем запись в reports ----- */
	reportID := uuid.New().String()
	_, err = db.ExecContext(ctx, `
		INSERT INTO reports(id, brigade_id, seq, file_path)
		     VALUES ($1,$2,$3,$4)`,
		reportID, j.BrigadeID, seq, filePath)
	if err != nil {
		return "", "", err
	}

	return reportID, filePath, nil
}
