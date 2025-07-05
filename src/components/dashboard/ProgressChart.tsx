import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { useData } from "@/contexts/DataContext";

export function ProgressChart() {
  const { cours } = useData();

  const getProgressColor = (progression: number) => {
    if (progression >= 75) return "text-success";
    if (progression >= 50) return "text-warning";
    return "text-primary";
  };

  const getProgressBadge = (progression: number) => {
    if (progression >= 75) {
      return (
        <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          En bonne voie
        </Badge>
      );
    }
    if (progression >= 50) {
      return (
        <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Attention
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
        Début
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Progression des cours
        </CardTitle>
        <CardDescription>
          Avancement des programmes par matière
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {cours.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Aucun cours disponible</p>
          </div>
        ) : (
          cours.map((cours) => (
            <div key={cours.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: cours.couleur }}
                    />
                    <h4 className="font-medium">{cours.nom}</h4>
                    {getProgressBadge(cours.progression)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {cours.classe} • {cours.quantumHoraire}h/semaine
                  </p>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-semibold ${getProgressColor(cours.progression)}`}>
                    {cours.progression}%
                  </div>
                  {cours.progression >= 75 && (
                    <div className="text-xs text-warning flex items-center gap-1 mt-1">
                      <AlertTriangle className="h-3 w-3" />
                      Alerte 75%
                    </div>
                  )}
                </div>
              </div>
              <Progress 
                value={cours.progression} 
                className="h-2"
                style={{
                  background: `linear-gradient(to right, ${cours.couleur}33 0%, ${cours.couleur}33 ${cours.progression}%, hsl(var(--muted)) ${cours.progression}%, hsl(var(--muted)) 100%)`
                }}
              />
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}