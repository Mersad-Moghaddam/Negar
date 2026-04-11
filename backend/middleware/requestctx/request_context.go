package requestctx

import (
	"log/slog"
	"os"
	"time"

	"github.com/gofiber/fiber/v2"
)

func NewLogger() *slog.Logger {
	return slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelInfo}))
}

func RequestLogger(logger *slog.Logger) fiber.Handler {
	return func(c *fiber.Ctx) error {
		start := time.Now()
		err := c.Next()
		latency := time.Since(start)
		logger.Info("request",
			slog.String("requestId", c.GetRespHeader("X-Request-ID")),
			slog.String("method", c.Method()),
			slog.String("path", c.Path()),
			slog.Int("status", c.Response().StatusCode()),
			slog.Duration("latency", latency),
			slog.String("ip", c.IP()),
		)
		return err
	}
}
