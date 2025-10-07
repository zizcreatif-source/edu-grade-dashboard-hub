-- Add layout_type column to landing_pages table
ALTER TABLE landing_pages 
ADD COLUMN IF NOT EXISTS layout_type text DEFAULT 'classic';

-- Add a comment to document the column
COMMENT ON COLUMN landing_pages.layout_type IS 'Type de layout de la page d''accueil: classic ou glassmorphism';