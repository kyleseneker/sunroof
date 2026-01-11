-- Add tags column to memories table
ALTER TABLE memories ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Create index for tag searches
CREATE INDEX IF NOT EXISTS idx_memories_tags ON memories USING GIN (tags);

-- Function to get all unique tags for a user's memories
CREATE OR REPLACE FUNCTION get_user_tags(user_uuid UUID)
RETURNS TABLE(tag TEXT, count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT UNNEST(m.tags) as tag, COUNT(*) as count
  FROM memories m
  JOIN journeys j ON m.journey_id = j.id
  WHERE j.user_id = user_uuid
  AND m.deleted_at IS NULL
  GROUP BY tag
  ORDER BY count DESC, tag ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

