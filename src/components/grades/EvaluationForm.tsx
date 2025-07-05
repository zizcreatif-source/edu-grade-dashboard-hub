import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Calendar, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const evaluationSchema = z.object({
  nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  type: z.enum(['controle', 'examen', 'tp', 'oral'], {
    required_error: 'Veuillez sélectionner un type d\'évaluation'
  }),
  coefficient: z.number().min(0.5, 'Le coefficient doit être supérieur à 0.5').max(5, 'Le coefficient ne peut pas dépasser 5'),
  date: z.date({
    required_error: 'Veuillez sélectionner une date'
  }),
  description: z.string().optional(),
});

type EvaluationFormData = z.infer<typeof evaluationSchema>;

interface EvaluationFormProps {
  coursId: string;
  onClose: () => void;
}

export function EvaluationForm({ coursId, onClose }: EvaluationFormProps) {
  const { addEvaluation } = useData();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const form = useForm<EvaluationFormData>({
    resolver: zodResolver(evaluationSchema),
    defaultValues: {
      nom: '',
      coefficient: 1,
      description: '',
    },
  });

  const onSubmit = async (data: EvaluationFormData) => {
    if (!coursId) {
      toast({
        title: "Erreur",
        description: "Aucun cours sélectionné.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      addEvaluation({
        coursId: coursId,
        nom: data.nom,
        type: data.type,
        coefficient: data.coefficient,
        date: data.date.toISOString().split('T')[0],
        description: data.description,
      });

      toast({
        title: "Évaluation créée",
        description: "La nouvelle évaluation a été créée avec succès.",
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Simulate file upload
      setUploadedFile(file);
      toast({
        title: "Fichier téléchargé",
        description: `${file.name} a été téléchargé avec succès.`,
      });
    }
  };

  const evaluationTypes = [
    { value: 'controle', label: 'Contrôle', color: 'bg-blue-100 text-blue-800' },
    { value: 'examen', label: 'Examen', color: 'bg-red-100 text-red-800' },
    { value: 'tp', label: 'Travaux Pratiques', color: 'bg-green-100 text-green-800' },
    { value: 'oral', label: 'Épreuve Orale', color: 'bg-purple-100 text-purple-800' },
  ];

  const coefficientPresets = [
    { value: 0.5, label: '0.5 - Exercice' },
    { value: 1, label: '1 - Contrôle simple' },
    { value: 1.5, label: '1.5 - Contrôle important' },
    { value: 2, label: '2 - Examen' },
    { value: 3, label: '3 - Examen final' },
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
                  <FormLabel>Nom de l'évaluation *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Contrôle Chapitre 3" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type d'évaluation *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner le type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {evaluationTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <Badge className={type.color} variant="secondary">
                              {type.label}
                            </Badge>
                          </div>
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
              name="coefficient"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Coefficient *</FormLabel>
                  <div className="space-y-2">
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.5"
                        min="0.5"
                        max="5"
                        {...field} 
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 1)}
                      />
                    </FormControl>
                    <div className="flex flex-wrap gap-1">
                      {coefficientPresets.map((preset) => (
                        <Button
                          key={preset.value}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => field.onChange(preset.value)}
                          className="text-xs"
                        >
                          {preset.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date de l'évaluation *</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className="w-full pl-3 text-left font-normal"
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: fr })
                          ) : (
                            <span className="text-muted-foreground">Sélectionner une date</span>
                          )}
                          <Calendar className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date("1900-01-01")}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* File Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Document d'évaluation (optionnel)</label>
              <Card className="border-dashed">
                <CardContent className="p-4">
                  <div className="text-center space-y-2">
                    <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
                    <div>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                      />
                      <Button asChild variant="outline" size="sm">
                        <label htmlFor="file-upload" className="cursor-pointer">
                          Télécharger un fichier
                        </label>
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      PDF, DOC, DOCX (max 10MB)
                    </p>
                    {uploadedFile && (
                      <Badge variant="secondary" className="mt-2">
                        {uploadedFile.name}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (optionnel)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Description de l'évaluation, consignes particulières..." 
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
            {isSubmitting ? 'Création...' : 'Créer l\'évaluation'}
          </Button>
        </div>
      </form>
    </Form>
  );
}