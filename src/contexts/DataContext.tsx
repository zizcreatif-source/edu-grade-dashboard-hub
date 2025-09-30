import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

// Data Types
export interface Etablissement {
  id: string;
  nom: string;
  logo?: string;
  configuration: {
    noteMin: number;
    noteMax: number;
  };
}

export interface Cours {
  id: string;
  nom: string;
  etablissementId: string;
  quantumHoraire: number;
  progression: number;
  couleur: string;
  description?: string;
  classe: string;
  anneeScolaire: string;
  responsableClasse?: string;
}

export interface Etudiant {
  id: string;
  nom: string;
  prenom: string;
  numero: string;
  etablissementId: string;
  classe: string;
  email?: string;
  avatar?: string;
  anneeScolaire: string;
  groupeIds?: string[];
}

export interface Note {
  id: string;
  etudiantId: string;
  coursId: string;
  evaluation: string;
  note: number;
  date: string;
  commentaire?: string;
}

export interface Evaluation {
  id: string;
  coursId: string;
  nom: string;
  date: string;
  type: 'controle' | 'examen' | 'tp' | 'oral';
  description?: string;
  estNoteGroupe?: boolean;
  groupeId?: string;
}

export interface Groupe {
  id: string;
  nom: string;
  description?: string;
  etudiantIds: string[];
  responsableId?: string;
  classe: string;
  anneeScolaire: string;
  etablissementId?: string;
  coursId?: string;
  parentGroupId?: string;
  type: 'main' | 'subgroup';
}

export interface SeanceCours {
  id: string;
  coursId: string;
  date: string;
  duree: number; // en heures
  contenu: string;
  objectifs?: string;
  ressources?: string;
  devoirs?: string;
}

export interface Presence {
  id: string;
  seanceId: string;
  etudiantId: string;
  statut: 'present' | 'absent' | 'retard';
  commentaire?: string;
}

interface DataContextType {
  etablissements: Etablissement[];
  cours: Cours[];
  etudiants: Etudiant[];
  notes: Note[];
  evaluations: Evaluation[];
  groupes: Groupe[];
  seances: SeanceCours[];
  presences: Presence[];
  // CRUD Operations - now async with Supabase
  addEtablissement: (etablissement: Omit<Etablissement, 'id'>) => Promise<void>;
  updateEtablissement: (id: string, etablissement: Partial<Etablissement>) => Promise<void>;
  deleteEtablissement: (id: string) => Promise<void>;
  addCours: (cours: Omit<Cours, 'id'>) => Promise<void>;
  updateCours: (id: string, cours: Partial<Cours>) => Promise<void>;
  deleteCours: (id: string) => Promise<void>;
  addEtudiant: (etudiant: Omit<Etudiant, 'id'>) => Promise<void>;
  updateEtudiant: (id: string, etudiant: Partial<Etudiant>) => Promise<void>;
  deleteEtudiant: (id: string) => Promise<void>;
  addNote: (note: Omit<Note, 'id'>) => Promise<void>;
  updateNote: (id: string, note: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  addEvaluation: (evaluation: Omit<Evaluation, 'id'>) => Promise<void>;
  updateEvaluation: (id: string, evaluation: Partial<Evaluation>) => Promise<void>;
  deleteEvaluation: (id: string) => Promise<void>;
  addGroupe: (groupe: Omit<Groupe, 'id'>) => Promise<void>;
  updateGroupe: (id: string, groupe: Partial<Groupe>) => Promise<void>;
  deleteGroupe: (id: string) => Promise<void>;
  addSeance: (seance: Omit<SeanceCours, 'id'>) => Promise<void>;
  updateSeance: (id: string, seance: Partial<SeanceCours>) => Promise<void>;
  deleteSeance: (id: string) => Promise<void>;
  addPresence: (presence: Omit<Presence, 'id'>) => Promise<void>;
  updatePresence: (id: string, presence: Partial<Presence>) => Promise<void>;
  deletePresence: (id: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [etablissements, setEtablissements] = useState<Etablissement[]>([]);
  const [cours, setCours] = useState<Cours[]>([]);
  const [etudiants, setEtudiants] = useState<Etudiant[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [groupes, setGroupes] = useState<Groupe[]>([]);
  const [seances, setSeances] = useState<SeanceCours[]>([]);
  const [presences, setPresences] = useState<Presence[]>([]);
  const [loading, setLoading] = useState(false);

  // Load data from Supabase when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      loadAllData();
    } else {
      // Clear data when user logs out
      setEtablissements([]);
      setCours([]);
      setEtudiants([]);
      setNotes([]);
      setEvaluations([]);
      setGroupes([]);
      setSeances([]);
      setPresences([]);
    }
  }, [isAuthenticated, user]);

  const loadAllData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Charger les établissements d'abord
      await loadEtablissements();
      
      // Ensuite charger le reste des données
      await Promise.all([
        loadCours(),
        loadEtudiants(),
        loadNotes(),
        loadEvaluations(),
        loadGroupes(),
        loadSeances(),
        loadPresences()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Transform functions for Supabase data
  const transformEtablissement = (data: any): Etablissement => ({
    id: data.id,
    nom: data.nom,
    logo: data.logo,
    configuration: typeof data.configuration === 'string' 
      ? JSON.parse(data.configuration)
      : data.configuration || {
          noteMin: 0,
          noteMax: 20
        }
  });

  const transformCours = (data: any): Cours => ({
    id: data.id,
    nom: data.nom,
    etablissementId: data.etablissement_id,
    quantumHoraire: data.quantum_horaire,
    progression: data.progression,
    couleur: data.couleur,
    description: data.description,
    classe: data.classe,
    anneeScolaire: data.annee_scolaire,
    responsableClasse: data.responsable_classe
  });

  const transformEtudiant = (data: any): Etudiant => ({
    id: data.id,
    nom: data.nom,
    prenom: data.prenom,
    numero: data.numero,
    etablissementId: data.etablissement_id,
    classe: data.classe,
    email: data.email,
    avatar: data.avatar,
    anneeScolaire: data.annee_scolaire,
    groupeIds: data.groupe_ids || []
  });

  const transformNote = (data: any): Note => ({
    id: data.id,
    etudiantId: data.etudiant_id,
    coursId: data.cours_id,
    evaluation: data.evaluation,
    note: parseFloat(data.note),
    date: data.date,
    commentaire: data.commentaire
  });

  const transformEvaluation = (data: any): Evaluation => ({
    id: data.id,
    coursId: data.cours_id,
    nom: data.nom,
    date: data.date,
    type: data.type as 'controle' | 'examen' | 'tp' | 'oral',
    description: data.description,
    estNoteGroupe: data.est_note_groupe,
    groupeId: data.groupe_id
  });

  const transformGroupe = (data: any): Groupe => ({
    id: data.id,
    nom: data.nom,
    description: data.description,
    etudiantIds: data.etudiant_ids || [],
    responsableId: data.responsable_id,
    classe: data.classe,
    anneeScolaire: data.annee_scolaire,
    etablissementId: data.etablissement_id,
    coursId: data.cours_id,
    parentGroupId: data.parent_group_id,
    type: data.type || 'main'
  });

  const transformSeance = (data: any): SeanceCours => ({
    id: data.id,
    coursId: data.cours_id,
    date: data.date,
    duree: parseFloat(data.duree),
    contenu: data.contenu,
    objectifs: data.objectifs,
    ressources: data.ressources,
    devoirs: data.devoirs
  });

  const transformPresence = (data: any): Presence => ({
    id: data.id,
    seanceId: data.seance_id,
    etudiantId: data.etudiant_id,
    statut: data.statut as 'present' | 'absent' | 'retard',
    commentaire: data.commentaire
  });

  // Load functions from Supabase
  const loadEtablissements = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('etablissements')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error loading etablissements:', error);
      return;
    }
    
    // Si aucun établissement existe, créer un établissement par défaut
    if (!data || data.length === 0) {
      await createDefaultEtablissement();
      // Recharger après création
      const { data: newData } = await supabase
        .from('etablissements')
        .select('*')
        .order('created_at', { ascending: false });
      setEtablissements((newData || []).map(transformEtablissement));
    } else {
      setEtablissements(data.map(transformEtablissement));
    }
  };

  const createDefaultEtablissement = async () => {
    if (!user) return;
    const { error } = await supabase
      .from('etablissements')
      .insert({
        user_id: user.id,
        nom: 'Mon Établissement',
        configuration: {
          noteMin: 0,
          noteMax: 20
        }
      });
    
    if (error) {
      console.error('Error creating default etablissement:', error);
    }
  };

  const loadCours = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('cours')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error loading cours:', error);
      return;
    }
    
    setCours((data || []).map(transformCours));
  };

  const loadEtudiants = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('etudiants')
      .select('*')
      .order('nom', { ascending: true });
    
    if (error) {
      console.error('Error loading etudiants:', error);
      return;
    }
    
    setEtudiants((data || []).map(transformEtudiant));
  };

  const loadNotes = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) {
      console.error('Error loading notes:', error);
      return;
    }
    
    setNotes((data || []).map(transformNote));
  };

  const loadEvaluations = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('evaluations')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) {
      console.error('Error loading evaluations:', error);
      return;
    }
    
    setEvaluations((data || []).map(transformEvaluation));
  };

  const loadGroupes = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('groupes')
      .select('*')
      .order('nom', { ascending: true });
    
    if (error) {
      console.error('Error loading groupes:', error);
      return;
    }
    
    setGroupes((data || []).map(transformGroupe));
  };

  const loadSeances = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('seances')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) {
      console.error('Error loading seances:', error);
      return;
    }
    
    setSeances((data || []).map(transformSeance));
  };

  const loadPresences = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('presences')
      .select('*');
    
    if (error) {
      console.error('Error loading presences:', error);
      return;
    }
    
    setPresences((data || []).map(transformPresence));
  };

  // Note: Data is now persisted directly to Supabase, no localStorage needed

  // CRUD Operations with Supabase integration
  
  // Helper functions to transform data to Supabase format
  const toSupabaseEtablissement = (etablissement: Partial<Etablissement>) => ({
    nom: etablissement.nom,
    logo: etablissement.logo,
    configuration: etablissement.configuration,
    user_id: user?.id
  });

  const toSupabaseCours = (cours: Partial<Cours>) => ({
    nom: cours.nom,
    etablissement_id: cours.etablissementId,
    quantum_horaire: cours.quantumHoraire,
    progression: cours.progression,
    couleur: cours.couleur,
    description: cours.description,
    classe: cours.classe,
    annee_scolaire: cours.anneeScolaire,
    responsable_classe: cours.responsableClasse,
    user_id: user?.id
  });

  const toSupabaseEtudiant = (etudiant: Partial<Etudiant>) => ({
    nom: etudiant.nom,
    prenom: etudiant.prenom,
    numero: etudiant.numero,
    etablissement_id: etudiant.etablissementId,
    classe: etudiant.classe,
    email: etudiant.email,
    avatar: etudiant.avatar,
    annee_scolaire: etudiant.anneeScolaire,
    groupe_ids: etudiant.groupeIds,
    user_id: user?.id
  });

  const toSupabaseNote = (note: Partial<Note>) => ({
    etudiant_id: note.etudiantId,
    cours_id: note.coursId,
    evaluation: note.evaluation,
    note: note.note,
    date: note.date,
    commentaire: note.commentaire,
    user_id: user?.id
  });

  const toSupabaseEvaluation = (evaluation: Partial<Evaluation>) => ({
    cours_id: evaluation.coursId,
    nom: evaluation.nom,
    date: evaluation.date,
    type: evaluation.type,
    description: evaluation.description,
    est_note_groupe: evaluation.estNoteGroupe,
    groupe_id: evaluation.groupeId,
    user_id: user?.id
  });

  const toSupabaseGroupe = (groupe: Partial<Groupe>) => ({
    nom: groupe.nom,
    description: groupe.description,
    etudiant_ids: groupe.etudiantIds,
    responsable_id: groupe.responsableId,
    classe: groupe.classe,
    annee_scolaire: groupe.anneeScolaire,
    etablissement_id: groupe.etablissementId,
    cours_id: groupe.coursId,
    parent_group_id: groupe.parentGroupId,
    type: groupe.type || 'main',
    user_id: user?.id
  });

  const toSupabaseSeance = (seance: Partial<SeanceCours>) => ({
    cours_id: seance.coursId,
    date: seance.date,
    duree: seance.duree,
    contenu: seance.contenu,
    objectifs: seance.objectifs,
    ressources: seance.ressources,
    devoirs: seance.devoirs,
    user_id: user?.id
  });

  const toSupabasePresence = (presence: Partial<Presence>) => ({
    seance_id: presence.seanceId,
    etudiant_id: presence.etudiantId,
    statut: presence.statut,
    commentaire: presence.commentaire,
    user_id: user?.id
  });

  // Etablissements
  const addEtablissement = async (etablissement: Omit<Etablissement, 'id'>) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('etablissements')
        .insert(toSupabaseEtablissement(etablissement))
        .select()
        .single();
      
      if (error) throw error;
      
      const newEtablissement = transformEtablissement(data);
      setEtablissements(prev => [...prev, newEtablissement]);
    } catch (error) {
      console.error('Error adding etablissement:', error);
    }
  };

  const updateEtablissement = async (id: string, etablissement: Partial<Etablissement>) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('etablissements')
        .update(toSupabaseEtablissement(etablissement))
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      const updatedEtablissement = transformEtablissement(data);
      setEtablissements(prev => prev.map(e => e.id === id ? updatedEtablissement : e));
    } catch (error) {
      console.error('Error updating etablissement:', error);
    }
  };

  const deleteEtablissement = async (id: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('etablissements')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setEtablissements(prev => prev.filter(e => e.id !== id));
    } catch (error) {
      console.error('Error deleting etablissement:', error);
    }
  };

  // Cours
  const addCours = async (cours: Omit<Cours, 'id'>) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('cours')
        .insert(toSupabaseCours(cours))
        .select()
        .single();
      
      if (error) throw error;
      
      const newCours = transformCours(data);
      setCours(prev => [...prev, newCours]);
    } catch (error) {
      console.error('Error adding cours:', error);
    }
  };

  const updateCours = async (id: string, cours: Partial<Cours>) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('cours')
        .update(toSupabaseCours(cours))
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      const updatedCours = transformCours(data);
      setCours(prev => prev.map(c => c.id === id ? updatedCours : c));
    } catch (error) {
      console.error('Error updating cours:', error);
    }
  };

  const deleteCours = async (id: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('cours')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setCours(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error deleting cours:', error);
    }
  };

  // Etudiants
  const addEtudiant = async (etudiant: Omit<Etudiant, 'id'>) => {
    if (!user) return;
    
    try {
      const etudiantWithDefaults = {
        ...etudiant,
        avatar: etudiant.avatar || `https://ui-avatars.com/api/?name=${etudiant.prenom}+${etudiant.nom}&background=random`,
        anneeScolaire: etudiant.anneeScolaire || new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
      };

      const { data, error } = await supabase
        .from('etudiants')
        .insert(toSupabaseEtudiant(etudiantWithDefaults))
        .select()
        .single();
      
      if (error) throw error;
      
      const newEtudiant = transformEtudiant(data);
      setEtudiants(prev => [...prev, newEtudiant]);
    } catch (error) {
      console.error('Error adding etudiant:', error);
    }
  };

  const updateEtudiant = async (id: string, etudiant: Partial<Etudiant>) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('etudiants')
        .update(toSupabaseEtudiant(etudiant))
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      const updatedEtudiant = transformEtudiant(data);
      setEtudiants(prev => prev.map(e => e.id === id ? updatedEtudiant : e));
    } catch (error) {
      console.error('Error updating etudiant:', error);
    }
  };

  const deleteEtudiant = async (id: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('etudiants')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setEtudiants(prev => prev.filter(e => e.id !== id));
    } catch (error) {
      console.error('Error deleting etudiant:', error);
    }
  };

  // Notes
  const addNote = async (note: Omit<Note, 'id'>) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('notes')
        .insert(toSupabaseNote(note))
        .select()
        .single();
      
      if (error) throw error;
      
      const newNote = transformNote(data);
      setNotes(prev => [...prev, newNote]);
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const updateNote = async (id: string, note: Partial<Note>) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('notes')
        .update(toSupabaseNote(note))
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      const updatedNote = transformNote(data);
      setNotes(prev => prev.map(n => n.id === id ? updatedNote : n));
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  const deleteNote = async (id: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setNotes(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  // Evaluations
  const addEvaluation = async (evaluation: Omit<Evaluation, 'id'>) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('evaluations')
        .insert(toSupabaseEvaluation(evaluation))
        .select()
        .single();
      
      if (error) throw error;
      
      const newEvaluation = transformEvaluation(data);
      setEvaluations(prev => [...prev, newEvaluation]);
    } catch (error) {
      console.error('Error adding evaluation:', error);
    }
  };

  const updateEvaluation = async (id: string, evaluation: Partial<Evaluation>) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('evaluations')
        .update(toSupabaseEvaluation(evaluation))
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      const updatedEvaluation = transformEvaluation(data);
      setEvaluations(prev => prev.map(e => e.id === id ? updatedEvaluation : e));
    } catch (error) {
      console.error('Error updating evaluation:', error);
    }
  };

  const deleteEvaluation = async (id: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('evaluations')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setEvaluations(prev => prev.filter(e => e.id !== id));
    } catch (error) {
      console.error('Error deleting evaluation:', error);
    }
  };

  // Groupes
  const addGroupe = async (groupe: Omit<Groupe, 'id'>) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('groupes')
        .insert(toSupabaseGroupe(groupe))
        .select()
        .single();
      
      if (error) throw error;
      
      const newGroupe = transformGroupe(data);
      setGroupes(prev => [...prev, newGroupe]);
    } catch (error) {
      console.error('Error adding groupe:', error);
    }
  };

  const updateGroupe = async (id: string, groupe: Partial<Groupe>) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('groupes')
        .update(toSupabaseGroupe(groupe))
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      const updatedGroupe = transformGroupe(data);
      setGroupes(prev => prev.map(g => g.id === id ? updatedGroupe : g));
    } catch (error) {
      console.error('Error updating groupe:', error);
    }
  };

  const deleteGroupe = async (id: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('groupes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setGroupes(prev => prev.filter(g => g.id !== id));
    } catch (error) {
      console.error('Error deleting groupe:', error);
    }
  };

  // Séances
  const addSeance = async (seance: Omit<SeanceCours, 'id'>) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('seances')
        .insert(toSupabaseSeance(seance))
        .select()
        .single();
      
      if (error) throw error;
      
      const newSeance = transformSeance(data);
      setSeances(prev => [...prev, newSeance]);
      
      // Mettre à jour automatiquement la progression du cours
      const coursSeances = seances.filter(s => s.coursId === seance.coursId);
      const totalHeuresEffectuees = coursSeances.reduce((acc, s) => acc + s.duree, 0) + seance.duree;
      const coursActuel = cours.find(c => c.id === seance.coursId);
      if (coursActuel) {
        const nouvelleProgression = Math.min(100, (totalHeuresEffectuees / coursActuel.quantumHoraire) * 100);
        await updateCours(seance.coursId, { progression: Math.round(nouvelleProgression) });
      }
    } catch (error) {
      console.error('Error adding seance:', error);
    }
  };

  const updateSeance = async (id: string, seance: Partial<SeanceCours>) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('seances')
        .update(toSupabaseSeance(seance))
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      const updatedSeance = transformSeance(data);
      setSeances(prev => prev.map(s => s.id === id ? updatedSeance : s));
    } catch (error) {
      console.error('Error updating seance:', error);
    }
  };

  const deleteSeance = async (id: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('seances')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setSeances(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      console.error('Error deleting seance:', error);
    }
  };

  // Presences
  const addPresence = async (presence: Omit<Presence, 'id'>) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('presences')
        .insert(toSupabasePresence(presence))
        .select()
        .single();
      
      if (error) throw error;
      
      const newPresence = transformPresence(data);
      setPresences(prev => [...prev, newPresence]);
    } catch (error) {
      console.error('Error adding presence:', error);
    }
  };

  const updatePresence = async (id: string, presence: Partial<Presence>) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('presences')
        .update(toSupabasePresence(presence))
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      const updatedPresence = transformPresence(data);
      setPresences(prev => prev.map(p => p.id === id ? updatedPresence : p));
    } catch (error) {
      console.error('Error updating presence:', error);
    }
  };

  const deletePresence = async (id: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('presences')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setPresences(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting presence:', error);
    }
  };

  const value = {
    etablissements,
    cours,
    etudiants,
    notes,
    evaluations,
    groupes,
    seances,
    presences,
    addEtablissement,
    updateEtablissement,
    deleteEtablissement,
    addCours,
    updateCours,
    deleteCours,
    addEtudiant,
    updateEtudiant,
    deleteEtudiant,
    addNote,
    updateNote,
    deleteNote,
    addEvaluation,
    updateEvaluation,
    deleteEvaluation,
    addGroupe,
    updateGroupe,
    deleteGroupe,
    addSeance,
    updateSeance,
    deleteSeance,
    addPresence,
    updatePresence,
    deletePresence
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};