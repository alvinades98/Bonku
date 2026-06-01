package models

import (
	"time"

	"gorm.io/gorm"
)

type Invoice struct {
	ID            uint           `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID        uint           `gorm:"not null;index" json:"user_id"`
	ClientID      uint           `gorm:"not null" json:"client_id"`
	InvoiceNumber string         `gorm:"type:varchar(100);not null" json:"invoice_number"`
	IssueDate     string         `gorm:"type:date;not null" json:"issue_date"`
	DueDate       string         `gorm:"type:date;not null" json:"due_date"`
	Status        string         `gorm:"type:enum('draft','sent','paid','cancelled');default:'draft'" json:"status"`
	Subtotal      float64        `gorm:"type:decimal(15,2);not null;default:0" json:"subtotal"`
	TaxPercent    float64        `gorm:"type:decimal(5,2);default:0" json:"tax_percent"`
	TaxAmount     float64        `gorm:"type:decimal(15,2);default:0" json:"tax_amount"`
	Total         float64        `gorm:"type:decimal(15,2);not null;default:0" json:"total"`
	Notes         string         `gorm:"type:text" json:"notes"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`

	Client Client          `gorm:"foreignKey:ClientID;references:ID;constraint:OnDelete:RESTRICT" json:"client,omitempty"`
	Items  []InvoiceItem   `gorm:"foreignKey:InvoiceID;constraint:OnDelete:CASCADE" json:"items,omitempty"`
	User   User            `gorm:"foreignKey:UserID;references:ID;constraint:OnDelete:CASCADE" json:"-"`
}

func (Invoice) TableName() string {
	return "invoices"
}
