import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export function QuickActions() {
  const navigate = useNavigate();
  
  const [customActions, setCustomActions] = useState<Array<{
    id: string;
    title: string;
    description: string;
    icon: any;
    color: string;
    onClick: () => void;
  }>>([]);

  const defaultActions = [
    {
      id: "nouvelle-note",
      title: "Nouvelle note",
      description: "Saisir rapidement une note",
      icon: Plus,
      color: "bg-primary hover:bg-primary/90",
      onClick: () => navigate("/notes")
    },
    {
      id: "ajouter-etudiant",
      title: "Ajouter étudiant", 
      description: "Inscrire un nouvel étudiant",
      icon: Users,
      color: "bg-accent hover:bg-accent/90",
      onClick: () => navigate("/etudiants")
    }
  ];

  const allActions = [...defaultActions, ...customActions];

  const addCustomAction = () => {
    const title = prompt("Titre de l'action :");
    const description = prompt("Description de l'action :");
    
    if (title && description) {
      const newAction = {
        id: `custom-${Date.now()}`,
        title,
        description,
        icon: Settings,
        color: "bg-muted hover:bg-muted/80 text-muted-foreground",
        onClick: () => console.log(`Action personnalisée : ${title}`)
      };
      
      setCustomActions(prev => [...prev, newAction]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actions rapides</CardTitle>
        <CardDescription>
          Accès direct aux fonctionnalités principales
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-3">
          {allActions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.id}
                variant="outline"
                className={`h-auto p-3 flex flex-col items-center gap-2 hover:shadow-md transition-all duration-200 ${action.color} border-0 text-white min-h-[80px] justify-center`}
                onClick={action.onClick}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <div className="text-center space-y-1 min-w-0 w-full">
                  <div className="font-medium text-xs sm:text-sm leading-tight truncate">
                    {action.title}
                  </div>
                  <div className="text-xs opacity-90 leading-tight line-clamp-2 hidden sm:block">
                    {action.description}
                  </div>
                </div>
              </Button>
            );
          })}
          
          {/* Add Action Button */}
          <Button
            variant="outline"
            className="h-auto p-3 flex flex-col items-center gap-2 hover:shadow-md transition-all duration-200 bg-border hover:bg-border/80 border-2 border-dashed min-h-[80px] justify-center"
            onClick={addCustomAction}
          >
            <Plus className="h-4 w-4 flex-shrink-0" />
            <div className="text-center space-y-1 min-w-0 w-full">
              <div className="font-medium text-xs sm:text-sm leading-tight">
                Ajouter une action
              </div>
              <div className="text-xs opacity-90 leading-tight hidden sm:block">
                Créer une nouvelle action rapide
              </div>
            </div>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}