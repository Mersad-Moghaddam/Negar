package mainController

import (
	"fmt"
	"math"
	"sort"
	"time"

	"libro-backend/models/book"
	"libro-backend/models/readingSession"
	"libro-backend/services/readingService"
	"libro-backend/statics/constants"
)

type trendDelta struct {
	Current   int    `json:"current"`
	Prev      int    `json:"prev"`
	Change    int    `json:"change"`
	Percent   int    `json:"percent"`
	Direction string `json:"direction"`
}

type sessionComparison struct {
	Sessions trendDelta `json:"sessions"`
	Pages    trendDelta `json:"pages"`
	Minutes  trendDelta `json:"minutes"`
}

type analyticsTrendComparison struct {
	Last7Days sessionComparison `json:"last7Days"`
	Month     sessionComparison `json:"month"`
}

type analyticsBookFocus struct {
	ID               string `json:"id"`
	Title            string `json:"title"`
	ProgressPercent  int    `json:"progressPercent"`
	RemainingPages   int    `json:"remainingPages"`
	LastActivityDays int    `json:"lastActivityDays,omitempty"`
}

type intelligenceInsight struct {
	Tone    string `json:"tone"`
	Message string `json:"message"`
}

type analyticsIntelligence struct {
	TotalReadingSessions        int                      `json:"totalReadingSessions"`
	TotalPagesRead              int                      `json:"totalPagesRead"`
	TotalFinishedBooks          int                      `json:"totalFinishedBooks"`
	ActiveBooksCount            int                      `json:"activeBooksCount"`
	DormantBooksCount           int                      `json:"dormantBooksCount"`
	AveragePagesPerSession      float64                  `json:"averagePagesPerSession"`
	AveragePagesPerActiveDay    float64                  `json:"averagePagesPerActiveDay"`
	CompletionRateAcrossStarted int                      `json:"completionRateAcrossStarted"`
	AverageCompletionVelocity   float64                  `json:"averageCompletionVelocity"`
	CurrentStreak               int                      `json:"currentStreak"`
	LongestStreak               int                      `json:"longestStreak"`
	WeeklyReadingMinutes        int                      `json:"weeklyReadingMinutes"`
	MonthlyReadingMinutes       int                      `json:"monthlyReadingMinutes"`
	SessionsThisWeek            int                      `json:"sessionsThisWeek"`
	SessionsThisMonth           int                      `json:"sessionsThisMonth"`
	BestReadingWeekday          string                   `json:"bestReadingWeekday,omitempty"`
	MostProductiveReadingWindow *string                  `json:"mostProductiveReadingWindow,omitempty"`
	BooksClosestToCompletion    []analyticsBookFocus     `json:"booksClosestToCompletion"`
	BooksAtRiskOfStagnation     []analyticsBookFocus     `json:"booksAtRiskOfStagnation"`
	Trends                      analyticsTrendComparison `json:"trends"`
	Insights                    []intelligenceInsight    `json:"insights"`
}

func buildAnalyticsIntelligence(now time.Time, books []book.Book, sessions []readingSession.ReadingSession, goals []readingService.GoalProgress) analyticsIntelligence {
	dayKey := func(t time.Time) string { return t.Format("2006-01-02") }
	startOfDay := func(t time.Time) time.Time { return time.Date(t.Year(), t.Month(), t.Day(), 0, 0, 0, 0, t.Location()) }
	weekStart, _ := weekWindowMain(now)
	monthStart, _ := monthWindowMain(now)
	prevMonthStart := monthStart.AddDate(0, -1, 0)
	prevMonthEnd := monthStart.AddDate(0, 0, -1)
	last7Start := startOfDay(now).AddDate(0, 0, -6)
	prev7Start := last7Start.AddDate(0, 0, -7)
	prev7End := last7Start.AddDate(0, 0, -1)

	totalPages := 0
	activeDays := map[string]struct{}{}
	daySessions := map[string]int{}
	weekdayCount := map[time.Weekday]int{}
	windowStats := map[string]int{"night": 0, "morning": 0, "afternoon": 0, "evening": 0}
	weeklyMinutes := 0
	monthlyMinutes := 0
	sessionsThisWeek := 0
	sessionsThisMonth := 0
	last7 := aggregateSessionsInRange(sessions, last7Start, now)
	prev7 := aggregateSessionsInRange(sessions, prev7Start, prev7End)
	thisMonth := aggregateSessionsInRange(sessions, monthStart, now)
	prevMonth := aggregateSessionsInRange(sessions, prevMonthStart, prevMonthEnd)
	bookLastActivity := map[string]time.Time{}

	for _, ses := range sessions {
		totalPages += maxInt(0, ses.PagesRead)
		key := dayKey(ses.Date)
		activeDays[key] = struct{}{}
		daySessions[key] += maxInt(0, ses.PagesRead)
		weekdayCount[ses.Date.Weekday()] += 1
		bookLastActivity[ses.BookID.String()] = maxTime(bookLastActivity[ses.BookID.String()], ses.Date)
		if !ses.Date.Before(weekStart) && !ses.Date.After(now) {
			sessionsThisWeek += 1
		}
		if !ses.Date.Before(monthStart) && !ses.Date.After(now) {
			sessionsThisMonth += 1
		}
		if !ses.Date.Before(last7Start) && !ses.Date.After(now) {
			weeklyMinutes += maxInt(0, ses.Duration)
		}
		if !ses.Date.Before(now.AddDate(0, 0, -29)) && !ses.Date.After(now) {
			monthlyMinutes += maxInt(0, ses.Duration)
		}
		hour := ses.Date.Hour()
		if hour != 0 || ses.Date.Minute() != 0 || ses.Date.Second() != 0 {
			switch {
			case hour < 6:
				windowStats["night"]++
			case hour < 12:
				windowStats["morning"]++
			case hour < 18:
				windowStats["afternoon"]++
			default:
				windowStats["evening"]++
			}
		}
	}

	totalFinished := 0
	activeBooks := 0
	started := 0
	dormant := 0
	velocitySum := 0.0
	velocityCount := 0
	closest := make([]analyticsBookFocus, 0)
	stalled := make([]analyticsBookFocus, 0)
	for _, b := range books {
		if b.Status == constants.BookStatusFinished {
			totalFinished++
		}
		if b.Status == constants.BookStatusCurrentlyRead || b.Status == constants.BookStatusFinished {
			started++
		}
		if b.Status == constants.BookStatusCurrentlyRead {
			activeBooks++
			current := 0
			if b.CurrentPage != nil {
				current = *b.CurrentPage
			}
			remaining := b.TotalPages - current
			if remaining < 0 {
				remaining = 0
			}
			progress := 0
			if b.TotalPages > 0 {
				progress = int(math.Round(float64(current) / float64(b.TotalPages) * 100))
			}
			focus := analyticsBookFocus{ID: b.ID.String(), Title: b.Title, ProgressPercent: progress, RemainingPages: remaining}
			closest = append(closest, focus)
			lastActivity := maxTime(bookLastActivity[b.ID.String()], b.UpdatedAt)
			if !lastActivity.IsZero() {
				days := int(startOfDay(now).Sub(startOfDay(lastActivity)).Hours() / 24)
				if days >= 10 {
					focus.LastActivityDays = days
					stalled = append(stalled, focus)
				}
				if days >= 14 {
					dormant++
				}
			}
		}
		if b.CompletedAt != nil && b.TotalPages > 0 {
			days := int(startOfDay(*b.CompletedAt).Sub(startOfDay(b.CreatedAt)).Hours() / 24)
			if days < 1 {
				days = 1
			}
			velocitySum += float64(b.TotalPages) / float64(days)
			velocityCount++
		}
	}

	sort.Slice(closest, func(i, j int) bool {
		if closest[i].RemainingPages == closest[j].RemainingPages {
			return closest[i].ProgressPercent > closest[j].ProgressPercent
		}
		return closest[i].RemainingPages < closest[j].RemainingPages
	})
	sort.Slice(stalled, func(i, j int) bool { return stalled[i].LastActivityDays > stalled[j].LastActivityDays })
	closest = topN(closest, 3)
	stalled = topN(stalled, 3)

	currentStreak, longestStreak := streaksFromDays(activeDays, now)
	avgPerSession := roundTo(totalPages, len(sessions))
	avgPerDay := roundTo(totalPages, len(activeDays))
	completionRate := percent(totalFinished, started)
	avgVelocity := 0.0
	if velocityCount > 0 {
		avgVelocity = math.Round((velocitySum/float64(velocityCount))*10) / 10
	}
	bestWeekday := ""
	bestWeekdayCount := 0
	for weekday, count := range weekdayCount {
		if count > bestWeekdayCount {
			bestWeekdayCount = count
			bestWeekday = weekday.String()
		}
	}

	window := dominantWindow(windowStats)
	insights := generateInsights(totalFinished, closest, stalled, last7, prev7, bestWeekday, goals)

	return analyticsIntelligence{
		TotalReadingSessions:        len(sessions),
		TotalPagesRead:              totalPages,
		TotalFinishedBooks:          totalFinished,
		ActiveBooksCount:            activeBooks,
		DormantBooksCount:           dormant,
		AveragePagesPerSession:      avgPerSession,
		AveragePagesPerActiveDay:    avgPerDay,
		CompletionRateAcrossStarted: completionRate,
		AverageCompletionVelocity:   avgVelocity,
		CurrentStreak:               currentStreak,
		LongestStreak:               longestStreak,
		WeeklyReadingMinutes:        weeklyMinutes,
		MonthlyReadingMinutes:       monthlyMinutes,
		SessionsThisWeek:            sessionsThisWeek,
		SessionsThisMonth:           sessionsThisMonth,
		BestReadingWeekday:          bestWeekday,
		MostProductiveReadingWindow: window,
		BooksClosestToCompletion:    closest,
		BooksAtRiskOfStagnation:     stalled,
		Trends: analyticsTrendComparison{
			Last7Days: sessionComparison{Sessions: buildDelta(last7.sessions, prev7.sessions), Pages: buildDelta(last7.pages, prev7.pages), Minutes: buildDelta(last7.minutes, prev7.minutes)},
			Month:     sessionComparison{Sessions: buildDelta(thisMonth.sessions, prevMonth.sessions), Pages: buildDelta(thisMonth.pages, prevMonth.pages), Minutes: buildDelta(thisMonth.minutes, prevMonth.minutes)},
		},
		Insights: insights,
	}
}

type sessionAgg struct{ sessions, pages, minutes int }

func aggregateSessionsInRange(sessions []readingSession.ReadingSession, from, to time.Time) sessionAgg {
	agg := sessionAgg{}
	for _, ses := range sessions {
		if ses.Date.Before(from) || ses.Date.After(to) {
			continue
		}
		agg.sessions++
		agg.pages += maxInt(0, ses.PagesRead)
		agg.minutes += maxInt(0, ses.Duration)
	}
	return agg
}

func buildDelta(current, prev int) trendDelta {
	change := current - prev
	pct := 0
	if prev > 0 {
		pct = int(math.Round((float64(change) / float64(prev)) * 100))
	} else if current > 0 {
		pct = 100
	}
	direction := "flat"
	if change > 0 {
		direction = "up"
	} else if change < 0 {
		direction = "down"
	}
	return trendDelta{Current: current, Prev: prev, Change: change, Percent: pct, Direction: direction}
}

func streaksFromDays(daySet map[string]struct{}, now time.Time) (int, int) {
	if len(daySet) == 0 {
		return 0, 0
	}
	dayList := make([]time.Time, 0, len(daySet))
	for key := range daySet {
		if d, err := time.Parse("2006-01-02", key); err == nil {
			dayList = append(dayList, d)
		}
	}
	if len(dayList) == 0 {
		return 0, 0
	}
	sort.Slice(dayList, func(i, j int) bool { return dayList[i].Before(dayList[j]) })
	longest := 1
	currentRun := 1
	for i := 1; i < len(dayList); i++ {
		diff := int(dayList[i].Sub(dayList[i-1]).Hours() / 24)
		if diff == 1 {
			currentRun++
		} else if diff > 1 {
			if currentRun > longest {
				longest = currentRun
			}
			currentRun = 1
		}
	}
	if currentRun > longest {
		longest = currentRun
	}

	end := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	latest := dayList[len(dayList)-1]
	if int(end.Sub(latest).Hours()/24) > 1 {
		return 0, longest
	}
	streak := 0
	for {
		if _, ok := daySet[end.Format("2006-01-02")]; !ok {
			break
		}
		streak++
		end = end.AddDate(0, 0, -1)
	}
	return streak, longest
}

func dominantWindow(stats map[string]int) *string {
	bestCount := 0
	best := ""
	labels := map[string]string{"night": "Night", "morning": "Morning", "afternoon": "Afternoon", "evening": "Evening"}
	for k, count := range stats {
		if count > bestCount {
			bestCount = count
			best = labels[k]
		}
	}
	if bestCount == 0 {
		return nil
	}
	return &best
}

func generateInsights(totalFinished int, closest []analyticsBookFocus, stalled []analyticsBookFocus, last7, prev7 sessionAgg, bestWeekday string, goals []readingService.GoalProgress) []intelligenceInsight {
	items := make([]intelligenceInsight, 0, 6)
	if len(closest) > 0 {
		items = append(items, intelligenceInsight{Tone: "positive", Message: fmt.Sprintf("You are close to finishing %s.", closest[0].Title)})
	}
	if last7.pages < prev7.pages && prev7.pages > 0 {
		items = append(items, intelligenceInsight{Tone: "warning", Message: "Your weekly activity is down compared with last week."})
	}
	if bestWeekday != "" {
		items = append(items, intelligenceInsight{Tone: "pattern", Message: fmt.Sprintf("You read most consistently on %s.", bestWeekday)})
	}
	if len(stalled) > 0 {
		items = append(items, intelligenceInsight{Tone: "nudge", Message: fmt.Sprintf("%d book(s) look stalled. A short session can restart momentum.", len(stalled))})
	}
	if last7.sessions > prev7.sessions && last7.sessions >= 2 {
		items = append(items, intelligenceInsight{Tone: "positive", Message: "Your average session volume is improving week over week."})
	}
	for _, g := range goals {
		if g.Period == "weekly" && g.PagesGoal > 0 {
			if g.PagesPercent >= 100 {
				items = append(items, intelligenceInsight{Tone: "goal", Message: "You are ahead of your weekly goal."})
			} else if g.PagesPercent < 60 {
				items = append(items, intelligenceInsight{Tone: "goal", Message: "You are behind your weekly goal. A 20-minute session today can help."})
			}
		}
	}
	if len(items) == 0 {
		if totalFinished == 0 {
			items = append(items, intelligenceInsight{Tone: "neutral", Message: "Start with one focused reading session to unlock personalized insights."})
		} else {
			items = append(items, intelligenceInsight{Tone: "neutral", Message: "Your reading routine is stable. Keep logging sessions for deeper insights."})
		}
	}
	return topN(items, 5)
}

func percent(n, d int) int {
	if d <= 0 {
		return 0
	}
	return int(math.Round(float64(n) / float64(d) * 100))
}

func roundTo(total, count int) float64 {
	if count <= 0 {
		return 0
	}
	return math.Round((float64(total)/float64(count))*10) / 10
}

func maxInt(a, b int) int {
	if a > b {
		return a
	}
	return b
}

func maxTime(a, b time.Time) time.Time {
	if a.IsZero() {
		return b
	}
	if b.After(a) {
		return b
	}
	return a
}

func topN[T any](items []T, n int) []T {
	if len(items) <= n {
		return items
	}
	return items[:n]
}

func weekWindowMain(now time.Time) (time.Time, time.Time) {
	weekday := int(now.Weekday())
	if weekday == 0 {
		weekday = 7
	}
	start := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location()).AddDate(0, 0, -(weekday - 1))
	return start, start.AddDate(0, 0, 6)
}

func monthWindowMain(now time.Time) (time.Time, time.Time) {
	start := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
	return start, start.AddDate(0, 1, -1)
}
