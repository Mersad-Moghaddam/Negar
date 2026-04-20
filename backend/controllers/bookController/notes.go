package bookController

import (
	"github.com/gofiber/fiber/v2"
	"negar-backend/apiSchema/bookSchema"
	"negar-backend/pkg/apiresponse"
	"negar-backend/pkg/requestutil"
	"negar-backend/pkg/validation"
	"negar-backend/services/apiErrCode"
)

func (h *BookController) ListNotes(c *fiber.Ctx) error {
	uid, err := requestutil.UserID(c)
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	id, err := requestutil.ParamUUID(c, "id")
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}

	notes, err := h.service.Book.ListNotes(c.Context(), uid, id)
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}

	return apiresponse.OK(c, fiber.Map{"items": notes}, nil)
}

func (h *BookController) AddNote(c *fiber.Ctx) error {
	var req bookSchema.BookNoteRequest
	if err := c.BodyParser(&req); err != nil {
		return apiErrCode.RespondError(c, err)
	}

	errs := validation.Errors{}
	req.Note = validation.Required(req.Note, "note", errs)
	if errs.HasAny() {
		return apiresponse.ValidationError(c, errs)
	}

	uid, err := requestutil.UserID(c)
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	id, err := requestutil.ParamUUID(c, "id")
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}

	note, err := h.service.Book.CreateNote(c.Context(), uid, id, req.Note, req.Highlight)
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}

	return apiresponse.Created(c, note)
}

func (h *BookController) DeleteNote(c *fiber.Ctx) error {
	uid, err := requestutil.UserID(c)
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	bookID, err := requestutil.ParamUUID(c, "id")
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	noteID, err := requestutil.ParamUUID(c, "noteId")
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}

	if err := h.service.Book.DeleteNote(c.Context(), uid, bookID, noteID); err != nil {
		return apiErrCode.RespondError(c, err)
	}

	return apiresponse.OK(c, fiber.Map{"message": "deleted"}, nil)
}
