import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Eye, Save, Upload, X, Plus, ExternalLink, GripVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableCarouselImage } from './SortableCarouselImage';

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
  const [uploading, setUploading] = useState(false);
  const [layoutType, setLayoutType] = useState<string>('classic');
  const [carouselImages, setCarouselImages] = useState<string[]>([]);
  const [uploadingCarousel, setUploadingCarousel] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const carouselInputRef = useRef<HTMLInputElement>(null);

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
          
          setLayoutType((data as any).layout_type || 'classic');
          setCarouselImages((data.carousel_images as string[]) || []);
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
        layout_type: layoutType,
        carousel_images: carouselImages,
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Vérifier la taille du fichier (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Fichier trop volumineux",
        description: "La photo ne doit pas dépasser 5MB.",
        variant: "destructive"
      });
      return;
    }

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Format non supporté",
        description: "Veuillez sélectionner une image (JPG, PNG, etc.).",
        variant: "destructive"
      });
      return;
    }

    try {
      setUploading(true);
      
      // Créer un nom de fichier unique
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/profile-${Date.now()}.${fileExt}`;
      
      // Upload vers Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Récupérer l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName);

      // Mettre à jour les données
      updatePersonalInfo('photo', publicUrl);

      toast({
        title: "Photo uploadée",
        description: "Votre photo de profil a été mise à jour avec succès."
      });

    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        title: "Erreur d'upload",
        description: "Impossible d'uploader la photo. Réessayez plus tard.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleCarouselUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !user) return;

    // Vérifier qu'on ne dépasse pas 3 images
    if (carouselImages.length + files.length > 3) {
      toast({
        title: "Limite atteinte",
        description: "Vous ne pouvez uploader que 3 images maximum pour le carousel.",
        variant: "destructive"
      });
      return;
    }

    try {
      setUploadingCarousel(true);
      const uploadedUrls: string[] = [];

      for (const file of Array.from(files)) {
        // Vérifier la taille
        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: "Fichier trop volumineux",
            description: `${file.name} dépasse 5MB.`,
            variant: "destructive"
          });
          continue;
        }

        // Vérifier le type
        if (!file.type.startsWith('image/')) {
          toast({
            title: "Format non supporté",
            description: `${file.name} n'est pas une image.`,
            variant: "destructive"
          });
          continue;
        }

        // Upload
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/carousel-${Date.now()}-${Math.random()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('profile-photos')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('profile-photos')
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
      }

      if (uploadedUrls.length > 0) {
        setCarouselImages(prev => [...prev, ...uploadedUrls]);
        toast({
          title: "Images uploadées",
          description: `${uploadedUrls.length} image(s) ajoutée(s) au carousel.`
        });
      }

    } catch (error) {
      console.error('Error uploading carousel images:', error);
      toast({
        title: "Erreur d'upload",
        description: "Impossible d'uploader les images.",
        variant: "destructive"
      });
    } finally {
      setUploadingCarousel(false);
      if (carouselInputRef.current) {
        carouselInputRef.current.value = '';
      }
    }
  };

  const removeCarouselImage = (index: number) => {
    setCarouselImages(prev => prev.filter((_, i) => i !== index));
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setCarouselImages((items) => {
        const oldIndex = items.findIndex((_, i) => i.toString() === active.id);
        const newIndex = items.findIndex((_, i) => i.toString() === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
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

      <Tabs defaultValue="layout" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full max-w-3xl">
          <TabsTrigger value="layout">Design</TabsTrigger>
          <TabsTrigger value="personal">Profil</TabsTrigger>
          <TabsTrigger value="specialites">Spécialités</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
        </TabsList>

        <TabsContent value="layout" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Type de page d'accueil</CardTitle>
              <CardDescription>
                Choisissez le style de votre page d'accueil
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <RadioGroup 
                value={layoutType} 
                onValueChange={setLayoutType}
                disabled={!isEditing}
                className="space-y-4"
              >
                <div className="flex items-start space-x-3 space-y-0 rounded-lg border p-4 hover:bg-accent/50 transition-colors">
                  <RadioGroupItem value="classic" id="classic" />
                  <div className="flex-1">
                    <Label htmlFor="classic" className="font-medium cursor-pointer">
                      Layout Classique
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Design traditionnel avec une présentation claire et professionnelle
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 space-y-0 rounded-lg border p-4 hover:bg-accent/50 transition-colors">
                  <RadioGroupItem value="glassmorphism" id="glassmorphism" />
                  <div className="flex-1">
                    <Label htmlFor="glassmorphism" className="font-medium cursor-pointer">
                      Layout Glassmorphism
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Design moderne avec effet de verre et carousel - photo en arrière-plan
                    </p>
                  </div>
                </div>
              </RadioGroup>

              {isEditing && (
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    💡 Prévisualisez votre page après avoir sauvegardé pour voir le nouveau design
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {layoutType === 'glassmorphism' && (
            <Card>
              <CardHeader>
                <CardTitle>Images du carousel (arrière-plan)</CardTitle>
                <CardDescription>
                  Ajoutez jusqu'à 3 images qui défileront en arrière-plan avec effet de flou
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={carouselImages.map((_, i) => i.toString())}
                    strategy={rectSortingStrategy}
                  >
                    <div className="grid grid-cols-3 gap-4">
                      {carouselImages.map((image, index) => (
                        <SortableCarouselImage
                          key={index}
                          id={index.toString()}
                          image={image}
                          index={index}
                          onRemove={removeCarouselImage}
                          isEditing={isEditing}
                        />
                      ))}
                      
                      {carouselImages.length < 3 && isEditing && (
                        <button
                          onClick={() => carouselInputRef.current?.click()}
                          disabled={uploadingCarousel}
                          className="h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 hover:bg-accent/50 transition-colors"
                        >
                          {uploadingCarousel ? (
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                          ) : (
                            <>
                              <Upload className="h-6 w-6 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                Ajouter une image
                              </span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </SortableContext>
                </DndContext>

                <input
                  type="file"
                  ref={carouselInputRef}
                  onChange={handleCarouselUpload}
                  accept="image/*"
                  multiple
                  className="hidden"
                />

                {isEditing && (
                  <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                    <p className="text-xs text-muted-foreground">
                      💡 Formats acceptés: JPG, PNG, GIF • Taille max: 5MB par image • {3 - carouselImages.length} image(s) restante(s)
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <GripVertical className="h-3 w-3" />
                      Glissez-déposez les images pour les réordonner
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

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
                <Label htmlFor="photo">Photo de profil</Label>
                <div className="flex gap-2">
                  <Input
                    id="photo"
                    value={landingData.personalInfo.photo}
                    onChange={(e) => updatePersonalInfo('photo', e.target.value)}
                    disabled={!isEditing}
                    placeholder="https:// ou uploadez depuis votre ordinateur"
                  />
                  {isEditing && (
                    <>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={triggerFileUpload}
                        disabled={uploading}
                        title="Uploader depuis votre ordinateur"
                      >
                        {uploading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                      </Button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept="image/*"
                        className="hidden"
                      />
                    </>
                  )}
                </div>
                {landingData.personalInfo.photo && (
                  <div className="mt-2">
                    <img
                      src={landingData.personalInfo.photo}
                      alt="Aperçu"
                      className="w-24 h-24 rounded-lg object-cover border"
                    />
                  </div>
                )}
                {isEditing && (
                  <p className="text-xs text-muted-foreground">
                    Formats acceptés: JPG, PNG, GIF • Taille max: 5MB
                  </p>
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