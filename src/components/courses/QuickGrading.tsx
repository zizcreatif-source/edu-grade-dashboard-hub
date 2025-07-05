import { useState, useMemo } from 'react';
import { Plus, Save, Calculator, FileCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useData, Etudiant } from '@/contexts/DataContext';
import { useToast } from '@/hooks/use-toast';
import { EvaluationForm } from '@/components/grades/EvaluationForm';

interface QuickGradingProps {
  coursId: string;
  students: Etudiant[];
}

interface QuickGrade {
  studentId: string;
  note: number | null;
  saved: boolean;
}

export function QuickGrading({ coursId, students }: QuickGradingProps) {
  const { evaluations, notes, addNote, updateNote } = useData();
  const { toast } = useToast();
  const [selectedEvaluation, setSelectedEvaluation] = useState<string>('');
  const [quickGrades, setQuickGrades] = useState<QuickGrade[]>([]);
  const [showEvaluationForm, setShowEvaluationForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const courseEvaluations = evaluations.filter(e => e.coursId === coursId);
  const selectedEval = evaluations.find(e => e.id === selectedEvaluation);

  // Initialize quick grades when evaluation is selected
  const initializeGrades = (evaluationId: string) => {
    const evaluation = evaluations.find(e => e.id === evaluationId);
    if (!evaluation) return;

    const grades: QuickGrade[] = students.map(student => {
      const existingNote = notes.find(n => 
        n.etudiantId === student.id && 
        n.coursId === coursId && 
        n.evaluation === evaluation.nom
      );

      return {
        studentId: student.id,
        note: existingNote?.note || null,
        saved: !!existingNote
      };
    });

    setQuickGrades(grades);
  };

  const handleEvaluationChange = (evaluationId: string) => {
    setSelectedEvaluation(evaluationId);
    initializeGrades(evaluationId);
  };

  const updateGrade = (studentId: string, note: number | null) => {
    setQuickGrades(prev => prev.map(grade => 
      grade.studentId === studentId 
        ? { ...grade, note, saved: false }
        : grade
    ));
  };

  const saveAllGrades = async () => {
    if (!selectedEval) return;

    setIsSaving(true);
    try {
      for (const grade of quickGrades) {
        if (!grade.saved && grade.note !== null) {
          const existingNote = notes.find(n => 
            n.etudiantId === grade.studentId && 
            n.coursId === coursId && 
            n.evaluation === selectedEval.nom
          );

          const noteData = {
            etudiantId: grade.studentId,
            coursId: coursId,
            evaluation: selectedEval.nom,
            note: grade.note,
            coefficient: selectedEval.coefficient,
            date: new Date().toISOString().split('T')[0],
          };

          if (existingNote) {
            updateNote(existingNote.id, noteData);
          } else {
            addNote(noteData);
          }
        }
      }

      setQuickGrades(prev => prev.map(grade => ({ ...grade, saved: true })));
      
      toast({
        title: "Notes sauvegardées",
        description: "Toutes les notes ont été enregistrées avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les notes.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (nom: string, prenom: string) => {
    return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
  };

  const getGradeColor = (note: number | null) => {
    if (note === null) return '';
    if (note >= 16) return 'bg-green-100 text-green-800 border-green-200';
    if (note >= 14) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (note >= 12) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (note >= 10) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getGradeLabel = (note: number | null) => {
    if (note === null) return '';
    if (note >= 16) return 'Excellent';
    if (note >= 14) return 'Bien';
    if (note >= 12) return 'Assez bien';
    if (note >= 10) return 'Passable';
    return 'Insuffisant';
  };

  const stats = useMemo(() => {
    const validGrades = quickGrades.filter(g => g.note !== null).map(g => g.note!);
    if (validGrades.length === 0) return null;

    const average = validGrades.reduce((sum, note) => sum + note, 0) / validGrades.length;
    const passCount = validGrades.filter(note => note >= 10).length;
    const passRate = (passCount / validGrades.length) * 100;

    return { average, passCount, passRate, total: validGrades.length };
  }, [quickGrades]);

  const unsavedCount = quickGrades.filter(g => !g.saved && g.note !== null).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Notation rapide des étudiants</h3>
          <p className="text-sm text-muted-foreground">
            Notez rapidement tous vos étudiants en une seule fois
          </p>
        </div>
        <Dialog open={showEvaluationForm} onOpenChange={setShowEvaluationForm}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle évaluation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Créer une nouvelle évaluation</DialogTitle>
            </DialogHeader>
            <EvaluationForm 
              coursId={coursId}
              onClose={() => setShowEvaluationForm(false)} 
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Evaluation Selection */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Sélectionner l'évaluation</label>
              <Select value={selectedEvaluation} onValueChange={handleEvaluationChange}>
                <SelectTrigger>
                  <Calculator className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Choisir une évaluation pour noter" />
                </SelectTrigger>
                <SelectContent>
                  {courseEvaluations.map((evaluation) => (
                    <SelectItem key={evaluation.id} value={evaluation.id}>
                      {evaluation.nom} - {evaluation.type} (Coeff. {evaluation.coefficient})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedEval && (
              <div className="flex gap-2 items-center">
                <Badge variant="outline" className="capitalize">
                  {selectedEval.type}
                </Badge>
                <Badge variant="secondary">
                  Coeff. {selectedEval.coefficient}
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Grading Interface */}
      {selectedEvaluation ? (
        <div className="space-y-6">
          {/* Statistics */}
          {stats && (
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-muted-foreground">Moyenne</p>
                  <p className="text-2xl font-bold">{stats.average.toFixed(1)}/20</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-muted-foreground">Taux réussite</p>
                  <p className="text-2xl font-bold">{stats.passRate.toFixed(0)}%</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-muted-foreground">Notes saisies</p>
                  <p className="text-2xl font-bold">{stats.total}/{students.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-muted-foreground">À sauvegarder</p>
                  <p className="text-2xl font-bold text-orange-600">{unsavedCount}</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Grading Grid */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="h-5 w-5" />
                  {selectedEval.nom}
                </CardTitle>
                <Button 
                  onClick={saveAllGrades} 
                  disabled={unsavedCount === 0 || isSaving}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? 'Sauvegarde...' : `Sauvegarder (${unsavedCount})`}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {students.map((student) => {
                  const gradeData = quickGrades.find(g => g.studentId === student.id);
                  const note = gradeData?.note;
                  const saved = gradeData?.saved || false;

                  return (
                    <div key={student.id} className="p-4 border rounded-lg space-y-3">
                      {/* Student Info */}
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={student.avatar} />
                          <AvatarFallback>
                            {getInitials(student.nom, student.prenom)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {student.prenom} {student.nom}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            N° {student.numero}
                          </p>
                        </div>
                      </div>

                      {/* Grade Input */}
                      <div className="space-y-2">
                        <div className="relative">
                          <Input
                            type="number"
                            min="0"
                            max="20"
                            step="0.5"
                            value={note || ''}
                            onChange={(e) => {
                              const value = e.target.value ? parseFloat(e.target.value) : null;
                              if (value === null || (value >= 0 && value <= 20)) {
                                updateGrade(student.id, value);
                              }
                            }}
                            className={`text-center text-lg font-bold ${getGradeColor(note)}`}
                            placeholder="Note/20"
                          />
                          {!saved && note !== null && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full" />
                          )}
                        </div>
                        
                        {note !== null && (
                          <div className="text-center">
                            <Badge variant="outline" className={getGradeColor(note)}>
                              {getGradeLabel(note)}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Sélectionnez une évaluation</h3>
            <p className="text-muted-foreground mb-4">
              {courseEvaluations.length > 0 
                ? 'Choisissez une évaluation pour commencer à noter vos étudiants'
                : 'Créez d\'abord une évaluation pour pouvoir noter vos étudiants'
              }
            </p>
            {courseEvaluations.length === 0 && (
              <Button onClick={() => setShowEvaluationForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Créer une évaluation
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}