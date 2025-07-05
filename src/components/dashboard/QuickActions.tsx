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
      onClick: () => navigate("/notes/nouveau")
    },
    {
      title: "Ajouter étudiant",
      description: "Inscrire un nouvel étudiant",
      icon: Users,
      color: "bg-accent hover:bg-accent/90",
      onClick: () => navigate("/etudiants/nouveau")
    },
    {
      title: "Créer évaluation",
      description: "Planifier une évaluation",
      icon: ClipboardList,
      color: "bg-success hover:bg-success/90",
      onClick: () => navigate("/evaluations/nouveau")
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
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.title}
                variant="outline"
                className={`h-auto p-4 flex flex-col items-center gap-2 hover:shadow-md transition-all duration-200 ${action.color} border-0 text-white`}
                onClick={action.onClick}
              >
                <Icon className="h-5 w-5" />
                <div className="text-center">
                  <div className="font-medium text-sm">{action.title}</div>
                  <div className="text-xs opacity-90 mt-1">{action.description}</div>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}