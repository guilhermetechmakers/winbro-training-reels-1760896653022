-- =====================================================
-- Migration: Enhance Video Management System
-- Created: 2024-12-20T18:00:00Z
-- Tables: video_processing_jobs, video_thumbnails, video_metadata
-- Purpose: Add comprehensive video processing and metadata management
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
-- TABLE: video_processing_jobs
-- Purpose: Track video processing jobs and their status
-- =====================================================
CREATE TABLE IF NOT EXISTS video_processing_jobs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE NOT NULL,
  
  -- Job details
  job_type TEXT NOT NULL CHECK (job_type IN ('transcode', 'transcribe', 'thumbnail', 'analyze', 'trim')),
  status TEXT DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed', 'cancelled')),
  priority INTEGER DEFAULT 0,
  
  -- Processing details
  worker_id TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  progress_percentage INTEGER DEFAULT 0,
  
  -- Configuration
  config JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT video_processing_jobs_video_id_not_empty CHECK (video_id IS NOT NULL),
  CONSTRAINT video_processing_jobs_job_type_not_empty CHECK (length(trim(job_type)) > 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS video_processing_jobs_video_id_idx ON video_processing_jobs(video_id);
CREATE INDEX IF NOT EXISTS video_processing_jobs_status_idx ON video_processing_jobs(status);
CREATE INDEX IF NOT EXISTS video_processing_jobs_job_type_idx ON video_processing_jobs(job_type);
CREATE INDEX IF NOT EXISTS video_processing_jobs_priority_idx ON video_processing_jobs(priority DESC, created_at ASC);
CREATE INDEX IF NOT EXISTS video_processing_jobs_created_at_idx ON video_processing_jobs(created_at DESC);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_video_processing_jobs_updated_at ON video_processing_jobs;
CREATE TRIGGER update_video_processing_jobs_updated_at
  BEFORE UPDATE ON video_processing_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABLE: video_thumbnails
-- Purpose: Store multiple thumbnail options for videos
-- =====================================================
CREATE TABLE IF NOT EXISTS video_thumbnails (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE NOT NULL,
  
  -- Thumbnail details
  thumbnail_url TEXT NOT NULL,
  thumbnail_type TEXT DEFAULT 'generated' CHECK (thumbnail_type IN ('generated', 'custom', 'poster_frame')),
  time_offset DECIMAL(10,3) NOT NULL, -- Time in seconds where thumbnail was captured
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  file_size INTEGER,
  
  -- Selection status
  is_primary BOOLEAN DEFAULT FALSE,
  is_selected BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT video_thumbnails_video_id_not_empty CHECK (video_id IS NOT NULL),
  CONSTRAINT video_thumbnails_url_not_empty CHECK (length(trim(thumbnail_url)) > 0),
  CONSTRAINT video_thumbnails_time_offset_positive CHECK (time_offset >= 0),
  CONSTRAINT video_thumbnails_dimensions_positive CHECK (width > 0 AND height > 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS video_thumbnails_video_id_idx ON video_thumbnails(video_id);
CREATE INDEX IF NOT EXISTS video_thumbnails_primary_idx ON video_thumbnails(video_id, is_primary) WHERE is_primary = TRUE;
CREATE INDEX IF NOT EXISTS video_thumbnails_selected_idx ON video_thumbnails(video_id, is_selected) WHERE is_selected = TRUE;

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_video_thumbnails_updated_at ON video_thumbnails;
CREATE TRIGGER update_video_thumbnails_updated_at
  BEFORE UPDATE ON video_thumbnails
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABLE: video_metadata
-- Purpose: Store additional metadata and processing results
-- =====================================================
CREATE TABLE IF NOT EXISTS video_metadata (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE NOT NULL,
  
  -- Processing results
  auto_tags TEXT[] DEFAULT '{}',
  ai_summary TEXT,
  confidence_scores JSONB DEFAULT '{}'::jsonb,
  
  -- Video analysis
  dominant_colors TEXT[],
  motion_analysis JSONB,
  audio_analysis JSONB,
  quality_metrics JSONB,
  
  -- Custom metadata
  custom_fields JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT video_metadata_video_id_not_empty CHECK (video_id IS NOT NULL)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS video_metadata_video_id_idx ON video_metadata(video_id);
CREATE INDEX IF NOT EXISTS video_metadata_auto_tags_idx ON video_metadata USING GIN (auto_tags);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_video_metadata_updated_at ON video_metadata;
CREATE TRIGGER update_video_metadata_updated_at
  BEFORE UPDATE ON video_metadata
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABLE: video_trim_segments
-- Purpose: Store video trim information
-- =====================================================
CREATE TABLE IF NOT EXISTS video_trim_segments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE NOT NULL,
  
  -- Trim details
  start_time DECIMAL(10,3) NOT NULL,
  end_time DECIMAL(10,3) NOT NULL,
  duration DECIMAL(10,3) GENERATED ALWAYS AS (end_time - start_time) STORED,
  
  -- Trim status
  is_applied BOOLEAN DEFAULT FALSE,
  applied_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT video_trim_segments_video_id_not_empty CHECK (video_id IS NOT NULL),
  CONSTRAINT video_trim_segments_time_valid CHECK (start_time >= 0 AND end_time > start_time)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS video_trim_segments_video_id_idx ON video_trim_segments(video_id);
CREATE INDEX IF NOT EXISTS video_trim_segments_applied_idx ON video_trim_segments(video_id, is_applied) WHERE is_applied = TRUE;

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_video_trim_segments_updated_at ON video_trim_segments;
CREATE TRIGGER update_video_trim_segments_updated_at
  BEFORE UPDATE ON video_trim_segments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- RLS Policies
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE video_processing_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_thumbnails ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_trim_segments ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own video data
CREATE POLICY "video_processing_jobs_select_own"
  ON video_processing_jobs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM videos 
      WHERE videos.id = video_processing_jobs.video_id 
      AND videos.user_id = auth.uid()
    )
  );

CREATE POLICY "video_processing_jobs_insert_own"
  ON video_processing_jobs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM videos 
      WHERE videos.id = video_processing_jobs.video_id 
      AND videos.user_id = auth.uid()
    )
  );

CREATE POLICY "video_processing_jobs_update_own"
  ON video_processing_jobs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM videos 
      WHERE videos.id = video_processing_jobs.video_id 
      AND videos.user_id = auth.uid()
    )
  );

CREATE POLICY "video_thumbnails_select_own"
  ON video_thumbnails FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM videos 
      WHERE videos.id = video_thumbnails.video_id 
      AND videos.user_id = auth.uid()
    )
  );

CREATE POLICY "video_thumbnails_insert_own"
  ON video_thumbnails FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM videos 
      WHERE videos.id = video_thumbnails.video_id 
      AND videos.user_id = auth.uid()
    )
  );

CREATE POLICY "video_thumbnails_update_own"
  ON video_thumbnails FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM videos 
      WHERE videos.id = video_thumbnails.video_id 
      AND videos.user_id = auth.uid()
    )
  );

CREATE POLICY "video_metadata_select_own"
  ON video_metadata FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM videos 
      WHERE videos.id = video_metadata.video_id 
      AND videos.user_id = auth.uid()
    )
  );

CREATE POLICY "video_metadata_insert_own"
  ON video_metadata FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM videos 
      WHERE videos.id = video_metadata.video_id 
      AND videos.user_id = auth.uid()
    )
  );

CREATE POLICY "video_metadata_update_own"
  ON video_metadata FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM videos 
      WHERE videos.id = video_metadata.video_id 
      AND videos.user_id = auth.uid()
    )
  );

CREATE POLICY "video_trim_segments_select_own"
  ON video_trim_segments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM videos 
      WHERE videos.id = video_trim_segments.video_id 
      AND videos.user_id = auth.uid()
    )
  );

CREATE POLICY "video_trim_segments_insert_own"
  ON video_trim_segments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM videos 
      WHERE videos.id = video_trim_segments.video_id 
      AND videos.user_id = auth.uid()
    )
  );

CREATE POLICY "video_trim_segments_update_own"
  ON video_trim_segments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM videos 
      WHERE videos.id = video_trim_segments.video_id 
      AND videos.user_id = auth.uid()
    )
  );

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to get video processing status
CREATE OR REPLACE FUNCTION get_video_processing_status(p_video_id UUID)
RETURNS TABLE (
  video_id UUID,
  total_jobs INTEGER,
  completed_jobs INTEGER,
  failed_jobs INTEGER,
  overall_status TEXT,
  progress_percentage INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p_video_id,
    COUNT(*)::INTEGER as total_jobs,
    COUNT(*) FILTER (WHERE status = 'completed')::INTEGER as completed_jobs,
    COUNT(*) FILTER (WHERE status = 'failed')::INTEGER as failed_jobs,
    CASE 
      WHEN COUNT(*) FILTER (WHERE status = 'failed') > 0 THEN 'failed'
      WHEN COUNT(*) FILTER (WHERE status = 'completed') = COUNT(*) THEN 'completed'
      WHEN COUNT(*) FILTER (WHERE status = 'processing') > 0 THEN 'processing'
      ELSE 'queued'
    END as overall_status,
    COALESCE(AVG(progress_percentage), 0)::INTEGER as progress_percentage
  FROM video_processing_jobs
  WHERE video_id = p_video_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to set primary thumbnail
CREATE OR REPLACE FUNCTION set_primary_thumbnail(p_video_id UUID, p_thumbnail_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Unset current primary
  UPDATE video_thumbnails 
  SET is_primary = FALSE 
  WHERE video_id = p_video_id;
  
  -- Set new primary
  UPDATE video_thumbnails 
  SET is_primary = TRUE, is_selected = TRUE
  WHERE id = p_thumbnail_id AND video_id = p_video_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Documentation
-- =====================================================
COMMENT ON TABLE video_processing_jobs IS 'Tracks video processing jobs and their status';
COMMENT ON TABLE video_thumbnails IS 'Stores multiple thumbnail options for videos';
COMMENT ON TABLE video_metadata IS 'Stores additional metadata and AI analysis results';
COMMENT ON TABLE video_trim_segments IS 'Stores video trim information';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS video_trim_segments CASCADE;
-- DROP TABLE IF EXISTS video_metadata CASCADE;
-- DROP TABLE IF EXISTS video_thumbnails CASCADE;
-- DROP TABLE IF EXISTS video_processing_jobs CASCADE;
-- DROP FUNCTION IF EXISTS get_video_processing_status(UUID);
-- DROP FUNCTION IF EXISTS set_primary_thumbnail(UUID, UUID);
