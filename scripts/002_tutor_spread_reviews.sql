CREATE TABLE IF NOT EXISTS tutor_spread_reviews (
  id BIGSERIAL PRIMARY KEY,
  student_id VARCHAR(50) NOT NULL REFERENCES users(student_id) ON DELETE CASCADE,
  staff_id BIGINT NOT NULL REFERENCES staff_users(id) ON DELETE CASCADE,
  planner_type VARCHAR(20) NOT NULL,
  page INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT '',
  comment TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, staff_id, planner_type, page)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON tutor_spread_reviews TO mars_app;
GRANT USAGE, SELECT ON SEQUENCE tutor_spread_reviews_id_seq TO mars_app;
