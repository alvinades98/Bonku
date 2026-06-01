package models

import "time"

type InvoiceItem struct {
	ID          uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	InvoiceID   uint      `gorm:"not null;index" json:"invoice_id"`
	Description string    `gorm:"type:text;not null" json:"description"`
	Quantity    float64   `gorm:"type:decimal(10,2);not null;default:1" json:"quantity"`
	UnitPrice   float64   `gorm:"type:decimal(15,2);not null;default:0" json:"unit_price"`
	Amount      float64   `gorm:"type:decimal(15,2);not null;default:0" json:"amount"`
	CreatedAt   time.Time `json:"created_at"`

	Invoice Invoice `gorm:"foreignKey:InvoiceID;references:ID;constraint:OnDelete:CASCADE" json:"-"`
}

func (InvoiceItem) TableName() string {
	return "invoice_items"
}
