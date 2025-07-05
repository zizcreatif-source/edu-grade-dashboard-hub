import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, ClipboardList, Plus } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { useNavigate } from "react-router-dom";

export function CourseList() {
  const { cours, etudiants, notes } = useData();
  const navigate = useNavigate();

  const getStudentCount = (coursId: string) => {
    return etudiants.filter(etudiant => 
      cours.find(c => c.id === coursId)?.classe === etudiant.classe
    ).length;
  };

  const getNotesCount = (coursId: string) => {
    return notes.filter(note => note.coursId === coursId).length;
  };

  const recentCourses = cours.slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Cours récents</CardTitle>
            <CardDescription>
              Accès rapide à vos matières
            </CardDescription>
          </div>
          <Button
            size="sm"
            onClick={() => navigate("/cours")}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Nouveau
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentCourses.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Aucun cours disponible</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => navigate("/cours")}
            >
              Créer un cours
            </Button>
          </div>
        ) : (
          recentCourses.map((cours) => (
            <div
              key={cours.id}
              className="flex items-center justify-between p-4 rounded-lg border bg-gradient-to-r from-card to-card/50 hover:shadow-md transition-all duration-200 cursor-pointer"
              onClick={() => navigate(`/cours/${cours.id}`)}
            >
              <div className="flex items-center gap-4">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-medium text-sm"
                  style={{ backgroundColor: cours.couleur }}
                >
                  {cours.nom.substring(0, 2).toUpperCase()}
                </div>
                <div className="space-y-1">
                  <h4 className="font-medium">{cours.nom}</h4>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {getStudentCount(cours.id)} étudiants
                    </span>
                    <span className="flex items-center gap-1">
                      <ClipboardList className="h-3 w-3" />
                      {getNotesCount(cours.id)} notes
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-xs">
                  {cours.classe}
                </Badge>
                <div className="text-right">
                  <div className="text-sm font-medium">{cours.progression}%</div>
                  <div className="text-xs text-muted-foreground">progression</div>
                </div>
              </div>
            </div>
          ))
        )}
        
        {cours.length > 5 && (
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => navigate("/cours")}
          >
            Voir tous les cours ({cours.length})
          </Button>
        )}
      </CardContent>
    </Card>
  );
}