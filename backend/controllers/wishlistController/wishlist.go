package wishlistController

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
	"negar-backend/apiSchema/wishlistSchema"
	"negar-backend/models/commonPagination"
	"negar-backend/models/wishlist"
	"negar-backend/pkg/apiresponse"
	"negar-backend/pkg/pagination"
	"negar-backend/pkg/requestutil"
	"negar-backend/repositories"
	"negar-backend/services/apiErrCode"
)

func (h *WishlistController) List(c *fiber.Ctx) error {
	uid, err := requestutil.UserID(c)
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}

	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "20"))
	page, limit = pagination.Normalize(page, limit)

	sortBy := c.Query("sortBy", "updated_at")
	if _, ok := allowedWishlistSort[sortBy]; !ok {
		sortBy = "updated_at"
	}

	order := c.Query("order", "desc")
	if order != "asc" {
		order = "desc"
	}

	filter := repositories.WishlistFilter{
		Search: c.Query("search"),
		SortBy: sortBy,
		Order:  order,
		PageFilter: repositories.PageFilter{
			Page:  page,
			Limit: limit,
		},
	}

	items, total, err := h.service.Wishlist.List(c.Context(), uid, filter)
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}

	meta := commonPagination.Meta{
		Page:    page,
		Limit:   limit,
		Total:   total,
		HasNext: int64(page*limit) < total,
	}

	return apiresponse.OK(c, items, meta)
}

func (h *WishlistController) Create(c *fiber.Ctx) error {
	var req wishlistSchema.WishlistRequest
	if err := c.BodyParser(&req); err != nil {
		return apiErrCode.RespondError(c, err)
	}
	if errs := validateWishlistRequest(req); errs.HasAny() {
		return apiresponse.ValidationError(c, errs)
	}

	uid, err := requestutil.UserID(c)
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}

	item := &wishlist.Wishlist{
		UserID:        uid,
		Title:         req.Title,
		Author:        req.Author,
		ExpectedPrice: req.ExpectedPrice,
		Notes:         req.Notes,
	}
	if err := h.service.Wishlist.Create(c.Context(), item); err != nil {
		return apiErrCode.RespondError(c, err)
	}

	h.recordAudit(c, "wishlist.created", &item.ID)
	return apiresponse.Created(c, item)
}

func (h *WishlistController) Get(c *fiber.Ctx) error {
	uid, err := requestutil.UserID(c)
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	id, err := requestutil.ParamUUID(c, "id")
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}

	item, err := h.service.Wishlist.Get(c.Context(), uid, id)
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}

	return apiresponse.OK(c, item, nil)
}

func (h *WishlistController) Update(c *fiber.Ctx) error {
	uid, err := requestutil.UserID(c)
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	id, err := requestutil.ParamUUID(c, "id")
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}

	item, err := h.service.Wishlist.Get(c.Context(), uid, id)
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}

	var req wishlistSchema.WishlistRequest
	if err = c.BodyParser(&req); err != nil {
		return apiErrCode.RespondError(c, err)
	}
	if errs := validateWishlistRequest(req); errs.HasAny() {
		return apiresponse.ValidationError(c, errs)
	}

	item.Title = req.Title
	item.Author = req.Author
	item.ExpectedPrice = req.ExpectedPrice
	item.Notes = req.Notes

	if err = h.service.Wishlist.Update(c.Context(), item); err != nil {
		return apiErrCode.RespondError(c, err)
	}

	h.recordAudit(c, "wishlist.updated", &item.ID)
	return apiresponse.OK(c, item, nil)
}

func (h *WishlistController) Delete(c *fiber.Ctx) error {
	uid, err := requestutil.UserID(c)
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	id, err := requestutil.ParamUUID(c, "id")
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}

	if err := h.service.Wishlist.Delete(c.Context(), uid, id); err != nil {
		return apiErrCode.RespondError(c, err)
	}

	h.recordAudit(c, "wishlist.deleted", &id)
	return apiresponse.OK(c, fiber.Map{"message": "deleted"}, nil)
}
