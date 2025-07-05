import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Clock, BookOpen, Target, FileText, Calendar, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { useData, SeanceCours } from '@/contexts/DataContext';
import { useToast } from '@/hooks/use-toast';

const seanceSchema = z.object({
  date: z.string().min(1, 'La date est requise'),
  duree: z.number().min(0.5, 'La durée doit être d\'au moins 30 minutes').max(8, 'La durée ne peut pas dépasser 8 heures'),
  contenu: z.string().min(5, 'Le contenu doit contenir au moins 5 caractères'),
  objectifs: z.string().optional(),
  ressources: z.string().optional(),
  devoirs: z.string().optional(),
});

type SeanceFormData = z.infer<typeof seanceSchema>;

interface SeanceManagerProps {
  coursId: string;
}

export function SeanceManager({ coursId }: SeanceManagerProps) {
  const { seances, addSeance, updateSeance, deleteSeance } = useData();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingSeance, setEditingSeance] = useState<SeanceCours | null>(null);

  const coursSeances = seances
    .filter(s => s.coursId === coursId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalHeures = coursSeances.reduce((acc, s) => acc + s.duree, 0);

  const form = useForm<SeanceFormData>({
    resolver: zodResolver(seanceSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      duree: 2,
      contenu: '',
      objectifs: '',
      ressources: '',
      devoirs: '',
    },
  });

  const onSubmit = (data: SeanceFormData) => {
    try {
      if (editingSeance) {
        updateSeance(editingSeance.id, data);
        toast({
          title: "Séance modifiée",
          description: "La séance a été modifiée avec succès.",
        });
      } else {
        addSeance({
          coursId,
          date: data.date,
          duree: data.duree,
          contenu: data.contenu,
          objectifs: data.objectifs,
          ressources: data.ressources,
          devoirs: data.devoirs,
        });
        toast({
          title: "Séance ajoutée",
          description: "La nouvelle séance a été enregistrée avec succès.",
        });
      }
      setShowForm(false);
      setEditingSeance(null);
      form.reset();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'enregistrement.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (seance: SeanceCours) => {
    setEditingSeance(seance);
    form.reset({
      date: seance.date,
      duree: seance.duree,
      contenu: seance.contenu,
      objectifs: seance.objectifs || '',
      ressources: seance.ressources || '',
      devoirs: seance.devoirs || '',
    });
    setShowForm(true);
  };

  const handleDelete = (seanceId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette séance ?')) {
      deleteSeance(seanceId);
      toast({
        title: "Séance supprimée",
        description: "La séance a été supprimée avec succès.",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header avec statistiques */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Séances de cours</h3>
          <p className="text-sm text-muted-foreground">
            {coursSeances.length} séance{coursSeances.length !== 1 ? 's' : ''} • {totalHeures}h effectuées
          </p>
        </div>
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingSeance(null); form.reset(); }}>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle séance
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingSeance ? 'Modifier la séance' : 'Nouvelle séance de cours'}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="duree"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Durée (heures) *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.5" 
                            min="0.5" 
                            max="8"
                            {...field} 
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="contenu"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contenu de la séance *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Décrivez ce qui a été fait pendant cette séance..."
                          rows={4}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="objectifs"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Objectifs pédagogiques</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Quels étaient les objectifs de cette séance ?"
                          rows={3}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="ressources"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ressources utilisées</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Manuel p.45, vidéo, exercices..."
                            rows={3}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="devoirs"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Devoirs donnés</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Exercices à faire, leçon à apprendre..."
                            rows={3}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Annuler
                  </Button>
                  <Button type="submit">
                    {editingSeance ? 'Modifier' : 'Enregistrer'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Liste des séances */}
      <div className="space-y-4">
        {coursSeances.map((seance) => (
          <Card key={seance.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(seance.date).toLocaleDateString('fr-FR')}
                    </Badge>
                    <Badge variant="secondary">
                      <Clock className="h-3 w-3 mr-1" />
                      {seance.duree}h
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(seance)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(seance.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm">Contenu</span>
                </div>
                <p className="text-sm text-muted-foreground ml-6">{seance.contenu}</p>
              </div>

              {seance.objectifs && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-primary" />
                    <span className="font-medium text-sm">Objectifs</span>
                  </div>
                  <p className="text-sm text-muted-foreground ml-6">{seance.objectifs}</p>
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                {seance.ressources && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <span className="font-medium text-sm">Ressources</span>
                    </div>
                    <p className="text-sm text-muted-foreground ml-6">{seance.ressources}</p>
                  </div>
                )}

                {seance.devoirs && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="h-4 w-4 text-primary" />
                      <span className="font-medium text-sm">Devoirs</span>
                    </div>
                    <p className="text-sm text-muted-foreground ml-6">{seance.devoirs}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {coursSeances.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucune séance enregistrée</h3>
              <p className="text-muted-foreground mb-4">
                Commencez par enregistrer votre première séance de cours.
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle séance
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}