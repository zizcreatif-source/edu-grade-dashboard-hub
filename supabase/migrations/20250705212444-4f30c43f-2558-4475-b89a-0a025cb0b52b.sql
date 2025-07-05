-- Create etablissements table
CREATE TABLE public.etablissements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nom TEXT NOT NULL,
  logo TEXT,
  configuration JSONB DEFAULT '{
    "noteMin": 0,
    "noteMax": 20,
    "coefficients": {
      "controle": 1,
      "examen": 2,
      "tp": 1.5,
      "oral": 1
    }
  }'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create cours table
CREATE TABLE public.cours (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  etablissement_id UUID NOT NULL REFERENCES public.etablissements(id) ON DELETE CASCADE,
  nom TEXT NOT NULL,
  quantum_horaire INTEGER NOT NULL DEFAULT 0,
  progression INTEGER NOT NULL DEFAULT 0 CHECK (progression >= 0 AND progression <= 100),
  couleur TEXT NOT NULL DEFAULT '#2563eb',
  description TEXT,
  classe TEXT NOT NULL,
  annee_scolaire TEXT NOT NULL,
  responsable_classe TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create etudiants table
CREATE TABLE public.etudiants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  etablissement_id UUID NOT NULL REFERENCES public.etablissements(id) ON DELETE CASCADE,
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  numero TEXT NOT NULL,
  classe TEXT NOT NULL,
  email TEXT,
  avatar TEXT,
  annee_scolaire TEXT NOT NULL,
  groupe_ids UUID[] DEFAULT ARRAY[]::UUID[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, numero, annee_scolaire)
);

-- Create evaluations table
CREATE TABLE public.evaluations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cours_id UUID NOT NULL REFERENCES public.cours(id) ON DELETE CASCADE,
  nom TEXT NOT NULL,
  date DATE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('controle', 'examen', 'tp', 'oral')),
  description TEXT,
  est_note_groupe BOOLEAN DEFAULT false,
  groupe_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notes table
CREATE TABLE public.notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  etudiant_id UUID NOT NULL REFERENCES public.etudiants(id) ON DELETE CASCADE,
  cours_id UUID NOT NULL REFERENCES public.cours(id) ON DELETE CASCADE,
  evaluation TEXT NOT NULL,
  note DECIMAL(4,2) NOT NULL,
  date DATE NOT NULL,
  commentaire TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create groupes table
CREATE TABLE public.groupes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nom TEXT NOT NULL,
  description TEXT,
  etudiant_ids UUID[] DEFAULT ARRAY[]::UUID[],
  responsable_id UUID,
  classe TEXT NOT NULL,
  annee_scolaire TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create seances table
CREATE TABLE public.seances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cours_id UUID NOT NULL REFERENCES public.cours(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  duree DECIMAL(3,1) NOT NULL DEFAULT 1.0,
  contenu TEXT NOT NULL,
  objectifs TEXT,
  ressources TEXT,
  devoirs TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create presences table
CREATE TABLE public.presences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  seance_id UUID NOT NULL REFERENCES public.seances(id) ON DELETE CASCADE,
  etudiant_id UUID NOT NULL REFERENCES public.etudiants(id) ON DELETE CASCADE,
  statut TEXT NOT NULL CHECK (statut IN ('present', 'absent', 'retard')),
  commentaire TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(seance_id, etudiant_id)
);

-- Enable RLS on all tables
ALTER TABLE public.etablissements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.etudiants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groupes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for etablissements
CREATE POLICY "Users can view their own etablissements" ON public.etablissements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own etablissements" ON public.etablissements FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own etablissements" ON public.etablissements FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own etablissements" ON public.etablissements FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for cours
CREATE POLICY "Users can view their own cours" ON public.cours FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own cours" ON public.cours FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own cours" ON public.cours FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own cours" ON public.cours FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for etudiants
CREATE POLICY "Users can view their own etudiants" ON public.etudiants FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own etudiants" ON public.etudiants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own etudiants" ON public.etudiants FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own etudiants" ON public.etudiants FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for evaluations
CREATE POLICY "Users can view their own evaluations" ON public.evaluations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own evaluations" ON public.evaluations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own evaluations" ON public.evaluations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own evaluations" ON public.evaluations FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for notes
CREATE POLICY "Users can view their own notes" ON public.notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own notes" ON public.notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own notes" ON public.notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own notes" ON public.notes FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for groupes
CREATE POLICY "Users can view their own groupes" ON public.groupes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own groupes" ON public.groupes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own groupes" ON public.groupes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own groupes" ON public.groupes FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for seances
CREATE POLICY "Users can view their own seances" ON public.seances FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own seances" ON public.seances FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own seances" ON public.seances FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own seances" ON public.seances FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for presences
CREATE POLICY "Users can view their own presences" ON public.presences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own presences" ON public.presences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own presences" ON public.presences FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own presences" ON public.presences FOR DELETE USING (auth.uid() = user_id);

-- Add update triggers for all tables
CREATE TRIGGER update_etablissements_updated_at BEFORE UPDATE ON public.etablissements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cours_updated_at BEFORE UPDATE ON public.cours FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_etudiants_updated_at BEFORE UPDATE ON public.etudiants FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_evaluations_updated_at BEFORE UPDATE ON public.evaluations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON public.notes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_groupes_updated_at BEFORE UPDATE ON public.groupes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_seances_updated_at BEFORE UPDATE ON public.seances FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_presences_updated_at BEFORE UPDATE ON public.presences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();