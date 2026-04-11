package validation

import (
	"fmt"
	"strings"
)

type Errors map[string]string

func (e Errors) Add(field, reason string) {
	if _, exists := e[field]; !exists {
		e[field] = reason
	}
}

func (e Errors) HasAny() bool { return len(e) > 0 }

func Required(value, field string, errs Errors) string {
	trimmed := strings.TrimSpace(value)
	if trimmed == "" {
		errs.Add(field, "is required")
	}
	return trimmed
}

func StringLength(value, field string, min, max int, errs Errors) {
	l := len(value)
	if l < min || l > max {
		errs.Add(field, fmt.Sprintf("length must be between %d and %d", min, max))
	}
}

func Enum(value, field string, options map[string]struct{}, errs Errors) {
	if _, ok := options[value]; !ok {
		errs.Add(field, "invalid value")
	}
}

func MinInt(value int, field string, min int, errs Errors) {
	if value < min {
		errs.Add(field, fmt.Sprintf("must be >= %d", min))
	}
}

func MinFloat(value float64, field string, min float64, errs Errors) {
	if value < min {
		errs.Add(field, fmt.Sprintf("must be >= %.2f", min))
	}
}
