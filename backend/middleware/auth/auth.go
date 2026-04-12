package auth

import (
	"strings"

	"github.com/gofiber/fiber/v2"
	"go.uber.org/zap"
	"libro-backend/middleware/requestctx"
	"libro-backend/pkg/apiresponse"
	"libro-backend/pkg/security"
)

func AuthMiddleware(jwtSecret string, logger *zap.Logger) fiber.Handler {
	return func(c *fiber.Ctx) error {
		reqLogger := requestctx.LoggerFromCtx(c, logger)
		authHeader := c.Get("Authorization")
		if !strings.HasPrefix(authHeader, "Bearer ") {
			reqLogger.Warn("auth_missing_bearer_token")
			return apiresponse.Error(c, fiber.StatusUnauthorized, "unauthorized", "Missing bearer token", nil)
		}
		token := strings.TrimPrefix(authHeader, "Bearer ")
		claims, err := security.ParseToken(jwtSecret, token)
		if err != nil || claims.Type != "access" {
			reqLogger.Warn("auth_invalid_access_token")
			return apiresponse.Error(c, fiber.StatusUnauthorized, "unauthorized", "Invalid access token", nil)
		}
		c.Locals("userID", claims.UserID)
		return c.Next()
	}
}
