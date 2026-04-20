package wishlistController

import (
	"github.com/gofiber/fiber/v2"
	"negar-backend/apiSchema/purchaseLinkSchema"
	"negar-backend/models/purchaseLink"
	"negar-backend/pkg/apiresponse"
	"negar-backend/pkg/requestutil"
	"negar-backend/services/apiErrCode"
)

func (h *WishlistController) AddLink(c *fiber.Ctx) error {
	var req purchaseLinkSchema.PurchaseLinkRequest
	if err := c.BodyParser(&req); err != nil {
		return apiErrCode.RespondError(c, err)
	}
	if errs := validateLinkRequest(req); errs.HasAny() {
		return apiresponse.ValidationError(c, errs)
	}

	uid, err := requestutil.UserID(c)
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	wishlistID, err := requestutil.ParamUUID(c, "id")
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}

	link := &purchaseLink.PurchaseLink{Label: req.Label, URL: req.URL}
	if err := h.service.Wishlist.AddLink(c.Context(), uid, wishlistID, link); err != nil {
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

	uid, err := requestutil.UserID(c)
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	wishlistID, err := requestutil.ParamUUID(c, "id")
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	linkID, err := requestutil.ParamUUID(c, "linkId")
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}

	link, err := h.service.Wishlist.UpdateLink(c.Context(), uid, wishlistID, linkID, req.Label, req.URL)
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}

	return apiresponse.OK(c, link, nil)
}

func (h *WishlistController) DeleteLink(c *fiber.Ctx) error {
	uid, err := requestutil.UserID(c)
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	wishlistID, err := requestutil.ParamUUID(c, "id")
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	linkID, err := requestutil.ParamUUID(c, "linkId")
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}

	if err := h.service.Wishlist.DeleteLink(c.Context(), uid, wishlistID, linkID); err != nil {
		return apiErrCode.RespondError(c, err)
	}

	return apiresponse.OK(c, fiber.Map{"message": "deleted"}, nil)
}
