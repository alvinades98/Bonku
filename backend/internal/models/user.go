package models

import "time"

type User struct {
	ID              uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	Email           string    `gorm:"type:varchar(255);uniqueIndex;not null" json:"email"`
	PasswordHash    string    `gorm:"type:varchar(255);not null" json:"-"`
	Name            string    `gorm:"type:varchar(255);not null" json:"name"`
	CompanyName     string    `gorm:"type:varchar(255)" json:"company_name"`
	CompanyAddress  string    `gorm:"type:text" json:"company_address"`
	CompanyPhone    string    `gorm:"type:varchar(20)" json:"company_phone"`
	NPWP            string    `gorm:"type:varchar(50)" json:"npwp"`
	CompanyLogoPath string    `gorm:"type:varchar(255)" json:"company_logo_path"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

func (User) TableName() string {
	return "users"
}
