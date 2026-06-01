package dto

import (
	"invoice-backend/internal/models"
	"time"
)

type InvoiceItemRequest struct {
	Description string  `json:"description" validate:"required,min=1"`
	Quantity    float64 `json:"quantity" validate:"required,gt=0"`
	UnitPrice   float64 `json:"unit_price" validate:"required,gte=0"`
	Amount      float64 `json:"amount" validate:"gte=0"`
}

type CreateInvoiceRequest struct {
	ClientID      uint                 `json:"client_id" validate:"required"`
	InvoiceNumber string               `json:"invoice_number" validate:"required,min=1,max=100"`
	IssueDate     string               `json:"issue_date" validate:"required"`
	DueDate       string               `json:"due_date" validate:"required"`
	Status        string               `json:"status" validate:"omitempty,oneof=draft sent paid cancelled"`
	Items         []InvoiceItemRequest `json:"items" validate:"required,min=1,dive"`
	Notes         string               `json:"notes" validate:"omitempty,max=2000"`
	TaxPercent    float64              `json:"tax_percent" validate:"gte=0,lte=100"`
}

type UpdateInvoiceRequest struct {
	ClientID      *uint                `json:"client_id"`
	InvoiceNumber *string              `json:"invoice_number" validate:"omitempty,min=1,max=100"`
	IssueDate     *string              `json:"issue_date"`
	DueDate       *string              `json:"due_date"`
	Status        *string              `json:"status" validate:"omitempty,oneof=draft sent paid cancelled"`
	Items         *[]InvoiceItemRequest `json:"items"`
	Notes         *string              `json:"notes" validate:"omitempty,max=2000"`
	TaxPercent    *float64             `json:"tax_percent" validate:"omitempty,gte=0,lte=100"`
}

type InvoiceItemResponse struct {
	ID          uint    `json:"id"`
	InvoiceID   uint    `json:"invoice_id"`
	Description string  `json:"description"`
	Quantity    float64 `json:"quantity"`
	UnitPrice   float64 `json:"unit_price"`
	Amount      float64 `json:"amount"`
}

type InvoiceResponse struct {
	ID            uint                 `json:"id"`
	UserID        uint                 `json:"user_id"`
	ClientID      uint                 `json:"client_id"`
	InvoiceNumber string               `json:"invoice_number"`
	IssueDate     string               `json:"issue_date"`
	DueDate       string               `json:"due_date"`
	Status        string               `json:"status"`
	Subtotal      float64              `json:"subtotal"`
	TaxPercent    float64              `json:"tax_percent"`
	TaxAmount     float64              `json:"tax_amount"`
	Total         float64              `json:"total"`
	Notes         string               `json:"notes"`
	Client        *ClientResponse      `json:"client,omitempty"`
	Items         []InvoiceItemResponse `json:"items"`
	CreatedAt     time.Time            `json:"created_at"`
	UpdatedAt     time.Time            `json:"updated_at"`
}

type DashboardStats struct {
	TotalInvoices int64   `json:"total_invoices"`
	Outstanding   int64   `json:"outstanding"`
	Paid          int64   `json:"paid"`
	MonthTotal    float64 `json:"month_total"`
}

func ToInvoiceItemResponse(item models.InvoiceItem) InvoiceItemResponse {
	return InvoiceItemResponse{
		ID:          item.ID,
		InvoiceID:   item.InvoiceID,
		Description: item.Description,
		Quantity:    item.Quantity,
		UnitPrice:   item.UnitPrice,
		Amount:      item.Amount,
	}
}

func ToInvoiceResponse(inv models.Invoice) InvoiceResponse {
	resp := InvoiceResponse{
		ID:            inv.ID,
		UserID:        inv.UserID,
		ClientID:      inv.ClientID,
		InvoiceNumber: inv.InvoiceNumber,
		IssueDate:     inv.IssueDate,
		DueDate:       inv.DueDate,
		Status:        inv.Status,
		Subtotal:      inv.Subtotal,
		TaxPercent:    inv.TaxPercent,
		TaxAmount:     inv.TaxAmount,
		Total:         inv.Total,
		Notes:         inv.Notes,
		Items:         make([]InvoiceItemResponse, len(inv.Items)),
		CreatedAt:     inv.CreatedAt,
		UpdatedAt:     inv.UpdatedAt,
	}

	for i, item := range inv.Items {
		resp.Items[i] = ToInvoiceItemResponse(item)
	}

	if inv.Client.ID != 0 {
		clientResp := ToClientResponse(inv.Client)
		resp.Client = &clientResp
	}

	return resp
}
