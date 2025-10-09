import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, Mail, Moon, Sun, LayoutDashboard, Phone, MapPin } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

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
    carouselImages?: string[];
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
  const backgroundImages = data.carouselImages && data.carouselImages.length > 0 
    ? data.carouselImages 
    : [data.photo];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background carousel */}
      <div className="fixed inset-0 z-0">
        <Carousel 
          opts={{ loop: true }}
          plugins={[
            Autoplay({
              delay: 5000,
            }),
          ]}
          className="h-full w-full"
        >
          <CarouselContent className="h-full">
            {backgroundImages.map((image, index) => (
              <CarouselItem key={index} className="h-screen">
                <div 
                  className="h-full w-full transition-all duration-1000"
                  style={{
                    backgroundImage: `url(${image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
      
      {/* Overlay gradient for better contrast */}
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-black/40 via-black/30 to-black/40" />

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/10 dark:bg-black/10 border-b border-white/20">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9 backdrop-blur-sm bg-white/20 dark:bg-black/20 hover:bg-white/30 dark:hover:bg-black/30 text-white"
          >
            {theme === 'light' ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </Button>

          <div></div>
          
          {isAuthenticated ? (
            <Button asChild size="sm" className="backdrop-blur-md bg-white/20 dark:bg-black/20 hover:bg-white/30 dark:hover:bg-black/30 text-white border border-white/30">
              <a href="/dashboard">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </a>
            </Button>
          ) : (
            <Button asChild size="sm" className="backdrop-blur-md bg-white/20 dark:bg-black/20 hover:bg-white/30 dark:hover:bg-black/30 text-white border border-white/30">
              <a href="/auth">Connexion Professeur</a>
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <section className="relative z-10 py-12 px-4">
        <div className="container mx-auto max-w-6xl space-y-8">
          {/* Hero Card */}
          <Card className="backdrop-blur-2xl bg-white/10 dark:bg-black/10 border border-white/20 shadow-2xl">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/50 shadow-2xl flex-shrink-0">
                  <img
                    src={data.photo}
                    alt={data.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex-1 text-center md:text-left space-y-3">
                  <Badge className="w-fit bg-white/20 backdrop-blur-sm text-white border border-white/30">
                    {data.experience}
                  </Badge>
                  
                  <h1 className="text-4xl lg:text-6xl font-bold text-white drop-shadow-lg">
                    {data.name}
                  </h1>
                  
                  <p className="text-xl text-white/90 font-medium">
                    {data.title}
                  </p>
                  
                  <p className="text-lg text-white/80">
                    {data.etablissement}
                  </p>
                </div>

                <Button 
                  size="lg" 
                  className="bg-white/30 hover:bg-white/40 backdrop-blur-md text-white border border-white/40 shadow-xl hover:shadow-2xl transition-all flex-shrink-0" 
                  asChild
                >
                  <a href={`mailto:${data.contact.email}`}>
                    <Mail className="mr-2 h-4 w-4" />
                    Me contacter
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* About and Specialties */}
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="backdrop-blur-2xl bg-white/10 dark:bg-black/10 border border-white/20 shadow-2xl">
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <GraduationCap className="h-8 w-8 text-white" />
                    <h2 className="text-3xl font-bold text-white">À propos</h2>
                  </div>
                  
                  <p className="text-lg text-white/90 leading-relaxed">
                    {data.presentation}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-2xl bg-white/10 dark:bg-black/10 border border-white/20 shadow-2xl">
              <CardContent className="p-8">
                <div className="space-y-6">
                  <h3 className="text-2xl font-semibold text-white">Spécialités</h3>
                  <div className="flex flex-wrap gap-3">
                    {data.specialites.map((spec, index) => (
                      <Badge 
                        key={index} 
                        className="text-base px-5 py-2 backdrop-blur-sm bg-white/20 border border-white/30 text-white"
                      >
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Card */}
          <Card className="backdrop-blur-2xl bg-white/10 dark:bg-black/10 border border-white/20 shadow-2xl">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-8 items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="h-8 w-8 text-white" />
                  <h2 className="text-3xl font-bold text-white">Contact</h2>
                </div>
                
                <div className="flex flex-col md:flex-row gap-6 text-center md:text-left">
                  <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-white/90" />
                    <a href={`mailto:${data.contact.email}`} className="text-lg text-white hover:text-white/80 transition-colors">
                      {data.contact.email}
                    </a>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-white/90" />
                    <span className="text-lg text-white">{data.contact.telephone}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-white/90" />
                    <span className="text-lg text-white">{data.contact.adresse}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 backdrop-blur-xl bg-white/10 dark:bg-black/10 border-t border-white/20 py-12 px-4 mt-20">
        <div className="container mx-auto max-w-4xl text-center">
          <p className="text-white/80 mb-4">
            Plateforme de gestion pédagogique personnalisée
          </p>
          <p className="text-sm text-white/60">
            © 2024 {data.name} - Tous droits réservés
          </p>
        </div>
      </footer>
    </div>
  );
}
