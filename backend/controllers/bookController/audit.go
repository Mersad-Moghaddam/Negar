package bookController

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"negar-backend/pkg/requestutil"
	"negar-backend/services/auditService"
)

func (h *BookController) recordAudit(c *fiber.Ctx, action string, resourceID *uuid.UUID, metadata map[string]any) {
	if h.service.Audit == nil {
		return
	}

	_ = h.service.Audit.Record(c.Context(), auditService.RecordInput{
		ActorUserID:  requestutil.MustUserID(c),
		ActorRole:    requestutil.UserRole(c),
		Action:       action,
		ResourceType: "book",
		ResourceID:   resourceID,
		Metadata:     metadata,
		IPAddress:    c.IP(),
		UserAgent:    c.Get("User-Agent"),
	})
}
