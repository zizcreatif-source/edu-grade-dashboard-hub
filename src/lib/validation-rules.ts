import { z } from 'zod';

// Règles de validation communes
export const ValidationRules = {
  // Validation des notes
  note: z.number()
    .min(0, "La note ne peut pas être négative")
    .max(20, "La note ne peut pas dépasser 20"),

  // Validation des noms
  nom: z.string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(50, "Le nom ne peut pas dépasser 50 caractères")
    .regex(/^[a-zA-ZÀ-ÿ\s-']+$/, "Le nom contient des caractères invalides"),

  // Validation des emails
  email: z.string()
    .email("Format d'email invalide")
    .max(100, "L'email ne peut pas dépasser 100 caractères"),

  // Validation des codes étudiants
  codeEtudiant: z.string()
    .min(3, "Le code étudiant doit contenir au moins 3 caractères")
    .max(20, "Le code étudiant ne peut pas dépasser 20 caractères")
    .regex(/^[a-zA-Z0-9-_]+$/, "Le code étudiant ne peut contenir que des lettres, chiffres, tirets et underscores"),

  // Validation des coefficients
  coefficient: z.number()
    .min(0.1, "Le coefficient doit être au moins 0.1")
    .max(10, "Le coefficient ne peut pas dépasser 10"),

  // Validation des dates
  dateNaissance: z.date()
    .max(new Date(), "La date de naissance ne peut pas être dans le futur")
    .min(new Date('1900-01-01'), "Date de naissance invalide"),

  // Validation des téléphones
  telephone: z.string()
    .regex(/^(\+33|0)[1-9](\d{8})$/, "Format de téléphone invalide")
    .optional(),

  // Validation des mots de passe
  motDePasse: z.string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre"),

  // Validation des URLs
  url: z.string()
    .url("Format d'URL invalide")
    .optional(),
};

// Schémas de validation pour les entités complètes
export const ValidationSchemas = {
  // Étudiant
  etudiant: z.object({
    nom: ValidationRules.nom,
    prenom: ValidationRules.nom,
    email: ValidationRules.email,
    codeEtudiant: ValidationRules.codeEtudiant,
    dateNaissance: ValidationRules.dateNaissance.optional(),
    telephone: ValidationRules.telephone,
    statut: z.enum(['actif', 'inactif', 'diplome']).default('actif'),
  }),

  // Cours
  cours: z.object({
    nom: z.string().min(2, "Le nom du cours doit contenir au moins 2 caractères"),
    code: z.string().min(2, "Le code du cours doit contenir au moins 2 caractères"),
    description: z.string().optional(),
    credits: z.number().min(1, "Le nombre de crédits doit être au moins 1").max(10, "Maximum 10 crédits"),
    semestre: z.enum(['S1', 'S2', 'S3', 'S4', 'S5', 'S6']),
  }),

  // Évaluation
  evaluation: z.object({
    nom: z.string().min(2, "Le nom de l'évaluation doit contenir au moins 2 caractères"),
    type: z.enum(['controle', 'examen', 'tp', 'oral']),
    coefficient: ValidationRules.coefficient,
    date: z.date(),
    duree: z.number().min(15, "Durée minimum 15 minutes").max(480, "Durée maximum 8 heures").optional(),
  }),

  // Note
  note: z.object({
    valeur: ValidationRules.note,
    commentaire: z.string().max(500, "Le commentaire ne peut pas dépasser 500 caractères").optional(),
    absent: z.boolean().default(false),
  }),

  // Établissement
  etablissement: z.object({
    nom: z.string().min(2, "Le nom de l'établissement doit contenir au moins 2 caractères"),
    configuration: z.object({
      noteMin: z.number().min(0).max(20),
      noteMax: z.number().min(0).max(20),
      coefficients: z.object({
        controle: ValidationRules.coefficient,
        examen: ValidationRules.coefficient,
        tp: ValidationRules.coefficient,
        oral: ValidationRules.coefficient,
      }),
    }),
  }),
};

// Fonction d'aide pour valider et formater les erreurs
export function validateAndFormatErrors<T>(schema: z.ZodSchema<T>, data: unknown) {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    const errors: Record<string, string> = {};
    result.error.errors.forEach((error) => {
      const path = error.path.join('.');
      errors[path] = error.message;
    });
    return { success: false as const, errors };
  }
  
  return { success: true as const, data: result.data };
}

// Messages d'erreur personnalisés
export const ErrorMessages = {
  required: "Ce champ est obligatoire",
  invalidEmail: "Format d'email invalide",
  passwordTooShort: "Le mot de passe doit contenir au moins 8 caractères",
  passwordWeak: "Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre",
  invalidDate: "Date invalide",
  noteBounds: "La note doit être comprise entre 0 et 20",
  duplicateCode: "Ce code existe déjà",
  networkError: "Erreur de connexion. Veuillez réessayer.",
  unknownError: "Une erreur inattendue s'est produite",
};