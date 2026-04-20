package bookController

import (
	"github.com/gofiber/fiber/v2"
	"negar-backend/apiSchema/bookSchema"
	"negar-backend/pkg/apiresponse"
	"negar-backend/pkg/bookview"
	"negar-backend/pkg/requestutil"
	"negar-backend/services/apiErrCode"
)

func (h *BookController) UpdateStatus(c *fiber.Ctx) error {
	var req bookSchema.BookStatusRequest
	if err := c.BodyParser(&req); err != nil {
		return apiErrCode.RespondError(c, err)
	}
	if errs := validateBookStatusRequest(&req); errs.HasAny() {
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

	bookModel, err := h.service.Book.UpdateStatus(
		c.Context(),
		uid,
		id,
		req.Status,
		req.FinishRating,
		req.FinishReflection,
		req.FinishHighlight,
		req.NextToReadFocus,
		req.NextToReadNote,
	)
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}

	return apiresponse.OK(c, bookview.Full(bookModel), nil)
}
