-- Add 'video' to the memories type constraint

-- Drop the existing constraint
ALTER TABLE memories DROP CONSTRAINT IF EXISTS memories_type_check;

-- Add the new constraint with 'video' included
ALTER TABLE memories ADD CONSTRAINT memories_type_check 
  CHECK (type IN ('photo', 'video', 'audio', 'text'));

