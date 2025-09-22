export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      cours: {
        Row: {
          annee_scolaire: string
          classe: string
          couleur: string
          created_at: string
          description: string | null
          etablissement_id: string
          id: string
          nom: string
          progression: number
          quantum_horaire: number
          responsable_classe: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          annee_scolaire: string
          classe: string
          couleur?: string
          created_at?: string
          description?: string | null
          etablissement_id: string
          id?: string
          nom: string
          progression?: number
          quantum_horaire?: number
          responsable_classe?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          annee_scolaire?: string
          classe?: string
          couleur?: string
          created_at?: string
          description?: string | null
          etablissement_id?: string
          id?: string
          nom?: string
          progression?: number
          quantum_horaire?: number
          responsable_classe?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cours_etablissement_id_fkey"
            columns: ["etablissement_id"]
            isOneToOne: false
            referencedRelation: "etablissements"
            referencedColumns: ["id"]
          },
        ]
      }
      etablissements: {
        Row: {
          configuration: Json | null
          created_at: string
          id: string
          logo: string | null
          nom: string
          updated_at: string
          user_id: string
        }
        Insert: {
          configuration?: Json | null
          created_at?: string
          id?: string
          logo?: string | null
          nom: string
          updated_at?: string
          user_id: string
        }
        Update: {
          configuration?: Json | null
          created_at?: string
          id?: string
          logo?: string | null
          nom?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      etudiants: {
        Row: {
          annee_scolaire: string
          avatar: string | null
          classe: string
          created_at: string
          email: string | null
          etablissement_id: string
          groupe_ids: string[] | null
          id: string
          nom: string
          numero: string
          prenom: string
          updated_at: string
          user_id: string
        }
        Insert: {
          annee_scolaire: string
          avatar?: string | null
          classe: string
          created_at?: string
          email?: string | null
          etablissement_id: string
          groupe_ids?: string[] | null
          id?: string
          nom: string
          numero: string
          prenom: string
          updated_at?: string
          user_id: string
        }
        Update: {
          annee_scolaire?: string
          avatar?: string | null
          classe?: string
          created_at?: string
          email?: string | null
          etablissement_id?: string
          groupe_ids?: string[] | null
          id?: string
          nom?: string
          numero?: string
          prenom?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "etudiants_etablissement_id_fkey"
            columns: ["etablissement_id"]
            isOneToOne: false
            referencedRelation: "etablissements"
            referencedColumns: ["id"]
          },
        ]
      }
      evaluations: {
        Row: {
          cours_id: string
          created_at: string
          date: string
          description: string | null
          est_note_groupe: boolean | null
          groupe_id: string | null
          id: string
          nom: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cours_id: string
          created_at?: string
          date: string
          description?: string | null
          est_note_groupe?: boolean | null
          groupe_id?: string | null
          id?: string
          nom: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cours_id?: string
          created_at?: string
          date?: string
          description?: string | null
          est_note_groupe?: boolean | null
          groupe_id?: string | null
          id?: string
          nom?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "evaluations_cours_id_fkey"
            columns: ["cours_id"]
            isOneToOne: false
            referencedRelation: "cours"
            referencedColumns: ["id"]
          },
        ]
      }
      groupes: {
        Row: {
          annee_scolaire: string
          classe: string
          created_at: string
          description: string | null
          etudiant_ids: string[] | null
          id: string
          nom: string
          responsable_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          annee_scolaire: string
          classe: string
          created_at?: string
          description?: string | null
          etudiant_ids?: string[] | null
          id?: string
          nom: string
          responsable_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          annee_scolaire?: string
          classe?: string
          created_at?: string
          description?: string | null
          etudiant_ids?: string[] | null
          id?: string
          nom?: string
          responsable_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      landing_pages: {
        Row: {
          contact: Json
          created_at: string
          id: string
          is_active: boolean | null
          personal_info: Json
          specialites: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          contact?: Json
          created_at?: string
          id?: string
          is_active?: boolean | null
          personal_info?: Json
          specialites?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          contact?: Json
          created_at?: string
          id?: string
          is_active?: boolean | null
          personal_info?: Json
          specialites?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notes: {
        Row: {
          commentaire: string | null
          cours_id: string
          created_at: string
          date: string
          etudiant_id: string
          evaluation: string
          id: string
          note: number
          updated_at: string
          user_id: string
        }
        Insert: {
          commentaire?: string | null
          cours_id: string
          created_at?: string
          date: string
          etudiant_id: string
          evaluation: string
          id?: string
          note: number
          updated_at?: string
          user_id: string
        }
        Update: {
          commentaire?: string | null
          cours_id?: string
          created_at?: string
          date?: string
          etudiant_id?: string
          evaluation?: string
          id?: string
          note?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notes_cours_id_fkey"
            columns: ["cours_id"]
            isOneToOne: false
            referencedRelation: "cours"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notes_etudiant_id_fkey"
            columns: ["etudiant_id"]
            isOneToOne: false
            referencedRelation: "etudiants"
            referencedColumns: ["id"]
          },
        ]
      }
      presences: {
        Row: {
          commentaire: string | null
          created_at: string
          etudiant_id: string
          id: string
          seance_id: string
          statut: string
          updated_at: string
          user_id: string
        }
        Insert: {
          commentaire?: string | null
          created_at?: string
          etudiant_id: string
          id?: string
          seance_id: string
          statut: string
          updated_at?: string
          user_id: string
        }
        Update: {
          commentaire?: string | null
          created_at?: string
          etudiant_id?: string
          id?: string
          seance_id?: string
          statut?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "presences_etudiant_id_fkey"
            columns: ["etudiant_id"]
            isOneToOne: false
            referencedRelation: "etudiants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "presences_seance_id_fkey"
            columns: ["seance_id"]
            isOneToOne: false
            referencedRelation: "seances"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      seances: {
        Row: {
          contenu: string
          cours_id: string
          created_at: string
          date: string
          devoirs: string | null
          duree: number
          id: string
          objectifs: string | null
          ressources: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          contenu: string
          cours_id: string
          created_at?: string
          date: string
          devoirs?: string | null
          duree?: number
          id?: string
          objectifs?: string | null
          ressources?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          contenu?: string
          cours_id?: string
          created_at?: string
          date?: string
          devoirs?: string | null
          duree?: number
          id?: string
          objectifs?: string | null
          ressources?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "seances_cours_id_fkey"
            columns: ["cours_id"]
            isOneToOne: false
            referencedRelation: "cours"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
