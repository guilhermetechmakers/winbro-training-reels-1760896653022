-- =====================================================
-- Migration: Create Certificates and Enhanced Quiz Features
-- Created: 2024-12-21T15:00:00Z
-- Tables: certificates, quiz_configurations, learning_analytics
-- Purpose: Enable certificate generation and enhanced interactive learning features
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
-- TABLE: certificates
-- Purpose: Store generated certificates for course completions
-- =====================================================
CREATE TABLE IF NOT EXISTS certificates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  enrollment_id UUID REFERENCES course_enrollments(id) ON DELETE CASCADE NOT NULL,
  
  -- Certificate details
  certificate_number TEXT NOT NULL UNIQUE, -- Unique certificate identifier
  title TEXT NOT NULL, -- Certificate title
  recipient_name TEXT NOT NULL, -- Full name of recipient
  course_title TEXT NOT NULL, -- Course title at time of completion
  completion_date TIMESTAMPTZ NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  
  -- Certificate configuration
  template_id TEXT DEFAULT 'default', -- Certificate template used
  issued_by TEXT NOT NULL, -- Organization/issuer name
  issuer_signature TEXT, -- Digital signature or signature image URL
  verification_code TEXT NOT NULL UNIQUE, -- For certificate verification
  
  -- Certificate status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'expired')),
  expires_at TIMESTAMPTZ, -- Optional expiration date
  
  -- File storage
  pdf_url TEXT, -- URL to generated PDF certificate
  thumbnail_url TEXT, -- URL to certificate thumbnail
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT certificates_certificate_number_not_empty CHECK (length(trim(certificate_number)) > 0),
  CONSTRAINT certificates_title_not_empty CHECK (length(trim(title)) > 0),
  CONSTRAINT certificates_recipient_name_not_empty CHECK (length(trim(recipient_name)) > 0),
  CONSTRAINT certificates_verification_code_not_empty CHECK (length(trim(verification_code)) > 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS certificates_user_id_idx ON certificates(user_id);
CREATE INDEX IF NOT EXISTS certificates_course_id_idx ON certificates(course_id);
CREATE INDEX IF NOT EXISTS certificates_enrollment_id_idx ON certificates(enrollment_id);
CREATE INDEX IF NOT EXISTS certificates_certificate_number_idx ON certificates(certificate_number);
CREATE INDEX IF NOT EXISTS certificates_verification_code_idx ON certificates(verification_code);
CREATE INDEX IF NOT EXISTS certificates_status_idx ON certificates(status);
CREATE INDEX IF NOT EXISTS certificates_completion_date_idx ON certificates(completion_date DESC);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_certificates_updated_at ON certificates;
CREATE TRIGGER update_certificates_updated_at
  BEFORE UPDATE ON certificates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own certificates
CREATE POLICY "certificates_select_own"
  ON certificates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "certificates_insert_own"
  ON certificates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "certificates_update_own"
  ON certificates FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Public verification policy (for certificate verification)
CREATE POLICY "certificates_select_verification"
  ON certificates FOR SELECT
  USING (status = 'active');

-- =====================================================
-- TABLE: quiz_configurations
-- Purpose: Store quiz settings and configurations
-- =====================================================
CREATE TABLE IF NOT EXISTS quiz_configurations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  quiz_id UUID REFERENCES course_quizzes(id) ON DELETE CASCADE,
  
  -- Quiz settings
  allow_retake BOOLEAN DEFAULT true,
  max_attempts INTEGER DEFAULT 3 CHECK (max_attempts > 0),
  show_correct_answers BOOLEAN DEFAULT true,
  show_explanations BOOLEAN DEFAULT true,
  randomize_questions BOOLEAN DEFAULT false,
  randomize_answers BOOLEAN DEFAULT false,
  time_limit INTEGER, -- in seconds, null for no limit
  pass_threshold INTEGER DEFAULT 80 CHECK (pass_threshold >= 0 AND pass_threshold <= 100),
  
  -- Advanced settings
  require_all_questions BOOLEAN DEFAULT true,
  allow_skip_questions BOOLEAN DEFAULT false,
  show_progress BOOLEAN DEFAULT true,
  show_timer BOOLEAN DEFAULT true,
  auto_submit BOOLEAN DEFAULT false,
  
  -- Feedback settings
  immediate_feedback BOOLEAN DEFAULT false,
  show_score_breakdown BOOLEAN DEFAULT true,
  custom_feedback TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS quiz_configurations_course_id_idx ON quiz_configurations(course_id);
CREATE INDEX IF NOT EXISTS quiz_configurations_quiz_id_idx ON quiz_configurations(quiz_id);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_quiz_configurations_updated_at ON quiz_configurations;
CREATE TRIGGER update_quiz_configurations_updated_at
  BEFORE UPDATE ON quiz_configurations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE quiz_configurations ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Inherit from parent course
CREATE POLICY "quiz_configurations_select_course_access"
  ON quiz_configurations FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM courses 
    WHERE id = quiz_configurations.course_id AND (
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

CREATE POLICY "quiz_configurations_insert_course_owner"
  ON quiz_configurations FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM courses 
    WHERE id = quiz_configurations.course_id AND auth.uid() = user_id
  ));

CREATE POLICY "quiz_configurations_update_course_owner"
  ON quiz_configurations FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM courses 
    WHERE id = quiz_configurations.course_id AND auth.uid() = user_id
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM courses 
    WHERE id = quiz_configurations.course_id AND auth.uid() = user_id
  ));

CREATE POLICY "quiz_configurations_delete_course_owner"
  ON quiz_configurations FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM courses 
    WHERE id = quiz_configurations.course_id AND auth.uid() = user_id
  ));

-- =====================================================
-- TABLE: learning_analytics
-- Purpose: Track detailed learning analytics and progress
-- =====================================================
CREATE TABLE IF NOT EXISTS learning_analytics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  module_id UUID REFERENCES course_modules(id) ON DELETE CASCADE,
  quiz_id UUID REFERENCES course_quizzes(id) ON DELETE CASCADE,
  
  -- Event details
  event_type TEXT NOT NULL CHECK (event_type IN (
    'quiz_started', 'quiz_completed', 'quiz_abandoned',
    'module_started', 'module_completed', 'module_abandoned',
    'course_started', 'course_completed', 'course_abandoned',
    'certificate_earned', 'certificate_downloaded',
    'video_played', 'video_paused', 'video_completed',
    'search_performed', 'bookmark_created', 'note_added'
  )),
  
  -- Event data
  event_data JSONB DEFAULT '{}'::jsonb,
  duration INTEGER DEFAULT 0, -- in seconds
  score INTEGER, -- if applicable
  progress_percentage INTEGER CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  
  -- Context
  session_id TEXT, -- Browser session identifier
  device_type TEXT, -- mobile, tablet, desktop
  browser_info TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS learning_analytics_user_id_idx ON learning_analytics(user_id);
CREATE INDEX IF NOT EXISTS learning_analytics_course_id_idx ON learning_analytics(course_id);
CREATE INDEX IF NOT EXISTS learning_analytics_module_id_idx ON learning_analytics(module_id);
CREATE INDEX IF NOT EXISTS learning_analytics_quiz_id_idx ON learning_analytics(quiz_id);
CREATE INDEX IF NOT EXISTS learning_analytics_event_type_idx ON learning_analytics(event_type);
CREATE INDEX IF NOT EXISTS learning_analytics_created_at_idx ON learning_analytics(created_at DESC);
CREATE INDEX IF NOT EXISTS learning_analytics_session_id_idx ON learning_analytics(session_id);

-- Enable Row Level Security
ALTER TABLE learning_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own analytics
CREATE POLICY "learning_analytics_select_own"
  ON learning_analytics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "learning_analytics_insert_own"
  ON learning_analytics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to generate unique certificate number
CREATE OR REPLACE FUNCTION generate_certificate_number()
RETURNS TEXT AS $$
DECLARE
  cert_number TEXT;
  exists_count INTEGER;
BEGIN
  LOOP
    -- Generate format: CERT-YYYYMMDD-XXXXXX
    cert_number := 'CERT-' || to_char(NOW(), 'YYYYMMDD') || '-' || 
                   upper(substring(md5(random()::text) from 1 for 6));
    
    -- Check if it already exists
    SELECT COUNT(*) INTO exists_count 
    FROM certificates 
    WHERE certificate_number = cert_number;
    
    -- If unique, return it
    IF exists_count = 0 THEN
      RETURN cert_number;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to generate verification code
CREATE OR REPLACE FUNCTION generate_verification_code()
RETURNS TEXT AS $$
DECLARE
  verification_code TEXT;
  exists_count INTEGER;
BEGIN
  LOOP
    -- Generate 8-character alphanumeric code
    verification_code := upper(substring(md5(random()::text) from 1 for 8));
    
    -- Check if it already exists
    SELECT COUNT(*) INTO exists_count 
    FROM certificates 
    WHERE verification_code = verification_code;
    
    -- If unique, return it
    IF exists_count = 0 THEN
      RETURN verification_code;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to create certificate when course is completed
CREATE OR REPLACE FUNCTION create_certificate_on_completion()
RETURNS TRIGGER AS $$
DECLARE
  course_record RECORD;
  user_record RECORD;
  cert_number TEXT;
  verification_code TEXT;
BEGIN
  -- Only create certificate if course is being completed (progress = 100)
  IF NEW.progress_percentage = 100 AND (OLD.progress_percentage IS NULL OR OLD.progress_percentage < 100) THEN
    
    -- Get course and user details
    SELECT title, enable_certificates, pass_threshold
    INTO course_record
    FROM courses 
    WHERE id = NEW.course_id;
    
    SELECT full_name, email
    INTO user_record
    FROM user_profiles 
    WHERE user_id = NEW.user_id;
    
    -- Only create certificate if enabled and user passed
    IF course_record.enable_certificates AND 
       (NEW.score IS NULL OR NEW.score >= course_record.pass_threshold) THEN
      
      -- Generate unique identifiers
      cert_number := generate_certificate_number();
      verification_code := generate_verification_code();
      
      -- Create certificate
      INSERT INTO certificates (
        user_id,
        course_id,
        enrollment_id,
        certificate_number,
        title,
        recipient_name,
        course_title,
        completion_date,
        score,
        issued_by,
        verification_code
      ) VALUES (
        NEW.user_id,
        NEW.course_id,
        NEW.id,
        cert_number,
        'Certificate of Completion',
        COALESCE(user_record.full_name, 'Student'),
        course_record.title,
        NEW.completed_at,
        COALESCE(NEW.score, 0),
        'Winbro Training Reels',
        verification_code
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create certificate on course completion
DROP TRIGGER IF EXISTS create_certificate_trigger ON course_enrollments;
CREATE TRIGGER create_certificate_trigger
  AFTER UPDATE ON course_enrollments
  FOR EACH ROW
  EXECUTE FUNCTION create_certificate_on_completion();

-- Function to log learning analytics
CREATE OR REPLACE FUNCTION log_learning_event(
  p_user_id UUID,
  p_course_id UUID,
  p_module_id UUID DEFAULT NULL,
  p_quiz_id UUID DEFAULT NULL,
  p_event_type TEXT,
  p_event_data JSONB DEFAULT '{}'::jsonb,
  p_duration INTEGER DEFAULT 0,
  p_score INTEGER DEFAULT NULL,
  p_progress_percentage INTEGER DEFAULT NULL,
  p_session_id TEXT DEFAULT NULL,
  p_device_type TEXT DEFAULT NULL,
  p_browser_info TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  event_id UUID;
BEGIN
  INSERT INTO learning_analytics (
    user_id,
    course_id,
    module_id,
    quiz_id,
    event_type,
    event_data,
    duration,
    score,
    progress_percentage,
    session_id,
    device_type,
    browser_info
  ) VALUES (
    p_user_id,
    p_course_id,
    p_module_id,
    p_quiz_id,
    p_event_type,
    p_event_data,
    p_duration,
    p_score,
    p_progress_percentage,
    p_session_id,
    p_device_type,
    p_browser_info
  ) RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- DOCUMENTATION
-- =====================================================
COMMENT ON TABLE certificates IS 'Generated certificates for course completions';
COMMENT ON COLUMN certificates.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN certificates.certificate_number IS 'Unique certificate identifier (CERT-YYYYMMDD-XXXXXX)';
COMMENT ON COLUMN certificates.recipient_name IS 'Full name of certificate recipient';
COMMENT ON COLUMN certificates.verification_code IS '8-character code for certificate verification';
COMMENT ON COLUMN certificates.pdf_url IS 'URL to generated PDF certificate file';
COMMENT ON COLUMN certificates.status IS 'Certificate status: active, revoked, expired';

COMMENT ON TABLE quiz_configurations IS 'Quiz settings and configurations';
COMMENT ON COLUMN quiz_configurations.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN quiz_configurations.course_id IS 'Parent course (references courses)';
COMMENT ON COLUMN quiz_configurations.quiz_id IS 'Specific quiz (references course_quizzes)';
COMMENT ON COLUMN quiz_configurations.max_attempts IS 'Maximum number of quiz attempts allowed';
COMMENT ON COLUMN quiz_configurations.pass_threshold IS 'Minimum score percentage to pass (0-100)';

COMMENT ON TABLE learning_analytics IS 'Detailed learning analytics and progress tracking';
COMMENT ON COLUMN learning_analytics.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN learning_analytics.event_type IS 'Type of learning event tracked';
COMMENT ON COLUMN learning_analytics.event_data IS 'Additional event-specific data (JSON)';
COMMENT ON COLUMN learning_analytics.session_id IS 'Browser session identifier for grouping events';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS learning_analytics CASCADE;
-- DROP TABLE IF EXISTS quiz_configurations CASCADE;
-- DROP TABLE IF EXISTS certificates CASCADE;
-- DROP FUNCTION IF EXISTS generate_certificate_number();
-- DROP FUNCTION IF EXISTS generate_verification_code();
-- DROP FUNCTION IF EXISTS create_certificate_on_completion();
-- DROP FUNCTION IF EXISTS log_learning_event();
