import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Upload, Download, FileText, Users, ClipboardList } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      title: "Nouvelle note",
      description: "Saisir rapidement une note",
      icon: Plus,
      color: "bg-primary hover:bg-primary/90",
      onClick: () => navigate("/notes")
    },
    {
      title: "Ajouter étudiant", 
      description: "Inscrire un nouvel étudiant",
      icon: Users,
      color: "bg-accent hover:bg-accent/90",
      onClick: () => navigate("/etudiants")
    },
    {
      title: "Créer cours",
      description: "Ajouter une nouvelle matière",
      icon: ClipboardList,
      color: "bg-success hover:bg-success/90",
      onClick: () => navigate("/cours")
    },
    {
      title: "Exporter données",
      description: "Télécharger un rapport",
      icon: Download,
      color: "bg-warning hover:bg-warning/90",
      onClick: () => console.log("Export données")
    },
    {
      title: "Import CSV",
      description: "Importer des données",
      icon: Upload,
      color: "bg-info hover:bg-info/90",
      onClick: () => console.log("Import CSV")
    },
    {
      title: "Générer bulletin",
      description: "Créer un bulletin de notes",
      icon: FileText,
      color: "bg-secondary hover:bg-secondary/80 text-secondary-foreground",
      onClick: () => console.log("Générer bulletin")
    }
  ];

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
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.title}
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
        </div>
      </CardContent>
    </Card>
  );
}