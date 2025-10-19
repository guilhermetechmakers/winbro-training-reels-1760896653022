-- =====================================================
-- Migration: Create Quiz Attempts Table
-- Created: 2024-12-20T16:00:00Z
-- Tables: quiz_attempts
-- Purpose: Track user quiz attempts and results
-- =====================================================

-- Enable UUID extension (idempotent)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Helper function for updated_at (idempotent)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TABLE: quiz_attempts
-- Purpose: Track individual quiz attempts and results
-- =====================================================
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  quiz_id UUID REFERENCES course_quizzes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  module_id UUID REFERENCES course_modules(id) ON DELETE CASCADE,
  
  -- Attempt details
  answers JSONB DEFAULT '[]'::jsonb, -- Array of answer objects
  score INTEGER DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  total_points INTEGER DEFAULT 0 CHECK (total_points >= 0),
  earned_points INTEGER DEFAULT 0 CHECK (earned_points >= 0),
  time_spent INTEGER DEFAULT 0 CHECK (time_spent >= 0), -- in seconds
  completed_at TIMESTAMPTZ,
  
  -- Attempt status
  status TEXT DEFAULT 'in-progress' CHECK (status IN ('in-progress', 'completed', 'abandoned')),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT quiz_attempts_earned_points_not_exceed_total CHECK (earned_points <= total_points)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS quiz_attempts_quiz_id_idx ON quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS quiz_attempts_user_id_idx ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS quiz_attempts_course_id_idx ON quiz_attempts(course_id);
CREATE INDEX IF NOT EXISTS quiz_attempts_module_id_idx ON quiz_attempts(module_id);
CREATE INDEX IF NOT EXISTS quiz_attempts_status_idx ON quiz_attempts(status);
CREATE INDEX IF NOT EXISTS quiz_attempts_completed_at_idx ON quiz_attempts(completed_at DESC);
CREATE INDEX IF NOT EXISTS quiz_attempts_score_idx ON quiz_attempts(score);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_quiz_attempts_updated_at ON quiz_attempts;
CREATE TRIGGER update_quiz_attempts_updated_at
  BEFORE UPDATE ON quiz_attempts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own attempts
CREATE POLICY "quiz_attempts_select_own"
  ON quiz_attempts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "quiz_attempts_insert_own"
  ON quiz_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "quiz_attempts_update_own"
  ON quiz_attempts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "quiz_attempts_delete_own"
  ON quiz_attempts FOR DELETE
  USING (auth.uid() = user_id);

-- Documentation
COMMENT ON TABLE quiz_attempts IS 'Individual quiz attempts and results';
COMMENT ON COLUMN quiz_attempts.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN quiz_attempts.quiz_id IS 'Quiz being attempted (references course_quizzes)';
COMMENT ON COLUMN quiz_attempts.user_id IS 'User making the attempt (references auth.users)';
COMMENT ON COLUMN quiz_attempts.course_id IS 'Course containing the quiz (references courses)';
COMMENT ON COLUMN quiz_attempts.module_id IS 'Module containing the quiz (references course_modules)';
COMMENT ON COLUMN quiz_attempts.answers IS 'JSON array of answer objects with questionId, answer, isCorrect, timeSpent, submittedAt';
COMMENT ON COLUMN quiz_attempts.score IS 'Final score percentage (0-100)';
COMMENT ON COLUMN quiz_attempts.total_points IS 'Total possible points for the quiz';
COMMENT ON COLUMN quiz_attempts.earned_points IS 'Points earned by the user';
COMMENT ON COLUMN quiz_attempts.time_spent IS 'Total time spent on quiz in seconds';
COMMENT ON COLUMN quiz_attempts.status IS 'Attempt status: in-progress, completed, abandoned';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS quiz_attempts CASCADE;