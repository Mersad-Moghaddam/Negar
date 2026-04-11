package commonPagination

type Meta struct {
	Page    int   `json:"page"`
	Limit   int   `json:"limit"`
	Total   int64 `json:"total"`
	HasNext bool  `json:"hasNext"`
}
