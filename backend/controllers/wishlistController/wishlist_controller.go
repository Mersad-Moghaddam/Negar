package wishlistController

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"libro-backend/apiSchema/purchaseLinkSchema"
	"libro-backend/apiSchema/wishlistSchema"
	"libro-backend/models/commonPagination"
	"libro-backend/models/purchaseLink"
	"libro-backend/models/wishlist"
	"libro-backend/pkg/apiresponse"
	"libro-backend/pkg/pagination"
	"libro-backend/pkg/validation"
	"libro-backend/repositories"
	"libro-backend/services/apiErrCode"
	"libro-backend/services/wishlistService"
)

type ServiceBridge struct{ Wishlist *wishlistService.Service }

type WishlistController struct{ service *ServiceBridge }

var allowedWishlistSort = map[string]struct{}{"title": {}, "created_at": {}, "updated_at": {}}

func NewWishlistController(service *ServiceBridge) *WishlistController {
	return &WishlistController{service: service}
}

func (h *WishlistController) List(c *fiber.Ctx) error {
	uid, err := uuid.Parse(c.Locals("userID").(string))
	if err != nil {
		return apiErrCode.RespondError(c, fiber.ErrBadRequest)
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
	items, total, err := h.service.Wishlist.List(c.Context(), uid, repositories.WishlistFilter{Search: c.Query("search"), SortBy: sortBy, Order: order, PageFilter: repositories.PageFilter{Page: page, Limit: limit}})
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	meta := commonPagination.Meta{Page: page, Limit: limit, Total: total, HasNext: int64(page*limit) < total}
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
	uid, err := uuid.Parse(c.Locals("userID").(string))
	if err != nil {
		return apiErrCode.RespondError(c, fiber.ErrBadRequest)
	}
	w := &wishlist.Wishlist{UserID: uid, Title: req.Title, Author: req.Author, ExpectedPrice: req.ExpectedPrice, Notes: req.Notes}
	if err := h.service.Wishlist.Create(c.Context(), w); err != nil {
		return apiErrCode.RespondError(c, err)
	}
	return apiresponse.Created(c, w)
}
func (h *WishlistController) Get(c *fiber.Ctx) error {
	uid, err := uuid.Parse(c.Locals("userID").(string))
	if err != nil {
		return apiErrCode.RespondError(c, fiber.ErrBadRequest)
	}
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return apiErrCode.RespondError(c, fiber.ErrBadRequest)
	}
	item, err := h.service.Wishlist.Get(c.Context(), uid, id)
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	return apiresponse.OK(c, item, nil)
}
func (h *WishlistController) Update(c *fiber.Ctx) error {
	uid, err := uuid.Parse(c.Locals("userID").(string))
	if err != nil {
		return apiErrCode.RespondError(c, fiber.ErrBadRequest)
	}
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return apiErrCode.RespondError(c, fiber.ErrBadRequest)
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
	item.Title, item.Author, item.ExpectedPrice, item.Notes = req.Title, req.Author, req.ExpectedPrice, req.Notes
	if err = h.service.Wishlist.Update(c.Context(), item); err != nil {
		return apiErrCode.RespondError(c, err)
	}
	return apiresponse.OK(c, item, nil)
}
func (h *WishlistController) Delete(c *fiber.Ctx) error {
	uid, err := uuid.Parse(c.Locals("userID").(string))
	if err != nil {
		return apiErrCode.RespondError(c, fiber.ErrBadRequest)
	}
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return apiErrCode.RespondError(c, fiber.ErrBadRequest)
	}
	if err := h.service.Wishlist.Delete(c.Context(), uid, id); err != nil {
		return apiErrCode.RespondError(c, err)
	}
	return apiresponse.OK(c, fiber.Map{"message": "deleted"}, nil)
}
func (h *WishlistController) AddLink(c *fiber.Ctx) error {
	var req purchaseLinkSchema.PurchaseLinkRequest
	if err := c.BodyParser(&req); err != nil {
		return apiErrCode.RespondError(c, err)
	}
	if errs := validateLinkRequest(req); errs.HasAny() {
		return apiresponse.ValidationError(c, errs)
	}
	uid, err := uuid.Parse(c.Locals("userID").(string))
	if err != nil {
		return apiErrCode.RespondError(c, fiber.ErrBadRequest)
	}
	wid, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return apiErrCode.RespondError(c, fiber.ErrBadRequest)
	}
	link := &purchaseLink.PurchaseLink{Label: req.Label, URL: req.URL}
	if err := h.service.Wishlist.AddLink(c.Context(), uid, wid, link); err != nil {
		return apiErrCode.RespondError(c, err)
	}
	return apiresponse.Created(c, link)
}
func (h *WishlistController) UpdateLink(c *fiber.Ctx) error {
	var req purchaseLinkSchema.PurchaseLinkRequest
	if err := c.BodyParser(&req); err != nil {
		return apiErrCode.RespondError(c, err)
	}
	if errs := validateLinkRequest(req); errs.HasAny() {
		return apiresponse.ValidationError(c, errs)
	}
	uid, err := uuid.Parse(c.Locals("userID").(string))
	if err != nil {
		return apiErrCode.RespondError(c, fiber.ErrBadRequest)
	}
	wid, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return apiErrCode.RespondError(c, fiber.ErrBadRequest)
	}
	lid, err := uuid.Parse(c.Params("linkId"))
	if err != nil {
		return apiErrCode.RespondError(c, fiber.ErrBadRequest)
	}
	link, err := h.service.Wishlist.UpdateLink(c.Context(), uid, wid, lid, req.Label, req.URL)
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	return apiresponse.OK(c, link, nil)
}
func (h *WishlistController) DeleteLink(c *fiber.Ctx) error {
	uid, err := uuid.Parse(c.Locals("userID").(string))
	if err != nil {
		return apiErrCode.RespondError(c, fiber.ErrBadRequest)
	}
	wid, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return apiErrCode.RespondError(c, fiber.ErrBadRequest)
	}
	lid, err := uuid.Parse(c.Params("linkId"))
	if err != nil {
		return apiErrCode.RespondError(c, fiber.ErrBadRequest)
	}
	if err := h.service.Wishlist.DeleteLink(c.Context(), uid, wid, lid); err != nil {
		return apiErrCode.RespondError(c, err)
	}
	return apiresponse.OK(c, fiber.Map{"message": "deleted"}, nil)
}

func validateWishlistRequest(req wishlistSchema.WishlistRequest) validation.Errors {
	errs := validation.Errors{}
	req.Title = validation.Required(req.Title, "title", errs)
	req.Author = validation.Required(req.Author, "author", errs)
	validation.StringLength(req.Title, "title", 1, 200, errs)
	validation.StringLength(req.Author, "author", 1, 200, errs)
	if req.ExpectedPrice != nil {
		validation.MinFloat(*req.ExpectedPrice, "expectedPrice", 0, errs)
	}
	return errs
}

func validateLinkRequest(req purchaseLinkSchema.PurchaseLinkRequest) validation.Errors {
	errs := validation.Errors{}
	req.URL = validation.Required(req.URL, "url", errs)
	if req.Label != "" {
		validation.StringLength(req.Label, "label", 1, 120, errs)
	}
	validation.StringLength(req.URL, "url", 5, 500, errs)
	return errs
}
