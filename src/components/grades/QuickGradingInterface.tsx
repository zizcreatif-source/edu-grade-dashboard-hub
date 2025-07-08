import { useState, useMemo } from 'react';
import { FileDown, Save, Star, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useData, Etudiant, Evaluation } from '@/contexts/DataContext';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

interface QuickGradingInterfaceProps {
  coursId: string;
  students: Etudiant[];
  evaluations: Evaluation[];
}

interface StudentGrade {
  studentId: string;
  note: number | null;
  saved: boolean;
}

export function QuickGradingInterface({ coursId, students, evaluations }: QuickGradingInterfaceProps) {
  const { notes, addNote, updateNote } = useData();
  const { toast } = useToast();
  const [selectedEvaluation, setSelectedEvaluation] = useState<string>('');
  const [grades, setGrades] = useState<StudentGrade[]>([]);
  const [currentStudentIndex, setCurrentStudentIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const selectedEval = evaluations.find(e => e.id === selectedEvaluation);
  const currentStudent = students[currentStudentIndex];
  const currentGrade = grades.find(g => g.studentId === currentStudent?.id);

  // Initialize grades when evaluation changes
  const initializeGrades = (evaluationId: string) => {
    const evaluation = evaluations.find(e => e.id === evaluationId);
    if (!evaluation) return;

    const initialGrades: StudentGrade[] = students.map(student => {
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

    setGrades(initialGrades);
    setCurrentStudentIndex(0);
  };

  const handleEvaluationChange = (evaluationId: string) => {
    setSelectedEvaluation(evaluationId);
    initializeGrades(evaluationId);
  };

  const updateCurrentGrade = (note: number | null) => {
    if (!currentStudent) return;
    
    setGrades(prev => prev.map(grade => 
      grade.studentId === currentStudent.id 
        ? { ...grade, note, saved: false }
        : grade
    ));
  };

  const saveCurrentGrade = async () => {
    if (!currentStudent || !selectedEval || currentGrade?.note === null) return;

    setIsSaving(true);
    try {
      const existingNote = notes.find(n => 
        n.etudiantId === currentStudent.id && 
        n.coursId === coursId && 
        n.evaluation === selectedEval.nom
      );

      const noteData = {
        etudiantId: currentStudent.id,
        coursId: coursId,
        evaluation: selectedEval.nom,
        note: currentGrade.note!,
        date: new Date().toISOString().split('T')[0],
      };

      if (existingNote) {
        await updateNote(existingNote.id, noteData);
      } else {
        await addNote(noteData);
      }

      setGrades(prev => prev.map(grade => 
        grade.studentId === currentStudent.id 
          ? { ...grade, saved: true }
          : grade
      ));

      toast({
        title: "Note sauvegardée",
        description: `Note de ${currentStudent.prenom} ${currentStudent.nom} enregistrée.`,
      });

      // Move to next student
      if (currentStudentIndex < students.length - 1) {
        setCurrentStudentIndex(prev => prev + 1);
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la note.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const goToStudent = (index: number) => {
    setCurrentStudentIndex(index);
  };

  const getGradeColor = (note: number | null) => {
    if (note === null) return 'bg-muted text-muted-foreground';
    if (note >= 16) return 'bg-green-500 text-white';
    if (note >= 14) return 'bg-blue-500 text-white';
    if (note >= 12) return 'bg-yellow-500 text-white';
    if (note >= 10) return 'bg-orange-500 text-white';
    return 'bg-red-500 text-white';
  };

  const getGradeLabel = (note: number | null) => {
    if (note === null) return 'Non noté';
    if (note >= 16) return 'Excellent';
    if (note >= 14) return 'Bien';
    if (note >= 12) return 'Assez bien';
    if (note >= 10) return 'Passable';
    return 'Insuffisant';
  };

  const gradedCount = grades.filter(g => g.note !== null).length;
  const savedCount = grades.filter(g => g.saved).length;
  const progress = students.length > 0 ? (savedCount / students.length) * 100 : 0;

  const stats = useMemo(() => {
    const validGrades = grades.filter(g => g.note !== null).map(g => g.note!);
    if (validGrades.length === 0) return null;

    const average = validGrades.reduce((sum, note) => sum + note, 0) / validGrades.length;
    const passCount = validGrades.filter(note => note >= 10).length;
    const passRate = (passCount / validGrades.length) * 100;

    return { average, passCount, passRate, total: validGrades.length };
  }, [grades]);

  return (
    <div className="space-y-6">
      {/* Evaluation Selection */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <Select value={selectedEvaluation} onValueChange={handleEvaluationChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sélectionner une évaluation pour commencer la notation" />
              </SelectTrigger>
              <SelectContent>
                {evaluations.map((evaluation) => (
                  <SelectItem key={evaluation.id} value={evaluation.id}>
                    {evaluation.nom} - {evaluation.type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedEval && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Progression: {savedCount}/{students.length} étudiants notés</span>
                  <span>{progress.toFixed(0)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedEval && currentStudent ? (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Current Student Grading */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-2 border-primary">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Notation en cours</span>
                  <Badge variant="outline">
                    {currentStudentIndex + 1} / {students.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Student Info */}
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={currentStudent.avatar} />
                    <AvatarFallback className="text-lg">
                      {currentStudent.prenom.charAt(0)}{currentStudent.nom.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-bold">
                      {currentStudent.prenom} {currentStudent.nom}
                    </h3>
                    <p className="text-muted-foreground">
                      N° {currentStudent.numero} - {currentStudent.classe}
                    </p>
                  </div>
                </div>

                {/* Grade Input */}
                <div className="space-y-4">
                  <label className="text-lg font-medium">Note sur 20</label>
                  <div className="flex items-center space-x-4">
                    <Input
                      type="number"
                      min="0"
                      max="20"
                      step="0.25"
                      value={currentGrade?.note || ''}
                      onChange={(e) => {
                        const value = e.target.value ? parseFloat(e.target.value) : null;
                        if (value === null || (value >= 0 && value <= 20)) {
                          updateCurrentGrade(value);
                        }
                      }}
                      className="text-3xl text-center h-16 font-bold"
                      placeholder="0"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && currentGrade?.note !== null) {
                          saveCurrentGrade();
                        }
                      }}
                    />
                    <div className="flex flex-col items-center space-y-2">
                      <div className={`px-4 py-2 rounded-lg text-sm font-medium ${getGradeColor(currentGrade?.note || null)}`}>
                        {getGradeLabel(currentGrade?.note || null)}
                      </div>
                      {currentGrade?.note !== null && (
                        <div className="flex">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < (currentGrade.note! / 4) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <Button 
                    onClick={saveCurrentGrade}
                    disabled={currentGrade?.note === null || isSaving}
                    className="flex-1"
                    size="lg"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? 'Sauvegarde...' : 'Sauvegarder & Suivant'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStudentIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentStudentIndex === 0}
                  >
                    Précédent
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStudentIndex(prev => Math.min(students.length - 1, prev + 1))}
                    disabled={currentStudentIndex === students.length - 1}
                  >
                    Suivant
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            {stats && (
              <div className="grid gap-4 md:grid-cols-3">
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
                    <p className="text-2xl font-bold">{savedCount}/{students.length}</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Students List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Liste des étudiants
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-96 overflow-y-auto">
                {students.map((student, index) => {
                  const grade = grades.find(g => g.studentId === student.id);
                  const isActive = index === currentStudentIndex;
                  
                  return (
                    <div
                      key={student.id}
                      className={`p-3 border-b cursor-pointer transition-colors ${
                        isActive ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => goToStudent(index)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={student.avatar} />
                            <AvatarFallback className="text-xs">
                              {student.prenom.charAt(0)}{student.nom.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">
                              {student.prenom} {student.nom}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              N° {student.numero}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {grade?.note !== null && (
                            <Badge className={`${getGradeColor(grade.note)} text-xs`}>
                              {grade.note}
                            </Badge>
                          )}
                          {grade?.saved && (
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                          )}
                        </div>
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
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Interface de notation rapide</h3>
            <p className="text-muted-foreground">
              Sélectionnez une évaluation pour commencer la notation immersive de vos étudiants
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}