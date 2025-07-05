import { useState } from 'react';
import { Plus, Search, Filter, MoreHorizontal, Eye, Edit, Archive, Trash2, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useData } from '@/contexts/DataContext';
import { CourseForm } from '@/components/courses/CourseForm';
import { CourseDetails } from '@/components/courses/CourseDetails';

export default function Cours() {
  const { cours, etablissements } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEtablissement, setSelectedEtablissement] = useState<string>('all');
  const [selectedCours, setSelectedCours] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCours, setEditingCours] = useState<string | null>(null);

  const filteredCours = cours.filter(cours => {
    const matchesSearch = cours.nom.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEtablissement = selectedEtablissement === 'all' || cours.etablissementId === selectedEtablissement;
    return matchesSearch && matchesEtablissement;
  });

  const getStatusBadge = (progression: number) => {
    if (progression >= 90) return <Badge variant="default" className="bg-green-500">Terminé</Badge>;
    if (progression >= 75) return <Badge variant="secondary">Avancé</Badge>;
    if (progression >= 25) return <Badge variant="outline">En cours</Badge>;
    return <Badge variant="destructive">Débutant</Badge>;
  };

  const getEtablissementName = (etablissementId: string) => {
    const etablissement = etablissements.find(e => e.id === etablissementId);
    return etablissement?.nom || 'N/A';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des Cours</h1>
          <p className="text-muted-foreground">Gérez vos cours, quantum horaire et progressions</p>
        </div>
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingCours(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau cours
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingCours ? 'Modifier le cours' : 'Créer un nouveau cours'}
              </DialogTitle>
            </DialogHeader>
            <CourseForm 
              coursId={editingCours} 
              onClose={() => {
                setShowForm(false);
                setEditingCours(null);
              }} 
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un cours..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedEtablissement} onValueChange={setSelectedEtablissement}>
              <SelectTrigger className="w-full sm:w-64">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrer par établissement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les établissements</SelectItem>
                {etablissements.map((etablissement) => (
                  <SelectItem key={etablissement.id} value={etablissement.id}>
                    {etablissement.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Course List */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredCours.map((cours) => (
          <Card key={cours.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{cours.nom}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {getEtablissementName(cours.etablissementId)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Classe: {cours.classe}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setSelectedCours(cours.id)}>
                      <Eye className="h-4 w-4 mr-2" />
                      Voir détails
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => {
                        setEditingCours(cours.id);
                        setShowForm(true);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Modifier
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Archive className="h-4 w-4 mr-2" />
                      Archiver
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progression</span>
                  <span>{cours.progression}%</span>
                </div>
                <Progress value={cours.progression} className="h-2" />
                {getStatusBadge(cours.progression)}
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Quantum horaire</p>
                  <p className="font-medium">{cours.quantumHoraire}h</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Heures effectuées</p>
                  <p className="font-medium">
                    {Math.round((cours.quantumHoraire * cours.progression) / 100)}h
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCours.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucun cours trouvé</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || selectedEtablissement !== 'all' 
                ? 'Aucun cours ne correspond aux critères de recherche.'
                : 'Commencez par créer votre premier cours.'}
            </p>
            {!searchTerm && selectedEtablissement === 'all' && (
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Créer un cours
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Course Details Modal */}
      <Dialog open={!!selectedCours} onOpenChange={() => setSelectedCours(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails du cours</DialogTitle>
          </DialogHeader>
          {selectedCours && (
            <CourseDetails 
              coursId={selectedCours} 
              onClose={() => setSelectedCours(null)} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}