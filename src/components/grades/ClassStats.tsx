import { useMemo } from 'react';
import { BarChart3, TrendingUp, Users, Award, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/contexts/DataContext';

interface ClassStatsProps {
  coursId: string;
  evaluationId?: string;
}

export function ClassStats({ coursId, evaluationId }: ClassStatsProps) {
  const { notes, cours, etudiants, evaluations } = useData();

  const selectedCourse = cours.find(c => c.id === coursId);
  const selectedEvaluation = evaluations.find(e => e.id === evaluationId);
  const courseStudents = etudiants.filter(e => e.classe === selectedCourse?.classe);

  // Get notes for the course/evaluation
  const courseNotes = useMemo(() => {
    let filteredNotes = notes.filter(n => n.coursId === coursId);
    
    if (evaluationId && selectedEvaluation) {
      filteredNotes = filteredNotes.filter(n => n.evaluation === selectedEvaluation.nom);
    }
    
    return filteredNotes;
  }, [notes, coursId, evaluationId, selectedEvaluation]);

  // Calculate comprehensive statistics
  const statistics = useMemo(() => {
    if (courseNotes.length === 0) return null;

    const noteValues = courseNotes.map(n => n.note);
    const average = noteValues.reduce((sum, note) => sum + note, 0) / noteValues.length;
    const min = Math.min(...noteValues);
    const max = Math.max(...noteValues);
    
    // Standard deviation
    const variance = noteValues.reduce((sum, note) => sum + Math.pow(note - average, 2), 0) / noteValues.length;
    const standardDeviation = Math.sqrt(variance);

    // Grade distribution
    const distribution = {
      excellent: noteValues.filter(n => n >= 16).length,
      bien: noteValues.filter(n => n >= 14 && n < 16).length,
      assezBien: noteValues.filter(n => n >= 12 && n < 14).length,
      passable: noteValues.filter(n => n >= 10 && n < 12).length,
      insuffisant: noteValues.filter(n => n < 10).length,
    };

    // Pass rates by thresholds
    const passRates = {
      rate10: (noteValues.filter(n => n >= 10).length / noteValues.length) * 100,
      rate12: (noteValues.filter(n => n >= 12).length / noteValues.length) * 100,
      rate14: (noteValues.filter(n => n >= 14).length / noteValues.length) * 100,
      rate16: (noteValues.filter(n => n >= 16).length / noteValues.length) * 100,
    };

    // Student performance analysis
    const studentStats = courseStudents.map(student => {
      const studentNotes = courseNotes.filter(n => n.etudiantId === student.id);
      if (studentNotes.length === 0) return null;

      const studentAverage = studentNotes.reduce((sum, note) => sum + note.note, 0) / studentNotes.length;

      return {
        studentId: student.id,
        studentName: `${student.prenom} ${student.nom}`,
        average: studentAverage,
        notesCount: studentNotes.length,
      };
    }).filter(Boolean);

    // Sort students by average
    const sortedStudents = studentStats.sort((a, b) => (b?.average || 0) - (a?.average || 0));

    return {
      average,
      min,
      max,
      standardDeviation,
      distribution,
      passRates,
      totalNotes: noteValues.length,
      totalStudents: courseStudents.length,
      studentsWithNotes: studentStats.length,
      sortedStudents: sortedStudents.slice(0, 10), // Top 10
    };
  }, [courseNotes, courseStudents]);

  if (!statistics) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Aucune statistique disponible</h3>
          <p className="text-muted-foreground">
            {evaluationId 
              ? "Aucune note saisie pour cette évaluation"
              : "Aucune note saisie pour ce cours"}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Moyenne générale</p>
                <p className="text-2xl font-bold">{statistics.average.toFixed(1)}/20</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Écart-type</p>
                <p className="text-2xl font-bold">{statistics.standardDeviation.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Min - Max</p>
              <p className="text-2xl font-bold">
                <span className="text-red-600">{statistics.min}</span>
                <span className="text-muted-foreground mx-2">-</span>
                <span className="text-green-600">{statistics.max}</span>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Participation</p>
                <p className="text-2xl font-bold">
                  {statistics.studentsWithNotes}/{statistics.totalStudents}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grade Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Répartition des notes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-5">
            <div className="text-center">
              <div className="bg-green-100 text-green-800 rounded-lg p-4">
                <p className="text-2xl font-bold">{statistics.distribution.excellent}</p>
                <p className="text-sm">Excellent (≥16)</p>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 text-blue-800 rounded-lg p-4">
                <p className="text-2xl font-bold">{statistics.distribution.bien}</p>
                <p className="text-sm">Bien (14-15.9)</p>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-yellow-100 text-yellow-800 rounded-lg p-4">
                <p className="text-2xl font-bold">{statistics.distribution.assezBien}</p>
                <p className="text-sm">Assez bien (12-13.9)</p>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 text-orange-800 rounded-lg p-4">
                <p className="text-2xl font-bold">{statistics.distribution.passable}</p>
                <p className="text-sm">Passable (10-11.9)</p>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-red-100 text-red-800 rounded-lg p-4">
                <p className="text-2xl font-bold">{statistics.distribution.insuffisant}</p>
                <p className="text-sm">Insuffisant (&lt;10)</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pass Rates */}
      <Card>
        <CardHeader>
          <CardTitle>Taux de réussite par seuil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Seuil 10/20 (Admis)</span>
                <span>{statistics.passRates.rate10.toFixed(1)}%</span>
              </div>
              <Progress value={statistics.passRates.rate10} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Seuil 12/20 (Assez bien)</span>
                <span>{statistics.passRates.rate12.toFixed(1)}%</span>
              </div>
              <Progress value={statistics.passRates.rate12} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Seuil 14/20 (Bien)</span>
                <span>{statistics.passRates.rate14.toFixed(1)}%</span>
              </div>
              <Progress value={statistics.passRates.rate14} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Seuil 16/20 (Excellent)</span>
                <span>{statistics.passRates.rate16.toFixed(1)}%</span>
              </div>
              <Progress value={statistics.passRates.rate16} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Performers */}
      {statistics.sortedStudents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Classement des étudiants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {statistics.sortedStudents.map((student, index) => (
                <div key={student?.studentId} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Badge variant={index < 3 ? "default" : "outline"}>
                      #{index + 1}
                    </Badge>
                    <span className="font-medium">{student?.studentName}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{student?.average.toFixed(1)}/20</p>
                    <p className="text-sm text-muted-foreground">
                      {student?.notesCount} note{(student?.notesCount || 0) > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alerts */}
      {statistics.passRates.rate10 < 50 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              <div>
                <p className="font-medium">Attention</p>
                <p className="text-sm">
                  Le taux de réussite est inférieur à 50%. Il pourrait être nécessaire de revoir les méthodes d'évaluation ou d'accompagnement.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}