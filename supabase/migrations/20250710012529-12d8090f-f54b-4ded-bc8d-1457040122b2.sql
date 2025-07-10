-- Mettre à jour les politiques de stockage pour permettre l'upload des logos d'établissements
-- Supprimer les anciennes politiques restrictives
DROP POLICY IF EXISTS "Users can upload their own profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile photos" ON storage.objects;

-- Créer des politiques plus permissives pour les utilisateurs authentifiés
CREATE POLICY "Authenticated users can upload files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'profile-photos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'profile-photos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'profile-photos' AND auth.uid() IS NOT NULL);