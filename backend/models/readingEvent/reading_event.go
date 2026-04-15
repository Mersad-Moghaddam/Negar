package readingEvent

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ReadingEvent struct {
	ID             uuid.UUID `gorm:"type:char(36);primaryKey" json:"id"`
	UserID         uuid.UUID `gorm:"type:char(36);index;not null" json:"userId"`
	BookID         uuid.UUID `gorm:"type:char(36);index;not null" json:"bookId"`
	EventDate      time.Time `gorm:"type:date;not null;index" json:"eventDate"`
	EventType      string    `gorm:"type:varchar(32);not null;index" json:"eventType"`
	PagesDelta     int       `gorm:"not null;default:0" json:"pagesDelta"`
	CompletedDelta int       `gorm:"not null;default:0" json:"completedDelta"`
	CreatedAt      time.Time `json:"createdAt"`
}

func (e *ReadingEvent) BeforeCreate(tx *gorm.DB) error {
	if e.ID == uuid.Nil {
		e.ID = uuid.New()
	}
	return nil
}
