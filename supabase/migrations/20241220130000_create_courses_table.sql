-- =====================================================
-- Migration: Create Courses and Related Tables
-- Created: 2024-12-20T13:00:00Z
-- Tables: courses, course_modules, course_quizzes, course_enrollments, course_completions
-- Purpose: Enable course creation, management, and tracking
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
-- TABLE: courses
-- Purpose: Store course metadata and configuration
-- =====================================================
CREATE TABLE IF NOT EXISTS courses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Core course fields
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  
  -- Course configuration
  difficulty_level TEXT DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  visibility TEXT DEFAULT 'private' CHECK (visibility IN ('private', 'public', 'organization')),
  customer_scope TEXT[] DEFAULT '{}',
  
  -- Course settings
  requires_approval BOOLEAN DEFAULT false,
  allow_downloads BOOLEAN DEFAULT false,
  enable_certificates BOOLEAN DEFAULT true,
  pass_threshold INTEGER DEFAULT 80 CHECK (pass_threshold >= 0 AND pass_threshold <= 100),
  
  -- Calculated fields
  total_duration INTEGER DEFAULT 0, -- in seconds
  enrolled_count INTEGER DEFAULT 0,
  
  -- Flexible metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT courses_title_not_empty CHECK (length(trim(title)) > 0),
  CONSTRAINT courses_description_length CHECK (length(description) <= 2000)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS courses_user_id_idx ON courses(user_id);
CREATE INDEX IF NOT EXISTS courses_status_idx ON courses(status) WHERE status != 'archived';
CREATE INDEX IF NOT EXISTS courses_visibility_idx ON courses(visibility);
CREATE INDEX IF NOT EXISTS courses_created_at_idx ON courses(created_at DESC);
CREATE INDEX IF NOT EXISTS courses_difficulty_level_idx ON courses(difficulty_level);
CREATE INDEX IF NOT EXISTS courses_tags_idx ON courses USING GIN(tags);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_courses_updated_at ON courses;
CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own courses or public courses
CREATE POLICY "courses_select_own_and_public"
  ON courses FOR SELECT
  USING (
    auth.uid() = user_id OR 
    visibility = 'public' OR 
    (visibility = 'organization' AND EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() AND organization_id = (
        SELECT organization_id FROM user_profiles WHERE user_id = courses.user_id
      )
    ))
  );

CREATE POLICY "courses_insert_own"
  ON courses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "courses_update_own"
  ON courses FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "courses_delete_own"
  ON courses FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- TABLE: course_modules
-- Purpose: Store course modules (reels, text, quizzes)
-- =====================================================
CREATE TABLE IF NOT EXISTS course_modules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  
  -- Module content
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('reel', 'text', 'quiz')),
  content_id UUID, -- references videos.id for reels, course_quizzes.id for quizzes
  content_data JSONB DEFAULT '{}'::jsonb, -- for text modules and other content
  
  -- Module configuration
  order_index INTEGER NOT NULL,
  estimated_duration INTEGER DEFAULT 0, -- in seconds
  is_required BOOLEAN DEFAULT true,
  unlock_after_previous BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT course_modules_title_not_empty CHECK (length(trim(title)) > 0),
  CONSTRAINT course_modules_order_positive CHECK (order_index >= 0),
  CONSTRAINT course_modules_duration_positive CHECK (estimated_duration >= 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS course_modules_course_id_idx ON course_modules(course_id);
CREATE INDEX IF NOT EXISTS course_modules_order_idx ON course_modules(course_id, order_index);
CREATE INDEX IF NOT EXISTS course_modules_type_idx ON course_modules(type);
CREATE INDEX IF NOT EXISTS course_modules_content_id_idx ON course_modules(content_id) WHERE content_id IS NOT NULL;

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_course_modules_updated_at ON course_modules;
CREATE TRIGGER update_course_modules_updated_at
  BEFORE UPDATE ON course_modules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE course_modules ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Inherit from parent course
CREATE POLICY "course_modules_select_course_access"
  ON course_modules FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM courses 
    WHERE id = course_modules.course_id AND (
      auth.uid() = user_id OR 
      visibility = 'public' OR 
      (visibility = 'organization' AND EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_id = auth.uid() AND organization_id = (
          SELECT organization_id FROM user_profiles WHERE user_id = courses.user_id
        )
      ))
    )
  ));

CREATE POLICY "course_modules_insert_course_owner"
  ON course_modules FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM courses 
    WHERE id = course_modules.course_id AND auth.uid() = user_id
  ));

CREATE POLICY "course_modules_update_course_owner"
  ON course_modules FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM courses 
    WHERE id = course_modules.course_id AND auth.uid() = user_id
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM courses 
    WHERE id = course_modules.course_id AND auth.uid() = user_id
  ));

CREATE POLICY "course_modules_delete_course_owner"
  ON course_modules FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM courses 
    WHERE id = course_modules.course_id AND auth.uid() = user_id
  ));

-- =====================================================
-- TABLE: course_quizzes
-- Purpose: Store quiz questions and answers
-- =====================================================
CREATE TABLE IF NOT EXISTS course_quizzes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  module_id UUID REFERENCES course_modules(id) ON DELETE CASCADE,
  
  -- Quiz content
  question TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('multiple-choice', 'true-false', 'short-answer')),
  options TEXT[] DEFAULT '{}', -- for multiple choice
  correct_answer TEXT NOT NULL, -- single answer or comma-separated for multiple correct
  explanation TEXT,
  
  -- Quiz configuration
  points INTEGER DEFAULT 1 CHECK (points > 0),
  time_limit INTEGER, -- in seconds, null for no limit
  order_index INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT course_quizzes_question_not_empty CHECK (length(trim(question)) > 0),
  CONSTRAINT course_quizzes_correct_answer_not_empty CHECK (length(trim(correct_answer)) > 0),
  CONSTRAINT course_quizzes_time_limit_positive CHECK (time_limit IS NULL OR time_limit > 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS course_quizzes_course_id_idx ON course_quizzes(course_id);
CREATE INDEX IF NOT EXISTS course_quizzes_module_id_idx ON course_quizzes(module_id);
CREATE INDEX IF NOT EXISTS course_quizzes_type_idx ON course_quizzes(type);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_course_quizzes_updated_at ON course_quizzes;
CREATE TRIGGER update_course_quizzes_updated_at
  BEFORE UPDATE ON course_quizzes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE course_quizzes ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Inherit from parent course
CREATE POLICY "course_quizzes_select_course_access"
  ON course_quizzes FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM courses 
    WHERE id = course_quizzes.course_id AND (
      auth.uid() = user_id OR 
      visibility = 'public' OR 
      (visibility = 'organization' AND EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_id = auth.uid() AND organization_id = (
          SELECT organization_id FROM user_profiles WHERE user_id = courses.user_id
        )
      ))
    )
  ));

CREATE POLICY "course_quizzes_insert_course_owner"
  ON course_quizzes FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM courses 
    WHERE id = course_quizzes.course_id AND auth.uid() = user_id
  ));

CREATE POLICY "course_quizzes_update_course_owner"
  ON course_quizzes FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM courses 
    WHERE id = course_quizzes.course_id AND auth.uid() = user_id
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM courses 
    WHERE id = course_quizzes.course_id AND auth.uid() = user_id
  ));

CREATE POLICY "course_quizzes_delete_course_owner"
  ON course_quizzes FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM courses 
    WHERE id = course_quizzes.course_id AND auth.uid() = user_id
  ));

-- =====================================================
-- TABLE: course_enrollments
-- Purpose: Track user enrollments and progress
-- =====================================================
CREATE TABLE IF NOT EXISTS course_enrollments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Enrollment details
  enrolled_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMPTZ,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  score INTEGER, -- final score if completed
  last_accessed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT course_enrollments_unique_user_course UNIQUE (course_id, user_id),
  CONSTRAINT course_enrollments_score_range CHECK (score IS NULL OR (score >= 0 AND score <= 100))
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS course_enrollments_course_id_idx ON course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS course_enrollments_user_id_idx ON course_enrollments(user_id);
CREATE INDEX IF NOT EXISTS course_enrollments_progress_idx ON course_enrollments(progress_percentage);
CREATE INDEX IF NOT EXISTS course_enrollments_completed_idx ON course_enrollments(completed_at) WHERE completed_at IS NOT NULL;

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_course_enrollments_updated_at ON course_enrollments;
CREATE TRIGGER update_course_enrollments_updated_at
  BEFORE UPDATE ON course_enrollments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own enrollments
CREATE POLICY "course_enrollments_select_own"
  ON course_enrollments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "course_enrollments_insert_own"
  ON course_enrollments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "course_enrollments_update_own"
  ON course_enrollments FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "course_enrollments_delete_own"
  ON course_enrollments FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- TABLE: course_completions
-- Purpose: Track individual module completions
-- =====================================================
CREATE TABLE IF NOT EXISTS course_completions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  enrollment_id UUID REFERENCES course_enrollments(id) ON DELETE CASCADE NOT NULL,
  module_id UUID REFERENCES course_modules(id) ON DELETE CASCADE NOT NULL,
  
  -- Completion details
  completed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  score INTEGER, -- score for this module
  time_spent INTEGER DEFAULT 0, -- in seconds
  attempts INTEGER DEFAULT 1 CHECK (attempts > 0),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT course_completions_unique_enrollment_module UNIQUE (enrollment_id, module_id),
  CONSTRAINT course_completions_score_range CHECK (score IS NULL OR (score >= 0 AND score <= 100)),
  CONSTRAINT course_completions_time_positive CHECK (time_spent >= 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS course_completions_enrollment_id_idx ON course_completions(enrollment_id);
CREATE INDEX IF NOT EXISTS course_completions_module_id_idx ON course_completions(module_id);
CREATE INDEX IF NOT EXISTS course_completions_completed_at_idx ON course_completions(completed_at DESC);

-- Enable Row Level Security
ALTER TABLE course_completions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Inherit from enrollment
CREATE POLICY "course_completions_select_enrollment_access"
  ON course_completions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM course_enrollments 
    WHERE id = course_completions.enrollment_id AND auth.uid() = user_id
  ));

CREATE POLICY "course_completions_insert_enrollment_access"
  ON course_completions FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM course_enrollments 
    WHERE id = course_completions.enrollment_id AND auth.uid() = user_id
  ));

CREATE POLICY "course_completions_update_enrollment_access"
  ON course_completions FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM course_enrollments 
    WHERE id = course_completions.enrollment_id AND auth.uid() = user_id
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM course_enrollments 
    WHERE id = course_completions.enrollment_id AND auth.uid() = user_id
  ));

CREATE POLICY "course_completions_delete_enrollment_access"
  ON course_completions FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM course_enrollments 
    WHERE id = course_completions.enrollment_id AND auth.uid() = user_id
  ));

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update course total duration
CREATE OR REPLACE FUNCTION update_course_duration()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE courses 
  SET total_duration = (
    SELECT COALESCE(SUM(estimated_duration), 0)
    FROM course_modules 
    WHERE course_id = COALESCE(NEW.course_id, OLD.course_id)
  )
  WHERE id = COALESCE(NEW.course_id, OLD.course_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update course duration when modules change
DROP TRIGGER IF EXISTS update_course_duration_trigger ON course_modules;
CREATE TRIGGER update_course_duration_trigger
  AFTER INSERT OR UPDATE OR DELETE ON course_modules
  FOR EACH ROW
  EXECUTE FUNCTION update_course_duration();

-- Function to update course enrollment count
CREATE OR REPLACE FUNCTION update_course_enrollment_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE courses 
  SET enrolled_count = (
    SELECT COUNT(*)
    FROM course_enrollments 
    WHERE course_id = COALESCE(NEW.course_id, OLD.course_id)
  )
  WHERE id = COALESCE(NEW.course_id, OLD.course_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update enrollment count
DROP TRIGGER IF EXISTS update_course_enrollment_count_trigger ON course_enrollments;
CREATE TRIGGER update_course_enrollment_count_trigger
  AFTER INSERT OR DELETE ON course_enrollments
  FOR EACH ROW
  EXECUTE FUNCTION update_course_enrollment_count();

-- =====================================================
-- DOCUMENTATION
-- =====================================================
COMMENT ON TABLE courses IS 'Course metadata and configuration';
COMMENT ON COLUMN courses.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN courses.user_id IS 'Course author (references auth.users)';
COMMENT ON COLUMN courses.title IS 'Course title (required)';
COMMENT ON COLUMN courses.description IS 'Course description (max 2000 chars)';
COMMENT ON COLUMN courses.status IS 'Course status: draft, published, archived';
COMMENT ON COLUMN courses.difficulty_level IS 'Course difficulty: beginner, intermediate, advanced';
COMMENT ON COLUMN courses.visibility IS 'Course visibility: private, public, organization';
COMMENT ON COLUMN courses.pass_threshold IS 'Minimum score percentage to pass (0-100)';
COMMENT ON COLUMN courses.total_duration IS 'Total course duration in seconds (calculated)';
COMMENT ON COLUMN courses.enrolled_count IS 'Number of enrolled users (calculated)';

COMMENT ON TABLE course_modules IS 'Course modules (reels, text, quizzes)';
COMMENT ON COLUMN course_modules.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN course_modules.course_id IS 'Parent course (references courses)';
COMMENT ON COLUMN course_modules.type IS 'Module type: reel, text, quiz';
COMMENT ON COLUMN course_modules.content_id IS 'References videos.id for reels, course_quizzes.id for quizzes';
COMMENT ON COLUMN course_modules.order_index IS 'Module order within course (0-based)';
COMMENT ON COLUMN course_modules.estimated_duration IS 'Module duration in seconds';

COMMENT ON TABLE course_quizzes IS 'Quiz questions and answers';
COMMENT ON COLUMN course_quizzes.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN course_quizzes.course_id IS 'Parent course (references courses)';
COMMENT ON COLUMN course_quizzes.module_id IS 'Parent module (references course_modules)';
COMMENT ON COLUMN course_quizzes.type IS 'Question type: multiple-choice, true-false, short-answer';
COMMENT ON COLUMN course_quizzes.options IS 'Answer options for multiple choice questions';
COMMENT ON COLUMN course_quizzes.correct_answer IS 'Correct answer(s) - comma-separated for multiple correct';

COMMENT ON TABLE course_enrollments IS 'User course enrollments and progress';
COMMENT ON COLUMN course_enrollments.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN course_enrollments.course_id IS 'Enrolled course (references courses)';
COMMENT ON COLUMN course_enrollments.user_id IS 'Enrolled user (references auth.users)';
COMMENT ON COLUMN course_enrollments.progress_percentage IS 'Completion percentage (0-100)';
COMMENT ON COLUMN course_enrollments.score IS 'Final course score if completed';

COMMENT ON TABLE course_completions IS 'Individual module completions';
COMMENT ON COLUMN course_completions.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN course_completions.enrollment_id IS 'Enrollment (references course_enrollments)';
COMMENT ON COLUMN course_completions.module_id IS 'Completed module (references course_modules)';
COMMENT ON COLUMN course_completions.score IS 'Module score if applicable';
COMMENT ON COLUMN course_completions.time_spent IS 'Time spent on module in seconds';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS course_completions CASCADE;
-- DROP TABLE IF EXISTS course_enrollments CASCADE;
-- DROP TABLE IF EXISTS course_quizzes CASCADE;
-- DROP TABLE IF EXISTS course_modules CASCADE;
-- DROP TABLE IF EXISTS courses CASCADE;
-- DROP FUNCTION IF EXISTS update_course_duration();
-- DROP FUNCTION IF EXISTS update_course_enrollment_count();
