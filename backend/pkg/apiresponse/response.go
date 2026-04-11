package apiresponse

import "github.com/gofiber/fiber/v2"

type ErrorResponse struct {
	Code    string `json:"code"`
	Message string `json:"message"`
	Details any    `json:"details,omitempty"`
}

type ValidationDetails struct {
	Fields map[string]string `json:"fields"`
}

func OK(c *fiber.Ctx, data any, meta any) error {
	resp := fiber.Map{"data": data}
	if meta != nil {
		resp["meta"] = meta
	}
	return c.JSON(resp)
}

func Created(c *fiber.Ctx, data any) error {
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"data": data})
}

func Error(c *fiber.Ctx, status int, code, message string, details any) error {
	return c.Status(status).JSON(ErrorResponse{Code: code, Message: message, Details: details})
}

func ValidationError(c *fiber.Ctx, fields map[string]string) error {
	return Error(c, fiber.StatusBadRequest, "validation_error", "Invalid request data.", fields)
}
