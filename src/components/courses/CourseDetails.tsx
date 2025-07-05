import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SeanceManager } from './SeanceManager';
import { QuickGrading } from './QuickGrading';
import { 
  Clock, 
  Users, 
  BookOpen, 
  Calendar, 
  Award,
  TrendingUp,
  User
} from 'lucide-react';

interface CourseDetailsProps {
  coursId: string;
  onClose: () => void;
}

export function CourseDetails({ coursId }: CourseDetailsProps) {
  const { cours, etablissements, etudiants, notes, evaluations, seances } = useData();
  
  const currentCours = cours.find(c => c.id === coursId);
  const etablissement = etablissements.find(e => e.id === currentCours?.etablissementId);
  const coursEtudiants = etudiants.filter(e => e.classe === currentCours?.classe);
  const coursNotes = notes.filter(n => n.coursId === coursId);
  const coursEvaluations = evaluations.filter(e => e.coursId === coursId);
  const coursSeances = seances.filter(s => s.coursId === coursId);

  if (!currentCours) {
    return <div>Cours non trouvé</div>;
  }

  const heuresEffectuees = coursSeances.reduce((acc, s) => acc + s.duree, 0);
  const moyenneGenerale = coursNotes.length > 0 
    ? coursNotes.reduce((acc, note) => acc + note.note, 0) / coursNotes.length 
    : 0;

  const getInitials = (nom: string, prenom: string) => {
    return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
  };

  const getEtudiantNotes = (etudiantId: string) => {
    return coursNotes.filter(n => n.etudiantId === etudiantId);
  };

  const getEtudiantMoyenne = (etudiantId: string) => {
    const etudiantNotes = getEtudiantNotes(etudiantId);
    if (etudiantNotes.length === 0) return 0;
    
    const totalPoints = etudiantNotes.reduce((acc, note) => acc + (note.note * note.coefficient), 0);
    const totalCoeff = etudiantNotes.reduce((acc, note) => acc + note.coefficient, 0);
    
    return totalCoeff > 0 ? totalPoints / totalCoeff : 0;
  };

  return (
      <Tabs defaultValue="overview" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
        <TabsTrigger value="seances">Séances de cours</TabsTrigger>
        <TabsTrigger value="evaluations">Évaluations</TabsTrigger>
        <TabsTrigger value="notes">Noter les étudiants</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        {/* Course Overview */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: currentCours.couleur }}
                />
                {currentCours.nom}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Établissement</p>
                  <p className="font-medium">{etablissement?.nom}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Classe</p>
                  <p className="font-medium">{currentCours.classe}</p>
                </div>
              </div>
              
              {currentCours.description && (
                <div>
                  <p className="text-muted-foreground text-sm">Description</p>
                  <p className="text-sm">{currentCours.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Progression
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Avancement</span>
                  <span>{currentCours.progression}%</span>
                </div>
                <Progress value={currentCours.progression} className="h-3" />
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    Total
                  </div>
                  <div className="font-bold text-lg">{currentCours.quantumHoraire}h</div>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                    <Award className="h-4 w-4" />
                    Effectuées
                  </div>
                  <div className="font-bold text-lg">{heuresEffectuees}h</div>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Restantes
                  </div>
                  <div className="font-bold text-lg">{currentCours.quantumHoraire - heuresEffectuees}h</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistics */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Étudiants</p>
                  <p className="text-2xl font-bold">{coursEtudiants.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Évaluations</p>
                  <p className="text-2xl font-bold">{coursEvaluations.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Notes saisies</p>
                  <p className="text-2xl font-bold">{coursNotes.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Moyenne</p>
                  <p className="text-2xl font-bold">{moyenneGenerale.toFixed(1)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Students List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Étudiants inscrits ({coursEtudiants.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {coursEtudiants.length > 0 ? (
              <div className="space-y-3">
                {coursEtudiants.map((etudiant) => {
                  const moyenne = getEtudiantMoyenne(etudiant.id);
                  const nbNotes = getEtudiantNotes(etudiant.id).length;
                  
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
                      <div className="text-right">
                        <p className="font-medium">
                          {moyenne > 0 ? moyenne.toFixed(1) : '-'}/20
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {nbNotes} note{nbNotes !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Aucun étudiant inscrit dans cette classe</p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="seances">
        <SeanceManager coursId={coursId} />
      </TabsContent>

      <TabsContent value="evaluations" className="space-y-6">
        {coursEvaluations.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Toutes les évaluations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {coursEvaluations.map((evaluation) => (
                  <div key={evaluation.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="font-medium">{evaluation.nom}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(evaluation.date).toLocaleDateString('fr-FR')}
                      </p>
                      {evaluation.description && (
                        <p className="text-sm text-muted-foreground mt-1">{evaluation.description}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="capitalize">
                        {evaluation.type}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1">
                        Coeff. {evaluation.coefficient}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucune évaluation</h3>
              <p className="text-muted-foreground">
                Aucune évaluation n'a encore été créée pour ce cours.
              </p>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="notes" className="space-y-6">
        <QuickGrading coursId={coursId} students={coursEtudiants} />
      </TabsContent>
    </Tabs>
  );
}