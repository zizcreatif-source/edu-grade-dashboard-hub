import { useState, useMemo } from 'react';
import { Plus, BookOpen, Users, Calculator, BarChart3, Save, Lock, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/contexts/DataContext';
import { GradeGrid } from '@/components/grades/GradeGrid';
import { EvaluationForm } from '@/components/grades/EvaluationForm';
import { ClassStats } from '@/components/grades/ClassStats';
import { GradeHistory } from '@/components/grades/GradeHistory';
import { QuickGradingInterface } from '@/components/grades/QuickGradingInterface';
import { GradePdfExporter } from '@/components/grades/GradePdfExporter';

export default function Notes() {
  const { cours, evaluations, etudiants, notes } = useData();
  const [selectedCours, setSelectedCours] = useState<string>('');
  const [selectedEvaluation, setSelectedEvaluation] = useState<string>('');
  const [viewMode, setViewMode] = useState<'quick' | 'grid' | 'export' | 'stats'>('quick');
  const [showEvaluationForm, setShowEvaluationForm] = useState(false);
  const [autoSave, setAutoSave] = useState(true);

  // Get evaluations for selected course
  const courseEvaluations = useMemo(() => {
    return evaluations.filter(e => e.coursId === selectedCours);
  }, [evaluations, selectedCours]);

  // Get students for selected course
  const courseStudents = useMemo(() => {
    const selectedCourse = cours.find(c => c.id === selectedCours);
    if (!selectedCourse) return [];
    return etudiants.filter(e => e.classe === selectedCourse.classe);
  }, [cours, etudiants, selectedCours]);

  // Get notes for selected evaluation
  const evaluationNotes = useMemo(() => {
    return notes.filter(n => n.coursId === selectedCours);
  }, [notes, selectedCours]);

  const selectedCourse = cours.find(c => c.id === selectedCours);
  const selectedEval = evaluations.find(e => e.id === selectedEvaluation);

  // Calculate class average for selected evaluation
  const classAverage = useMemo(() => {
    if (!selectedEvaluation) return 0;
    const evalNotes = notes.filter(n => n.coursId === selectedCours && n.evaluation === selectedEval?.nom);
    if (evalNotes.length === 0) return 0;
    return evalNotes.reduce((sum, note) => sum + note.note, 0) / evalNotes.length;
  }, [notes, selectedCours, selectedEvaluation, selectedEval?.nom]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Système de Notation</h1>
          <p className="text-muted-foreground">Saisie des notes et calculs automatiques</p>
        </div>
        <div className="flex gap-2">
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
                coursId={selectedCours}
                onClose={() => setShowEvaluationForm(false)} 
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Course and Evaluation Selection */}
      <Card>
        <CardContent className="p-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm font-medium mb-2 block">Cours</label>
              <Select value={selectedCours} onValueChange={setSelectedCours}>
                <SelectTrigger>
                  <BookOpen className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Sélectionner un cours" />
                </SelectTrigger>
                <SelectContent>
                  {cours.map((course) => {
                    const studentsInClass = etudiants.filter(e => e.classe === course.classe).length;
                    return (
                      <SelectItem key={course.id} value={course.id}>
                        {course.nom} - {course.classe} ({studentsInClass} étudiants)
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {selectedCours && courseStudents.length === 0 && (
                <p className="text-sm text-amber-600 mt-1">
                  ⚠️ Aucun étudiant trouvé pour la classe de ce cours
                </p>
              )}
            </div>

            {selectedCours && (
              <div>
                <label className="text-sm font-medium mb-2 block">Évaluation</label>
                <Select value={selectedEvaluation} onValueChange={setSelectedEvaluation}>
                  <SelectTrigger>
                    <Calculator className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Sélectionner une évaluation" />
                  </SelectTrigger>
                  <SelectContent>
                    {courseEvaluations.map((evaluation) => (
                      <SelectItem key={evaluation.id} value={evaluation.id}>
                        {evaluation.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedCours && (
              <div className="flex items-end">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4" />
                    <span>{courseStudents.length} étudiants</span>
                  </div>
                  {selectedEvaluation && (
                    <div className="flex items-center gap-2 text-sm">
                      <BarChart3 className="h-4 w-4" />
                      <span>Moyenne: {classAverage.toFixed(1)}/20</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Course Info */}
      {selectedCourse && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Cours sélectionné</p>
                  <p className="font-medium">{selectedCourse.nom}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Classe</p>
                  <p className="font-medium">{selectedCourse.classe}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div>
                <p className="text-sm text-muted-foreground">Évaluations</p>
                <p className="text-2xl font-bold">{courseEvaluations.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div>
                <p className="text-sm text-muted-foreground">Notes saisies</p>
                <p className="text-2xl font-bold">{evaluationNotes.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      {selectedCours ? (
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="quick">Notation rapide</TabsTrigger>
            <TabsTrigger value="grid">Saisie avancée</TabsTrigger>
            <TabsTrigger value="export">Export PDF</TabsTrigger>
            <TabsTrigger value="stats">Statistiques</TabsTrigger>
          </TabsList>

          <TabsContent value="quick" className="space-y-4">
            <QuickGradingInterface 
              coursId={selectedCours}
              students={courseStudents}
              evaluations={courseEvaluations}
            />
          </TabsContent>

          <TabsContent value="grid" className="space-y-4">
            {selectedEvaluation ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <h3 className="text-lg font-medium">
                      Saisie des notes - {selectedEval?.nom}
                    </h3>
                    <Badge variant="outline" className="capitalize">
                      {selectedEval?.type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const gradeGrid = document.querySelector('[data-grade-grid="true"]');
                        if (gradeGrid) {
                          const saveAllButton = gradeGrid.querySelector('button[data-save-all="true"]');
                          if (saveAllButton) {
                            (saveAllButton as HTMLButtonElement).click();
                          }
                        }
                      }}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Sauvegarder tout
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setAutoSave(!autoSave)}
                    >
                      {autoSave ? <Lock className="h-4 w-4 mr-2" /> : <Unlock className="h-4 w-4 mr-2" />}
                      {autoSave ? 'Verrouiller' : 'Déverrouiller'}
                    </Button>
                  </div>
                </div>
                <GradeGrid 
                  coursId={selectedCours}
                  evaluationId={selectedEvaluation}
                  students={courseStudents}
                  autoSave={autoSave}
                />
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Sélectionnez une évaluation</h3>
                  <p className="text-muted-foreground mb-4">
                    Choisissez une évaluation pour commencer la saisie des notes
                  </p>
                  <Button onClick={() => setShowEvaluationForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Créer une évaluation
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="export" className="space-y-4">
            <GradePdfExporter 
              coursId={selectedCours}
              evaluationId={selectedEvaluation}
              students={courseStudents}
            />
          </TabsContent>

          <TabsContent value="stats">
            <ClassStats 
              coursId={selectedCours}
              evaluationId={selectedEvaluation}
            />
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Sélectionnez un cours</h3>
            <p className="text-muted-foreground">
              Choisissez un cours pour commencer la saisie des notes
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}