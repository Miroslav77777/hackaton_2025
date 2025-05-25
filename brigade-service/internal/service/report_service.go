package service

import (
	"bytes"
	"context"
	"text/template"
	"time"

	"github.com/google/uuid"
	"github.com/signintech/gopdf"
)

type ReportData struct {
	ActNumber        string `json:"actNumber"`
	Date             string `json:"date"`
	Time             string `json:"time"`
	InspectorName    string `json:"inspectorName"`
	Description      string `json:"description"`
	Status           string `json:"status"`
	SealStatus       string `json:"sealStatus"`
	ConnectionStatus string `json:"connectionStatus"`
	CommissionAccess string `json:"commissionAccess"`
	Violation        string `json:"violation"`
	Recalculation    string `json:"recalculation"`
	TariffChange     string `json:"tariffChange"`
	Notes            string `json:"notes"`
}

type Person struct {
	Name      string
	Position  string
	Signature string
}

type Equipment struct {
	Name          string
	Serial        string
	AccuracyClass string
	LastCheck     string
	Reading       string
}

type Param struct {
	Name  string
	Value string
}

type ReportService struct {
	tpl *template.Template
}

func NewReportService(pattern string) (*ReportService, error) {
	tpl, err := template.ParseFiles(pattern)
	if err != nil {
		return nil, err
	}
	return &ReportService{tpl: tpl}, nil
}

func (s *ReportService) Generate(ctx context.Context, brigadeID, batchID, addressID uuid.UUID, data map[string]interface{}) (string, error) {
	ctxData := s.withDefaults(data)
	ctxData["BrigadeID"] = brigadeID
	ctxData["BatchID"] = batchID
	ctxData["AddressID"] = addressID

	var buf bytes.Buffer
	if err := s.tpl.Execute(&buf, ctxData); err != nil {
		return "", err
	}
	return buf.String(), nil
}

func (s *ReportService) GeneratePDF(ctx context.Context, brigadeID, batchID, addressID uuid.UUID, data map[string]interface{}, outputPath string) error {
	ctxData := s.withDefaults(data)
	ctxData["BrigadeID"] = brigadeID.String()
	ctxData["BatchID"] = batchID.String()
	ctxData["AddressID"] = addressID.String()

	var buf bytes.Buffer
	if err := s.tpl.Execute(&buf, ctxData); err != nil {
		return err
	}

	pdf := gopdf.GoPdf{}
	pdf.Start(gopdf.Config{PageSize: *gopdf.PageSizeA4})
	pdf.AddPage()
	if err := pdf.AddTTFFont("dejavu", "reports/tmpl/DejaVuSans.ttf"); err != nil {
		return err
	}
	if err := pdf.SetFont("dejavu", "", 16); err != nil {
		return err
	}
	pdf.SetX(40)
	pdf.SetY(40)

	lines := bytes.Split(buf.Bytes(), []byte("\n"))
	for i, line := range lines {
		str := string(line)

		if i == 0 || (len(str) >= 3 && str[:3] == "АКТ") ||
			(len(str) >= 8 && str[:8] == "Дата сос") ||
			(len(str) >= 12 && str[:12] == "Адрес провер") {
			pdf.SetFont("dejavu", "", 16)
		} else if len(str) > 0 && (str[0] == '-' || str[0] == '|') {
			pdf.SetFont("dejavu", "", 14)
		} else {
			pdf.SetFont("dejavu", "", 13)
		}

		pdf.Cell(nil, str)
		pdf.Br(18)

		if str == "" ||
			(len(str) >= 3 && str[:3] == "АКТ") ||
			(len(str) >= 8 && str[:8] == "Дата сос") ||
			(len(str) >= 12 && str[:12] == "Адрес провер") {
			pdf.Br(6)
		}
	}

	return pdf.WritePdf(outputPath)
}

func (s *ReportService) withDefaults(data map[string]interface{}) map[string]interface{} {
	get := func(key, def string) string {
		if val, ok := data[key].(string); ok && val != "" {
			return val
		}
		return def
	}

	now := time.Now()
	if val, ok := data["date"].(string); ok && val != "" {
		t, err := time.Parse("02.01.2006", val)
		if err == nil {
			now = t
		}
	}
	return map[string]interface{}{
		"ActNumber":           get("actNumber", "А-2025/041"),
		"Day":                 now.Format("02"),
		"Month":               now.Format("January"), // или "01" для цифры
		"Year":                now.Format("2006"),
		"Hour":                now.Format("15"),
		"Minute":              now.Format("04"),
		"time":                get("time", time.Now().Format("15:04")),
		"InspectorName":       get("inspectorName", "Астафьев Михаил Федорович"),
		"InspectorPosition":   get("inspectorPosition", "Ведущий инженер-инспектор"),
		"ElectricianName":     get("electricianName", "Иванов Александр Петрович"),
		"ElectricianPosition": get("electricianPosition", "Электромонтер 4 разряда"),
		"GridRepName":         get("gridRepName", "Сидоров Алексей Николаевич"),
		"GridRepPosition":     get("gridRepPosition", "Представитель сетевой организации"),
		"CompanyName":         get("companyName", "АО \"КубаньЭнерго\""),
		"Address":             get("address", "г. Краснодар, ул. Энергетиков, д. 15, кв. 4"),
		"Account":             get("account", "40817810099910000001"),
		"CustomerName":        get("customerName", "Петрова Наталья Сергеевна"),
		"CustomerContact":     get("customerContact", "+7 (918) 123-45-67 / petrovans@mail.ru"),
		"CustomerID":          get("customerID", "Паспорт 03 04 123456, выдан ОВД ЦМР г. Краснодара"),
		"MeterSN":             get("meterSN", "ЭЭ1234567"),
		"MeterClass":          get("meterClass", "1.0"),
		"MeterLastCheck":      get("meterLastCheck", "01.06.2021"),
		"MeterReading":        get("meterReading", "48523"),
		"TA_SN":               get("ta_sn", "ТА-54321"),
		"TA_Class":            get("ta_class", "0.5S"),
		"TA_LastCheck":        get("ta_last_check", "12.09.2020"),
		"TA_Reading":          get("ta_reading", "Показания отсутствуют"),
		"sealStatus":          get("sealStatus", "Целы, без повреждений"),
		"connectionStatus":    get("connectionStatus", "Не выявлено"),
		"commissionAccess":    get("commissionAccess", "Потребитель отказал в допуске"),
		"violation":           get("violation", "Обнаружено вмешательство в работу счётчика"),
		"recalculation":       get("recalculation", "Требуется перерасчет по среднему за 6 мес."),
		"tariffChange":        get("tariffChange", "Предложен переход на двухтарифный учёт"),
		"notes":               get("notes", "Потребитель отказался подписывать акт."),
	}
}
