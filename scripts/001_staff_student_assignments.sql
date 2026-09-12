CREATE TABLE IF NOT EXISTS staff_student_assignments (
  staff_id bigint NOT NULL REFERENCES staff_users(id) ON DELETE CASCADE,
  student_id varchar(50) NOT NULL REFERENCES users(student_id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (staff_id, student_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE
ON staff_student_assignments
TO mars_app;
