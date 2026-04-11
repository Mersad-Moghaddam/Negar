package auth

import (
	"strings"

	"github.com/gofiber/fiber/v2"
	"libro-backend/pkg/apiresponse"
	"libro-backend/pkg/security"
)

func AuthMiddleware(jwtSecret string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if !strings.HasPrefix(authHeader, "Bearer ") {
			return apiresponse.Error(c, fiber.StatusUnauthorized, "unauthorized", "Missing bearer token", nil)
		}
		token := strings.TrimPrefix(authHeader, "Bearer ")
		claims, err := security.ParseToken(jwtSecret, token)
		if err != nil || claims.Type != "access" {
			return apiresponse.Error(c, fiber.StatusUnauthorized, "unauthorized", "Invalid access token", nil)
		}
		c.Locals("userID", claims.UserID)
		return c.Next()
	}
}
