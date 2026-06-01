package main

import (
	"log"
	"os"

	"invoice-backend/config"
	"invoice-backend/internal/dto"
	"invoice-backend/internal/handlers"
	"invoice-backend/internal/middleware"
	"invoice-backend/internal/models"
	"invoice-backend/internal/repository"
	"invoice-backend/internal/services"

	"github.com/go-playground/validator/v10"
	echo "github.com/labstack/echo/v4"
	echoMiddleware "github.com/labstack/echo/v4/middleware"
)

func main() {
	cfg := config.LoadConfig()

	db, err := config.InitDB(cfg)
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	if err := db.AutoMigrate(
		&models.User{},
		&models.Client{},
		&models.Invoice{},
		&models.InvoiceItem{},
	); err != nil {
		log.Fatalf("Failed to auto migrate: %v", err)
	}

	uploadDir := cfg.UploadDir
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		log.Fatalf("Failed to create upload directory: %v", err)
	}

	e := echo.New()

	e.Use(middleware.CORSMiddleware())
	e.Use(echoMiddleware.Logger())
	e.Use(echoMiddleware.Recover())

	v := validator.New()

	userRepo := repository.NewUserRepository(db)
	clientRepo := repository.NewClientRepository(db)
	invoiceRepo := repository.NewInvoiceRepository(db)

	authService := services.NewAuthService(cfg.JWTSecret)
	invoiceService := services.NewInvoiceService()
	pdfService := services.NewPDFService(cfg.GotenbergURL, "./templates/invoice.html")

	authHandler := handlers.NewAuthHandler(userRepo, authService, v)
	clientHandler := handlers.NewClientHandler(clientRepo, v)
	invoiceHandler := handlers.NewInvoiceHandler(invoiceRepo, clientRepo, invoiceService, pdfService, v)

	api := e.Group("/api/v1")

	api.POST("/auth/register", authHandler.Register)
	api.POST("/auth/login", authHandler.Login)
	api.POST("/auth/logout", authHandler.Logout)

	protected := api.Group("")
	protected.Use(middleware.JWTMiddleware(cfg.JWTSecret))
	{
		protected.GET("/auth/me", authHandler.GetMe)
		protected.PUT("/auth/profile", authHandler.UpdateProfile)

		protected.GET("/clients", clientHandler.List)
		protected.GET("/clients/:id", clientHandler.Get)
		protected.POST("/clients", clientHandler.Create)
		protected.PUT("/clients/:id", clientHandler.Update)
		protected.DELETE("/clients/:id", clientHandler.Delete)

		protected.GET("/invoices", invoiceHandler.List)
		protected.GET("/invoices/:id", invoiceHandler.Get)
		protected.POST("/invoices", invoiceHandler.Create)
		protected.PUT("/invoices/:id", invoiceHandler.Update)
		protected.DELETE("/invoices/:id", invoiceHandler.Delete)
		protected.GET("/invoices/:id/pdf", invoiceHandler.DownloadPDF)

		protected.GET("/dashboard/stats", invoiceHandler.GetStats)
	}

	e.GET("/health", func(c echo.Context) error {
		return c.JSON(200, map[string]string{"status": "ok"})
	})

	log.Printf("Server starting on port %s", cfg.Port)
	if err := e.Start(":" + cfg.Port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

var _ = dto.UserModel{}
