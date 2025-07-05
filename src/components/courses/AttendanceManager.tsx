import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Users, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useData, Presence } from '@/contexts/DataContext';
import { useToast } from '@/hooks/use-toast';

interface AttendanceManagerProps {
  seanceId: string;
  coursId: string;
}

export function AttendanceManager({ seanceId, coursId }: AttendanceManagerProps) {
  const { etudiants, cours, presences, addPresence, updatePresence } = useData();
  const { toast } = useToast();
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [comment, setComment] = useState('');

  // Get students for this course
  const currentCours = cours.find(c => c.id === coursId);
  const courseStudents = etudiants.filter(e => e.classe === currentCours?.classe);
  
  // Get existing attendance for this session
  const sessionAttendance = presences.filter(p => p.seanceId === seanceId);

  const getStudentAttendance = (etudiantId: string): Presence | undefined => {
    return sessionAttendance.find(p => p.etudiantId === etudiantId);
  };

  const handleAttendanceChange = (etudiantId: string, statut: 'present' | 'absent' | 'retard') => {
    const existingAttendance = getStudentAttendance(etudiantId);
    
    if (existingAttendance) {
      updatePresence(existingAttendance.id, { statut });
    } else {
      addPresence({
        seanceId,
        etudiantId,
        statut,
      });
    }

    toast({
      title: "Présence mise à jour",
      description: `Statut modifié : ${statut}`,
    });
  };

  const handleAddComment = (etudiantId: string, commentaire: string) => {
    const existingAttendance = getStudentAttendance(etudiantId);
    
    if (existingAttendance) {
      updatePresence(existingAttendance.id, { commentaire });
    } else {
      addPresence({
        seanceId,
        etudiantId,
        statut: 'absent', // Par défaut si pas encore défini
        commentaire,
      });
    }

    setComment('');
    setSelectedStudent('');
    toast({
      title: "Commentaire ajouté",
      description: "Le commentaire a été enregistré avec succès.",
    });
  };

  const getInitials = (nom: string, prenom: string) => {
    return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
  };

  const getStatusBadge = (statut: 'present' | 'absent' | 'retard') => {
    switch (statut) {
      case 'present':
        return <Badge className="bg-green-100 text-green-800">Présent</Badge>;
      case 'absent':
        return <Badge className="bg-red-100 text-red-800">Absent</Badge>;
      case 'retard':
        return <Badge className="bg-orange-100 text-orange-800">Retard</Badge>;
      default:
        return <Badge variant="outline">Non défini</Badge>;
    }
  };

  const getStatusIcon = (statut?: 'present' | 'absent' | 'retard') => {
    switch (statut) {
      case 'present':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'absent':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'retard':
        return <Clock className="h-5 w-5 text-orange-600" />;
      default:
        return <Users className="h-5 w-5 text-gray-400" />;
    }
  };

  // Statistiques de présence
  const totalStudents = courseStudents.length;
  const presentCount = sessionAttendance.filter(p => p.statut === 'present').length;
  const absentCount = sessionAttendance.filter(p => p.statut === 'absent').length;
  const lateCount = sessionAttendance.filter(p => p.statut === 'retard').length;
  const undefinedCount = totalStudents - sessionAttendance.length;

  return (
    <div className="space-y-6">
      {/* Header with Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Présents</p>
                <p className="text-2xl font-bold text-green-600">{presentCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">Absents</p>
                <p className="text-2xl font-bold text-red-600">{absentCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Retards</p>
                <p className="text-2xl font-bold text-orange-600">{lateCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{totalStudents}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => {
            courseStudents.forEach(student => {
              if (!getStudentAttendance(student.id)) {
                handleAttendanceChange(student.id, 'present');
              }
            });
          }}
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Marquer tous présents
        </Button>
      </div>

      {/* Students List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Liste de présence ({courseStudents.length} étudiants)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {courseStudents.map((etudiant) => {
              const attendance = getStudentAttendance(etudiant.id);
              
              return (
                <div key={etudiant.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={etudiant.avatar} />
                      <AvatarFallback>
                        {getInitials(etudiant.nom, etudiant.prenom)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {etudiant.prenom} {etudiant.nom}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        N° {etudiant.numero}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(attendance?.statut)}
                      {attendance ? getStatusBadge(attendance.statut) : getStatusBadge('absent' as any)}
                    </div>
                    
                    <div className="flex gap-1">
                      <Button
                        variant={attendance?.statut === 'present' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleAttendanceChange(etudiant.id, 'present')}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={attendance?.statut === 'retard' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleAttendanceChange(etudiant.id, 'retard')}
                      >
                        <Clock className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={attendance?.statut === 'absent' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleAttendanceChange(etudiant.id, 'absent')}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedStudent(etudiant.id);
                              setComment(attendance?.commentaire || '');
                            }}
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>
                              Commentaire - {etudiant.prenom} {etudiant.nom}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Textarea
                              placeholder="Ajouter un commentaire sur l'assiduité..."
                              value={comment}
                              onChange={(e) => setComment(e.target.value)}
                              rows={4}
                            />
                            <div className="flex justify-end gap-3">
                              <Button variant="outline" onClick={() => setSelectedStudent('')}>
                                Annuler
                              </Button>
                              <Button onClick={() => handleAddComment(etudiant.id, comment)}>
                                Enregistrer
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                  
                  {attendance?.commentaire && (
                    <div className="w-full mt-2 p-2 bg-muted rounded text-sm">
                      <p className="text-muted-foreground">Commentaire :</p>
                      <p>{attendance.commentaire}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}