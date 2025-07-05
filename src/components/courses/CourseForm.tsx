import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useData, Cours } from '@/contexts/DataContext';
import { useToast } from '@/hooks/use-toast';

const courseSchema = z.object({
  nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  etablissementId: z.string().min(1, 'Veuillez sélectionner un établissement'),
  classe: z.string().min(1, 'Veuillez spécifier la classe'),
  quantumHoraire: z.number().min(1, 'Le quantum horaire doit être supérieur à 0'),
  description: z.string().optional(),
  couleur: z.string().min(7, 'Veuillez sélectionner une couleur'),
});

type CourseFormData = z.infer<typeof courseSchema>;

interface CourseFormProps {
  coursId?: string | null;
  onClose: () => void;
}

export function CourseForm({ coursId, onClose }: CourseFormProps) {
  const { cours, etablissements, addCours, updateCours } = useData();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      nom: '',
      etablissementId: '',
      classe: '',
      quantumHoraire: 1,
      description: '',
      couleur: '#2563eb',
    },
  });

  // Load existing course data when editing
  useEffect(() => {
    if (coursId) {
      const existingCours = cours.find(c => c.id === coursId);
      if (existingCours) {
        form.reset({
          nom: existingCours.nom,
          etablissementId: existingCours.etablissementId,
          classe: existingCours.classe,
          quantumHoraire: existingCours.quantumHoraire,
          description: existingCours.description || '',
          couleur: existingCours.couleur,
        });
      }
    }
  }, [coursId, cours, form]);

  const onSubmit = async (data: CourseFormData) => {
    setIsSubmitting(true);
    try {
      if (coursId) {
        // Update existing course
        updateCours(coursId, data);
        toast({
          title: "Cours modifié",
          description: "Le cours a été modifié avec succès.",
        });
      } else {
        // Create new course
        addCours({
          ...data,
          progression: 0,
        });
        toast({
          title: "Cours créé",
          description: "Le nouveau cours a été créé avec succès.",
        });
      }
      onClose();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'enregistrement.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const predefinedColors = [
    '#2563eb', '#16a34a', '#dc2626', '#7c3aed', 
    '#ea580c', '#0891b2', '#be123c', '#4338ca'
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="nom"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom du cours *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Mathématiques" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="etablissementId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Établissement *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un établissement" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {etablissements.map((etablissement) => (
                        <SelectItem key={etablissement.id} value={etablissement.id}>
                          {etablissement.nom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="classe"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Classe *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Terminale S" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4">
            <FormField
              control={form.control}
              name="quantumHoraire"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantum horaire (heures) *</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="1" 
                      {...field} 
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="couleur"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Couleur du cours *</FormLabel>
                  <div className="space-y-3">
                    <div className="flex gap-2 flex-wrap">
                      {predefinedColors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          className={`w-8 h-8 rounded-full border-2 transition-all ${
                            field.value === color 
                              ? 'border-foreground scale-110' 
                              : 'border-muted hover:scale-105'
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => field.onChange(color)}
                        />
                      ))}
                    </div>
                    <FormControl>
                      <Input 
                        type="color" 
                        {...field} 
                        className="w-full h-10"
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Description du cours (optionnel)" 
                  {...field} 
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting 
              ? (coursId ? 'Modification...' : 'Création...') 
              : (coursId ? 'Modifier' : 'Créer')
            }
          </Button>
        </div>
      </form>
    </Form>
  );
}