-- Ajouter les colonnes manquantes à la table groupes
ALTER TABLE public.groupes 
ADD COLUMN IF NOT EXISTS etablissement_id uuid,
ADD COLUMN IF NOT EXISTS cours_id uuid,
ADD COLUMN IF NOT EXISTS parent_group_id uuid,
ADD COLUMN IF NOT EXISTS type text DEFAULT 'main' CHECK (type IN ('main', 'subgroup'));

-- Créer un index pour améliorer les performances des requêtes sur parent_group_id
CREATE INDEX IF NOT EXISTS idx_groupes_parent_group_id ON public.groupes(parent_group_id);

-- Créer un index pour les requêtes sur etablissement_id
CREATE INDEX IF NOT EXISTS idx_groupes_etablissement_id ON public.groupes(etablissement_id);

-- Créer un index pour les requêtes sur cours_id
CREATE INDEX IF NOT EXISTS idx_groupes_cours_id ON public.groupes(cours_id);