package wishlistController

import (
	"negar-backend/apiSchema/purchaseLinkSchema"
	"negar-backend/apiSchema/wishlistSchema"
	"negar-backend/pkg/validation"
)

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
