package bookController

import (
	"negar-backend/services/auditService"
	"negar-backend/services/bookService"
	"negar-backend/statics/constants"
)

type ServiceBridge struct {
	Book  *bookService.Service
	Audit *auditService.Service
}

type BookController struct{ service *ServiceBridge }

var allowedBookSort = map[string]struct{}{
	"title":       {},
	"author":      {},
	"created_at":  {},
	"updated_at":  {},
	"status":      {},
	"total_pages": {},
}

var allowedBookStatus = map[string]struct{}{
	constants.BookStatusInLibrary:     {},
	constants.BookStatusCurrentlyRead: {},
	constants.BookStatusFinished:      {},
	constants.BookStatusNextToRead:    {},
}

func NewBookController(service *ServiceBridge) *BookController {
	return &BookController{service: service}
}
