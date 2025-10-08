import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { GraduationCap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ClassicLanding } from "@/components/landing/ClassicLanding";
import { GlassmorphismLanding } from "@/components/landing/GlassmorphismLanding";

// Type definitions for landing page data
interface PersonalInfo {
  name: string;
  title: string;
  photo: string;
  presentation: string;
  experience: string;
  etablissement: string;
}

interface Contact {
  email: string;
  telephone: string;
  adresse: string;
}

// Default data structure
const defaultProfessorData = {
  name: "Professeur",
  title: "Enseignant",
  photo: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=300&h=300&fit=crop&crop=faces",
  specialites: ["Mathématiques", "Sciences"],
  experience: "Plusieurs années d'expérience",
  etablissement: "Établissement scolaire",
  contact: {
    email: "contact@professeur.fr",
    telephone: "01 23 45 67 89",
    adresse: "France"
  },
  presentation: "Passionné par l'enseignement, j'accompagne mes élèves vers la réussite.",
  carouselImages: []
};

export default function Landing() {
  const { isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [data, setData] = useState(defaultProfessorData);
  const [loading, setLoading] = useState(true);
  const [layoutType, setLayoutType] = useState<string>('classic');

  // Récupérer les données de la landing page
  useEffect(() => {
    const fetchLandingData = async () => {
      try {
        // On cherche d'abord la première landing page active (pour le demo)
        // Plus tard, on pourra récupérer par sous-domaine ou slug
        const { data: landingData, error } = await supabase
          .from('landing_pages')
          .select('*')
          .eq('is_active', true)
          .maybeSingle();

        if (error) {
          console.error('Error fetching landing page:', error);
          return;
        }

        if (landingData) {
          const personalInfo = landingData.personal_info as unknown as PersonalInfo;
          const contact = landingData.contact as unknown as Contact;
          
          setData({
            name: personalInfo.name,
            title: personalInfo.title,
            photo: personalInfo.photo,
            specialites: landingData.specialites || [],
            experience: personalInfo.experience,
            etablissement: personalInfo.etablissement,
            contact: contact,
            presentation: personalInfo.presentation,
            carouselImages: (landingData.carousel_images as string[]) || []
          });
          
          setLayoutType((landingData as any).layout_type || 'classic');
        }
      } catch (error) {
        console.error('Error fetching landing page:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLandingData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <GraduationCap className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  // Render le layout approprié selon le choix
  if (layoutType === 'glassmorphism') {
    return (
      <GlassmorphismLanding
        data={data}
        theme={theme}
        toggleTheme={toggleTheme}
        isAuthenticated={isAuthenticated}
      />
    );
  }

  // Layout classic par défaut
  return (
    <ClassicLanding
      data={data}
      theme={theme}
      toggleTheme={toggleTheme}
      isAuthenticated={isAuthenticated}
    />
  );
}