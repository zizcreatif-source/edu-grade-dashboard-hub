import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Eye, Save, Upload, X, Plus, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface LandingPageData {
  personalInfo: {
    name: string;
    title: string;
    photo: string;
    presentation: string;
    experience: string;
    etablissement: string;
  };
  specialites: string[];
  contact: {
    email: string;
    telephone: string;
    adresse: string;
  };
}

export function LandingPageManager() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [newSpecialite, setNewSpecialite] = useState("");
  const [loading, setLoading] = useState(true);
  const [landingPageId, setLandingPageId] = useState<string | null>(null);

  const [landingData, setLandingData] = useState<LandingPageData>({
    personalInfo: {
      name: "Professeur",
      title: "Enseignant",
      photo: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=300&h=300&fit=crop&crop=faces",
      presentation: "Passionné par l'enseignement, j'accompagne mes élèves vers la réussite.",
      experience: "Plusieurs années d'expérience",
      etablissement: "Établissement scolaire"
    },
    specialites: ["Mathématiques", "Sciences"],
    contact: {
      email: "contact@professeur.fr",
      telephone: "01 23 45 67 89",
      adresse: "France"
    }
  });

  // Charger les données existantes
  useEffect(() => {
    const fetchLandingData = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('landing_pages')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching landing page:', error);
          return;
        }

        if (data) {
          setLandingPageId(data.id);
          const personalInfo = data.personal_info as unknown as LandingPageData['personalInfo'];
          const contact = data.contact as unknown as LandingPageData['contact'];
          
          setLandingData({
            personalInfo,
            specialites: data.specialites || [],
            contact
          });
        }
      } catch (error) {
        console.error('Error fetching landing page:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLandingData();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const dataToSave = {
        user_id: user.id,
        personal_info: landingData.personalInfo,
        specialites: landingData.specialites,
        contact: landingData.contact,
        is_active: true
      };

      if (landingPageId) {
        // Mise à jour
        const { error } = await supabase
          .from('landing_pages')
          .update(dataToSave)
          .eq('id', landingPageId);

        if (error) throw error;
      } else {
        // Création
        const { data, error } = await supabase
          .from('landing_pages')
          .insert(dataToSave)
          .select('id')
          .single();

        if (error) throw error;
        setLandingPageId(data.id);
      }

      toast({
        title: "Page d'accueil mise à jour",
        description: "Vos modifications ont été sauvegardées avec succès."
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving landing page:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les modifications.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addSpecialite = () => {
    if (newSpecialite.trim()) {
      setLandingData(prev => ({
        ...prev,
        specialites: [...prev.specialites, newSpecialite.trim()]
      }));
      setNewSpecialite("");
    }
  };

  const removeSpecialite = (index: number) => {
    setLandingData(prev => ({
      ...prev,
      specialites: prev.specialites.filter((_, i) => i !== index)
    }));
  };

  const updatePersonalInfo = (field: string, value: string) => {
    setLandingData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value
      }
    }));
  };

  const updateContact = (field: string, value: string) => {
    setLandingData(prev => ({
      ...prev,
      contact: {
        ...prev.contact,
        [field]: value
      }
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Page d'accueil</h2>
          <p className="text-muted-foreground">
            Personnalisez votre page d'accueil visible par vos élèves et parents
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <a href="/landing" target="_blank">
              <ExternalLink className="mr-2 h-4 w-4" />
              Prévisualiser
            </a>
          </Button>
          {isEditing ? (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Annuler
              </Button>
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Sauvegarder
              </Button>
            </div>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <Eye className="mr-2 h-4 w-4" />
              Modifier
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full max-w-2xl">
          <TabsTrigger value="personal">Profil</TabsTrigger>
          <TabsTrigger value="specialites">Spécialités</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations personnelles</CardTitle>
              <CardDescription>
                Ces informations apparaîtront en en-tête de votre page
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom complet</Label>
                  <Input
                    id="name"
                    value={landingData.personalInfo.name}
                    onChange={(e) => updatePersonalInfo('name', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Titre / Fonction</Label>
                  <Input
                    id="title"
                    value={landingData.personalInfo.title}
                    onChange={(e) => updatePersonalInfo('title', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="etablissement">Établissement</Label>
                <Input
                  id="etablissement"
                  value={landingData.personalInfo.etablissement}
                  onChange={(e) => updatePersonalInfo('etablissement', e.target.value)}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Expérience</Label>
                <Input
                  id="experience"
                  value={landingData.personalInfo.experience}
                  onChange={(e) => updatePersonalInfo('experience', e.target.value)}
                  disabled={!isEditing}
                  placeholder="ex: 15 ans d'expérience"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="presentation">Présentation</Label>
                <Textarea
                  id="presentation"
                  value={landingData.personalInfo.presentation}
                  onChange={(e) => updatePersonalInfo('presentation', e.target.value)}
                  disabled={!isEditing}
                  rows={4}
                  placeholder="Décrivez votre approche pédagogique et votre passion pour l'enseignement..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="photo">Photo de profil (URL)</Label>
                <div className="flex gap-2">
                  <Input
                    id="photo"
                    value={landingData.personalInfo.photo}
                    onChange={(e) => updatePersonalInfo('photo', e.target.value)}
                    disabled={!isEditing}
                    placeholder="https://..."
                  />
                  {isEditing && (
                    <Button variant="outline" size="icon">
                      <Upload className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {landingData.personalInfo.photo && (
                  <div className="mt-2">
                    <img
                      src={landingData.personalInfo.photo}
                      alt="Aperçu"
                      className="w-24 h-24 rounded-lg object-cover"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="specialites" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Spécialités</CardTitle>
              <CardDescription>
                Ajoutez vos matières et spécialités d'enseignement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {landingData.specialites.map((spec, index) => (
                  <Badge key={index} variant="secondary" className="text-sm px-3 py-1">
                    {spec}
                    {isEditing && (
                      <button
                        onClick={() => removeSpecialite(index)}
                        className="ml-2 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </Badge>
                ))}
              </div>

              {isEditing && (
                <div className="flex gap-2">
                  <Input
                    value={newSpecialite}
                    onChange={(e) => setNewSpecialite(e.target.value)}
                    placeholder="Nouvelle spécialité..."
                    onKeyPress={(e) => e.key === 'Enter' && addSpecialite()}
                  />
                  <Button onClick={addSpecialite} size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations de contact</CardTitle>
              <CardDescription>
                Ces informations seront visibles dans la section contact
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={landingData.contact.email}
                  onChange={(e) => updateContact('email', e.target.value)}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telephone">Téléphone</Label>
                <Input
                  id="telephone"
                  value={landingData.contact.telephone}
                  onChange={(e) => updateContact('telephone', e.target.value)}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="adresse">Adresse</Label>
                <Textarea
                  id="adresse"
                  value={landingData.contact.adresse}
                  onChange={(e) => updateContact('adresse', e.target.value)}
                  disabled={!isEditing}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}