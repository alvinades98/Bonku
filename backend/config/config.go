package config

import (
	"os"
)

type Config struct {
	Port          string
	DBHost        string
	DBPort        string
	DBUser        string
	DBPassword    string
	DBName        string
	JWTSecret     string
	GotenbergURL  string
	UploadDir     string
}

func LoadConfig() Config {
	return Config{
		Port:         getEnv("PORT", "8080"),
		DBHost:       getEnv("DB_HOST", "localhost"),
		DBPort:       getEnv("DB_PORT", "3306"),
		DBUser:       getEnv("DB_USER", "root"),
		DBPassword:   getEnv("DB_PASSWORD", "rootpassword"),
		DBName:       getEnv("DB_NAME", "invoice_app"),
		JWTSecret:    getEnv("JWT_SECRET", "dev-secret-change-in-production"),
		GotenbergURL: getEnv("GOTENBERG_URL", "http://localhost:3001"),
		UploadDir:    getEnv("UPLOAD_DIR", "./uploads"),
	}
}

func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}
