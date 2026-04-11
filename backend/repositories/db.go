package repositories

import (
	"fmt"

	"gorm.io/gorm"
	"libro-backend/models/book"
	"libro-backend/models/purchaseLink"
	"libro-backend/models/user"
	"libro-backend/models/wishlist"
)

func AssertSchema(db *gorm.DB) error {
	for _, model := range []any{&user.User{}, &book.Book{}, &wishlist.Wishlist{}, &purchaseLink.PurchaseLink{}} {
		if !db.Migrator().HasTable(model) {
			return fmt.Errorf("missing table for model %T: run SQL migrations", model)
		}
	}
	return nil
}
