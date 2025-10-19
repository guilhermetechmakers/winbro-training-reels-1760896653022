-- =====================================================
-- Migration: Create videos table for video upload and management
-- Created: 2024-12-13T12:00:00Z
-- Tables: videos, video_transcripts, video_processing_jobs
-- Purpose: Enable video upload, storage, processing, and management functionality
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
-- TABLE: videos
-- Purpose: Store video metadata and processing information
-- =====================================================
CREATE TABLE IF NOT EXISTS videos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Core video information
  title TEXT NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL, -- duration in seconds
  
  -- File information
  original_filename TEXT NOT NULL,
  file_size BIGINT NOT NULL, -- file size in bytes
  mime_type TEXT NOT NULL,
  
  -- Storage URLs
  video_url TEXT, -- HLS/DASH streaming URL
  thumbnail_url TEXT, -- poster/thumbnail URL
  audio_url TEXT, -- audio-only fallback URL
  
  -- Processing status
  processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  processing_progress INTEGER DEFAULT 0 CHECK (processing_progress >= 0 AND processing_progress <= 100),
  processing_error TEXT, -- error message if processing failed
  
  -- Video metadata
  width INTEGER,
  height INTEGER,
  fps DECIMAL(5,2),
  bitrate INTEGER,
  
  -- Content categorization
  machine_model TEXT,
  process_type TEXT,
  tooling TEXT,
  skill_level TEXT CHECK (skill_level IN ('beginner', 'intermediate', 'advanced')),
  tags TEXT[] DEFAULT '{}',
  
  -- Access control
  visibility TEXT DEFAULT 'private' CHECK (visibility IN ('private', 'public', 'organization')),
  customer_scope TEXT[], -- array of customer IDs who can access this video
  
  -- Status and moderation
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'published', 'archived', 'rejected')),
  moderation_notes TEXT,
  moderated_by UUID REFERENCES auth.users(id),
  moderated_at TIMESTAMPTZ,
  
  -- Analytics
  view_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  bookmark_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT videos_title_not_empty CHECK (length(trim(title)) > 0),
  CONSTRAINT videos_duration_positive CHECK (duration > 0),
  CONSTRAINT videos_file_size_positive CHECK (file_size > 0),
  CONSTRAINT videos_processing_progress_valid CHECK (processing_progress >= 0 AND processing_progress <= 100)
);

-- =====================================================
-- TABLE: video_transcripts
-- Purpose: Store video transcripts with timestamps
-- =====================================================
CREATE TABLE IF NOT EXISTS video_transcripts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE NOT NULL,
  
  -- Transcript data
  segment_index INTEGER NOT NULL,
  start_time DECIMAL(8,3) NOT NULL, -- start time in seconds
  end_time DECIMAL(8,3) NOT NULL, -- end time in seconds
  text TEXT NOT NULL,
  confidence DECIMAL(3,2), -- AI confidence score 0-1
  
  -- Processing info
  language TEXT DEFAULT 'en',
  is_auto_generated BOOLEAN DEFAULT true,
  edited_by UUID REFERENCES auth.users(id),
  edited_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT video_transcripts_segment_index_positive CHECK (segment_index >= 0),
  CONSTRAINT video_transcripts_time_valid CHECK (start_time >= 0 AND end_time > start_time),
  CONSTRAINT video_transcripts_text_not_empty CHECK (length(trim(text)) > 0),
  CONSTRAINT video_transcripts_confidence_valid CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 1))
);

-- =====================================================
-- TABLE: video_processing_jobs
-- Purpose: Track video processing jobs and their status
-- =====================================================
CREATE TABLE IF NOT EXISTS video_processing_jobs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE NOT NULL,
  
  -- Job information
  job_type TEXT NOT NULL CHECK (job_type IN ('transcode', 'transcribe', 'thumbnail', 'analyze')),
  status TEXT DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed', 'cancelled')),
  
  -- Processing details
  worker_id TEXT, -- ID of the worker processing this job
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  
  -- Job configuration
  config JSONB DEFAULT '{}'::jsonb,
  priority INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =====================================================
-- PERFORMANCE INDEXES
-- =====================================================

-- Videos table indexes
CREATE INDEX IF NOT EXISTS videos_user_id_idx ON videos(user_id);
CREATE INDEX IF NOT EXISTS videos_created_at_idx ON videos(created_at DESC);
CREATE INDEX IF NOT EXISTS videos_status_idx ON videos(status) WHERE status != 'archived';
CREATE INDEX IF NOT EXISTS videos_processing_status_idx ON videos(processing_status);
CREATE INDEX IF NOT EXISTS videos_visibility_idx ON videos(visibility);
CREATE INDEX IF NOT EXISTS videos_tags_idx ON videos USING GIN(tags);
CREATE INDEX IF NOT EXISTS videos_customer_scope_idx ON videos USING GIN(customer_scope);
CREATE INDEX IF NOT EXISTS videos_machine_model_idx ON videos(machine_model) WHERE machine_model IS NOT NULL;
CREATE INDEX IF NOT EXISTS videos_process_type_idx ON videos(process_type) WHERE process_type IS NOT NULL;
CREATE INDEX IF NOT EXISTS videos_skill_level_idx ON videos(skill_level) WHERE skill_level IS NOT NULL;

-- Video transcripts indexes
CREATE INDEX IF NOT EXISTS video_transcripts_video_id_idx ON video_transcripts(video_id);
CREATE INDEX IF NOT EXISTS video_transcripts_start_time_idx ON video_transcripts(video_id, start_time);
CREATE INDEX IF NOT EXISTS video_transcripts_text_search_idx ON video_transcripts USING GIN(to_tsvector('english', text));

-- Video processing jobs indexes
CREATE INDEX IF NOT EXISTS video_processing_jobs_video_id_idx ON video_processing_jobs(video_id);
CREATE INDEX IF NOT EXISTS video_processing_jobs_status_idx ON video_processing_jobs(status);
CREATE INDEX IF NOT EXISTS video_processing_jobs_type_idx ON video_processing_jobs(job_type);
CREATE INDEX IF NOT EXISTS video_processing_jobs_priority_idx ON video_processing_jobs(priority DESC, created_at ASC);

-- =====================================================
-- AUTO-UPDATE TRIGGERS
-- =====================================================

-- Videos table trigger
DROP TRIGGER IF EXISTS update_videos_updated_at ON videos;
CREATE TRIGGER update_videos_updated_at
  BEFORE UPDATE ON videos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Video transcripts table trigger
DROP TRIGGER IF EXISTS update_video_transcripts_updated_at ON video_transcripts;
CREATE TRIGGER update_video_transcripts_updated_at
  BEFORE UPDATE ON video_transcripts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Video processing jobs table trigger
DROP TRIGGER IF EXISTS update_video_processing_jobs_updated_at ON video_processing_jobs;
CREATE TRIGGER update_video_processing_jobs_updated_at
  BEFORE UPDATE ON video_processing_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_processing_jobs ENABLE ROW LEVEL SECURITY;

-- Videos RLS Policies
CREATE POLICY "videos_select_own"
  ON videos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "videos_select_public"
  ON videos FOR SELECT
  USING (visibility = 'public' AND status = 'published');

CREATE POLICY "videos_select_organization"
  ON videos FOR SELECT
  USING (
    visibility = 'organization' 
    AND status = 'published'
    AND auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE raw_user_meta_data->>'company' = (
        SELECT raw_user_meta_data->>'company' 
        FROM auth.users 
        WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "videos_insert_own"
  ON videos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "videos_update_own"
  ON videos FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "videos_delete_own"
  ON videos FOR DELETE
  USING (auth.uid() = user_id);

-- Video transcripts RLS Policies
CREATE POLICY "video_transcripts_select_video_owner"
  ON video_transcripts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM videos 
      WHERE videos.id = video_transcripts.video_id 
      AND videos.user_id = auth.uid()
    )
  );

CREATE POLICY "video_transcripts_select_public_video"
  ON video_transcripts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM videos 
      WHERE videos.id = video_transcripts.video_id 
      AND videos.visibility = 'public' 
      AND videos.status = 'published'
    )
  );

CREATE POLICY "video_transcripts_insert_video_owner"
  ON video_transcripts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM videos 
      WHERE videos.id = video_transcripts.video_id 
      AND videos.user_id = auth.uid()
    )
  );

CREATE POLICY "video_transcripts_update_video_owner"
  ON video_transcripts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM videos 
      WHERE videos.id = video_transcripts.video_id 
      AND videos.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM videos 
      WHERE videos.id = video_transcripts.video_id 
      AND videos.user_id = auth.uid()
    )
  );

CREATE POLICY "video_transcripts_delete_video_owner"
  ON video_transcripts FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM videos 
      WHERE videos.id = video_transcripts.video_id 
      AND videos.user_id = auth.uid()
    )
  );

-- Video processing jobs RLS Policies
CREATE POLICY "video_processing_jobs_select_video_owner"
  ON video_processing_jobs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM videos 
      WHERE videos.id = video_processing_jobs.video_id 
      AND videos.user_id = auth.uid()
    )
  );

CREATE POLICY "video_processing_jobs_insert_video_owner"
  ON video_processing_jobs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM videos 
      WHERE videos.id = video_processing_jobs.video_id 
      AND videos.user_id = auth.uid()
    )
  );

CREATE POLICY "video_processing_jobs_update_video_owner"
  ON video_processing_jobs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM videos 
      WHERE videos.id = video_processing_jobs.video_id 
      AND videos.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM videos 
      WHERE videos.id = video_processing_jobs.video_id 
      AND videos.user_id = auth.uid()
    )
  );

-- =====================================================
-- DOCUMENTATION
-- =====================================================

COMMENT ON TABLE videos IS 'Stores video metadata, processing status, and access control information';
COMMENT ON COLUMN videos.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN videos.user_id IS 'Owner of this video (references auth.users)';
COMMENT ON COLUMN videos.title IS 'Video title (required, non-empty)';
COMMENT ON COLUMN videos.duration IS 'Video duration in seconds';
COMMENT ON COLUMN videos.processing_status IS 'Current processing status: pending, processing, completed, failed, cancelled';
COMMENT ON COLUMN videos.processing_progress IS 'Processing progress percentage (0-100)';
COMMENT ON COLUMN videos.visibility IS 'Access level: private (owner only), public (everyone), organization (company only)';
COMMENT ON COLUMN videos.customer_scope IS 'Array of customer IDs who can access this video';
COMMENT ON COLUMN videos.status IS 'Content status: draft, pending_review, published, archived, rejected';
COMMENT ON COLUMN videos.tags IS 'Array of tags for categorization and search';

COMMENT ON TABLE video_transcripts IS 'Stores video transcripts with timestamps for search and navigation';
COMMENT ON COLUMN video_transcripts.video_id IS 'Reference to the video this transcript belongs to';
COMMENT ON COLUMN video_transcripts.segment_index IS 'Order of this segment in the transcript';
COMMENT ON COLUMN video_transcripts.start_time IS 'Start time of this segment in seconds';
COMMENT ON COLUMN video_transcripts.end_time IS 'End time of this segment in seconds';
COMMENT ON COLUMN video_transcripts.text IS 'Transcript text for this segment';
COMMENT ON COLUMN video_transcripts.confidence IS 'AI confidence score for this segment (0-1)';

COMMENT ON TABLE video_processing_jobs IS 'Tracks video processing jobs and their status';
COMMENT ON COLUMN video_processing_jobs.video_id IS 'Reference to the video being processed';
COMMENT ON COLUMN video_processing_jobs.job_type IS 'Type of processing job: transcode, transcribe, thumbnail, analyze';
COMMENT ON COLUMN video_processing_jobs.status IS 'Job status: queued, processing, completed, failed, cancelled';
COMMENT ON COLUMN video_processing_jobs.config IS 'Job configuration parameters as JSON';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS video_processing_jobs CASCADE;
-- DROP TABLE IF EXISTS video_transcripts CASCADE;
-- DROP TABLE IF EXISTS videos CASCADE;
