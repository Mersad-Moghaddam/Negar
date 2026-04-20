package wishlistController

import (
	"negar-backend/services/auditService"
	"negar-backend/services/wishlistService"
)

type ServiceBridge struct {
	Wishlist *wishlistService.Service
	Audit    *auditService.Service
}

type WishlistController struct{ service *ServiceBridge }

var allowedWishlistSort = map[string]struct{}{
	"title":      {},
	"created_at": {},
	"updated_at": {},
}

func NewWishlistController(service *ServiceBridge) *WishlistController {
	return &WishlistController{service: service}
}
