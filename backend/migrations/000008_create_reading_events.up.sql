CREATE TABLE reading_events (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  book_id CHAR(36) NOT NULL,
  event_date DATE NOT NULL,
  event_type VARCHAR(32) NOT NULL,
  pages_delta INT NOT NULL DEFAULT 0,
  completed_delta INT NOT NULL DEFAULT 0,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX idx_reading_events_user_id (user_id),
  INDEX idx_reading_events_book_id (book_id),
  INDEX idx_reading_events_event_date (event_date),
  INDEX idx_reading_events_event_type (event_type),
  CONSTRAINT fk_reading_events_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_reading_events_book FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);
