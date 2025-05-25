package handler

import (
	"net/http"
	"os"
	"path/filepath"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"brigade-service/internal/db"
	"brigade-service/internal/service"
	"brigade-service/internal/ws"
)

type ReportHandler struct {
	repo *db.Repo
	svc  *service.ReportService
	hub  *ws.Hub
}

func NewReportHandler(repo *db.Repo, svc *service.ReportService, hub *ws.Hub) *ReportHandler {
	return &ReportHandler{repo: repo, svc: svc, hub: hub}
}

// POST /api/v1/batches/:batchId/addresses/:addressId/report
func (h *ReportHandler) CreateReport(c *gin.Context) {
	bID, _ := uuid.Parse(c.Param("batchId"))
	aID, _ := uuid.Parse(c.Param("addressId"))

	var body map[string]interface{} // или ваша struct ReportData
	if err := c.BindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 1) Генерим текст отчёта
	content, err := h.svc.Generate(c.Request.Context(), uuid.Nil, bID, aID, body)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// 1.1) Генерим pdf-файл
	pdfPath := "reports/generated/report_" + aID.String() + ".pdf"
	err = h.svc.GeneratePDF(c.Request.Context(), uuid.Nil, bID, aID, body, pdfPath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "pdf: " + err.Error()})
		return
	}

	// 2) Сохраняем в БД
	rpt := db.Report{
		BatchID:   bID,
		AddressID: aID,
		Content:   content,
		FilePath:  &pdfPath,
	}
	if err := h.repo.SaveReport(c, rpt); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// 3) Отмечаем посещение и, если нужно, закрываем batch
	h.repo.MarkAddressVisited(c, bID, aID)
	h.repo.CloseBatchIfDone(c, bID)

	// 4) Шлём уведомление по WebSocket
	h.hub.Broadcast("all_reports", gin.H{
		"type":       "new_report",
		"batch_id":   bID,
		"address_id": aID,
		"content":    content,
	})

	c.JSON(http.StatusCreated, gin.H{"content": content})
}

func (h *ReportHandler) ListAllReports(c *gin.Context) {
	metas, err := h.repo.ListReportMeta(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, metas)
}

func (h *ReportHandler) GetRawAddress(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid UUID"})
		return
	}

	raw, err := h.repo.GetRawAddressByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"raw_address": raw})
}

func (h *ReportHandler) DownloadReport(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid UUID"})
		return
	}

	// Получаем путь к файлу из БД
	report, err := h.repo.GetReportByID(c.Request.Context(), id)
	if err != nil || report.FilePath == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "report not found"})
		return
	}

	// Открываем файл
	filePath := *report.FilePath
	f, err := os.Open(filePath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot open file"})
		return
	}
	defer f.Close()

	// Отдаём как attachment
	c.Header("Content-Type", "application/pdf")
	c.Header("Content-Disposition", "attachment; filename=\""+filepath.Base(filePath)+"\"")
	c.File(filePath)
}

func registerReportRoutes(rg *gin.RouterGroup, repo *db.Repo, svc *service.ReportService, hub *ws.Hub) {
	h := NewReportHandler(repo, svc, hub)

	rg.POST("/batches/:batchId/addresses/:addressId/report", h.CreateReport)

	// 👇 Добавляем только эту строку
	rg.GET("/reports", h.ListAllReports)
	rg.GET("/addresses/:id/raw", h.GetRawAddress)
	rg.GET("/reports/:id/download", h.DownloadReport)
}
