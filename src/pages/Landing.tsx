import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Mail, Phone, MapPin, Calendar, Award, Users, BookOpen, Star } from "lucide-react";

// Mock data - sera remplacé par les données du professeur
const mockProfessorData = {
  name: "Professeur Martin Dubois",
  title: "Professeur de Mathématiques et Physique",
  photo: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=300&h=300&fit=crop&crop=faces",
  specialites: [
    "Mathématiques Terminale S",
    "Physique-Chimie", 
    "Préparation BAC",
    "Soutien Scolaire"
  ],
  experience: "15 ans d'expérience",
  etablissement: "Lycée Jean Moulin - Paris",
  contact: {
    email: "martin.dubois@lycee.fr",
    telephone: "01 23 45 67 89",
    adresse: "12 Rue de l'Éducation, 75001 Paris"
  },
  presentation: "Passionné par l'enseignement des sciences, j'accompagne mes élèves vers la réussite avec une pédagogie adaptée et bienveillante. Mon objectif : faire aimer les mathématiques et la physique à tous mes élèves.",
  stats: {
    eleves: 120,
    reussiteBac: 95,
    anneesExperience: 15
  },
  services: [
    {
      titre: "Cours Particuliers",
      description: "Accompagnement personnalisé pour tous niveaux",
      icon: Users
    },
    {
      titre: "Préparation BAC",
      description: "Méthodologie et entraînement intensif",
      icon: Award
    },
    {
      titre: "Soutien Scolaire",
      description: "Aide aux devoirs et remise à niveau",
      icon: BookOpen
    }
  ],
  temoignages: [
    {
      nom: "Sophie L.",
      classe: "Terminale S",
      commentaire: "Grâce aux cours de M. Dubois, j'ai eu 18/20 au BAC de maths !",
      note: 5
    },
    {
      nom: "Antoine M.", 
      classe: "1ère S",
      commentaire: "Professeur très pédagogue, j'ai enfin compris les maths !",
      note: 5
    }
  ]
};

export default function Landing() {
  const { isAuthenticated } = useAuth();
  const [data] = useState(mockProfessorData);

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
          <div className="flex items-center gap-3">
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">EduGrade</span>
          </div>
          
          {isAuthenticated ? (
            <Button asChild>
              <a href="/dashboard">Tableau de bord</a>
            </Button>
          ) : (
            <Button asChild>
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
                <Button size="lg" variant="outline">
                  <Calendar className="mr-2 h-4 w-4" />
                  Prendre RDV
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

      {/* Stats */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center border-0 shadow-lg">
              <CardContent className="pt-8 pb-8">
                <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                <div className="text-3xl font-bold text-primary mb-2">
                  {data.stats.eleves}+
                </div>
                <p className="text-muted-foreground">Élèves accompagnés</p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg">
              <CardContent className="pt-8 pb-8">
                <Award className="h-12 w-12 text-primary mx-auto mb-4" />
                <div className="text-3xl font-bold text-primary mb-2">
                  {data.stats.reussiteBac}%
                </div>
                <p className="text-muted-foreground">Taux de réussite BAC</p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg">
              <CardContent className="pt-8 pb-8">
                <GraduationCap className="h-12 w-12 text-primary mx-auto mb-4" />
                <div className="text-3xl font-bold text-primary mb-2">
                  {data.stats.anneesExperience}
                </div>
                <p className="text-muted-foreground">Années d'expérience</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Mes Services
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Un accompagnement personnalisé pour chaque élève
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {data.services.map((service, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="pt-8 pb-8 text-center">
                  <service.icon className="h-12 w-12 text-primary mx-auto mb-6" />
                  <h3 className="text-xl font-semibold mb-3">{service.titre}</h3>
                  <p className="text-muted-foreground">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Témoignages */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Ce que disent mes élèves</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {data.temoignages.map((temoignage, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="pt-6 pb-6">
                  <div className="flex gap-1 mb-4">
                    {renderStars(temoignage.note)}
                  </div>
                  <p className="text-muted-foreground mb-4">"{temoignage.commentaire}"</p>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{temoignage.nom}</p>
                      <p className="text-sm text-muted-foreground">{temoignage.classe}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
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
                  
                  <Button variant="outline" className="w-full" size="lg">
                    <Calendar className="mr-2 h-4 w-4" />
                    Prendre rendez-vous
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
          <div className="flex items-center justify-center gap-3 mb-4">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold">EduGrade</span>
          </div>
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