-- =====================================================
-- Migration: Create Search Functionality
-- Created: 2024-12-13T18:00:00Z
-- Tables: search_index, search_suggestions, search_analytics
-- Purpose: Enable full-text search and faceted filtering for video content
-- =====================================================

-- Enable UUID extension (idempotent)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable full-text search extensions
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- Helper function for updated_at (idempotent)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TABLE: search_index
-- Purpose: Optimized search index for video content with full-text search capabilities
-- =====================================================
CREATE TABLE IF NOT EXISTS search_index (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE NOT NULL,
  
  -- Searchable content
  title TEXT NOT NULL,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  machine_model TEXT,
  process_type TEXT,
  tooling TEXT,
  skill_level TEXT,
  
  -- Full-text search vectors
  search_vector tsvector,
  title_vector tsvector,
  description_vector tsvector,
  tags_vector tsvector,
  transcript_vector tsvector,
  
  -- Metadata for faceted search
  status TEXT NOT NULL DEFAULT 'published',
  visibility TEXT NOT NULL DEFAULT 'public',
  customer_scope TEXT[] DEFAULT '{}',
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Content metrics
  view_count INTEGER DEFAULT 0,
  bookmark_count INTEGER DEFAULT 0,
  duration INTEGER NOT NULL, -- in seconds
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT search_index_video_id_unique UNIQUE (video_id),
  CONSTRAINT search_index_title_not_empty CHECK (length(trim(title)) > 0),
  CONSTRAINT search_index_duration_positive CHECK (duration > 0)
);

-- Performance indexes for search
CREATE INDEX IF NOT EXISTS search_index_search_vector_idx ON search_index USING GIN (search_vector);
CREATE INDEX IF NOT EXISTS search_index_title_vector_idx ON search_index USING GIN (title_vector);
CREATE INDEX IF NOT EXISTS search_index_description_vector_idx ON search_index USING GIN (description_vector);
CREATE INDEX IF NOT EXISTS search_index_tags_vector_idx ON search_index USING GIN (tags_vector);
CREATE INDEX IF NOT EXISTS search_index_transcript_vector_idx ON search_index USING GIN (transcript_vector);

-- Faceted search indexes
CREATE INDEX IF NOT EXISTS search_index_status_idx ON search_index(status) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS search_index_visibility_idx ON search_index(visibility);
CREATE INDEX IF NOT EXISTS search_index_skill_level_idx ON search_index(skill_level) WHERE skill_level IS NOT NULL;
CREATE INDEX IF NOT EXISTS search_index_machine_model_idx ON search_index(machine_model) WHERE machine_model IS NOT NULL;
CREATE INDEX IF NOT EXISTS search_index_process_type_idx ON search_index(process_type) WHERE process_type IS NOT NULL;
CREATE INDEX IF NOT EXISTS search_index_author_id_idx ON search_index(author_id);
CREATE INDEX IF NOT EXISTS search_index_created_at_idx ON search_index(created_at DESC);
CREATE INDEX IF NOT EXISTS search_index_view_count_idx ON search_index(view_count DESC);
CREATE INDEX IF NOT EXISTS search_index_duration_idx ON search_index(duration);

-- Trigram indexes for fuzzy matching
CREATE INDEX IF NOT EXISTS search_index_title_trgm_idx ON search_index USING GIN (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS search_index_description_trgm_idx ON search_index USING GIN (description gin_trgm_ops);
CREATE INDEX IF NOT EXISTS search_index_tags_trgm_idx ON search_index USING GIN (tags gin_trgm_ops);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_search_index_updated_at ON search_index;
CREATE TRIGGER update_search_index_updated_at
  BEFORE UPDATE ON search_index
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABLE: search_suggestions
-- Purpose: Store search suggestions and autocomplete data
-- =====================================================
CREATE TABLE IF NOT EXISTS search_suggestions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Suggestion content
  query TEXT NOT NULL,
  suggestion_type TEXT NOT NULL CHECK (suggestion_type IN ('tag', 'machine_model', 'process_type', 'tooling', 'author', 'title')),
  suggestion_value TEXT NOT NULL,
  
  -- Usage tracking
  usage_count INTEGER DEFAULT 1,
  last_used_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT search_suggestions_query_not_empty CHECK (length(trim(query)) > 0),
  CONSTRAINT search_suggestions_value_not_empty CHECK (length(trim(suggestion_value)) > 0),
  CONSTRAINT search_suggestions_unique UNIQUE (query, suggestion_type, suggestion_value)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS search_suggestions_query_idx ON search_suggestions(query);
CREATE INDEX IF NOT EXISTS search_suggestions_type_idx ON search_suggestions(suggestion_type);
CREATE INDEX IF NOT EXISTS search_suggestions_usage_count_idx ON search_suggestions(usage_count DESC);
CREATE INDEX IF NOT EXISTS search_suggestions_last_used_idx ON search_suggestions(last_used_at DESC);

-- Trigram index for fuzzy matching
CREATE INDEX IF NOT EXISTS search_suggestions_query_trgm_idx ON search_suggestions USING GIN (query gin_trgm_ops);
CREATE INDEX IF NOT EXISTS search_suggestions_value_trgm_idx ON search_suggestions USING GIN (suggestion_value gin_trgm_ops);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_search_suggestions_updated_at ON search_suggestions;
CREATE TRIGGER update_search_suggestions_updated_at
  BEFORE UPDATE ON search_suggestions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABLE: search_analytics
-- Purpose: Track search queries and performance metrics
-- =====================================================
CREATE TABLE IF NOT EXISTS search_analytics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Search query details
  query TEXT NOT NULL,
  query_type TEXT NOT NULL CHECK (query_type IN ('text', 'filter', 'faceted', 'autocomplete')),
  filters JSONB DEFAULT '{}',
  
  -- Results metrics
  result_count INTEGER DEFAULT 0,
  execution_time_ms INTEGER DEFAULT 0,
  clicked_result_id UUID,
  clicked_result_position INTEGER,
  
  -- Session context
  session_id TEXT,
  ip_address INET,
  user_agent TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT search_analytics_query_not_empty CHECK (length(trim(query)) > 0),
  CONSTRAINT search_analytics_result_count_positive CHECK (result_count >= 0),
  CONSTRAINT search_analytics_execution_time_positive CHECK (execution_time_ms >= 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS search_analytics_query_idx ON search_analytics(query);
CREATE INDEX IF NOT EXISTS search_analytics_user_id_idx ON search_analytics(user_id);
CREATE INDEX IF NOT EXISTS search_analytics_created_at_idx ON search_analytics(created_at DESC);
CREATE INDEX IF NOT EXISTS search_analytics_query_type_idx ON search_analytics(query_type);

-- =====================================================
-- FUNCTIONS: Search functionality
-- =====================================================

-- Function to update search vectors when video content changes
CREATE OR REPLACE FUNCTION update_search_index_vectors()
RETURNS TRIGGER AS $$
DECLARE
  transcript_text TEXT;
BEGIN
  -- Get transcript text for the video
  SELECT string_agg(text, ' ') INTO transcript_text
  FROM video_transcripts
  WHERE video_id = NEW.video_id;
  
  -- Update search vectors
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.tags, ' '), '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(transcript_text, '')), 'D');
    
  NEW.title_vector := to_tsvector('english', COALESCE(NEW.title, ''));
  NEW.description_vector := to_tsvector('english', COALESCE(NEW.description, ''));
  NEW.tags_vector := to_tsvector('english', COALESCE(array_to_string(NEW.tags, ' '), ''));
  NEW.transcript_vector := to_tsvector('english', COALESCE(transcript_text, ''));
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update search vectors
DROP TRIGGER IF EXISTS update_search_index_vectors_trigger ON search_index;
CREATE TRIGGER update_search_index_vectors_trigger
  BEFORE INSERT OR UPDATE ON search_index
  FOR EACH ROW
  EXECUTE FUNCTION update_search_index_vectors();

-- Function to search videos with full-text search
CREATE OR REPLACE FUNCTION search_videos(
  search_query TEXT DEFAULT '',
  filter_tags TEXT[] DEFAULT '{}',
  filter_machine_model TEXT DEFAULT NULL,
  filter_process_type TEXT DEFAULT NULL,
  filter_skill_level TEXT DEFAULT NULL,
  filter_status TEXT DEFAULT 'published',
  filter_visibility TEXT DEFAULT NULL,
  filter_author_id UUID DEFAULT NULL,
  filter_date_from TIMESTAMPTZ DEFAULT NULL,
  filter_date_to TIMESTAMPTZ DEFAULT NULL,
  filter_duration_min INTEGER DEFAULT NULL,
  filter_duration_max INTEGER DEFAULT NULL,
  sort_by TEXT DEFAULT 'relevance',
  sort_order TEXT DEFAULT 'DESC',
  limit_count INTEGER DEFAULT 20,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
  video_id UUID,
  title TEXT,
  description TEXT,
  thumbnail_url TEXT,
  duration INTEGER,
  tags TEXT[],
  machine_model TEXT,
  process_type TEXT,
  tooling TEXT,
  skill_level TEXT,
  author_id UUID,
  view_count INTEGER,
  bookmark_count INTEGER,
  created_at TIMESTAMPTZ,
  relevance_score REAL,
  highlight_title TEXT,
  highlight_description TEXT,
  highlight_transcript TEXT
) AS $$
DECLARE
  search_vector tsvector;
  query_text TEXT;
BEGIN
  -- Prepare search query
  query_text := trim(search_query);
  IF query_text = '' THEN
    search_vector := ''::tsvector;
  ELSE
    search_vector := plainto_tsquery('english', query_text);
  END IF;
  
  RETURN QUERY
  SELECT 
    si.video_id,
    si.title,
    si.description,
    v.thumbnail_url,
    si.duration,
    si.tags,
    si.machine_model,
    si.process_type,
    si.tooling,
    si.skill_level,
    si.author_id,
    si.view_count,
    si.bookmark_count,
    si.created_at,
    CASE 
      WHEN query_text = '' THEN 1.0
      ELSE ts_rank(si.search_vector, search_vector)
    END as relevance_score,
    CASE 
      WHEN query_text = '' THEN si.title
      ELSE ts_headline('english', si.title, search_vector, 'MaxWords=50,MinWords=10')
    END as highlight_title,
    CASE 
      WHEN query_text = '' THEN si.description
      ELSE ts_headline('english', COALESCE(si.description, ''), search_vector, 'MaxWords=100,MinWords=20')
    END as highlight_description,
    CASE 
      WHEN query_text = '' THEN NULL
      ELSE ts_headline('english', COALESCE(si.transcript_vector::text, ''), search_vector, 'MaxWords=150,MinWords=30')
    END as highlight_transcript
  FROM search_index si
  JOIN videos v ON v.id = si.video_id
  WHERE 
    (query_text = '' OR si.search_vector @@ search_vector)
    AND (array_length(filter_tags, 1) IS NULL OR si.tags && filter_tags)
    AND (filter_machine_model IS NULL OR si.machine_model ILIKE '%' || filter_machine_model || '%')
    AND (filter_process_type IS NULL OR si.process_type ILIKE '%' || filter_process_type || '%')
    AND (filter_skill_level IS NULL OR si.skill_level = filter_skill_level)
    AND (filter_status IS NULL OR si.status = filter_status)
    AND (filter_visibility IS NULL OR si.visibility = filter_visibility)
    AND (filter_author_id IS NULL OR si.author_id = filter_author_id)
    AND (filter_date_from IS NULL OR si.created_at >= filter_date_from)
    AND (filter_date_to IS NULL OR si.created_at <= filter_date_to)
    AND (filter_duration_min IS NULL OR si.duration >= filter_duration_min)
    AND (filter_duration_max IS NULL OR si.duration <= filter_duration_max)
  ORDER BY 
    CASE 
      WHEN sort_by = 'relevance' AND query_text != '' THEN ts_rank(si.search_vector, search_vector)
      WHEN sort_by = 'relevance' THEN 1.0
      WHEN sort_by = 'created_at' THEN si.created_at
      WHEN sort_by = 'view_count' THEN si.view_count
      WHEN sort_by = 'title' THEN si.title
      ELSE 1.0
    END DESC,
    CASE 
      WHEN sort_by = 'created_at' AND sort_order = 'ASC' THEN si.created_at
      WHEN sort_by = 'view_count' AND sort_order = 'ASC' THEN si.view_count
      WHEN sort_by = 'title' AND sort_order = 'ASC' THEN si.title
    END ASC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get search suggestions
CREATE OR REPLACE FUNCTION get_search_suggestions(
  query_text TEXT,
  suggestion_types TEXT[] DEFAULT ARRAY['tag', 'machine_model', 'process_type', 'tooling', 'author', 'title'],
  limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
  suggestion_type TEXT,
  suggestion_value TEXT,
  usage_count INTEGER,
  similarity_score REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ss.suggestion_type,
    ss.suggestion_value,
    ss.usage_count,
    similarity(ss.suggestion_value, query_text) as similarity_score
  FROM search_suggestions ss
  WHERE 
    ss.suggestion_type = ANY(suggestion_types)
    AND (
      query_text = '' OR 
      ss.suggestion_value ILIKE '%' || query_text || '%' OR
      similarity(ss.suggestion_value, query_text) > 0.3
    )
  ORDER BY 
    similarity_score DESC,
    ss.usage_count DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get faceted search counts
CREATE OR REPLACE FUNCTION get_search_facets(
  search_query TEXT DEFAULT '',
  filter_tags TEXT[] DEFAULT '{}',
  filter_machine_model TEXT DEFAULT NULL,
  filter_process_type TEXT DEFAULT NULL,
  filter_skill_level TEXT DEFAULT NULL,
  filter_status TEXT DEFAULT 'published',
  filter_visibility TEXT DEFAULT NULL,
  filter_author_id UUID DEFAULT NULL,
  filter_date_from TIMESTAMPTZ DEFAULT NULL,
  filter_date_to TIMESTAMPTZ DEFAULT NULL,
  filter_duration_min INTEGER DEFAULT NULL,
  filter_duration_max INTEGER DEFAULT NULL
)
RETURNS TABLE (
  facet_type TEXT,
  facet_value TEXT,
  facet_count BIGINT
) AS $$
DECLARE
  search_vector tsvector;
  query_text TEXT;
BEGIN
  query_text := trim(search_query);
  IF query_text = '' THEN
    search_vector := ''::tsvector;
  ELSE
    search_vector := plainto_tsquery('english', query_text);
  END IF;
  
  RETURN QUERY
  WITH base_results AS (
    SELECT si.*
    FROM search_index si
    WHERE 
      (query_text = '' OR si.search_vector @@ search_vector)
      AND (array_length(filter_tags, 1) IS NULL OR si.tags && filter_tags)
      AND (filter_machine_model IS NULL OR si.machine_model ILIKE '%' || filter_machine_model || '%')
      AND (filter_process_type IS NULL OR si.process_type ILIKE '%' || filter_process_type || '%')
      AND (filter_skill_level IS NULL OR si.skill_level = filter_skill_level)
      AND (filter_status IS NULL OR si.status = filter_status)
      AND (filter_visibility IS NULL OR si.visibility = filter_visibility)
      AND (filter_author_id IS NULL OR si.author_id = filter_author_id)
      AND (filter_date_from IS NULL OR si.created_at >= filter_date_from)
      AND (filter_date_to IS NULL OR si.created_at <= filter_date_to)
      AND (filter_duration_min IS NULL OR si.duration >= filter_duration_min)
      AND (filter_duration_max IS NULL OR si.duration <= filter_duration_max)
  )
  SELECT 'tags'::TEXT as facet_type, unnest(tags)::TEXT as facet_value, COUNT(*)::BIGINT as facet_count
  FROM base_results
  WHERE array_length(tags, 1) > 0
  GROUP BY unnest(tags)
  UNION ALL
  SELECT 'machine_model'::TEXT as facet_type, machine_model::TEXT as facet_value, COUNT(*)::BIGINT as facet_count
  FROM base_results
  WHERE machine_model IS NOT NULL
  GROUP BY machine_model
  UNION ALL
  SELECT 'process_type'::TEXT as facet_type, process_type::TEXT as facet_value, COUNT(*)::BIGINT as facet_count
  FROM base_results
  WHERE process_type IS NOT NULL
  GROUP BY process_type
  UNION ALL
  SELECT 'skill_level'::TEXT as facet_type, skill_level::TEXT as facet_value, COUNT(*)::BIGINT as facet_count
  FROM base_results
  WHERE skill_level IS NOT NULL
  GROUP BY skill_level
  ORDER BY facet_count DESC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE search_index ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for search_index
CREATE POLICY "search_index_select_authenticated"
  ON search_index FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "search_index_insert_authenticated"
  ON search_index FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "search_index_update_authenticated"
  ON search_index FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- RLS Policies for search_suggestions
CREATE POLICY "search_suggestions_select_authenticated"
  ON search_suggestions FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "search_suggestions_insert_authenticated"
  ON search_suggestions FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "search_suggestions_update_authenticated"
  ON search_suggestions FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- RLS Policies for search_analytics
CREATE POLICY "search_analytics_select_own"
  ON search_analytics FOR SELECT
  USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "search_analytics_insert_authenticated"
  ON search_analytics FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- =====================================================
-- DOCUMENTATION
-- =====================================================

COMMENT ON TABLE search_index IS 'Optimized search index for video content with full-text search capabilities';
COMMENT ON TABLE search_suggestions IS 'Search suggestions and autocomplete data';
COMMENT ON TABLE search_analytics IS 'Search query analytics and performance metrics';

COMMENT ON FUNCTION search_videos IS 'Search videos with full-text search and faceted filtering';
COMMENT ON FUNCTION get_search_suggestions IS 'Get search suggestions based on query text';
COMMENT ON FUNCTION get_search_facets IS 'Get faceted search counts for filters';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS search_analytics CASCADE;
-- DROP TABLE IF EXISTS search_suggestions CASCADE;
-- DROP TABLE IF EXISTS search_index CASCADE;
-- DROP FUNCTION IF EXISTS search_videos CASCADE;
-- DROP FUNCTION IF EXISTS get_search_suggestions CASCADE;
-- DROP FUNCTION IF EXISTS get_search_facets CASCADE;
-- DROP FUNCTION IF EXISTS update_search_index_vectors CASCADE;
