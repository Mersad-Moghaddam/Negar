package bookController

import (
	"strings"

	"negar-backend/apiSchema/bookSchema"
	"negar-backend/pkg/validation"
)

func validateBookRequest(req bookSchema.BookRequest) validation.Errors {
	errs := validation.Errors{}
	req.Title = validation.Required(req.Title, "title", errs)
	req.Author = validation.Required(req.Author, "author", errs)
	req.Status = validation.Required(req.Status, "status", errs)
	validation.StringLength(req.Title, "title", 1, 200, errs)
	validation.StringLength(req.Author, "author", 1, 200, errs)
	validation.Enum(req.Status, "status", allowedBookStatus, errs)
	validation.MinInt(req.TotalPages, "totalPages", 1, errs)
	return errs
}

func validateBookStatusRequest(req *bookSchema.BookStatusRequest) validation.Errors {
	errs := validation.Errors{}
	if req.Status != nil {
		*req.Status = validation.Required(*req.Status, "status", errs)
		validation.Enum(*req.Status, "status", allowedBookStatus, errs)
	}
	if req.FinishRating != nil && (*req.FinishRating < 1 || *req.FinishRating > 5) {
		errs.Add("finishRating", "must be between 1 and 5")
	}
	if req.FinishReflection != nil {
		*req.FinishReflection = validation.Required(*req.FinishReflection, "finishReflection", errs)
		validation.StringLength(*req.FinishReflection, "finishReflection", 1, 1000, errs)
	}
	if req.FinishHighlight != nil {
		*req.FinishHighlight = validation.Required(*req.FinishHighlight, "finishHighlight", errs)
		validation.StringLength(*req.FinishHighlight, "finishHighlight", 1, 600, errs)
	}
	if req.NextToReadNote != nil {
		trimmed := strings.TrimSpace(*req.NextToReadNote)
		req.NextToReadNote = &trimmed
		if trimmed != "" {
			validation.StringLength(trimmed, "nextToReadNote", 1, 240, errs)
		}
	}
	return errs
}
