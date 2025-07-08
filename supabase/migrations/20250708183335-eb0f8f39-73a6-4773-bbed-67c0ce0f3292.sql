-- Mettre à jour la classe du cours pour correspondre aux étudiants existants
UPDATE cours 
SET classe = 'Terminale S' 
WHERE classe = 'Licence 1';