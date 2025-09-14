import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Mail, Phone, MapPin, Calendar, Award, Users, BookOpen, Star, Moon, Sun, LayoutDashboard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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
  presentation: "Passionné par l'enseignement, j'accompagne mes élèves vers la réussite."
};

export default function Landing() {
  const { isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [data, setData] = useState(defaultProfessorData);
  const [loading, setLoading] = useState(true);

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
            presentation: personalInfo.presentation
          });
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

  const renderStars = (count: number) => {
    return Array.from({ length: count }, (_, i) => (
      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          {/* Left side - Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9"
          >
            {theme === 'light' ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </Button>

          {/* Center - Empty space for layout */}
          <div></div>
          
          {/* Right side - Dashboard/Auth button */}
          {isAuthenticated ? (
            <Button asChild size="sm">
              <a href="/dashboard">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </a>
            </Button>
          ) : (
            <Button asChild size="sm">
              <a href="/auth">Connexion Professeur</a>
            </Button>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge className="w-fit bg-primary/10 text-primary border-primary/20">
                {data.experience}
              </Badge>
              
              <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                {data.name}
              </h1>
              
              <p className="text-xl text-primary font-medium">
                {data.title}
              </p>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                {data.presentation}
              </p>

              <div className="flex flex-wrap gap-2">
                {data.specialites.map((spec, index) => (
                  <Badge key={index} variant="secondary" className="text-sm">
                    {spec}
                  </Badge>
                ))}
              </div>

              <div className="flex gap-4 pt-4">
                <Button size="lg" className="bg-gradient-to-r from-primary to-primary-glow">
                  <Mail className="mr-2 h-4 w-4" />
                  Me contacter
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square max-w-md mx-auto relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary-glow/20 rounded-3xl rotate-6"></div>
                <img
                  src={data.photo}
                  alt={data.name}
                  className="relative rounded-3xl w-full h-full object-cover shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Contact */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Contact</h2>
            <p className="text-xl text-muted-foreground">
              N'hésitez pas à me contacter pour discuter de vos besoins
            </p>
          </div>

          <Card className="border-0 shadow-xl">
            <CardContent className="pt-8 pb-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Mail className="h-6 w-6 text-primary" />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-muted-foreground">{data.contact.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Phone className="h-6 w-6 text-primary" />
                    <div>
                      <p className="font-medium">Téléphone</p>
                      <p className="text-muted-foreground">{data.contact.telephone}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <MapPin className="h-6 w-6 text-primary" />
                    <div>
                      <p className="font-medium">Adresse</p>
                      <p className="text-muted-foreground">{data.contact.adresse}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <GraduationCap className="h-6 w-6 text-primary" />
                    <div>
                      <p className="font-medium">Établissement</p>
                      <p className="text-muted-foreground">{data.etablissement}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Button className="w-full bg-gradient-to-r from-primary to-primary-glow" size="lg">
                    <Mail className="mr-2 h-4 w-4" />
                    Envoyer un message
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/50 py-12 px-4 mt-20">
        <div className="container mx-auto max-w-4xl text-center">
          <p className="text-muted-foreground mb-4">
            Plateforme de gestion pédagogique personnalisée
          </p>
          <p className="text-sm text-muted-foreground">
            © 2024 {data.name} - Tous droits réservés
          </p>
        </div>
      </footer>
    </div>
  );
}