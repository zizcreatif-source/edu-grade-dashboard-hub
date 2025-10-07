import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Mail, Moon, Sun, LayoutDashboard } from "lucide-react";

interface ClassicLandingProps {
  data: {
    name: string;
    title: string;
    photo: string;
    specialites: string[];
    experience: string;
    etablissement: string;
    contact: {
      email: string;
      telephone: string;
      adresse: string;
    };
    presentation: string;
  };
  theme: string;
  toggleTheme: () => void;
  isAuthenticated: boolean;
}

export function ClassicLanding({
  data,
  theme,
  toggleTheme,
  isAuthenticated,
}: ClassicLandingProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
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

          <div></div>
          
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
                <Button size="lg" className="bg-gradient-to-r from-primary to-primary-glow" asChild>
                  <a href={`mailto:${data.contact.email}`}>
                    <Mail className="mr-2 h-4 w-4" />
                    Me contacter
                  </a>
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
