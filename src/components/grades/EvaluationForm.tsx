import { useState } from 'react';
import { BookOpen, GraduationCap, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/hooks/use-toast';

interface EvaluationFormProps {
  coursId: string;
  onClose: () => void;
}

export function EvaluationForm({ coursId, onClose }: EvaluationFormProps) {
  const { addEvaluation } = useData();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  const evaluationTemplates = [
    {
      id: 'exam-only',
      title: 'Examen uniquement',
      description: 'Une seule évaluation finale',
      icon: GraduationCap,
      evaluations: [
        { nom: 'Examen final', type: 'examen', coefficient: 2 }
      ]
    },
    {
      id: 'homework-exam',
      title: 'Devoir + Examen',
      description: 'Un devoir en contrôle continu et un examen final',
      icon: BookOpen,
      evaluations: [
        { nom: 'Devoir', type: 'controle', coefficient: 1 },
        { nom: 'Examen final', type: 'examen', coefficient: 2 }
      ]
    }
  ];

  const handleTemplateSubmit = async () => {
    if (!selectedTemplate || !coursId) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un template d'évaluation.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const template = evaluationTemplates.find(t => t.id === selectedTemplate);
      if (!template) return;

      // Créer toutes les évaluations du template
      template.evaluations.forEach((evaluation, index) => {
        addEvaluation({
          coursId: coursId,
          nom: evaluation.nom,
          type: evaluation.type as 'controle' | 'examen' | 'tp' | 'oral',
          coefficient: evaluation.coefficient,
          date: new Date().toISOString().split('T')[0], // Date d'aujourd'hui par défaut
          description: `Évaluation créée automatiquement - ${template.title}`,
        });
      });

      toast({
        title: "Évaluations créées",
        description: `${template.evaluations.length} évaluation(s) créée(s) avec succès.`,
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

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-medium">Choisissez votre système d'évaluation</h3>
        <p className="text-sm text-muted-foreground">
          Sélectionnez le type d'évaluations pour ce cours
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {evaluationTemplates.map((template) => {
          const Icon = template.icon;
          const isSelected = selectedTemplate === template.id;
          
          return (
            <Card 
              key={template.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                isSelected ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedTemplate(template.id)}
            >
              <CardHeader className="text-center">
                <div className="mx-auto mb-2">
                  <Icon className={`h-12 w-12 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <CardTitle className="flex items-center justify-center gap-2">
                  {template.title}
                  {isSelected && <CheckCircle className="h-5 w-5 text-primary" />}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-3">
                <p className="text-sm text-muted-foreground">
                  {template.description}
                </p>
                <div className="space-y-2">
                  {template.evaluations.map((evaluation, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span>{evaluation.nom}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize">
                          {evaluation.type}
                        </Badge>
                        <Badge variant="secondary">
                          Coeff. {evaluation.coefficient}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onClose}>
          Annuler
        </Button>
        <Button 
          onClick={handleTemplateSubmit} 
          disabled={isSubmitting || !selectedTemplate}
        >
          {isSubmitting ? 'Création...' : 'Créer les évaluations'}
        </Button>
      </div>
    </div>
  );
}