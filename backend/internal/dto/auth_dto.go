package dto

import "invoice-backend/internal/models"

type UserModel struct {
	Email           string
	PasswordHash    string
	Name            string
	CompanyName     string
	CompanyAddress  string
	CompanyPhone    string
	NPWP            string
	CompanyLogoPath string
}

func (m *UserModel) ToUser() models.User {
	return models.User{
		Email:           m.Email,
		PasswordHash:    m.PasswordHash,
		Name:            m.Name,
		CompanyName:     m.CompanyName,
		CompanyAddress:  m.CompanyAddress,
		CompanyPhone:    m.CompanyPhone,
		NPWP:            m.NPWP,
		CompanyLogoPath: m.CompanyLogoPath,
	}
}

type RegisterRequest struct {
	Name     string `json:"name" validate:"required,min=2,max=255"`
	Email    string `json:"email" validate:"required,email,max=255"`
	Password string `json:"password" validate:"required,min=6,max=255"`
}

type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

type UpdateProfileRequest struct {
	Name            string `json:"name" validate:"required,min=2,max=255"`
	CompanyName     string `json:"company_name" validate:"omitempty,min=2,max=255"`
	CompanyAddress  string `json:"company_address" validate:"omitempty,max=500"`
	CompanyPhone    string `json:"company_phone" validate:"omitempty,max=20"`
	NPWP            string `json:"npwp" validate:"omitempty,max=50"`
	CompanyLogoPath string `json:"company_logo_path" validate:"omitempty,max=255"`
}

type UserResponse struct {
	ID              uint   `json:"id"`
	Email           string `json:"email"`
	Name            string `json:"name"`
	CompanyName     string `json:"company_name"`
	CompanyAddress  string `json:"company_address"`
	CompanyPhone    string `json:"company_phone"`
	NPWP            string `json:"npwp"`
	CompanyLogoPath string `json:"company_logo_path"`
}

type AuthResponse struct {
	Token string       `json:"token"`
	User  UserResponse `json:"user"`
}

type RegisterResponse struct {
	User UserResponse `json:"user"`
}

func ToUserResponse(u models.User) UserResponse {
	return UserResponse{
		ID:              u.ID,
		Email:           u.Email,
		Name:            u.Name,
		CompanyName:     u.CompanyName,
		CompanyAddress:  u.CompanyAddress,
		CompanyPhone:    u.CompanyPhone,
		NPWP:            u.NPWP,
		CompanyLogoPath: u.CompanyLogoPath,
	}
}
