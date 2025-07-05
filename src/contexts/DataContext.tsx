import React, { createContext, useContext, useState, useEffect } from 'react';

// Data Types
export interface Etablissement {
  id: string;
  nom: string;
  logo?: string;
  configuration: {
    noteMin: number;
    noteMax: number;
    coefficients: Record<string, number>;
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
  // CRUD Operations
  addEtablissement: (etablissement: Omit<Etablissement, 'id'>) => void;
  updateEtablissement: (id: string, etablissement: Partial<Etablissement>) => void;
  deleteEtablissement: (id: string) => void;
  addCours: (cours: Omit<Cours, 'id'>) => void;
  updateCours: (id: string, cours: Partial<Cours>) => void;
  deleteCours: (id: string) => void;
  addEtudiant: (etudiant: Omit<Etudiant, 'id'>) => void;
  updateEtudiant: (id: string, etudiant: Partial<Etudiant>) => void;
  deleteEtudiant: (id: string) => void;
  addNote: (note: Omit<Note, 'id'>) => void;
  updateNote: (id: string, note: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  addEvaluation: (evaluation: Omit<Evaluation, 'id'>) => void;
  updateEvaluation: (id: string, evaluation: Partial<Evaluation>) => void;
  deleteEvaluation: (id: string) => void;
  addGroupe: (groupe: Omit<Groupe, 'id'>) => void;
  updateGroupe: (id: string, groupe: Partial<Groupe>) => void;
  deleteGroupe: (id: string) => void;
  addSeance: (seance: Omit<SeanceCours, 'id'>) => void;
  updateSeance: (id: string, seance: Partial<SeanceCours>) => void;
  deleteSeance: (id: string) => void;
  addPresence: (presence: Omit<Presence, 'id'>) => void;
  updatePresence: (id: string, presence: Partial<Presence>) => void;
  deletePresence: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

// Mock data
const mockData = {
  etablissements: [
    {
      id: '1',
      nom: 'Lycée Jean Moulin',
      logo: 'https://ui-avatars.com/api/?name=JM&background=2563eb&color=ffffff',
      configuration: {
        noteMin: 0,
        noteMax: 20,
        coefficients: { controle: 1, examen: 2, tp: 1.5, oral: 1 }
      }
    }
  ] as Etablissement[],
  cours: [
    {
      id: '1',
      nom: 'Mathématiques',
      etablissementId: '1',
      quantumHoraire: 4,
      progression: 65,
      couleur: '#2563eb',
      classe: 'Terminale S',
      description: 'Cours de mathématiques niveau terminale',
      anneeScolaire: '2024-2025',
      responsableClasse: 'M. Dupuis'
    },
    {
      id: '2',
      nom: 'Physique-Chimie',
      etablissementId: '1',
      quantumHoraire: 6,
      progression: 78,
      couleur: '#16a34a',
      classe: 'Terminale S',
      description: 'Cours de physique-chimie',
      anneeScolaire: '2024-2025',
      responsableClasse: 'M. Dupuis'
    },
    {
      id: '3',
      nom: 'Français',
      etablissementId: '1',
      quantumHoraire: 4,
      progression: 45,
      couleur: '#dc2626',
      classe: '1ère L',
      description: 'Cours de français littérature',
      anneeScolaire: '2024-2025',
      responsableClasse: 'Mme. Martin'
    }
  ] as Cours[],
  etudiants: [
    {
      id: '1',
      nom: 'Dupont',
      prenom: 'Jean',
      numero: '2024001',
      etablissementId: '1',
      classe: 'Terminale S',
      email: 'jean.dupont@lycee.fr',
      avatar: 'https://ui-avatars.com/api/?name=Jean+Dupont&background=random',
      anneeScolaire: '2024-2025'
    },
    {
      id: '2',
      nom: 'Martin',
      prenom: 'Sophie',
      numero: '2024002',
      etablissementId: '1',
      classe: 'Terminale S',
      email: 'sophie.martin@lycee.fr',
      avatar: 'https://ui-avatars.com/api/?name=Sophie+Martin&background=random',
      anneeScolaire: '2024-2025'
    }
  ] as Etudiant[],
  notes: [
    {
      id: '1',
      etudiantId: '1',
      coursId: '1',
      evaluation: 'Contrôle 1',
      note: 15,
      coefficient: 1,
      date: '2024-01-15',
      commentaire: 'Bon travail'
    },
    {
      id: '2',
      etudiantId: '2',
      coursId: '1',
      evaluation: 'Contrôle 1',
      note: 17,
      coefficient: 1,
      date: '2024-01-15'
    }
  ] as Note[],
  evaluations: [
    {
      id: '1',
      coursId: '1',
      nom: 'Contrôle Algèbre',
      date: '2024-02-15',
      coefficient: 2,
      type: 'controle' as const,
      description: 'Contrôle sur les fonctions'
    }
  ] as Evaluation[],
  groupes: [] as Groupe[],
  seances: [] as SeanceCours[]
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [etablissements, setEtablissements] = useState<Etablissement[]>([]);
  const [cours, setCours] = useState<Cours[]>([]);
  const [etudiants, setEtudiants] = useState<Etudiant[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [groupes, setGroupes] = useState<Groupe[]>([]);
  const [seances, setSeances] = useState<SeanceCours[]>([]);
  const [presences, setPresences] = useState<Presence[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const loadData = () => {
      const savedEtablissements = localStorage.getItem('edugrade_etablissements');
      const savedCours = localStorage.getItem('edugrade_cours');
      const savedEtudiants = localStorage.getItem('edugrade_etudiants');
      const savedNotes = localStorage.getItem('edugrade_notes');
      const savedEvaluations = localStorage.getItem('edugrade_evaluations');
      const savedGroupes = localStorage.getItem('edugrade_groupes');
      const savedSeances = localStorage.getItem('edugrade_seances');

      setEtablissements(savedEtablissements ? JSON.parse(savedEtablissements) : mockData.etablissements);
      setCours(savedCours ? JSON.parse(savedCours) : mockData.cours);
      setEtudiants(savedEtudiants ? JSON.parse(savedEtudiants) : mockData.etudiants);
      setNotes(savedNotes ? JSON.parse(savedNotes) : mockData.notes);
      setEvaluations(savedEvaluations ? JSON.parse(savedEvaluations) : mockData.evaluations);
      setGroupes(savedGroupes ? JSON.parse(savedGroupes) : mockData.groupes);
      setSeances(savedSeances ? JSON.parse(savedSeances) : mockData.seances);
    };

    loadData();
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('edugrade_etablissements', JSON.stringify(etablissements));
  }, [etablissements]);

  useEffect(() => {
    localStorage.setItem('edugrade_cours', JSON.stringify(cours));
  }, [cours]);

  useEffect(() => {
    localStorage.setItem('edugrade_etudiants', JSON.stringify(etudiants));
  }, [etudiants]);

  useEffect(() => {
    localStorage.setItem('edugrade_notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('edugrade_evaluations', JSON.stringify(evaluations));
  }, [evaluations]);

  useEffect(() => {
    localStorage.setItem('edugrade_groupes', JSON.stringify(groupes));
  }, [groupes]);

  useEffect(() => {
    localStorage.setItem('edugrade_seances', JSON.stringify(seances));
  }, [seances]);

  // CRUD Operations
  const generateId = () => Date.now().toString();

  // Etablissements
  const addEtablissement = (etablissement: Omit<Etablissement, 'id'>) => {
    const newEtablissement = { ...etablissement, id: generateId() };
    setEtablissements(prev => [...prev, newEtablissement]);
  };

  const updateEtablissement = (id: string, etablissement: Partial<Etablissement>) => {
    setEtablissements(prev => prev.map(e => e.id === id ? { ...e, ...etablissement } : e));
  };

  const deleteEtablissement = (id: string) => {
    setEtablissements(prev => prev.filter(e => e.id !== id));
  };

  // Cours
  const addCours = (cours: Omit<Cours, 'id'>) => {
    const newCours = { ...cours, id: generateId() };
    setCours(prev => [...prev, newCours]);
  };

  const updateCours = (id: string, cours: Partial<Cours>) => {
    setCours(prev => prev.map(c => c.id === id ? { ...c, ...cours } : c));
  };

  const deleteCours = (id: string) => {
    setCours(prev => prev.filter(c => c.id !== id));
  };

  // Etudiants
  const addEtudiant = (etudiant: Omit<Etudiant, 'id'>) => {
    const newEtudiant = { 
      ...etudiant, 
      id: generateId(),
      avatar: etudiant.avatar || `https://ui-avatars.com/api/?name=${etudiant.prenom}+${etudiant.nom}&background=random`,
      anneeScolaire: etudiant.anneeScolaire || new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
    };
    setEtudiants(prev => [...prev, newEtudiant]);
  };

  const updateEtudiant = (id: string, etudiant: Partial<Etudiant>) => {
    setEtudiants(prev => prev.map(e => e.id === id ? { ...e, ...etudiant } : e));
  };

  const deleteEtudiant = (id: string) => {
    setEtudiants(prev => prev.filter(e => e.id !== id));
  };

  // Notes
  const addNote = (note: Omit<Note, 'id'>) => {
    const newNote = { ...note, id: generateId() };
    setNotes(prev => [...prev, newNote]);
  };

  const updateNote = (id: string, note: Partial<Note>) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, ...note } : n));
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  // Evaluations
  const addEvaluation = (evaluation: Omit<Evaluation, 'id'>) => {
    const newEvaluation = { ...evaluation, id: generateId() };
    setEvaluations(prev => [...prev, newEvaluation]);
  };

  const updateEvaluation = (id: string, evaluation: Partial<Evaluation>) => {
    setEvaluations(prev => prev.map(e => e.id === id ? { ...e, ...evaluation } : e));
  };

  const deleteEvaluation = (id: string) => {
    setEvaluations(prev => prev.filter(e => e.id !== id));
  };

  // Groupes
  const addGroupe = (groupe: Omit<Groupe, 'id'>) => {
    const newGroupe = { ...groupe, id: generateId() };
    setGroupes(prev => [...prev, newGroupe]);
  };

  const updateGroupe = (id: string, groupe: Partial<Groupe>) => {
    setGroupes(prev => prev.map(g => g.id === id ? { ...g, ...groupe } : g));
  };

  const deleteGroupe = (id: string) => {
    setGroupes(prev => prev.filter(g => g.id !== id));
  };

  // Séances
  const addSeance = (seance: Omit<SeanceCours, 'id'>) => {
    const newSeance = { ...seance, id: generateId() };
    setSeances(prev => [...prev, newSeance]);
    
    // Mettre à jour automatiquement la progression du cours
    const coursSeances = seances.filter(s => s.coursId === seance.coursId);
    const totalHeuresEffectuees = coursSeances.reduce((acc, s) => acc + s.duree, 0) + seance.duree;
    const coursActuel = cours.find(c => c.id === seance.coursId);
    if (coursActuel) {
      const nouvelleProgression = Math.min(100, (totalHeuresEffectuees / coursActuel.quantumHoraire) * 100);
      updateCours(seance.coursId, { progression: Math.round(nouvelleProgression) });
    }
  };

  const updateSeance = (id: string, seance: Partial<SeanceCours>) => {
    setSeances(prev => prev.map(s => s.id === id ? { ...s, ...seance } : s));
  };

  const deleteSeance = (id: string) => {
    setSeances(prev => prev.filter(s => s.id !== id));
  };

  // Presences
  const addPresence = (presence: Omit<Presence, 'id'>) => {
    const newPresence = { ...presence, id: generateId() };
    setPresences(prev => [...prev, newPresence]);
  };

  const updatePresence = (id: string, presence: Partial<Presence>) => {
    setPresences(prev => prev.map(p => p.id === id ? { ...p, ...presence } : p));
  };

  const deletePresence = (id: string) => {
    setPresences(prev => prev.filter(p => p.id !== id));
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