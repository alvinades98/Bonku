package dto

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
