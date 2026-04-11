package apiErrCode

import (
	"errors"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
	"libro-backend/pkg/apiresponse"
	"libro-backend/statics/customErr"
)

func RespondError(c *fiber.Ctx, err error) error {
	switch {
	case errors.Is(err, customErr.ErrBadRequest):
		return apiresponse.Error(c, fiber.StatusBadRequest, "bad_request", "Invalid request", nil)
	case errors.Is(err, customErr.ErrUnauthorized):
		return apiresponse.Error(c, fiber.StatusUnauthorized, "unauthorized", "Unauthorized", nil)
	case errors.Is(err, customErr.ErrConflict):
		return apiresponse.Error(c, fiber.StatusConflict, "conflict", "Resource conflict", nil)
	case errors.Is(err, customErr.ErrNotFound), errors.Is(err, gorm.ErrRecordNotFound):
		return apiresponse.Error(c, fiber.StatusNotFound, "not_found", "Resource not found", nil)
	case errors.Is(err, customErr.ErrRateLimited):
		return apiresponse.Error(c, fiber.StatusTooManyRequests, "rate_limited", "Too many requests", nil)
	default:
		return apiresponse.Error(c, fiber.StatusInternalServerError, "internal_error", "Internal server error", nil)
	}
}
