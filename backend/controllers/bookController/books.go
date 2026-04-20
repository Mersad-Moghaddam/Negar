package bookController

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
	"negar-backend/apiSchema/bookSchema"
	"negar-backend/models/book"
	"negar-backend/models/commonPagination"
	"negar-backend/pkg/apiresponse"
	"negar-backend/pkg/bookview"
	"negar-backend/pkg/pagination"
	"negar-backend/pkg/requestutil"
	"negar-backend/repositories"
	"negar-backend/services/apiErrCode"
)

func (h *BookController) List(c *fiber.Ctx) error {
	uid, err := requestutil.UserID(c)
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}

	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "20"))
	page, limit = pagination.Normalize(page, limit)

	sortBy := c.Query("sortBy", "updated_at")
	if _, ok := allowedBookSort[sortBy]; !ok {
		sortBy = "updated_at"
	}

	order := c.Query("order", "desc")
	if order != "asc" {
		order = "desc"
	}

	filter := repositories.BookFilter{
		Search: c.Query("search"),
		Status: c.Query("status"),
		Genre:  c.Query("genre"),
		SortBy: sortBy,
		Order:  order,
		PageFilter: repositories.PageFilter{
			Page:  page,
			Limit: limit,
		},
	}

	books, total, err := h.service.Book.List(c.Context(), uid, filter)
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}

	meta := commonPagination.Meta{
		Page:    page,
		Limit:   limit,
		Total:   total,
		HasNext: int64(page*limit) < total,
	}

	return apiresponse.OK(c, bookview.FullList(books), meta)
}

func (h *BookController) Create(c *fiber.Ctx) error {
	var req bookSchema.BookRequest
	if err := c.BodyParser(&req); err != nil {
		return apiErrCode.RespondError(c, err)
	}
	if errs := validateBookRequest(req); errs.HasAny() {
		return apiresponse.ValidationError(c, errs)
	}

	uid, err := requestutil.UserID(c)
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}

	bookModel := &book.Book{
		UserID:     uid,
		Title:      req.Title,
		Author:     req.Author,
		TotalPages: req.TotalPages,
		Status:     req.Status,
		CoverURL:   req.CoverURL,
		Genre:      req.Genre,
		ISBN:       req.ISBN,
	}
	if err := h.service.Book.Create(c.Context(), bookModel); err != nil {
		return apiErrCode.RespondError(c, err)
	}

	h.recordAudit(c, "book.created", &bookModel.ID, map[string]any{"status": bookModel.Status})
	return apiresponse.Created(c, bookview.Full(bookModel))
}

func (h *BookController) Get(c *fiber.Ctx) error {
	uid, err := requestutil.UserID(c)
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	id, err := requestutil.ParamUUID(c, "id")
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}

	bookModel, err := h.service.Book.Get(c.Context(), uid, id)
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}

	h.recordAudit(c, "book.status.updated", &bookModel.ID, map[string]any{"status": bookModel.Status})
	return apiresponse.OK(c, bookview.Full(bookModel), nil)
}

func (h *BookController) Update(c *fiber.Ctx) error {
	uid, err := requestutil.UserID(c)
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	id, err := requestutil.ParamUUID(c, "id")
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}

	bookModel, err := h.service.Book.Get(c.Context(), uid, id)
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}

	var req bookSchema.BookRequest
	if err = c.BodyParser(&req); err != nil {
		return apiErrCode.RespondError(c, err)
	}
	if errs := validateBookRequest(req); errs.HasAny() {
		return apiresponse.ValidationError(c, errs)
	}

	bookModel.Title = req.Title
	bookModel.Author = req.Author
	bookModel.TotalPages = req.TotalPages
	bookModel.Status = req.Status
	bookModel.CoverURL = req.CoverURL
	bookModel.Genre = req.Genre
	bookModel.ISBN = req.ISBN

	if err = h.service.Book.Update(c.Context(), bookModel); err != nil {
		return apiErrCode.RespondError(c, err)
	}

	h.recordAudit(c, "book.updated", &bookModel.ID, map[string]any{"status": bookModel.Status})
	return apiresponse.OK(c, bookview.Full(bookModel), nil)
}

func (h *BookController) Delete(c *fiber.Ctx) error {
	uid, err := requestutil.UserID(c)
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	id, err := requestutil.ParamUUID(c, "id")
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}

	if err := h.service.Book.Delete(c.Context(), uid, id); err != nil {
		return apiErrCode.RespondError(c, err)
	}

	h.recordAudit(c, "book.deleted", &id, nil)
	return apiresponse.OK(c, fiber.Map{"message": "deleted"}, nil)
}
