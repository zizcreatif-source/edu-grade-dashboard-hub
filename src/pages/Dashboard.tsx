import { StatsCard } from "@/components/dashboard/StatsCard";
import { ProgressChart } from "@/components/dashboard/ProgressChart";
import { CourseList } from "@/components/dashboard/CourseList";
import { AlertsPanel } from "@/components/dashboard/AlertsPanel";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { BookOpen, Users, ClipboardList, TrendingUp } from "lucide-react";
import { useData } from "@/contexts/DataContext";

export default function Dashboard() {
  const { cours, etudiants, notes } = useData();

  // Calculs des statistiques
  const coursActifs = cours.length;
  const totalEtudiants = etudiants.length;
  const notesSaisies = notes.length;
  const moyenneGenerale = notes.length > 0 
    ? (notes.reduce((sum, note) => sum + note.note, 0) / notes.length).toFixed(1)
    : "0";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Vue d'ensemble de votre activité pédagogique
        </p>
      </div>

      {/* Statistiques principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Cours actifs"
          value={coursActifs}
          description="Matières enseignées"
          icon={BookOpen}
          trend={{
            value: 12,
            label: "vs mois dernier",
            positive: true
          }}
        />
        <StatsCard
          title="Étudiants"
          value={totalEtudiants}
          description="Inscrits au total"
          icon={Users}
          trend={{
            value: 5,
            label: "nouvelles inscriptions",
            positive: true
          }}
        />
        <StatsCard
          title="Notes saisies"
          value={notesSaisies}
          description="Ce mois-ci"
          icon={ClipboardList}
          trend={{
            value: 23,
            label: "vs mois dernier",
            positive: true
          }}
        />
        <StatsCard
          title="Moyenne générale"
          value={`${moyenneGenerale}/20`}
          description="Toutes classes confondues"
          icon={TrendingUp}
          trend={{
            value: 2.3,
            label: "amélioration ce mois",
            positive: true
          }}
        />
      </div>

      {/* Section principale */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Colonne gauche */}
        <div className="lg:col-span-2 space-y-6">
          <ProgressChart />
          <CourseList />
        </div>

        {/* Colonne droite */}
        <div className="space-y-6">
          <AlertsPanel />
          <QuickActions />
        </div>
      </div>
    </div>
  );
}