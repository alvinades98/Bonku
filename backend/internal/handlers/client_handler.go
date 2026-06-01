package handlers

import (
	"net/http"
	"strconv"

	"invoice-backend/internal/dto"
	"invoice-backend/internal/models"
	"invoice-backend/internal/repository"

	"github.com/go-playground/validator/v10"
	echo "github.com/labstack/echo/v4"
)

type ClientHandler struct {
	ClientRepo *repository.ClientRepository
	Validator  *validator.Validate
}

func NewClientHandler(clientRepo *repository.ClientRepository, v *validator.Validate) *ClientHandler {
	return &ClientHandler{
		ClientRepo: clientRepo,
		Validator:  v,
	}
}

func (h *ClientHandler) List(c echo.Context) error {
	userID := c.Get("user_id").(uint)

	clients, err := h.ClientRepo.GetByUserID(userID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, dto.NewErrorResponse("Failed to fetch clients", nil))
	}

	response := make([]dto.ClientResponse, len(clients))
	for i, client := range clients {
		response[i] = dto.ToClientResponse(client)
	}

	return c.JSON(http.StatusOK, response)
}

func (h *ClientHandler) Get(c echo.Context) error {
	userID := c.Get("user_id").(uint)
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, dto.NewErrorResponse("Invalid client ID", nil))
	}

	client, err := h.ClientRepo.GetByID(uint(id), userID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, dto.NewErrorResponse("Failed to fetch client", nil))
	}
	if client == nil {
		return c.JSON(http.StatusNotFound, dto.NewErrorResponse("Client not found", nil))
	}

	return c.JSON(http.StatusOK, dto.ToClientResponse(*client))
}

func (h *ClientHandler) Create(c echo.Context) error {
	userID := c.Get("user_id").(uint)

	var req dto.CreateClientRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, dto.NewErrorResponse("Invalid request body", nil))
	}

	if err := h.Validator.Struct(req); err != nil {
		errors := formatValidationErrors(err)
		return c.JSON(http.StatusUnprocessableEntity, dto.NewErrorResponse("Validation failed", errors))
	}

	client := models.Client{
		UserID:  userID,
		Name:    req.Name,
		Email:   req.Email,
		Phone:   req.Phone,
		Address: req.Address,
	}

	if err := h.ClientRepo.Create(&client); err != nil {
		return c.JSON(http.StatusInternalServerError, dto.NewErrorResponse("Failed to create client", nil))
	}

	return c.JSON(http.StatusCreated, dto.ToClientResponse(client))
}

func (h *ClientHandler) Update(c echo.Context) error {
	userID := c.Get("user_id").(uint)
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, dto.NewErrorResponse("Invalid client ID", nil))
	}

	client, err := h.ClientRepo.GetByID(uint(id), userID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, dto.NewErrorResponse("Failed to fetch client", nil))
	}
	if client == nil {
		return c.JSON(http.StatusNotFound, dto.NewErrorResponse("Client not found", nil))
	}

	var req dto.UpdateClientRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, dto.NewErrorResponse("Invalid request body", nil))
	}

	if err := h.Validator.Struct(req); err != nil {
		errors := formatValidationErrors(err)
		return c.JSON(http.StatusUnprocessableEntity, dto.NewErrorResponse("Validation failed", errors))
	}

	if req.Name != "" {
		client.Name = req.Name
	}
	if req.Email != "" {
		client.Email = req.Email
	}
	if req.Phone != "" {
		client.Phone = req.Phone
	}
	if req.Address != "" {
		client.Address = req.Address
	}

	if err := h.ClientRepo.Update(client); err != nil {
		return c.JSON(http.StatusInternalServerError, dto.NewErrorResponse("Failed to update client", nil))
	}

	return c.JSON(http.StatusOK, dto.ToClientResponse(*client))
}

func (h *ClientHandler) Delete(c echo.Context) error {
	userID := c.Get("user_id").(uint)
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, dto.NewErrorResponse("Invalid client ID", nil))
	}

	if err := h.ClientRepo.Delete(uint(id), userID); err != nil {
		return c.JSON(http.StatusNotFound, dto.NewErrorResponse("Client not found", nil))
	}

	return c.NoContent(http.StatusNoContent)
}
