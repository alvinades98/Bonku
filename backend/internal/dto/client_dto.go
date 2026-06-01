package dto

import (
	"invoice-backend/internal/models"
	"time"
)

type CreateClientRequest struct {
	Name    string `json:"name" validate:"required,min=1,max=255"`
	Email   string `json:"email" validate:"omitempty,email,max=255"`
	Phone   string `json:"phone" validate:"omitempty,max=20"`
	Address string `json:"address" validate:"omitempty,max=1000"`
}

type UpdateClientRequest struct {
	Name    string `json:"name" validate:"omitempty,min=1,max=255"`
	Email   string `json:"email" validate:"omitempty,email,max=255"`
	Phone   string `json:"phone" validate:"omitempty,max=20"`
	Address string `json:"address" validate:"omitempty,max=1000"`
}

type ClientResponse struct {
	ID        uint      `json:"id"`
	UserID    uint      `json:"user_id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	Phone     string    `json:"phone"`
	Address   string    `json:"address"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func ToClientResponse(c models.Client) ClientResponse {
	return ClientResponse{
		ID:        c.ID,
		UserID:    c.UserID,
		Name:      c.Name,
		Email:     c.Email,
		Phone:     c.Phone,
		Address:   c.Address,
		CreatedAt: c.CreatedAt,
		UpdatedAt: c.UpdatedAt,
	}
}
