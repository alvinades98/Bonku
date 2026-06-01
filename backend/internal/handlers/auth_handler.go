package handlers

import (
	"net/http"

	"invoice-backend/internal/dto"
	"invoice-backend/internal/models"
	"invoice-backend/internal/repository"
	"invoice-backend/internal/services"

	"github.com/go-playground/validator/v10"
	echo "github.com/labstack/echo/v4"
)

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

func (h *AuthHandler) Register(c echo.Context) error {
	var req dto.RegisterRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, dto.NewErrorResponse("Invalid request body", nil))
	}

	if err := h.Validator.Struct(req); err != nil {
		errors := formatValidationErrors(err)
		return c.JSON(http.StatusUnprocessableEntity, dto.NewErrorResponse("Validation failed", errors))
	}

	existing, err := h.UserRepo.GetByEmail(req.Email)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, dto.NewErrorResponse("Failed to check email", nil))
	}
	if existing != nil {
		return c.JSON(http.StatusUnprocessableEntity, dto.NewErrorResponse("Email already registered", map[string][]string{
			"email": {"Email already exists"},
		}))
	}

	hashedPassword, err := h.AuthService.HashPassword(req.Password)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, dto.NewErrorResponse("Failed to process password", nil))
	}

	userModel := models.User{
		Email:        req.Email,
		PasswordHash: hashedPassword,
		Name:         req.Name,
	}
	if err := h.UserRepo.Create(&userModel); err != nil {
		return c.JSON(http.StatusInternalServerError, dto.NewErrorResponse("Failed to create user", nil))
	}

	return c.JSON(http.StatusCreated, dto.RegisterResponse{
		User: dto.ToUserResponse(userModel),
	})
}

func (h *AuthHandler) Login(c echo.Context) error {
	var req dto.LoginRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, dto.NewErrorResponse("Invalid request body", nil))
	}

	if err := h.Validator.Struct(req); err != nil {
		errors := formatValidationErrors(err)
		return c.JSON(http.StatusUnprocessableEntity, dto.NewErrorResponse("Validation failed", errors))
	}

	user, err := h.UserRepo.GetByEmail(req.Email)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, dto.NewErrorResponse("Failed to authenticate", nil))
	}
	if user == nil {
		return c.JSON(http.StatusUnprocessableEntity, dto.NewErrorResponse("Invalid email or password", map[string][]string{
			"email": {"Email or password is incorrect"},
		}))
	}

	if err := h.AuthService.ComparePassword(user.PasswordHash, req.Password); err != nil {
		return c.JSON(http.StatusUnprocessableEntity, dto.NewErrorResponse("Invalid email or password", map[string][]string{
			"email": {"Email or password is incorrect"},
		}))
	}

	token, err := h.AuthService.GenerateTokenWithClaims(user.ID, user.Email)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, dto.NewErrorResponse("Failed to generate token", nil))
	}

	cookie := &http.Cookie{
		Name:     "jwt",
		Value:    token,
		Path:     "/",
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   86400,
	}
	c.SetCookie(cookie)

	return c.JSON(http.StatusOK, dto.AuthResponse{
		Token: token,
		User:  dto.ToUserResponse(*user),
	})
}

func (h *AuthHandler) Logout(c echo.Context) error {
	cookie := &http.Cookie{
		Name:     "jwt",
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   -1,
	}
	c.SetCookie(cookie)

	return c.NoContent(http.StatusNoContent)
}

func (h *AuthHandler) GetMe(c echo.Context) error {
	userID := c.Get("user_id").(uint)

	user, err := h.UserRepo.GetByID(userID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, dto.NewErrorResponse("Failed to get user data", nil))
	}
	if user == nil {
		return c.JSON(http.StatusNotFound, dto.NewErrorResponse("User not found", nil))
	}

	return c.JSON(http.StatusOK, dto.ToUserResponse(*user))
}

func (h *AuthHandler) UpdateProfile(c echo.Context) error {
	userID := c.Get("user_id").(uint)

	user, err := h.UserRepo.GetByID(userID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, dto.NewErrorResponse("Failed to get user data", nil))
	}
	if user == nil {
		return c.JSON(http.StatusNotFound, dto.NewErrorResponse("User not found", nil))
	}

	var req dto.UpdateProfileRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, dto.NewErrorResponse("Invalid request body", nil))
	}

	if err := h.Validator.Struct(req); err != nil {
		errors := formatValidationErrors(err)
		return c.JSON(http.StatusUnprocessableEntity, dto.NewErrorResponse("Validation failed", errors))
	}

	user.Name = req.Name
	user.CompanyName = req.CompanyName
	user.CompanyAddress = req.CompanyAddress
	user.CompanyPhone = req.CompanyPhone
	user.NPWP = req.NPWP
	user.CompanyLogoPath = req.CompanyLogoPath

	if err := h.UserRepo.Update(user); err != nil {
		return c.JSON(http.StatusInternalServerError, dto.NewErrorResponse("Failed to update profile", nil))
	}

	return c.JSON(http.StatusOK, dto.ToUserResponse(*user))
}

func formatValidationErrors(err error) map[string][]string {
	errors := make(map[string][]string)
	if validationErrors, ok := err.(validator.ValidationErrors); ok {
		for _, fe := range validationErrors {
			field := fe.Field()
			switch fe.Tag() {
			case "required":
				errors[field] = append(errors[field], field+" is required")
			case "email":
				errors[field] = append(errors[field], field+" must be a valid email")
			case "min":
				errors[field] = append(errors[field], field+" must be at least "+fe.Param()+" characters")
			case "max":
				errors[field] = append(errors[field], field+" must be at most "+fe.Param()+" characters")
			case "gt":
				errors[field] = append(errors[field], field+" must be greater than "+fe.Param())
			case "gte":
				errors[field] = append(errors[field], field+" must be greater than or equal to "+fe.Param())
			case "oneof":
				errors[field] = append(errors[field], field+" must be one of: "+fe.Param())
			default:
				errors[field] = append(errors[field], field+" is invalid")
			}
		}
	}
	return errors
}

func RegisterRequestToModel(req *dto.RegisterRequest) dto.UserModel {
	return dto.UserModel{
		Email:        req.Email,
		PasswordHash: req.Password,
		Name:         req.Name,
	}
}
