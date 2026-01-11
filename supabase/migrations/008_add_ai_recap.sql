-- Add AI recap columns to journeys table
ALTER TABLE journeys 
ADD COLUMN IF NOT EXISTS ai_recap TEXT,
ADD COLUMN IF NOT EXISTS ai_recap_highlights TEXT[],
ADD COLUMN IF NOT EXISTS ai_recap_generated_at TIMESTAMPTZ;

-- Add index for quick lookup
CREATE INDEX IF NOT EXISTS idx_journeys_ai_recap ON journeys(id) WHERE ai_recap IS NOT NULL;

COMMENT ON COLUMN journeys.ai_recap IS 'AI-generated recap text for the journey';
COMMENT ON COLUMN journeys.ai_recap_highlights IS 'Array of highlight strings from AI recap';
COMMENT ON COLUMN journeys.ai_recap_generated_at IS 'Timestamp when the AI recap was generated';

