import { useState } from 'react';
import { Trash2, Edit, Calendar, FileText, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useData } from '@/contexts/DataContext';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface EvaluationManagerProps {
  coursId: string;
}

export function EvaluationManager({ coursId }: EvaluationManagerProps) {
  const { evaluations, deleteEvaluation, notes, cours } = useData();
  const [evaluationToDelete, setEvaluationToDelete] = useState<string | null>(null);

  const selectedCourse = cours.find(c => c.id === coursId);
  const courseEvaluations = evaluations.filter(e => e.coursId === coursId);

  const handleDeleteEvaluation = async () => {
    if (!evaluationToDelete) return;

    try {
      await deleteEvaluation(evaluationToDelete);
      toast.success('Évaluation supprimée avec succès');
      setEvaluationToDelete(null);
    } catch (error) {
      toast.error('Erreur lors de la suppression de l\'évaluation');
      console.error('Error deleting evaluation:', error);
    }
  };

  const getEvaluationStats = (evaluationId: string, evaluationName: string) => {
    const evalNotes = notes.filter(n => n.coursId === coursId && n.evaluation === evaluationName);
    const noteCount = evalNotes.length;
    const average = noteCount > 0 
      ? (evalNotes.reduce((sum, note) => sum + note.note, 0) / noteCount).toFixed(1)
      : '0';
    
    return { noteCount, average };
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'controle': 'Contrôle',
      'examen': 'Examen',
      'tp': 'TP',
      'oral': 'Oral'
    };
    return labels[type] || type;
  };

  const getTypeBadgeVariant = (type: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      'examen': 'destructive',
      'controle': 'default',
      'tp': 'secondary',
      'oral': 'outline'
    };
    return variants[type] || 'default';
  };

  if (!selectedCourse) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Sélectionnez un cours</h3>
          <p className="text-muted-foreground">
            Choisissez un cours pour gérer ses évaluations
          </p>
        </CardContent>
      </Card>
    );
  }

  if (courseEvaluations.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Aucune évaluation</h3>
          <p className="text-muted-foreground">
            Ce cours n'a pas encore d'évaluations. Créez-en une pour commencer.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">Évaluations du cours</h3>
            <p className="text-sm text-muted-foreground">
              {courseEvaluations.length} évaluation(s) pour {selectedCourse.nom}
            </p>
          </div>
        </div>

        <div className="grid gap-4">
          {courseEvaluations.map((evaluation) => {
            const stats = getEvaluationStats(evaluation.id, evaluation.nom);
            
            return (
              <Card key={evaluation.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-semibold">{evaluation.nom}</h4>
                        <Badge variant={getTypeBadgeVariant(evaluation.type)}>
                          {getTypeLabel(evaluation.type)}
                        </Badge>
                        {evaluation.estNoteGroupe && (
                          <Badge variant="outline">
                            <Users className="h-3 w-3 mr-1" />
                            Note de groupe
                          </Badge>
                        )}
                      </div>

                      {evaluation.description && (
                        <p className="text-sm text-muted-foreground mb-3">
                          {evaluation.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {format(new Date(evaluation.date), 'dd MMMM yyyy', { locale: fr })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          <span>{stats.noteCount} note(s)</span>
                        </div>
                        {stats.noteCount > 0 && (
                          <div className="font-medium text-foreground">
                            Moyenne: {stats.average}/20
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEvaluationToDelete(evaluation.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <AlertDialog open={evaluationToDelete !== null} onOpenChange={() => setEvaluationToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cette évaluation ? Cette action supprimera également
              toutes les notes associées et ne peut pas être annulée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteEvaluation} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
