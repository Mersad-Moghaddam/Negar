package mainController

import (
	"testing"
	"time"

	"github.com/google/uuid"
	"libro-backend/models/book"
	"libro-backend/models/readingSession"
	"libro-backend/services/readingService"
	"libro-backend/statics/constants"
)

func TestBuildAnalyticsIntelligenceEmpty(t *testing.T) {
	t.Parallel()
	now := time.Date(2026, 4, 16, 10, 0, 0, 0, time.UTC)
	result := buildAnalyticsIntelligence(now, nil, nil, nil)
	if result.TotalReadingSessions != 0 || result.TotalPagesRead != 0 {
		t.Fatalf("expected zero metrics, got %+v", result)
	}
	if result.CurrentStreak != 0 || result.LongestStreak != 0 {
		t.Fatalf("expected no streaks, got current=%d longest=%d", result.CurrentStreak, result.LongestStreak)
	}
	if len(result.Insights) == 0 {
		t.Fatal("expected a fallback insight")
	}
}

func TestBuildAnalyticsIntelligenceDerivedMetrics(t *testing.T) {
	t.Parallel()
	now := time.Date(2026, 4, 16, 10, 0, 0, 0, time.UTC)
	cp1 := 90
	cp2 := 300
	finishedAt := now.AddDate(0, 0, -5)
	books := []book.Book{
		{ID: uuid.New(), Title: "Almost Done", TotalPages: 100, Status: constants.BookStatusCurrentlyRead, CurrentPage: &cp1, UpdatedAt: now.AddDate(0, 0, -1), CreatedAt: now.AddDate(0, -1, 0)},
		{ID: uuid.New(), Title: "Completed", TotalPages: 300, Status: constants.BookStatusFinished, CurrentPage: &cp2, CompletedAt: &finishedAt, UpdatedAt: finishedAt, CreatedAt: now.AddDate(0, -1, 0)},
	}
	sessions := []readingSession.ReadingSession{
		{BookID: books[0].ID, Date: now.AddDate(0, 0, -1), Duration: 30, PagesRead: 25},
		{BookID: books[0].ID, Date: now.AddDate(0, 0, -2), Duration: 20, PagesRead: 20},
		{BookID: books[1].ID, Date: now.AddDate(0, 0, -8), Duration: 40, PagesRead: 35},
	}
	goals := []readingService.GoalProgress{{Period: "weekly", PagesGoal: 100, PagesRead: 45, PagesPercent: 45}}
	result := buildAnalyticsIntelligence(now, books, sessions, goals)

	if result.TotalFinishedBooks != 1 {
		t.Fatalf("expected 1 finished book, got %d", result.TotalFinishedBooks)
	}
	if result.ActiveBooksCount != 1 {
		t.Fatalf("expected 1 active book, got %d", result.ActiveBooksCount)
	}
	if result.CompletionRateAcrossStarted != 50 {
		t.Fatalf("expected completion rate 50, got %d", result.CompletionRateAcrossStarted)
	}
	if len(result.BooksClosestToCompletion) == 0 || result.BooksClosestToCompletion[0].Title != "Almost Done" {
		t.Fatalf("expected near-finish book to be surfaced, got %+v", result.BooksClosestToCompletion)
	}
	if result.Trends.Last7Days.Pages.Current != 45 {
		t.Fatalf("expected current 7-day pages=45, got %d", result.Trends.Last7Days.Pages.Current)
	}
}
