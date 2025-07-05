import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle2, Clock, Calendar, TrendingUp } from "lucide-react";
import { useData } from "@/contexts/DataContext";

export function AlertsPanel() {
  const { cours, evaluations } = useData();

  // Alertes pour les cours à 75% de progression
  const progressAlerts = cours.filter(c => c.progression >= 75);

  // Évaluations prochaines (simulation)
  const upcomingEvaluations = evaluations.filter(evaluation => {
    const evalDate = new Date(evaluation.date);
    const today = new Date();
    const diffTime = evalDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 7;
  });

  const alerts = [
    ...progressAlerts.map(cours => ({
      id: `progress-${cours.id}`,
      type: 'warning' as const,
      icon: AlertTriangle,
      title: 'Progression avancée',
      message: `Le cours "${cours.nom}" a atteint ${cours.progression}% de progression`,
      action: 'Voir le cours',
      badge: 'Progression'
    })),
    ...upcomingEvaluations.map(evaluation => ({
      id: `eval-${evaluation.id}`,
      type: 'info' as const,  
      icon: Calendar,
      title: 'Évaluation prochaine',
      message: `"${evaluation.nom}" prévue le ${new Date(evaluation.date).toLocaleDateString('fr-FR')}`,
      action: 'Préparer',
      badge: 'Évaluation'
    }))
  ];

  // Notifications simulées
  const notifications = [
    {
      id: 'notif-1',
      type: 'success' as const,
      icon: CheckCircle2,
      title: 'Notes saisies',
      message: '15 nouvelles notes ont été ajoutées aujourd\'hui',
      badge: 'Terminé',
      time: 'Il y a 2h'
    },
    {
      id: 'notif-2', 
      type: 'info' as const,
      icon: TrendingUp,
      title: 'Statistiques',
      message: 'La moyenne générale a augmenté de 0.8 points ce mois-ci',
      badge: 'Analyse',
      time: 'Il y a 1 jour'
    }
  ];

  const allItems = [...alerts, ...notifications];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Alertes & Notifications
              {allItems.length > 0 && (
                <Badge variant="destructive" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  {allItems.length}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Informations importantes et rappels
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {allItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Aucune alerte en cours</p>
            <p className="text-sm">Tout semble fonctionner correctement</p>
          </div>
        ) : (
          <div className="space-y-3">
            {allItems.map((item) => {
              const Icon = item.icon;
              const alertVariant = item.type === 'warning' ? 'destructive' : 'default';
              
              return (
                <Alert key={item.id} variant={alertVariant} className="border-l-4">
                  <Icon className="h-4 w-4" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-sm">{item.title}</h4>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            item.type === 'warning' ? 'border-warning text-warning' :
                            item.type === 'success' ? 'border-success text-success' :
                            'border-info text-info'
                          }`}
                        >
                          {item.badge}
                        </Badge>
                        {'time' in item && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {item.time}
                          </span>
                        )}
                      </div>
                    </div>
                    <AlertDescription className="text-sm">
                      {item.message}
                    </AlertDescription>
                    {'action' in item && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2 h-7 text-xs"
                      >
                        {item.action}
                      </Button>
                    )}
                  </div>
                </Alert>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}