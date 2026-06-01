package services

import "invoice-backend/internal/models"

type InvoiceService struct{}

func NewInvoiceService() *InvoiceService {
	return &InvoiceService{}
}

func (s *InvoiceService) CalculateTotals(items []models.InvoiceItem, taxPercent float64) (subtotal, taxAmount, total float64) {
	subtotal = 0
	for _, item := range items {
		subtotal += item.Amount
	}

	taxAmount = subtotal * taxPercent / 100
	total = subtotal + taxAmount

	return subtotal, taxAmount, total
}

func (s *InvoiceService) CalculateItemAmount(quantity, unitPrice float64) float64 {
	return quantity * unitPrice
}
