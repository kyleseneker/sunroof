-- Migration: Support email-based collaborator invites
-- Change shared_with from UUID[] to TEXT[] to support both user_ids and emails
-- On signup, a trigger converts email invites to user_ids

-- Step 1: Drop ALL existing policies that reference shared_with or journeys
-- Journey policies
DROP POLICY IF EXISTS "Users can view own journeys" ON journeys;
DROP POLICY IF EXISTS "Users can view journeys shared with them" ON journeys;
DROP POLICY IF EXISTS "Users can insert own journeys" ON journeys;
DROP POLICY IF EXISTS "Users can create journeys" ON journeys;
DROP POLICY IF EXISTS "Users can update own journeys" ON journeys;
DROP POLICY IF EXISTS "Users can delete own journeys" ON journeys;

-- Memory policies (various naming conventions from different migrations)
DROP POLICY IF EXISTS "Users can view own memories" ON memories;
DROP POLICY IF EXISTS "Users can view shared journey memories" ON memories;
DROP POLICY IF EXISTS "Users can view memories in accessible journeys" ON memories;
DROP POLICY IF EXISTS "Users can insert own memories" ON memories;
DROP POLICY IF EXISTS "Users can insert memories to shared journeys" ON memories;
DROP POLICY IF EXISTS "Users can create memories in accessible journeys" ON memories;
DROP POLICY IF EXISTS "Users can update own memories" ON memories;
DROP POLICY IF EXISTS "Users can update memories on shared journeys" ON memories;
DROP POLICY IF EXISTS "Users can update memories in own journeys" ON memories;
DROP POLICY IF EXISTS "Users can delete own memories" ON memories;
DROP POLICY IF EXISTS "Users can delete memories from shared journeys" ON memories;
DROP POLICY IF EXISTS "Users can delete memories in own journeys" ON memories;

-- Step 2: Alter shared_with column from UUID[] to TEXT[]
ALTER TABLE journeys 
  ALTER COLUMN shared_with TYPE TEXT[] 
  USING shared_with::TEXT[];

ALTER TABLE journeys 
  ALTER COLUMN shared_with SET DEFAULT '{}';

-- Step 3: Function to convert email invites to user_id when a user signs up
CREATE OR REPLACE FUNCTION convert_email_invites_to_user_id()
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
BEGIN
  user_email := LOWER(TRIM(NEW.email));
  
  IF user_email IS NULL OR user_email = '' THEN
    RETURN NEW;
  END IF;
  
  UPDATE journeys
  SET shared_with = array_replace(shared_with, user_email, NEW.id::TEXT)
  WHERE shared_with IS NOT NULL
    AND user_email = ANY(shared_with);
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Never block user signup if invite conversion fails
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger on auth.users for new signups
DROP TRIGGER IF EXISTS on_auth_user_created_convert_invites ON auth.users;
CREATE TRIGGER on_auth_user_created_convert_invites
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION convert_email_invites_to_user_id();

-- Step 4: Recreate ALL journey policies
CREATE POLICY "Users can view own journeys" ON journeys
  FOR SELECT
  USING (
    auth.uid() = user_id 
    OR (auth.uid())::TEXT = ANY(shared_with)
    OR LOWER(auth.jwt() ->> 'email') = ANY(shared_with)
  );

CREATE POLICY "Users can insert own journeys" ON journeys
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own journeys" ON journeys
  FOR UPDATE
  USING (
    auth.uid() = user_id 
    OR (auth.uid())::TEXT = ANY(shared_with)
    OR LOWER(auth.jwt() ->> 'email') = ANY(shared_with)
  );

CREATE POLICY "Users can delete own journeys" ON journeys
  FOR DELETE
  USING (auth.uid() = user_id);

-- Step 5: Recreate ALL memory policies
CREATE POLICY "Users can view own memories" ON memories
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM journeys 
      WHERE journeys.id = memories.journey_id 
      AND (
        journeys.user_id = auth.uid()
        OR (auth.uid())::TEXT = ANY(journeys.shared_with)
        OR LOWER(auth.jwt() ->> 'email') = ANY(journeys.shared_with)
      )
    )
  );

CREATE POLICY "Users can insert own memories" ON memories
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM journeys 
      WHERE journeys.id = memories.journey_id 
      AND (
        journeys.user_id = auth.uid()
        OR (auth.uid())::TEXT = ANY(journeys.shared_with)
        OR LOWER(auth.jwt() ->> 'email') = ANY(journeys.shared_with)
      )
    )
  );

CREATE POLICY "Users can update own memories" ON memories
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM journeys 
      WHERE journeys.id = memories.journey_id 
      AND (
        journeys.user_id = auth.uid()
        OR (auth.uid())::TEXT = ANY(journeys.shared_with)
        OR LOWER(auth.jwt() ->> 'email') = ANY(journeys.shared_with)
      )
    )
  );

CREATE POLICY "Users can delete own memories" ON memories
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM journeys 
      WHERE journeys.id = memories.journey_id 
      AND (
        journeys.user_id = auth.uid()
        OR (auth.uid())::TEXT = ANY(journeys.shared_with)
        OR LOWER(auth.jwt() ->> 'email') = ANY(journeys.shared_with)
      )
    )
  );

-- Documentation
COMMENT ON FUNCTION convert_email_invites_to_user_id IS 
  'Converts email-based journey invites to user_id when a new user signs up';
COMMENT ON COLUMN journeys.shared_with IS 
  'Array of user_ids (as text) or email addresses for pending invites';
