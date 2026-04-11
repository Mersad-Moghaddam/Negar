package mainController

import (
	"github.com/gofiber/fiber/v2"
	"libro-backend/pkg/apiresponse"
	"libro-backend/services/apiErrCode"
	"libro-backend/services/bookService"
	"libro-backend/statics/constants"
)

type MainService struct{ books *bookService.Service }

type MainController struct{ service *MainService }

func NewMainController(service *MainService) *MainController {
	return &MainController{service: service}
}

func (c *MainController) Health(ctx *fiber.Ctx) error {
	return apiresponse.OK(ctx, fiber.Map{"status": constants.HealthStatusOK}, nil)
}

func (c *MainController) Ready(ctx *fiber.Ctx) error {
	return apiresponse.OK(ctx, fiber.Map{"status": constants.HealthStatusOK}, nil)
}

func (c *MainController) DashboardSummary(ctx *fiber.Ctx) error {
	uid := parseUUID(ctx.Locals("userID").(string))
	counts, recent, reading, err := c.service.books.Summary(ctx.Context(), uid)
	if err != nil {
		return apiErrCode.RespondError(ctx, err)
	}
	return apiresponse.OK(ctx, fiber.Map{"counts": counts, "recentBooks": withBooksComputed(recent), "currentlyReading": withBooksComputed(reading)}, nil)
}

func (c *MainController) DashboardAnalytics(ctx *fiber.Ctx) error {
	uid := parseUUID(ctx.Locals("userID").(string))
	analytics, err := c.service.books.Analytics(ctx.Context(), uid)
	if err != nil {
		return apiErrCode.RespondError(ctx, err)
	}
	return apiresponse.OK(ctx, analytics, nil)
}

func (c *MainController) DashboardInsights(ctx *fiber.Ctx) error {
	uid := parseUUID(ctx.Locals("userID").(string))
	insights, err := c.service.books.Insights(ctx.Context(), uid)
	if err != nil {
		return apiErrCode.RespondError(ctx, err)
	}
	return apiresponse.OK(ctx, fiber.Map{"items": insights}, nil)
}
