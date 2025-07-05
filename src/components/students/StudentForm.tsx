import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/hooks/use-toast';

const studentSchema = z.object({
  nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  prenom: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  numero: z.string().min(1, 'Le numéro étudiant est requis'),
  etablissementId: z.string().min(1, 'Veuillez sélectionner un établissement'),
  classe: z.string().min(1, 'Veuillez spécifier la classe'),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  anneeScolaire: z.string().min(1, 'Veuillez spécifier l\'année scolaire'),
});

type StudentFormData = z.infer<typeof studentSchema>;

interface StudentFormProps {
  studentId?: string | null;
  onClose: () => void;
}

export function StudentForm({ studentId, onClose }: StudentFormProps) {
  const { etudiants, etablissements, addEtudiant, updateEtudiant } = useData();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      nom: '',
      prenom: '',
      numero: '',
      etablissementId: '',
      classe: '',
      email: '',
      anneeScolaire: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
    },
  });

  // Load existing student data when editing
  useEffect(() => {
    if (studentId) {
      const existingStudent = etudiants.find(e => e.id === studentId);
      if (existingStudent) {
        form.reset({
          nom: existingStudent.nom,
          prenom: existingStudent.prenom,
          numero: existingStudent.numero,
          etablissementId: existingStudent.etablissementId,
          classe: existingStudent.classe,
          email: existingStudent.email || '',
          anneeScolaire: existingStudent.anneeScolaire,
        });
      }
    }
  }, [studentId, etudiants, form]);

  const onSubmit = async (data: StudentFormData) => {
    setIsSubmitting(true);
    try {
      // Check if numero already exists (only for new students or different numero)
      const existingStudent = etudiants.find(e => e.numero === data.numero && e.id !== studentId);
      if (existingStudent) {
        form.setError('numero', { 
          message: 'Ce numéro étudiant existe déjà' 
        });
        setIsSubmitting(false);
        return;
      }

      if (studentId) {
        // Update existing student
        updateEtudiant(studentId, {
          ...data,
          email: data.email || undefined,
        });
        toast({
          title: "Étudiant modifié",
          description: "Les informations de l'étudiant ont été modifiées avec succès.",
        });
      } else {
        // Create new student
        addEtudiant({
          nom: data.nom,
          prenom: data.prenom,
          numero: data.numero,
          etablissementId: data.etablissementId,
          classe: data.classe,
          email: data.email || undefined,
          anneeScolaire: data.anneeScolaire,
        });
        toast({
          title: "Étudiant ajouté",
          description: "Le nouvel étudiant a été ajouté avec succès.",
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

  // Get unique classes from existing students
  const existingClasses = [...new Set(etudiants.map(e => e.classe))].sort();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="prenom"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prénom *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Jean" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nom"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Dupont" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="numero"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Numéro étudiant *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: 2024001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4">
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
                    <Input 
                      placeholder="Ex: Terminale S" 
                      {...field}
                      list="classes-list"
                    />
                  </FormControl>
                  <datalist id="classes-list">
                    {existingClasses.map((classe) => (
                      <option key={classe} value={classe} />
                    ))}
                  </datalist>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email (optionnel)</FormLabel>
                  <FormControl>
                    <Input 
                      type="email"
                      placeholder="Ex: jean.dupont@lycee.fr" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="anneeScolaire"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Année scolaire *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: 2024-2025" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting 
              ? (studentId ? 'Modification...' : 'Ajout...') 
              : (studentId ? 'Modifier' : 'Ajouter')
            }
          </Button>
        </div>
      </form>
    </Form>
  );
}