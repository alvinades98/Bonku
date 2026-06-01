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
	InvoiceNumber  string
	IssueDate      string
	DueDate        string
	Status         string
	CompanyName    string
	CompanyAddress string
	CompanyPhone   string
	NPWP           string
	ClientName     string
	ClientEmail    string
	ClientPhone    string
	ClientAddress  string
	Items          []PDFItem
	Subtotal       string
	TaxPercent     string
	TaxAmount      string
	Total          string
	Notes          string
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

	result := "Rp "
	var intPart int64
	if amount >= 0 {
		intPart = int64(amount)
	} else {
		intPart = int64(amount)
		result = "-Rp "
	}

	str := fmt.Sprintf("%d", intPart)
	if str[0] == '-' {
		str = str[1:]
	}

	runes := []rune(str)
	for i := len(runes) - 1; i >= 0; i-- {
		if (len(runes)-1-i)%3 == 0 && i != len(runes)-1 {
			result += "."
		}
		result += string(runes[i])
	}

	return result
}

func FormatFilename(invoiceNumber string) string {
	safe := invoiceNumber
	safe = filepath.Clean(safe)
	safe = safe + ".pdf"
	return safe
}
