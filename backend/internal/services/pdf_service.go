package services

import (
	"bytes"
	"fmt"
	"html/template"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"
)

type PDFService struct {
	GotenbergURL string
	TemplatePath string
}

func NewPDFService(gotenbergURL, templatePath string) *PDFService {
	return &PDFService{
		GotenbergURL: gotenbergURL,
		TemplatePath: templatePath,
	}
}

type InvoicePDFData struct {
	InvoiceNumber     string
	IssueDate         string
	DueDate           string
	Status            string
	CompanyName       string
	CompanyAddress    string
	CompanyPhone      string
	NPWP              string
	CompanyLogoBase64 template.URL
	ClientName        string
	ClientEmail       string
	ClientPhone       string
	ClientAddress     string
	Items             []PDFItem
	Subtotal          string
	TaxPercent        string
	TaxAmount         string
	Total             string
	Notes             string
}

type PDFItem struct {
	Description string
	Quantity    string
	UnitPrice   string
	Amount      string
}

func (s *PDFService) GeneratePDF(data InvoicePDFData) ([]byte, error) {
	tmplContent, err := os.ReadFile(s.TemplatePath)
	if err != nil {
		return nil, fmt.Errorf("failed to read template: %w", err)
	}

	tmpl, err := template.New("invoice").Parse(string(tmplContent))
	if err != nil {
		return nil, fmt.Errorf("failed to parse template: %w", err)
	}

	var htmlBuf bytes.Buffer
	if err := tmpl.Execute(&htmlBuf, data); err != nil {
		return nil, fmt.Errorf("failed to execute template: %w", err)
	}

	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)

	part, err := writer.CreateFormFile("files", "index.html")
	if err != nil {
		return nil, fmt.Errorf("failed to create form file: %w", err)
	}

	if _, err := io.Copy(part, &htmlBuf); err != nil {
		return nil, fmt.Errorf("failed to write HTML to form: %w", err)
	}

	writer.Close()

	url := s.GotenbergURL + "/forms/chromium/convert/html"
	req, err := http.NewRequest("POST", url, body)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", writer.FormDataContentType())

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to send request to Gotenberg: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		respBody, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("Gotenberg error (status %d): %s", resp.StatusCode, string(respBody))
	}

	pdfBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read PDF response: %w", err)
	}

	return pdfBytes, nil
}

func FormatRupiah(amount float64) string {
	if amount == 0 {
		return "Rp 0"
	}

	negative := amount < 0
	if negative {
		amount = -amount
	}

	var intPart int64
	var fracPart float64
	if amount >= 0 {
		intPart = int64(amount)
		fracPart = amount - float64(intPart)
	}

	str := fmt.Sprintf("%d", intPart)
	runes := []rune(str)
	var result []rune

	for i, r := range runes {
		if i > 0 && (len(runes)-i)%3 == 0 {
			result = append(result, '.')
		}
		result = append(result, r)
	}

	output := "Rp " + string(result)
	if fracPart > 0 {
		output += fmt.Sprintf(",%.0f", fracPart*100)
	}
	if negative {
		output = "-" + output
	}

	return output
}

func FormatFilename(invoiceNumber string) string {
	safe := invoiceNumber
	safe = filepath.Clean(safe)
	safe = safe + ".pdf"
	return safe
}

// FormatDate converts date strings (ISO 8601 or YYYY-MM-DD) to "01 Januari 2006" format (Indonesian)
func FormatDate(dateStr string) string {
	// Strip time portion if present
	clean := strings.TrimSuffix(dateStr, "T00:00:00Z")
	clean = strings.TrimSuffix(clean, "+00:00")

	// Try parsing as full RFC3339
	if t, err := time.Parse(time.RFC3339, dateStr); err == nil {
		return formatIndonesianDate(t)
	}

	// Try parsing as YYYY-MM-DD
	if t, err := time.Parse("2006-01-02", clean); err == nil {
		return formatIndonesianDate(t)
	}

	// Fallback: return cleaned string
	return clean
}

var monthNames = map[time.Month]string{
	time.January: "Januari", time.February: "Februari", time.March: "Maret",
	time.April: "April", time.May: "Mei", time.June: "Juni",
	time.July: "Juli", time.August: "Agustus", time.September: "September",
	time.October: "Oktober", time.November: "November", time.December: "Desember",
}

func formatIndonesianDate(t time.Time) string {
	return fmt.Sprintf("%02d %s %d", t.Day(), monthNames[t.Month()], t.Year())
}
