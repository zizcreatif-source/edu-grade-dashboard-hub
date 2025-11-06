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
              delay: 6000,
            }),
          ]}
          className="h-full w-full"
        >
          <CarouselContent className="h-full">
            {backgroundImages.map((image, index) => (
              <CarouselItem key={index} className="h-screen">
                <div 
                  className="h-full w-full transition-all duration-[2000ms] animate-fade-in"
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
      
      {/* Animated overlay gradients for depth */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/20 animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute inset-0 bg-gradient-to-tl from-black/50 via-black/30 to-black/40" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-2xl bg-white/5 dark:bg-black/5 border-b border-white/10 shadow-lg">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-10 w-10 backdrop-blur-md bg-white/10 dark:bg-black/10 hover:bg-white/20 dark:hover:bg-black/20 text-white border border-white/20 hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            {theme === 'light' ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </Button>

          <div className="text-white font-semibold text-lg backdrop-blur-sm bg-white/5 px-4 py-2 rounded-full border border-white/20">
            {data.title}
          </div>
          
          {isAuthenticated ? (
            <Button asChild size="sm" className="backdrop-blur-md bg-white/10 dark:bg-black/10 hover:bg-white/20 dark:hover:bg-black/20 text-white border border-white/20 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
              <a href="/dashboard">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </a>
            </Button>
          ) : (
            <Button asChild size="sm" className="backdrop-blur-md bg-white/10 dark:bg-black/10 hover:bg-white/20 dark:hover:bg-black/20 text-white border border-white/20 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
              <a href="/auth">Connexion</a>
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <section className="relative z-10 py-8 sm:py-16 px-4">
        <div className="container mx-auto max-w-7xl space-y-8 sm:space-y-12">
          {/* Hero Card with enhanced glassmorphism */}
          <Card className="backdrop-blur-3xl bg-gradient-to-br from-white/15 via-white/10 to-white/5 dark:from-black/15 dark:via-black/10 dark:to-black/5 border border-white/20 shadow-[0_8px_32px_0_rgba(255,255,255,0.1)] hover:shadow-[0_8px_48px_0_rgba(255,255,255,0.2)] transition-all duration-500 overflow-hidden group animate-fade-in">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardContent className="relative p-8 sm:p-12 md:p-16">
              <div className="max-w-4xl space-y-6 sm:space-y-8">
                <Badge className="w-fit bg-gradient-to-r from-white/30 to-white/20 backdrop-blur-md text-white border border-white/40 text-sm px-4 py-2 shadow-lg hover:scale-105 transition-transform duration-300">
                  ✨ {data.experience}
                </Badge>
                
                <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)] leading-tight break-words bg-gradient-to-br from-white via-white to-white/80 bg-clip-text animate-fade-in">
                  {data.name}
                </h1>
                
                <p className="text-2xl sm:text-3xl md:text-4xl text-white/95 font-semibold drop-shadow-lg">
                  {data.title}
                </p>
                
                <p className="text-lg sm:text-xl md:text-2xl text-white/85 leading-relaxed max-w-2xl backdrop-blur-sm bg-white/5 p-4 rounded-lg border border-white/10">
                  {data.presentation}
                </p>

                <div className="flex flex-wrap gap-3 sm:gap-4 pt-4">
                  {data.specialites.map((spec, index) => (
                    <Badge 
                      key={index} 
                      className="text-base sm:text-lg px-5 sm:px-6 py-2.5 sm:py-3 backdrop-blur-md bg-gradient-to-r from-white/20 to-white/10 border border-white/30 text-white hover:from-white/30 hover:to-white/20 hover:scale-110 transition-all duration-300 shadow-lg cursor-default"
                    >
                      {spec}
                    </Badge>
                  ))}
                </div>

                <Button 
                  size="lg" 
                  className="w-full sm:w-auto bg-white/20 hover:bg-white/30 backdrop-blur-lg text-white border-2 border-white/40 shadow-[0_8px_32px_0_rgba(255,255,255,0.2)] hover:shadow-[0_8px_48px_0_rgba(255,255,255,0.3)] transition-all duration-300 mt-6 text-lg px-8 py-6 hover:scale-105 font-semibold" 
                  asChild
                >
                  <a href={`mailto:${data.contact.email}`}>
                    <Mail className="mr-3 h-5 sm:h-6 w-5 sm:w-6" />
                    Me contacter
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Info Grid - Two columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Establishment Card */}
            <Card className="backdrop-blur-3xl bg-gradient-to-br from-white/15 via-white/10 to-white/5 dark:from-black/15 dark:via-black/10 dark:to-black/5 border border-white/20 shadow-[0_8px_32px_0_rgba(255,255,255,0.1)] hover:shadow-[0_8px_48px_0_rgba(255,255,255,0.2)] transition-all duration-500 overflow-hidden group hover:scale-[1.02] animate-fade-in">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardContent className="relative p-6 sm:p-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl backdrop-blur-md bg-white/20 border border-white/30 shadow-lg">
                      <GraduationCap className="h-7 sm:h-8 w-7 sm:w-8 text-white" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white">Établissement</h3>
                  </div>
                  <p className="text-lg sm:text-xl text-white/90 font-medium break-words pl-1">{data.etablissement}</p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Contact Card */}
            <Card className="backdrop-blur-3xl bg-gradient-to-br from-white/15 via-white/10 to-white/5 dark:from-black/15 dark:via-black/10 dark:to-black/5 border border-white/20 shadow-[0_8px_32px_0_rgba(255,255,255,0.1)] hover:shadow-[0_8px_48px_0_rgba(255,255,255,0.2)] transition-all duration-500 overflow-hidden group hover:scale-[1.02] animate-fade-in">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardContent className="relative p-6 sm:p-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl backdrop-blur-md bg-white/20 border border-white/30 shadow-lg">
                      <Phone className="h-7 sm:h-8 w-7 sm:w-8 text-white" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white">Téléphone</h3>
                  </div>
                  <p className="text-lg sm:text-xl text-white/90 font-medium">{data.contact.telephone}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Full Contact Card */}
          <Card className="backdrop-blur-3xl bg-gradient-to-br from-white/15 via-white/10 to-white/5 dark:from-black/15 dark:via-black/10 dark:to-black/5 border border-white/20 shadow-[0_8px_32px_0_rgba(255,255,255,0.1)] hover:shadow-[0_8px_48px_0_rgba(255,255,255,0.2)] transition-all duration-500 overflow-hidden group animate-fade-in">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardContent className="relative p-8 sm:p-10">
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-xl backdrop-blur-md bg-white/20 border border-white/30 shadow-lg">
                    <Mail className="h-8 sm:h-10 w-8 sm:w-10 text-white" />
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-bold text-white">Informations de Contact</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <a 
                    href={`mailto:${data.contact.email}`}
                    className="group/item flex flex-col gap-3 p-5 rounded-xl backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/20 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <Mail className="h-6 w-6 text-white/90 group-hover/item:scale-110 transition-transform" />
                    <div>
                      <p className="text-sm text-white/70 font-medium mb-1">Email</p>
                      <p className="text-base text-white font-semibold break-all">{data.contact.email}</p>
                    </div>
                  </a>
                  
                  <div className="flex flex-col gap-3 p-5 rounded-xl backdrop-blur-md bg-white/10 border border-white/20 shadow-lg hover:bg-white/15 hover:scale-105 transition-all duration-300">
                    <Phone className="h-6 w-6 text-white/90" />
                    <div>
                      <p className="text-sm text-white/70 font-medium mb-1">Téléphone</p>
                      <p className="text-base text-white font-semibold">{data.contact.telephone}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-3 p-5 rounded-xl backdrop-blur-md bg-white/10 border border-white/20 shadow-lg hover:bg-white/15 hover:scale-105 transition-all duration-300">
                    <MapPin className="h-6 w-6 text-white/90" />
                    <div>
                      <p className="text-sm text-white/70 font-medium mb-1">Adresse</p>
                      <p className="text-base text-white font-semibold">{data.contact.adresse}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 backdrop-blur-2xl bg-gradient-to-t from-white/10 to-white/5 dark:from-black/10 dark:to-black/5 border-t border-white/20 py-16 px-4 mt-24">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-3 backdrop-blur-md bg-white/10 px-6 py-3 rounded-full border border-white/20">
              <GraduationCap className="h-6 w-6 text-white" />
              <span className="text-white/90 font-semibold text-lg">Plateforme EduGrade</span>
            </div>
            <p className="text-white/75 text-lg max-w-2xl mx-auto">
              Plateforme de gestion pédagogique personnalisée pour un suivi optimal de vos élèves
            </p>
            <div className="pt-4 border-t border-white/10">
              <p className="text-sm text-white/60">
                © 2024 {data.name} - Tous droits réservés
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
