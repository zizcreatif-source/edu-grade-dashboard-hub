-- Drop the existing check constraint if it exists
ALTER TABLE landing_pages 
DROP CONSTRAINT IF EXISTS landing_pages_layout_type_check;

-- Add a new check constraint that allows 'classic' and 'glassmorphism'
ALTER TABLE landing_pages
ADD CONSTRAINT landing_pages_layout_type_check 
CHECK (layout_type IN ('classic', 'glassmorphism'));