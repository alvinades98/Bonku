package handlers

import (
	"net/http"
	"strconv"

	"invoice-backend/internal/dto"
	"invoice-backend/internal/models"
	"invoice-backend/internal/repository"
	"invoice-backend/internal/services"

	"github.com/go-playground/validator/v10"
	echo "github.com/labstack/echo/v4"
)

type InvoiceHandler struct {
	InvoiceRepo    *repository.InvoiceRepository
	ClientRepo     *repository.ClientRepository
	InvoiceService *services.InvoiceService
	PDFService     *services.PDFService
	Validator      *validator.Validate
}

func NewInvoiceHandler(
	invoiceRepo *repository.InvoiceRepository,
	clientRepo *repository.ClientRepository,
	invoiceService *services.InvoiceService,
	pdfService *services.PDFService,
	v *validator.Validate,
) *InvoiceHandler {
	return &InvoiceHandler{
		InvoiceRepo:    invoiceRepo,
		ClientRepo:     clientRepo,
		InvoiceService: invoiceService,
		PDFService:     pdfService,
		Validator:      v,
	}
}

func (h *InvoiceHandler) List(c echo.Context) error {
	userID := c.Get("user_id").(uint)

	status := c.QueryParam("status")
	page, _ := strconv.Atoi(c.QueryParam("page"))
	limit, _ := strconv.Atoi(c.QueryParam("limit"))

	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 50
	}

	invoices, _, err := h.InvoiceRepo.List(userID, status, page, limit)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, dto.NewErrorResponse("Failed to fetch invoices", nil))
	}

	response := make([]dto.InvoiceResponse, len(invoices))
	for i, inv := range invoices {
		response[i] = dto.ToInvoiceResponse(inv)
	}

	return c.JSON(http.StatusOK, response)
}

func (h *InvoiceHandler) Get(c echo.Context) error {
	userID := c.Get("user_id").(uint)
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, dto.NewErrorResponse("Invalid invoice ID", nil))
	}

	invoice, err := h.InvoiceRepo.GetByID(uint(id), userID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, dto.NewErrorResponse("Failed to fetch invoice", nil))
	}
	if invoice == nil {
		return c.JSON(http.StatusNotFound, dto.NewErrorResponse("Invoice not found", nil))
	}

	return c.JSON(http.StatusOK, dto.ToInvoiceResponse(*invoice))
}

func (h *InvoiceHandler) Create(c echo.Context) error {
	userID := c.Get("user_id").(uint)

	var req dto.CreateInvoiceRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, dto.NewErrorResponse("Invalid request body", nil))
	}

	if err := h.Validator.Struct(req); err != nil {
		errors := formatValidationErrors(err)
		return c.JSON(http.StatusUnprocessableEntity, dto.NewErrorResponse("Validation failed", errors))
	}

	client, err := h.ClientRepo.GetByID(req.ClientID, userID)
	if err != nil || client == nil {
		return c.JSON(http.StatusUnprocessableEntity, dto.NewErrorResponse("Client not found", map[string][]string{
			"client_id": {"Client not found or does not belong to you"},
		}))
	}

	invoiceNumber := req.InvoiceNumber
	if invoiceNumber == "" {
		generated, err := h.InvoiceRepo.GetNextInvoiceNumber(userID)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, dto.NewErrorResponse("Failed to generate invoice number", nil))
		}
		invoiceNumber = generated
	}

	items := make([]models.InvoiceItem, len(req.Items))
	for i, itemReq := range req.Items {
		amount := h.InvoiceService.CalculateItemAmount(itemReq.Quantity, itemReq.UnitPrice)
		items[i] = models.InvoiceItem{
			Description: itemReq.Description,
			Quantity:    itemReq.Quantity,
			UnitPrice:   itemReq.UnitPrice,
			Amount:      amount,
		}
	}

	subtotal, taxAmount, total := h.InvoiceService.CalculateTotals(items, req.TaxPercent)

	status := req.Status
	if status == "" {
		status = "draft"
	}

	invoice := models.Invoice{
		UserID:        userID,
		ClientID:      req.ClientID,
		InvoiceNumber: invoiceNumber,
		IssueDate:     req.IssueDate,
		DueDate:       req.DueDate,
		Status:        status,
		Subtotal:      subtotal,
		TaxPercent:    req.TaxPercent,
		TaxAmount:     taxAmount,
		Total:         total,
		Notes:         req.Notes,
	}

	if err := h.InvoiceRepo.Create(&invoice, items); err != nil {
		return c.JSON(http.StatusInternalServerError, dto.NewErrorResponse("Failed to create invoice", nil))
	}

	savedInvoice, err := h.InvoiceRepo.GetByID(invoice.ID, userID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, dto.NewErrorResponse("Failed to fetch created invoice", nil))
	}

	return c.JSON(http.StatusCreated, dto.ToInvoiceResponse(*savedInvoice))
}

func (h *InvoiceHandler) Update(c echo.Context) error {
	userID := c.Get("user_id").(uint)
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, dto.NewErrorResponse("Invalid invoice ID", nil))
	}

	invoice, err := h.InvoiceRepo.GetByID(uint(id), userID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, dto.NewErrorResponse("Failed to fetch invoice", nil))
	}
	if invoice == nil {
		return c.JSON(http.StatusNotFound, dto.NewErrorResponse("Invoice not found", nil))
	}

	var req dto.UpdateInvoiceRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, dto.NewErrorResponse("Invalid request body", nil))
	}

	if req.ClientID != nil {
		client, err := h.ClientRepo.GetByID(*req.ClientID, userID)
		if err != nil || client == nil {
			return c.JSON(http.StatusUnprocessableEntity, dto.NewErrorResponse("Client not found", map[string][]string{
				"client_id": {"Client not found or does not belong to you"},
			}))
		}
		invoice.ClientID = *req.ClientID
	}

	if req.InvoiceNumber != nil {
		invoice.InvoiceNumber = *req.InvoiceNumber
	}
	if req.IssueDate != nil {
		invoice.IssueDate = *req.IssueDate
	}
	if req.DueDate != nil {
		invoice.DueDate = *req.DueDate
	}
	if req.Status != nil {
		invoice.Status = *req.Status
	}
	if req.Notes != nil {
		invoice.Notes = *req.Notes
	}

	var items []models.InvoiceItem
	if req.Items != nil {
		if err := h.Validator.Var(*req.Items, "required,min=1,dive"); err != nil {
			errors := formatValidationErrors(err)
			return c.JSON(http.StatusUnprocessableEntity, dto.NewErrorResponse("Validation failed", errors))
		}

		items = make([]models.InvoiceItem, len(*req.Items))
		for i, itemReq := range *req.Items {
			amount := h.InvoiceService.CalculateItemAmount(itemReq.Quantity, itemReq.UnitPrice)
			items[i] = models.InvoiceItem{
				Description: itemReq.Description,
				Quantity:    itemReq.Quantity,
				UnitPrice:   itemReq.UnitPrice,
				Amount:      amount,
			}
		}

		taxPercent := invoice.TaxPercent
		if req.TaxPercent != nil {
			taxPercent = *req.TaxPercent
		}

		subtotal, taxAmount, total := h.InvoiceService.CalculateTotals(items, taxPercent)
		invoice.Subtotal = subtotal
		invoice.TaxAmount = taxAmount
		invoice.Total = total
		if req.TaxPercent != nil {
			invoice.TaxPercent = *req.TaxPercent
		}
	}

	if err := h.InvoiceRepo.Update(invoice, items); err != nil {
		return c.JSON(http.StatusInternalServerError, dto.NewErrorResponse("Failed to update invoice", nil))
	}

	savedInvoice, err := h.InvoiceRepo.GetByID(invoice.ID, userID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, dto.NewErrorResponse("Failed to fetch updated invoice", nil))
	}

	return c.JSON(http.StatusOK, dto.ToInvoiceResponse(*savedInvoice))
}

func (h *InvoiceHandler) Delete(c echo.Context) error {
	userID := c.Get("user_id").(uint)
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, dto.NewErrorResponse("Invalid invoice ID", nil))
	}

	if err := h.InvoiceRepo.Delete(uint(id), userID); err != nil {
		return c.JSON(http.StatusNotFound, dto.NewErrorResponse("Invoice not found", nil))
	}

	return c.NoContent(http.StatusNoContent)
}

func (h *InvoiceHandler) GetStats(c echo.Context) error {
	userID := c.Get("user_id").(uint)

	stats, err := h.InvoiceRepo.GetStats(userID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, dto.NewErrorResponse("Failed to fetch dashboard stats", nil))
	}

	return c.JSON(http.StatusOK, stats)
}

func (h *InvoiceHandler) DownloadPDF(c echo.Context) error {
	userID := c.Get("user_id").(uint)
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, dto.NewErrorResponse("Invalid invoice ID", nil))
	}

	invoice, err := h.InvoiceRepo.GetByID(uint(id), userID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, dto.NewErrorResponse("Failed to fetch invoice", nil))
	}
	if invoice == nil {
		return c.JSON(http.StatusNotFound, dto.NewErrorResponse("Invoice not found", nil))
	}

	user, err := h.InvoiceRepo.GetUserByID(invoice.UserID)
	if err != nil || user == nil {
		return c.JSON(http.StatusInternalServerError, dto.NewErrorResponse("Failed to fetch user data", nil))
	}

	pdfData := services.InvoicePDFData{
		InvoiceNumber:  invoice.InvoiceNumber,
		IssueDate:      invoice.IssueDate,
		DueDate:        invoice.DueDate,
		Status:         invoice.Status,
		CompanyName:    user.Name,
		CompanyAddress: user.CompanyAddress,
		CompanyPhone:   user.CompanyPhone,
		NPWP:           user.NPWP,
		ClientName:     invoice.Client.Name,
		ClientEmail:    invoice.Client.Email,
		ClientPhone:    invoice.Client.Phone,
		ClientAddress:  invoice.Client.Address,
		Notes:          invoice.Notes,
		Subtotal:       services.FormatRupiah(invoice.Subtotal),
		TaxPercent:     services.FormatRupiah(invoice.TaxPercent),
		TaxAmount:      services.FormatRupiah(invoice.TaxAmount),
		Total:          services.FormatRupiah(invoice.Total),
	}

	pdfData.Items = make([]services.PDFItem, len(invoice.Items))
	for i, item := range invoice.Items {
		pdfData.Items[i] = services.PDFItem{
			Description: item.Description,
			Quantity:    services.FormatRupiah(item.Quantity),
			UnitPrice:   services.FormatRupiah(item.UnitPrice),
			Amount:      services.FormatRupiah(item.Amount),
		}
	}

	pdfBytes, err := h.PDFService.GeneratePDF(pdfData)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, dto.NewErrorResponse("Failed to generate PDF: "+err.Error(), nil))
	}

	filename := services.FormatFilename(invoice.InvoiceNumber)
	c.Response().Header().Set("Content-Type", "application/pdf")
	c.Response().Header().Set("Content-Disposition", "attachment; filename="+filename)
	c.Response().Header().Set("Content-Length", strconv.Itoa(len(pdfBytes)))

	if _, err := c.Response().Write(pdfBytes); err != nil {
		return c.JSON(http.StatusInternalServerError, dto.NewErrorResponse("Failed to send PDF", nil))
	}

	return nil
}
