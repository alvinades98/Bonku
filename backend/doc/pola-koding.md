# Pola Koding & Konvensi — Backend

Dokumen berisi pola koding dan konvensi untuk pengembangan backend Invoice Generator.

---

## 1. Struktur Folder

```
backend/
├── cmd/api/              # Entry point — hanya main.go
├── config/               # Configuration & database setup
├── internal/             # Internal packages (tidak di-import dari luar)
│   ├── models/           # GORM model definitions
│   ├── dto/              # Request/Response data structures
│   ├── handlers/         # HTTP handlers (controllers)
│   ├── middleware/       # HTTP middleware
│   ├── services/         # Business logic layer
│   └── repository/       # Data access layer (DB queries)
├── templates/            # HTML templates (PDF generation)
├── uploads/              # User uploaded files
└── doc/                  # Documentation
```

### Aturan Layer

| Layer | Tugas | Tidak Boleh |
|-------|-------|-------------|
| **Handler** | Parse request, call service/repo, return response | Business logic, DB queries langsung |
| **Service** | Business logic, calculation, external API call | HTTP response, DB queries langsung |
| **Repository** | DB queries, CRUD operations | Business logic, HTTP response |

---

## 2. Naming Convention

### Package & File

- **Package**: lowercase, single word (`models`, `dto`, `handlers`)
- **File**: snake_case (`auth_handler.go`, `invoice_repo.go`)
- **Folder**: lowercase, snake_case (`cmd/api/`, `internal/models/`)

### Types & Functions

- **Struct**: PascalCase (`User`, `InvoiceResponse`, `CreateClientRequest`)
- **Interface**: PascalCase, sering diakhiri `-er` (`Validator`, `Repository`)
- **Function/Method**: PascalCase (exported) atau camelCase (unexported)
- **Variable**: camelCase (`userID`, `invoiceNumber`, `db`)
- **Constant**: UPPER_SNAKE_CASE (`JWT_COOKIE_NAME`, `MAX_UPLOAD_SIZE`)

### Database

- **Table**: plural, lowercase (`users`, `clients`, `invoice_items`)
- **Column**: snake_case (`user_id`, `created_at`, `invoice_number`)

---

## 3. Handler Pattern

### Struktur Handler

```go
type AuthHandler struct {
    UserRepo    *repository.UserRepository
    AuthService *services.AuthService
    Validator   *validator.Validate
}

func NewAuthHandler(userRepo *repository.UserRepository, authService *services.AuthService, v *validator.Validate) *AuthHandler {
    return &AuthHandler{
        UserRepo:    userRepo,
        AuthService: authService,
        Validator:   v,
    }
}
```

### Handler Method Pattern

```go
func (h *AuthHandler) Login(c echo.Context) error {
    // 1. Bind request
    var req dto.LoginRequest
    if err := c.Bind(&req); err != nil {
        return c.JSON(http.StatusBadRequest, dto.NewErrorResponse("Invalid request body", nil))
    }

    // 2. Validate
    if err := h.Validator.Struct(req); err != nil {
        errors := formatValidationErrors(err)
        return c.JSON(http.StatusUnprocessableEntity, dto.NewErrorResponse("Validation failed", errors))
    }

    // 3. Business logic (via service/repo)
    user, err := h.UserRepo.GetByEmail(req.Email)
    if err != nil {
        return c.JSON(http.StatusInternalServerError, dto.NewErrorResponse("Failed to authenticate", nil))
    }

    // 4. Return response
    return c.JSON(http.StatusOK, response)
}
```

### HTTP Status Codes

| Status | Kapan Digunakan |
|--------|-----------------|
| `200 OK` | GET/PUT berhasil |
| `201 Created` | POST berhasil |
| `204 No Content` | DELETE berhasil |
| `400 Bad Request` | Invalid JSON/body |
| `401 Unauthorized` | Missing/invalid JWT |
| `404 Not Found` | Resource tidak ditemukan |
| `422 Unprocessable` | Validation error |
| `500 Internal Server` | Server error |

---

## 4. DTO Pattern

### Request DTO

```go
type CreateClientRequest struct {
    Name    string `json:"name" validate:"required,min=1,max=255"`
    Email   string `json:"email" validate:"omitempty,email,max=255"`
    Phone   string `json:"phone" validate:"omitempty,max=20"`
    Address string `json:"address" validate:"omitempty,max=1000"`
}
```

### Response DTO

```go
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
```

### Converter Function

```go
func ToClientResponse(c models.Client) ClientResponse {
    return ClientResponse{
        ID:        c.ID,
        UserID:    c.UserID,
        Name:      c.Name,
        Email:     c.Email,
        // ...
    }
}
```

---

## 5. Validation Tags

Menggunakan `go-playground/validator/v10`:

| Tag | Deskripsi | Contoh |
|-----|-----------|--------|
| `required` | Field wajib diisi | `validate:"required"` |
| `email` | Harus format email valid | `validate:"required,email"` |
| `min=N` | Minimum length/value | `validate:"min=6"` |
| `max=N` | Maximum length/value | `validate:"max=255"` |
| `gt=N` | Greater than | `validate:"gt=0"` |
| `gte=N` | Greater than or equal | `validate:"gte=0"` |
| `oneof` | Harus salah satu value | `validate:"oneof=draft sent paid cancelled"` |
| `omitempty` | Skip validation jika kosong | `validate:"omitempty,email"` |
| `dive` | Validate slice/array items | `validate:"required,min=1,dive"` |

### Pola Validation di Handler

```go
if err := h.Validator.Struct(req); err != nil {
    errors := formatValidationErrors(err)
    return c.JSON(http.StatusUnprocessableEntity, dto.NewErrorResponse("Validation failed", errors))
}
```

---

## 6. Error Response Format

Semua error response mengikuti format yang sama:

```json
{
  "message": "User-friendly error message",
  "errors": {
    "field_name": ["Error detail 1", "Error detail 2"]
  }
}
```

### Membuat Error Response

```go
// Simple error
return c.JSON(http.StatusBadRequest, dto.NewErrorResponse("Invalid request body", nil))

// With field errors
return c.JSON(http.StatusUnprocessableEntity, dto.NewErrorResponse("Validation failed", map[string][]string{
    "email": {"Email already exists"},
    "name":  {"Name is required"},
}))
```

### Error Response Helper

```go
// internal/dto/error_dto.go
type ErrorResponse struct {
    Message string            `json:"message"`
    Errors  map[string][]string `json:"errors,omitempty"`
}

func NewErrorResponse(message string, errors map[string][]string) ErrorResponse {
    return ErrorResponse{
        Message: message,
        Errors:  errors,
    }
}
```

---

## 7. User Data Scoping

**PENTING:** Semua data harus di-scope per user. User A tidak boleh mengakses data User B.

### Repository Pattern

```go
// ✅ Good: Scoped by user_id
func (r *ClientRepository) GetByID(id, userID uint) (*models.Client, error) {
    var client models.Client
    err := r.DB.Where("id = ? AND user_id = ?", id, userID).First(&client).Error
    // ...
}

// ❌ Bad: Not scoped
func (r *ClientRepository) GetByID(id uint) (*models.Client, error) {
    var client models.Client
    err := r.DB.First(&client, id).Error
    // ...
}
```

### Handler Pattern

```go
func (h *ClientHandler) Get(c echo.Context) error {
    userID := c.Get("user_id").(uint)  // Extract from JWT
    id, _ := strconv.ParseUint(c.Param("id"), 10, 64)

    client, err := h.ClientRepo.GetByID(uint(id), userID)  // Pass userID
    // ...
}
```

---

## 8. Database Operations

### GORM Preload (Eager Loading)

```go
// Load invoice with nested client & items
err := r.DB.
    Preload("Client").
    Preload("Items").
    Where("id = ? AND user_id = ?", id, userID).
    First(&invoice).Error
```

### Transaction

```go
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
```

### Soft Delete

```go
// Model
type Invoice struct {
    // ...
    DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

// Delete (soft)
r.DB.Where("id = ? AND user_id = ?", id, userID).Delete(&models.Invoice{})

// Query (exclude deleted)
r.DB.Where("user_id = ?", userID).Find(&invoices)  // Otomatis exclude deleted
```

---

## 9. Middleware Pattern

### JWT Middleware

```go
func JWTMiddleware(secret string) echo.MiddlewareFunc {
    return func(next echo.HandlerFunc) echo.HandlerFunc {
        return func(c echo.Context) error {
            // Extract & validate token
            cookie, err := c.Cookie("jwt")
            // ...

            // Inject to context
            c.Set("user_id", claims.UserID)
            c.Set("user_email", claims.Email)

            return next(c)
        }
    }
}
```

### Extract User ID di Handler

```go
userID := c.Get("user_id").(uint)
```

---

## 10. Configuration Pattern

### Config Struct

```go
type Config struct {
    Port         string
    DBHost       string
    DBPort       string
    DBUser       string
    DBPassword   string
    DBName       string
    JWTSecret    string
    GotenbergURL string
    UploadDir    string
}
```

### Environment Loader

```go
func LoadConfig() Config {
    return Config{
        Port:       getEnv("PORT", "8080"),
        DBHost:     getEnv("DB_HOST", "localhost"),
        // ...
    }
}

func getEnv(key, fallback string) string {
    if value, exists := os.LookupEnv(key); exists {
        return value
    }
    return fallback
}
```

---

## Best Practices

### ✅ DO

- Gunakan dependency injection (constructor pattern)
- Validate request di handler sebelum process
- Scope semua query dengan `user_id`
- Gunakan transaction untuk operasi multi-table
- Return error response yang konsisten
- Pisahkan business logic dari handler

### ❌ DON'T

- Jangan taruh business logic di handler
- Jangan query DB langsung dari handler
- Jangan hardcode config values
- Jangan expose password hash di response
- Jangan skip validation
- Jangan lupa scope data per user
