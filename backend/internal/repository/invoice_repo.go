package repository

import (
	"errors"
	"fmt"
	"strings"
	"time"

	"invoice-backend/internal/dto"
	"invoice-backend/internal/models"

	"gorm.io/gorm"
)

type InvoiceRepository struct {
	DB *gorm.DB
}

func NewInvoiceRepository(db *gorm.DB) *InvoiceRepository {
	return &InvoiceRepository{DB: db}
}

func (r *InvoiceRepository) Create(invoice *models.Invoice, items []models.InvoiceItem) error {
	return r.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(invoice).Error; err != nil {
			return err
		}

		for i := range items {
			items[i].InvoiceID = invoice.ID
		}
		return tx.Create(&items).Error
	})
}

func (r *InvoiceRepository) GetByID(id, userID uint) (*models.Invoice, error) {
	var invoice models.Invoice
	err := r.DB.
		Preload("Client").
		Preload("Items").
		Where("id = ? AND user_id = ?", id, userID).
		First(&invoice).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &invoice, nil
}

func (r *InvoiceRepository) List(userID uint, status string, page, limit int) ([]models.Invoice, int64, error) {
	var invoices []models.Invoice
	var total int64

	query := r.DB.Model(&models.Invoice{}).Where("user_id = ?", userID)

	if status != "" {
		query = query.Where("status = ?", status)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if limit > 0 {
		if page < 1 {
			page = 1
		}
		offset := (page - 1) * limit
		query = query.Offset(offset).Limit(limit)
	}

	err := query.
		Preload("Client").
		Preload("Items").
		Order("created_at DESC").
		Find(&invoices).Error

	return invoices, total, err
}

func (r *InvoiceRepository) Update(invoice *models.Invoice, items []models.InvoiceItem) error {
	return r.DB.Transaction(func(tx *gorm.DB) error {
		// Strip time portion from dates — MySQL DATE column needs YYYY-MM-DD
		issueDate := strings.TrimSuffix(strings.TrimSuffix(invoice.IssueDate, "T00:00:00Z"), "+00:00")
		dueDate := strings.TrimSuffix(strings.TrimSuffix(invoice.DueDate, "T00:00:00Z"), "+00:00")
		// Also handle time.Parse format if present
		if t, err := time.Parse(time.RFC3339, invoice.IssueDate); err == nil {
			issueDate = t.Format("2006-01-02")
		}
		if t, err := time.Parse(time.RFC3339, invoice.DueDate); err == nil {
			dueDate = t.Format("2006-01-02")
		}

		updates := map[string]interface{}{
			"client_id":      invoice.ClientID,
			"invoice_number": invoice.InvoiceNumber,
			"issue_date":     issueDate,
			"due_date":       dueDate,
			"status":         invoice.Status,
			"subtotal":       invoice.Subtotal,
			"tax_percent":    invoice.TaxPercent,
			"tax_amount":     invoice.TaxAmount,
			"total":          invoice.Total,
			"notes":          invoice.Notes,
		}

		if err := tx.Model(&models.Invoice{}).Where("id = ?", invoice.ID).Updates(updates).Error; err != nil {
			return err
		}

		if len(items) > 0 {
			if err := tx.Where("invoice_id = ?", invoice.ID).Delete(&models.InvoiceItem{}).Error; err != nil {
				return err
			}

			for i := range items {
				items[i].InvoiceID = invoice.ID
				items[i].ID = 0
			}
			return tx.Create(&items).Error
		}

		return nil
	})
}

func (r *InvoiceRepository) Delete(id, userID uint) error {
	result := r.DB.Where("id = ? AND user_id = ?", id, userID).Delete(&models.Invoice{})
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
}

func (r *InvoiceRepository) GetNextInvoiceNumber(userID uint) (string, error) {
	var count int64
	err := r.DB.Model(&models.Invoice{}).Where("user_id = ?", userID).Count(&count).Error
	if err != nil {
		return "", err
	}
	return fmt.Sprintf("INV-%03d", count+1), nil
}

func (r *InvoiceRepository) GetUserByID(id uint) (*models.User, error) {
	var user models.User
	err := r.DB.First(&user, id).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *InvoiceRepository) GetStats(userID uint) (*dto.DashboardStats, error) {
	stats := &dto.DashboardStats{}

	now := time.Now()
	startOfMonth := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())

	if err := r.DB.Model(&models.Invoice{}).
		Where("user_id = ?", userID).
		Count(&stats.TotalInvoices).Error; err != nil {
		return nil, err
	}

	if err := r.DB.Model(&models.Invoice{}).
		Where("user_id = ? AND status IN ?", userID, []string{"draft", "sent"}).
		Count(&stats.Outstanding).Error; err != nil {
		return nil, err
	}

	if err := r.DB.Model(&models.Invoice{}).
		Where("user_id = ? AND status = ?", userID, "paid").
		Count(&stats.Paid).Error; err != nil {
		return nil, err
	}

	if err := r.DB.Model(&models.Invoice{}).
		Where("user_id = ? AND created_at >= ? AND status = ?", userID, startOfMonth, "paid").
		Select("COALESCE(SUM(total), 0)").
		Scan(&stats.MonthTotal).Error; err != nil {
		return nil, err
	}

	return stats, nil
}

func (r *InvoiceRepository) CountAllInvoices() (int64, error) {
	var count int64
	err := r.DB.Model(&models.Invoice{}).Count(&count).Error
	return count, err
}

func (r *InvoiceRepository) CountAllUsers() (int64, error) {
	var count int64
	err := r.DB.Model(&models.User{}).Count(&count).Error
	return count, err
}
