import { useMemo } from 'react';
import { History, User, Calendar, MessageSquare, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useData } from '@/contexts/DataContext';

interface GradeHistoryProps {
  coursId: string;
}

interface HistoryEntry {
  id: string;
  studentId: string;
  studentName: string;
  studentAvatar: string;
  evaluation: string;
  note: number;
  previousNote?: number;
  date: string;
  commentaire?: string;
  action: 'created' | 'updated';
}

export function GradeHistory({ coursId }: GradeHistoryProps) {
  const { notes, etudiants, cours } = useData();

  const selectedCourse = cours.find(c => c.id === coursId);
  const courseStudents = etudiants.filter(e => e.classe === selectedCourse?.classe);

  // Transform notes into history entries
  const historyEntries = useMemo(() => {
    const courseNotes = notes.filter(n => n.coursId === coursId);
    
    const entries: HistoryEntry[] = courseNotes.map(note => {
      const student = courseStudents.find(s => s.id === note.etudiantId);
      if (!student) return null;

      return {
        id: note.id,
        studentId: student.id,
        studentName: `${student.prenom} ${student.nom}`,
        studentAvatar: student.avatar || '',
        evaluation: note.evaluation,
        note: note.note,
        date: note.date,
        commentaire: note.commentaire,
        action: 'created' as const, // In a real app, you'd track this
      };
    }).filter(Boolean) as HistoryEntry[];

    // Sort by date (most recent first)
    return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [notes, coursId, courseStudents]);

  // Group entries by date
  const groupedEntries = useMemo(() => {
    const groups: { [date: string]: HistoryEntry[] } = {};
    
    historyEntries.forEach(entry => {
      if (!groups[entry.date]) {
        groups[entry.date] = [];
      }
      groups[entry.date].push(entry);
    });

    return Object.entries(groups).sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime());
  }, [historyEntries]);

  const getInitials = (nom: string, prenom: string) => {
    return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
  };

  const getGradeColor = (note: number) => {
    if (note >= 16) return 'text-green-600 bg-green-100';
    if (note >= 14) return 'text-blue-600 bg-blue-100';
    if (note >= 12) return 'text-yellow-600 bg-yellow-100';
    if (note >= 10) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (historyEntries.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Aucun historique disponible</h3>
          <p className="text-muted-foreground">
            L'historique des modifications apparaîtra ici une fois que vous aurez saisi des notes.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total modifications</p>
                <p className="text-2xl font-bold">{historyEntries.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-muted-foreground">Étudiants concernés</p>
              <p className="text-2xl font-bold">
                {new Set(historyEntries.map(e => e.studentId)).size}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-muted-foreground">Évaluations</p>
              <p className="text-2xl font-bold">
                {new Set(historyEntries.map(e => e.evaluation)).size}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-muted-foreground">Dernière modification</p>
              <p className="text-lg font-bold">
                {historyEntries.length > 0 
                  ? new Date(historyEntries[0].date).toLocaleDateString('fr-FR')
                  : '-'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* History Timeline */}
      <div className="space-y-6">
        {groupedEntries.map(([date, entries]) => (
          <Card key={date}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5" />
                {formatDate(date)}
                <Badge variant="outline">{entries.length} modification{entries.length > 1 ? 's' : ''}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {entries.map((entry) => (
                  <div key={entry.id} className="flex items-start gap-4 p-4 rounded-lg border bg-muted/20">
                    <Avatar>
                      <AvatarImage src={entry.studentAvatar} />
                      <AvatarFallback>
                        {getInitials(entry.studentName.split(' ')[1] || '', entry.studentName.split(' ')[0] || '')}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{entry.studentName}</p>
                          <p className="text-sm text-muted-foreground">{entry.evaluation}</p>
                        </div>
                        <div className="text-right">
                          <Badge className={`${getGradeColor(entry.note)} border-0`}>
                            {entry.note}/20
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {entry.note}/20
                          </p>
                        </div>
                      </div>

                      {entry.commentaire && (
                        <div className="flex items-start gap-2 p-3 bg-muted rounded-lg">
                          <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <p className="text-sm">{entry.commentaire}</p>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <User className="h-3 w-3" />
                          <span>
                            {entry.action === 'created' ? 'Note ajoutée' : 'Note modifiée'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {entry.previousNote && entry.previousNote !== entry.note && (
                            <>
                              {entry.note > entry.previousNote ? (
                                <TrendingUp className="h-3 w-3 text-green-600" />
                              ) : (
                                <TrendingDown className="h-3 w-3 text-red-600" />
                              )}
                              <span>
                                {entry.previousNote} → {entry.note}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}