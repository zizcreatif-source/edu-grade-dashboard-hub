import { useState, useMemo } from 'react';
import { Plus, Search, Filter, Download, Upload, Edit, Trash2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useData } from '@/contexts/DataContext';
import { StudentForm } from '@/components/students/StudentForm';
import { ImportExcel } from '@/components/students/ImportExcel';
import { GroupManager } from '@/components/students/GroupManager';

export default function Etudiants() {
  const { etudiants, etablissements } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEtablissement, setSelectedEtablissement] = useState<string>('all');
  const [selectedClasse, setSelectedClasse] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showGroups, setShowGroups] = useState(false);
  const [editingStudent, setEditingStudent] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  const classes = useMemo(() => {
    const allClasses = [...new Set(etudiants.map(e => e.classe))];
    return allClasses.sort();
  }, [etudiants]);

  const filteredEtudiants = etudiants.filter(etudiant => {
    const matchesSearch = 
      etudiant.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      etudiant.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      etudiant.numero.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEtablissement = selectedEtablissement === 'all' || etudiant.etablissementId === selectedEtablissement;
    const matchesClasse = selectedClasse === 'all' || etudiant.classe === selectedClasse;
    return matchesSearch && matchesEtablissement && matchesClasse;
  });

  const getEtablissementName = (etablissementId: string) => {
    const etablissement = etablissements.find(e => e.id === etablissementId);
    return etablissement?.nom || 'N/A';
  };

  const getInitials = (nom: string, prenom: string) => {
    return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
  };

  const exportStudents = () => {
    const csvContent = [
      ['Nom', 'Prénom', 'Numéro', 'Classe', 'Email', 'Établissement'].join(','),
      ...filteredEtudiants.map(etudiant => [
        etudiant.nom,
        etudiant.prenom,
        etudiant.numero,
        etudiant.classe,
        etudiant.email || '',
        getEtablissementName(etudiant.etablissementId)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'etudiants.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des Étudiants</h1>
          <p className="text-muted-foreground">Gérez vos étudiants, classes et groupes de travail</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showImport} onOpenChange={setShowImport}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Importer Excel
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Importer des étudiants depuis Excel</DialogTitle>
              </DialogHeader>
              <ImportExcel onClose={() => setShowImport(false)} />
            </DialogContent>
          </Dialog>

          <Button variant="outline" onClick={exportStudents}>
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>

          <Dialog open={showGroups} onOpenChange={setShowGroups}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Groupes
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Gestion des groupes</DialogTitle>
              </DialogHeader>
              <GroupManager onClose={() => setShowGroups(false)} />
            </DialogContent>
          </Dialog>

          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingStudent(null)}>
                <Plus className="h-4 w-4 mr-2" />
                Nouvel étudiant
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingStudent ? 'Modifier l\'étudiant' : 'Ajouter un nouvel étudiant'}
                </DialogTitle>
              </DialogHeader>
              <StudentForm 
                studentId={editingStudent} 
                onClose={() => {
                  setShowForm(false);
                  setEditingStudent(null);
                }} 
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un étudiant..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedEtablissement} onValueChange={setSelectedEtablissement}>
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue placeholder="Établissement" />
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
            <Select value={selectedClasse} onValueChange={setSelectedClasse}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Classe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les classes</SelectItem>
                {classes.map((classe) => (
                  <SelectItem key={classe} value={classe}>
                    {classe}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total étudiants</p>
                <p className="text-2xl font-bold">{filteredEtudiants.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-muted-foreground">Classes actives</p>
              <p className="text-2xl font-bold">{classes.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-muted-foreground">Établissements</p>
              <p className="text-2xl font-bold">{etablissements.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-muted-foreground">Avec email</p>
              <p className="text-2xl font-bold">
                {filteredEtudiants.filter(e => e.email).length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des étudiants ({filteredEtudiants.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredEtudiants.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Étudiant</TableHead>
                  <TableHead>Numéro</TableHead>
                  <TableHead>Classe</TableHead>
                  <TableHead>Établissement</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEtudiants.map((etudiant) => (
                  <TableRow key={etudiant.id}>
                    <TableCell>
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
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{etudiant.numero}</Badge>
                    </TableCell>
                    <TableCell>{etudiant.classe}</TableCell>
                    <TableCell>{getEtablissementName(etudiant.etablissementId)}</TableCell>
                    <TableCell>
                      {etudiant.email ? (
                        <a href={`mailto:${etudiant.email}`} className="text-primary hover:underline">
                          {etudiant.email}
                        </a>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setEditingStudent(etudiant.id);
                            setShowForm(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucun étudiant trouvé</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || selectedEtablissement !== 'all' || selectedClasse !== 'all'
                  ? 'Aucun étudiant ne correspond aux critères de recherche.'
                  : 'Commencez par ajouter vos premiers étudiants.'}
              </p>
              {!searchTerm && selectedEtablissement === 'all' && selectedClasse === 'all' && (
                <div className="flex gap-2 justify-center">
                  <Button onClick={() => setShowForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un étudiant
                  </Button>
                  <Button variant="outline" onClick={() => setShowImport(true)}>
                    <Upload className="h-4 w-4 mr-2" />
                    Importer Excel
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}