-- Campus Nutrition+ Database Schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Students table
CREATE TABLE IF NOT EXISTS students (
  id SERIAL PRIMARY KEY,
  roll_number VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  hostel VARCHAR(50) NOT NULL,
  room VARCHAR(10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_students_roll ON students(roll_number);

-- Admins table
CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  email VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);

-- Weekly menu template (repeats every week)
CREATE TABLE IF NOT EXISTS weekly_menu (
  id SERIAL PRIMARY KEY,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 1 AND 7), -- 1=Monday, 7=Sunday
  meal_type VARCHAR(20) NOT NULL CHECK (meal_type IN ('BREAKFAST', 'LUNCH', 'SNACKS', 'DINNER')),
  dishes JSONB NOT NULL,
  created_by INT REFERENCES admins(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(day_of_week, meal_type)
);

CREATE INDEX idx_weekly_menu_day_meal ON weekly_menu(day_of_week, meal_type);

-- Daily menu overrides (only when admin makes changes)
CREATE TABLE IF NOT EXISTS daily_overrides (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  meal_type VARCHAR(20) NOT NULL CHECK (meal_type IN ('BREAKFAST', 'LUNCH', 'SNACKS', 'DINNER')),
  removed_dishes TEXT[],
  added_dishes JSONB,
  created_by INT REFERENCES admins(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(date, meal_type)
);

CREATE INDEX idx_daily_overrides_date_meal ON daily_overrides(date, meal_type);

-- Feedback submissions
CREATE TABLE IF NOT EXISTS feedback (
  id SERIAL PRIMARY KEY,
  student_id INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  submission_date DATE NOT NULL,
  meal_type VARCHAR(20) NOT NULL CHECK (meal_type IN ('BREAKFAST', 'LUNCH', 'SNACKS', 'DINNER')),
  ratings JSONB NOT NULL, -- {dish_id: rating_value}
  wastage INT CHECK (wastage BETWEEN 0 AND 100),
  comments TEXT,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id, submission_date, meal_type)
);

CREATE INDEX idx_feedback_date_meal ON feedback(submission_date, meal_type);
CREATE INDEX idx_feedback_student ON feedback(student_id);

-- Analytics cache (for performance with 1000+ students)
CREATE TABLE IF NOT EXISTS daily_analytics (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  meal_type VARCHAR(20) NOT NULL,
  total_submissions INT DEFAULT 0,
  average_rating DECIMAL(3,2),
  average_wastage DECIMAL(5,2),
  top_rated_dishes JSONB,
  low_rated_dishes JSONB,
  total_students INT DEFAULT 0,
  participation_rate DECIMAL(5,2),
  calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(date, meal_type)
);

CREATE INDEX idx_analytics_date ON daily_analytics(date);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for weekly_menu
CREATE TRIGGER update_weekly_menu_updated_at 
  BEFORE UPDATE ON weekly_menu 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin (password: admin123)
INSERT INTO admins (username, password_hash, email) 
VALUES ('admin', '$2b$10$DnB/Zoxbqg88eJU6Wvfks.4nlFJN/qRZN7PDR.iTRDfdjwngEDuGm', 'admin@campus.edu')
ON CONFLICT (username) DO NOTHING;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Database schema created successfully!';
  RAISE NOTICE 'Tables: students, admins, weekly_menu, daily_overrides, feedback, daily_analytics';
  RAISE NOTICE 'Default admin created: username=admin, password=admin123 (CHANGE THIS!)';
END $$;


-- > const bcrypt = require("bcrypt");
-- undefined
-- > bcrypt.hash("admin123", 10).then(console.log);
