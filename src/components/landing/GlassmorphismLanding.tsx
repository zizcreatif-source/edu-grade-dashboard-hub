import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Mail, Moon, Sun, LayoutDashboard } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface GlassmorphismLandingProps {
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

export function GlassmorphismLanding({
  data,
  theme,
  toggleTheme,
  isAuthenticated,
}: GlassmorphismLandingProps) {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background avec image du prof en flou */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url(${data.photo})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(20px) brightness(0.7)',
        }}
      />
      
      {/* Overlay gradient */}
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-background/90 via-background/80 to-primary/20" />

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-background/30 border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9 backdrop-blur-sm bg-background/20"
          >
            {theme === 'light' ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </Button>

          <div></div>
          
          {isAuthenticated ? (
            <Button asChild size="sm" className="backdrop-blur-sm bg-primary/90 hover:bg-primary">
              <a href="/dashboard">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </a>
            </Button>
          ) : (
            <Button asChild size="sm" className="backdrop-blur-sm bg-primary/90 hover:bg-primary">
              <a href="/auth">Connexion Professeur</a>
            </Button>
          )}
        </div>
      </header>

      {/* Main Content - Carousel */}
      <section className="relative z-10 py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <Carousel className="w-full">
            <CarouselContent>
              {/* Slide 1 - Hero */}
              <CarouselItem>
                <div className="flex items-center justify-center min-h-[70vh]">
                  <div className="backdrop-blur-xl bg-background/30 border border-white/20 rounded-3xl p-12 max-w-4xl shadow-2xl">
                    <div className="text-center space-y-6">
                      <div className="mx-auto w-32 h-32 rounded-full overflow-hidden border-4 border-white/30 shadow-2xl">
                        <img
                          src={data.photo}
                          alt={data.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <Badge className="w-fit mx-auto bg-primary/20 backdrop-blur-sm text-primary border-primary/30">
                        {data.experience}
                      </Badge>
                      
                      <h1 className="text-5xl lg:text-7xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                        {data.name}
                      </h1>
                      
                      <p className="text-2xl text-primary font-medium">
                        {data.title}
                      </p>
                      
                      <p className="text-xl text-foreground/90 max-w-2xl mx-auto">
                        {data.etablissement}
                      </p>

                      <Button 
                        size="lg" 
                        className="bg-gradient-to-r from-primary to-primary-glow backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all" 
                        asChild
                      >
                        <a href={`mailto:${data.contact.email}`}>
                          <Mail className="mr-2 h-4 w-4" />
                          Me contacter
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </CarouselItem>

              {/* Slide 2 - Présentation */}
              <CarouselItem>
                <div className="flex items-center justify-center min-h-[70vh]">
                  <div className="backdrop-blur-xl bg-background/30 border border-white/20 rounded-3xl p-12 max-w-4xl shadow-2xl">
                    <div className="space-y-8">
                      <div className="text-center">
                        <GraduationCap className="h-16 w-16 text-primary mx-auto mb-4" />
                        <h2 className="text-4xl font-bold mb-4">À propos</h2>
                      </div>
                      
                      <p className="text-xl text-foreground/90 leading-relaxed text-center">
                        {data.presentation}
                      </p>

                      <div className="pt-6">
                        <h3 className="text-2xl font-semibold mb-4 text-center">Spécialités</h3>
                        <div className="flex flex-wrap gap-3 justify-center">
                          {data.specialites.map((spec, index) => (
                            <Badge 
                              key={index} 
                              variant="secondary" 
                              className="text-lg px-6 py-2 backdrop-blur-sm bg-secondary/50 border border-white/10"
                            >
                              {spec}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CarouselItem>

              {/* Slide 3 - Contact */}
              <CarouselItem>
                <div className="flex items-center justify-center min-h-[70vh]">
                  <div className="backdrop-blur-xl bg-background/30 border border-white/20 rounded-3xl p-12 max-w-4xl shadow-2xl">
                    <div className="space-y-8 text-center">
                      <Mail className="h-16 w-16 text-primary mx-auto" />
                      <h2 className="text-4xl font-bold">Contactez-moi</h2>
                      
                      <div className="space-y-4 text-xl">
                        <p className="text-foreground/90">
                          N'hésitez pas à me contacter pour toute question
                        </p>
                        
                        <div className="space-y-3 pt-4">
                          <p className="text-primary font-medium">{data.contact.email}</p>
                          <p className="text-foreground/80">{data.contact.telephone}</p>
                          <p className="text-foreground/80">{data.contact.adresse}</p>
                        </div>
                      </div>

                      <Button 
                        size="lg" 
                        className="bg-gradient-to-r from-primary to-primary-glow backdrop-blur-sm shadow-xl mt-6" 
                        asChild
                      >
                        <a href={`mailto:${data.contact.email}`}>
                          <Mail className="mr-2 h-5 w-5" />
                          Envoyer un email
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            </CarouselContent>
            
            <CarouselPrevious className="backdrop-blur-sm bg-background/30 border-white/20" />
            <CarouselNext className="backdrop-blur-sm bg-background/30 border-white/20" />
          </Carousel>

          {/* Indicator dots */}
          <div className="flex justify-center gap-2 mt-8">
            <div className="w-2 h-2 rounded-full bg-primary/50" />
            <div className="w-2 h-2 rounded-full bg-primary/50" />
            <div className="w-2 h-2 rounded-full bg-primary/50" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 backdrop-blur-md bg-background/30 border-t border-white/10 py-12 px-4 mt-20">
        <div className="container mx-auto max-w-4xl text-center">
          <p className="text-foreground/80 mb-4">
            Plateforme de gestion pédagogique personnalisée
          </p>
          <p className="text-sm text-foreground/60">
            © 2024 {data.name} - Tous droits réservés
          </p>
        </div>
      </footer>
    </div>
  );
}
