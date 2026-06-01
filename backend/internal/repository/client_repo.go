package repository

import (
	"errors"

	"invoice-backend/internal/models"

	"gorm.io/gorm"
)

type ClientRepository struct {
	DB *gorm.DB
}

func NewClientRepository(db *gorm.DB) *ClientRepository {
	return &ClientRepository{DB: db}
}

func (r *ClientRepository) Create(client *models.Client) error {
	return r.DB.Create(client).Error
}

func (r *ClientRepository) GetByID(id, userID uint) (*models.Client, error) {
	var client models.Client
	err := r.DB.Where("id = ? AND user_id = ?", id, userID).First(&client).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &client, nil
}

func (r *ClientRepository) GetByUserID(userID uint) ([]models.Client, error) {
	var clients []models.Client
	err := r.DB.Where("user_id = ?", userID).Order("created_at DESC").Find(&clients).Error
	return clients, err
}

func (r *ClientRepository) Update(client *models.Client) error {
	return r.DB.Save(client).Error
}

func (r *ClientRepository) Delete(id, userID uint) error {
	result := r.DB.Where("id = ? AND user_id = ?", id, userID).Delete(&models.Client{})
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
}
