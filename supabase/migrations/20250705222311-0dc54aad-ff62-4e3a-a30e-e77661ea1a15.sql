-- Create table for landing page data
CREATE TABLE public.landing_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  personal_info JSONB NOT NULL DEFAULT '{
    "name": "Professeur",
    "title": "Enseignant",
    "photo": "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=300&h=300&fit=crop&crop=faces",
    "presentation": "Passionné par l''enseignement, j''accompagne mes élèves vers la réussite.",
    "experience": "Plusieurs années d''expérience",
    "etablissement": "Établissement scolaire"
  }'::jsonb,
  specialites TEXT[] DEFAULT ARRAY['Mathématiques', 'Sciences'],
  contact JSONB NOT NULL DEFAULT '{
    "email": "contact@professeur.fr",
    "telephone": "01 23 45 67 89",
    "adresse": "France"
  }'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.landing_pages ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own landing page" 
ON public.landing_pages 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own landing page" 
ON public.landing_pages 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own landing page" 
ON public.landing_pages 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own landing page" 
ON public.landing_pages 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_landing_pages_updated_at
BEFORE UPDATE ON public.landing_pages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();