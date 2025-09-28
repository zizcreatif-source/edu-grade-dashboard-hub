import { useState, useEffect, useMemo } from 'react';
import { Save, MessageSquare, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useData, Etudiant } from '@/contexts/DataContext';
import { useToast } from '@/hooks/use-toast';

interface GradeGridProps {
  coursId: string;
  evaluationId: string;
  students: Etudiant[];
  autoSave: boolean;
}

interface GradeData {
  studentId: string;
  note: number | null;
  commentaire: string;
  saved: boolean;
}

export function GradeGrid({ coursId, evaluationId, students, autoSave }: GradeGridProps) {
  const { notes, evaluations, addNote, updateNote } = useData();
  const { toast } = useToast();
  const [gradesData, setGradesData] = useState<GradeData[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [openPopover, setOpenPopover] = useState<string | null>(null);

  const evaluation = evaluations.find(e => e.id === evaluationId);

  // Initialize grades data
  useEffect(() => {
    const initialData = students.map(student => {
      const existingNote = notes.find(n => 
        n.etudiantId === student.id && 
        n.coursId === coursId && 
        n.evaluation === evaluation?.nom
      );

      return {
        studentId: student.id,
        note: existingNote?.note || null,
        commentaire: existingNote?.commentaire || '',
        saved: !!existingNote
      };
    });

    setGradesData(initialData);
  }, [students, notes, coursId, evaluation?.nom]);

  const updateGrade = (studentId: string, field: 'note' | 'commentaire', value: number | string | null) => {
    setGradesData(prev => prev.map(grade => 
      grade.studentId === studentId 
        ? { ...grade, [field]: value, saved: false }
        : grade
    ));
  };

  const saveGrade = async (studentId: string) => {
    const gradeData = gradesData.find(g => g.studentId === studentId);
    if (!gradeData || !evaluation) return;

    try {
      const existingNote = notes.find(n => 
        n.etudiantId === studentId && 
        n.coursId === coursId && 
        n.evaluation === evaluation.nom
      );

      const noteData = {
        etudiantId: studentId,
        coursId: coursId,
        evaluation: evaluation.nom,
        note: gradeData.note || 0,
        date: new Date().toISOString().split('T')[0],
        commentaire: gradeData.commentaire || undefined
      };

      if (existingNote) {
        updateNote(existingNote.id, noteData);
      } else if (gradeData.note !== null || gradeData.commentaire) {
        addNote(noteData);
      }

      setGradesData(prev => prev.map(grade => 
        grade.studentId === studentId 
          ? { ...grade, saved: true }
          : grade
      ));

      if (!autoSave) {
        toast({
          title: "Note sauvegardée",
          description: "La note a été enregistrée avec succès.",
        });
      }
      
      // Fermer le popover de commentaire après sauvegarde
      setOpenPopover(null);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la note.",
        variant: "destructive",
      });
    }
  };

  const saveAllGrades = () => {
    gradesData.forEach(grade => {
      if (!grade.saved && grade.note !== null) {
        saveGrade(grade.studentId);
      }
    });
  };

  const getGradeColor = (note: number | null) => {
    if (note === null) return 'bg-muted';
    if (note >= 16) return 'bg-green-100 text-green-800';
    if (note >= 14) return 'bg-blue-100 text-blue-800';
    if (note >= 12) return 'bg-yellow-100 text-yellow-800';
    if (note >= 10) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const getInitials = (nom: string, prenom: string) => {
    return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const validGrades = gradesData.filter(g => g.note !== null).map(g => g.note!);
    if (validGrades.length === 0) return null;

    const average = validGrades.reduce((sum, note) => sum + note, 0) / validGrades.length;
    const min = Math.min(...validGrades);
    const max = Math.max(...validGrades);
    const passCount = validGrades.filter(note => note >= 10).length;
    const passRate = (passCount / validGrades.length) * 100;

    return { average, min, max, passCount, passRate, total: validGrades.length };
  }, [gradesData]);

  return (
    <div className="space-y-6">
      {/* Statistics */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Moyenne</p>
                <p className="text-2xl font-bold">{stats.average.toFixed(1)}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Note min</p>
                <p className="text-2xl font-bold text-red-600">{stats.min}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Note max</p>
                <p className="text-2xl font-bold text-green-600">{stats.max}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Taux réussite</p>
                <p className="text-2xl font-bold">{stats.passRate.toFixed(0)}%</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Notes saisies</p>
                <p className="text-2xl font-bold">{stats.total}/{students.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Grade Grid */}
      <div data-grade-grid="true">
        <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Grille de saisie</CardTitle>
            <div className="flex gap-2">
              <Badge variant={autoSave ? "default" : "outline"}>
                {autoSave ? "Sauvegarde auto" : "Sauvegarde manuelle"}
              </Badge>
              {!autoSave && (
                <Button onClick={saveAllGrades} size="sm" data-save-all="true">
                  <Save className="h-4 w-4 mr-2" />
                  Tout sauvegarder
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {students.map((student) => {
              const gradeData = gradesData.find(g => g.studentId === student.id);
              const note = gradeData?.note;
              const commentaire = gradeData?.commentaire || '';
              const saved = gradeData?.saved || false;

              return (
                <div key={student.id} className="grid grid-cols-12 gap-4 items-center p-3 rounded-lg border hover:bg-muted/50">
                  {/* Student Info */}
                  <div className="col-span-5 flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={student.avatar} />
                      <AvatarFallback>
                        {getInitials(student.nom, student.prenom)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {student.prenom} {student.nom}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        N° {student.numero}
                      </p>
                    </div>
                  </div>

                  {/* Grade Input */}
                  <div className="col-span-3">
                    <div className="relative">
                      <Input
                        type="number"
                        min="0"
                        max="20"
                        step="0.5"
                        value={note != null ? note.toString() : ''}
                        onChange={(e) => {
                          const inputValue = e.target.value;
                          if (inputValue === '') {
                            updateGrade(student.id, 'note', null);
                          } else {
                            // Allow intermediate typing, store as string temporarily
                            const value = parseFloat(inputValue);
                            if (!isNaN(value)) {
                              updateGrade(student.id, 'note', value);
                            }
                          }
                        }}
                        onBlur={(e) => {
                          const inputValue = e.target.value;
                          if (inputValue !== '') {
                            const value = parseFloat(inputValue);
                            if (isNaN(value) || value < 0 || value > 20) {
                              // Reset to previous valid value or null
                              updateGrade(student.id, 'note', note);
                            }
                          }
                        }}
                        className={`text-center ${getGradeColor(note)}`}
                        placeholder="Note"
                      />
                      {!saved && note !== null && (
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full" />
                      )}
                    </div>
                  </div>

                  {/* Grade Badge */}
                  <div className="col-span-2">
                    {note !== null && (
                      <Badge className={getGradeColor(note)}>
                        {note >= 16 ? 'Excellent' : 
                         note >= 14 ? 'Bien' :
                         note >= 12 ? 'Assez bien' :
                         note >= 10 ? 'Passable' : 'Insuffisant'}
                      </Badge>
                    )}
                  </div>

                  {/* Comment Button */}
                  <div className="col-span-2 flex justify-end gap-2">
                    <Popover 
                      open={openPopover === student.id} 
                      onOpenChange={(open) => setOpenPopover(open ? student.id : null)}
                    >
                      <PopoverTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className={commentaire ? "text-blue-600" : ""}
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <div className="space-y-3">
                          <h4 className="font-medium">Commentaire</h4>
                          <Textarea
                            placeholder="Ajouter un commentaire..."
                            value={commentaire}
                            onChange={(e) => {
                              e.preventDefault();
                              updateGrade(student.id, 'commentaire', e.target.value);
                            }}
                            onKeyDown={(e) => {
                              e.stopPropagation();
                            }}
                            rows={3}
                          />
                          <Button 
                            size="sm" 
                            onClick={() => saveGrade(student.id)}
                            className="w-full"
                          >
                            Sauvegarder
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>

                    {!autoSave && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => saveGrade(student.id)}
                        disabled={saved || note === null}
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}