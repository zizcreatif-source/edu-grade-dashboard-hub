import { useState, useMemo } from 'react';
import { Plus, Users, User, Edit, Trash2, GitBranch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/hooks/use-toast';

interface Group {
  id: string;
  name: string;
  description?: string;
  studentIds: string[];
  leaderId?: string;
  classe: string;
  etablissementId?: string;
  coursId?: string;
  parentGroupId?: string; // Pour les sous-groupes
  type: 'main' | 'subgroup';
}

interface GroupManagerProps {
  onClose: () => void;
}

export function GroupManager({ onClose }: GroupManagerProps) {
  const { etudiants, etablissements, cours } = useData();
  const { toast } = useToast();
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedClasse, setSelectedClasse] = useState<string>('all');
  const [selectedEtablissement, setSelectedEtablissement] = useState<string>('all');
  const [selectedCours, setSelectedCours] = useState<string>('all');
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showCreateSubGroup, setShowCreateSubGroup] = useState(false);
  const [parentGroupForSubGroup, setParentGroupForSubGroup] = useState<Group | null>(null);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [groupLeader, setGroupLeader] = useState<string>('');
  const [newGroupEtablissement, setNewGroupEtablissement] = useState<string>('');
  const [newGroupCours, setNewGroupCours] = useState<string>('');

  const classes = useMemo(() => {
    const allClasses = [...new Set(etudiants.map(e => e.classe))];
    return allClasses.sort();
  }, [etudiants]);

  const filteredStudents = useMemo(() => {
    return etudiants.filter(etudiant => {
      const classeMatch = selectedClasse === 'all' || etudiant.classe === selectedClasse;
      const etablissementMatch = selectedEtablissement === 'all' || etudiant.etablissementId === selectedEtablissement;
      return classeMatch && etablissementMatch;
    });
  }, [etudiants, selectedClasse, selectedEtablissement]);

  const availableStudentsForGroup = useMemo(() => {
    if (showCreateSubGroup && parentGroupForSubGroup) {
      // Pour un sous-groupe, seuls les étudiants du groupe parent sont disponibles
      return filteredStudents.filter(etudiant => 
        parentGroupForSubGroup.studentIds.includes(etudiant.id)
      );
    }
    return filteredStudents;
  }, [filteredStudents, showCreateSubGroup, parentGroupForSubGroup]);

  const getInitials = (nom: string, prenom: string) => {
    return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
  };

  const getStudentById = (id: string) => {
    return etudiants.find(e => e.id === id);
  };

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) {
      toast({
        title: "Nom requis",
        description: "Veuillez saisir un nom pour le groupe",
        variant: "destructive",
      });
      return;
    }

    if (selectedStudents.length === 0) {
      toast({
        title: "Étudiants requis",
        description: "Veuillez sélectionner au moins un étudiant",
        variant: "destructive",
      });
      return;
    }

    // Vérifier la classe pour les groupes principaux
    if (!showCreateSubGroup && selectedClasse === 'all') {
      toast({
        title: "Classe requise",
        description: "Veuillez sélectionner une classe pour le groupe",
        variant: "destructive",
      });
      return;
    }

    const newGroup: Group = {
      id: Date.now().toString(),
      name: newGroupName,
      description: newGroupDescription,
      studentIds: selectedStudents,
      leaderId: groupLeader || undefined,
      classe: showCreateSubGroup ? parentGroupForSubGroup!.classe : selectedClasse,
      etablissementId: newGroupEtablissement || undefined,
      coursId: newGroupCours || undefined,
      parentGroupId: showCreateSubGroup ? parentGroupForSubGroup!.id : undefined,
      type: showCreateSubGroup ? 'subgroup' : 'main'
    };

    setGroups([...groups, newGroup]);
    
    // Reset form
    setNewGroupName('');
    setNewGroupDescription('');
    setSelectedStudents([]);
    setGroupLeader('');
    setNewGroupEtablissement('');
    setNewGroupCours('');
    setShowCreateGroup(false);
    setShowCreateSubGroup(false);
    setParentGroupForSubGroup(null);

    toast({
      title: showCreateSubGroup ? "Sous-groupe créé" : "Groupe créé",
      description: `Le ${showCreateSubGroup ? 'sous-groupe' : 'groupe'} "${newGroupName}" a été créé avec succès.`,
    });
  };

  const handleDeleteGroup = (groupId: string) => {
    setGroups(groups.filter(g => g.id !== groupId));
    toast({
      title: "Groupe supprimé",
      description: "Le groupe a été supprimé avec succès.",
    });
  };

  const handleStudentSelection = (studentId: string, checked: boolean) => {
    if (checked) {
      setSelectedStudents([...selectedStudents, studentId]);
    } else {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
      // Remove from leader if was selected
      if (groupLeader === studentId) {
        setGroupLeader('');
      }
    }
  };

  const handleCreateSubGroup = (parentGroup: Group) => {
    setParentGroupForSubGroup(parentGroup);
    setShowCreateSubGroup(true);
    setShowCreateGroup(true);
  };

  const filteredGroups = useMemo(() => {
    return groups.filter(group => {
      const classeMatch = selectedClasse === 'all' || group.classe === selectedClasse;
      const etablissementMatch = selectedEtablissement === 'all' || group.etablissementId === selectedEtablissement;
      const coursMatch = selectedCours === 'all' || group.coursId === selectedCours;
      return classeMatch && etablissementMatch && coursMatch;
    });
  }, [groups, selectedClasse, selectedEtablissement, selectedCours]);

  const getEtablissementName = (etablissementId?: string) => {
    if (!etablissementId) return '';
    const etablissement = etablissements.find(e => e.id === etablissementId);
    return etablissement?.nom || '';
  };

  const getCoursName = (coursId?: string) => {
    if (!coursId) return '';
    const coursItem = cours.find(c => c.id === coursId);
    return coursItem?.nom || '';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Gestion des Groupes</h3>
          <p className="text-sm text-muted-foreground">
            Créez et gérez les groupes de travail par classe
          </p>
        </div>
        <Dialog open={showCreateGroup} onOpenChange={setShowCreateGroup}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau groupe
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {showCreateSubGroup 
                  ? `Créer un sous-groupe de "${parentGroupForSubGroup?.name}"` 
                  : "Créer un nouveau groupe"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Nom du groupe *</label>
                  <Input
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder={showCreateSubGroup ? "Ex: Sous-groupe 1" : "Ex: Groupe A"}
                  />
                </div>
                {!showCreateSubGroup && (
                  <div>
                    <label className="text-sm font-medium">Classe *</label>
                    <Select value={selectedClasse} onValueChange={setSelectedClasse}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une classe" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((classe) => (
                          <SelectItem key={classe} value={classe}>
                            {classe}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {showCreateSubGroup && (
                  <div>
                    <label className="text-sm font-medium">Classe (héritée)</label>
                    <Input 
                      value={parentGroupForSubGroup?.classe || ''} 
                      disabled 
                      className="bg-muted"
                    />
                  </div>
                )}
              </div>

              {!showCreateSubGroup && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">Établissement (optionnel)</label>
                    <Select value={newGroupEtablissement} onValueChange={setNewGroupEtablissement}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un établissement" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Aucun établissement</SelectItem>
                        {etablissements.map((etablissement) => (
                          <SelectItem key={etablissement.id} value={etablissement.id}>
                            {etablissement.nom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Cours (optionnel)</label>
                    <Select value={newGroupCours} onValueChange={setNewGroupCours}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un cours" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Aucun cours</SelectItem>
                        {cours.filter(c => selectedClasse === 'all' || c.classe === selectedClasse).map((coursItem) => (
                          <SelectItem key={coursItem.id} value={coursItem.id}>
                            {coursItem.nom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium">Description (optionnel)</label>
                <Input
                  value={newGroupDescription}
                  onChange={(e) => setNewGroupDescription(e.target.value)}
                  placeholder={showCreateSubGroup ? "Description du sous-groupe" : "Description du groupe"}
                />
              </div>

              {(selectedClasse !== 'all' || showCreateSubGroup) && (
                <div>
                  <label className="text-sm font-medium mb-3 block">
                    {showCreateSubGroup 
                      ? `Sélectionner les étudiants du groupe parent (${selectedStudents.length} sélectionnés)` 
                      : `Sélectionner les étudiants (${selectedStudents.length} sélectionnés)`}
                  </label>
                  <div className="border rounded-lg max-h-48 overflow-y-auto">
                    {availableStudentsForGroup.map((etudiant) => (
                      <div key={etudiant.id} className="flex items-center space-x-3 p-3 border-b last:border-b-0">
                        <Checkbox
                          checked={selectedStudents.includes(etudiant.id)}
                          onCheckedChange={(checked) => 
                            handleStudentSelection(etudiant.id, checked as boolean)
                          }
                        />
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={etudiant.avatar} />
                          <AvatarFallback className="text-xs">
                            {getInitials(etudiant.nom, etudiant.prenom)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {etudiant.prenom} {etudiant.nom}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {etudiant.numero}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedStudents.length > 0 && (
                <div>
                  <label className="text-sm font-medium">Responsable du groupe (optionnel)</label>
                  <Select value={groupLeader} onValueChange={setGroupLeader}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un responsable" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Aucun responsable</SelectItem>
                      {selectedStudents.map((studentId) => {
                        const student = getStudentById(studentId);
                        return student ? (
                          <SelectItem key={studentId} value={studentId}>
                            {student.prenom} {student.nom}
                          </SelectItem>
                        ) : null;
                      })}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => {
                  setShowCreateGroup(false);
                  setShowCreateSubGroup(false);
                  setParentGroupForSubGroup(null);
                  setNewGroupName('');
                  setNewGroupDescription('');
                  setSelectedStudents([]);
                  setGroupLeader('');
                  setNewGroupEtablissement('');
                  setNewGroupCours('');
                }}>
                  Annuler
                </Button>
                <Button onClick={handleCreateGroup}>
                  {showCreateSubGroup ? "Créer le sous-groupe" : "Créer le groupe"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Filtrer par classe:</label>
          <Select value={selectedClasse} onValueChange={setSelectedClasse}>
            <SelectTrigger>
              <SelectValue />
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
        
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Filtrer par établissement:</label>
          <Select value={selectedEtablissement} onValueChange={setSelectedEtablissement}>
            <SelectTrigger>
              <SelectValue />
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
        
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Filtrer par cours:</label>
          <Select value={selectedCours} onValueChange={setSelectedCours}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les cours</SelectItem>
              {cours.map((coursItem) => (
                <SelectItem key={coursItem.id} value={coursItem.id}>
                  {coursItem.nom}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Groups List */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredGroups.length > 0 ? (
          filteredGroups.map((group) => {
            const leader = group.leaderId ? getStudentById(group.leaderId) : null;
            
            return (
              <Card key={group.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{group.name}</CardTitle>
                        {group.type === 'subgroup' && (
                          <Badge variant="outline" className="text-xs">
                            <GitBranch className="h-3 w-3 mr-1" />
                            Sous-groupe
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{group.classe}</p>
                      {group.etablissementId && (
                        <p className="text-xs text-muted-foreground">
                          Établissement: {getEtablissementName(group.etablissementId)}
                        </p>
                      )}
                      {group.coursId && (
                        <p className="text-xs text-muted-foreground">
                          Cours: {getCoursName(group.coursId)}
                        </p>
                      )}
                      {group.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {group.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {group.type === 'main' && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleCreateSubGroup(group)}
                          title="Créer un sous-groupe"
                        >
                          <GitBranch className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-destructive"
                        onClick={() => handleDeleteGroup(group.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Badge variant="outline">
                      <Users className="h-3 w-3 mr-1" />
                      {group.studentIds.length} membres
                    </Badge>
                    {leader && (
                      <Badge variant="secondary">
                        <User className="h-3 w-3 mr-1" />
                        Resp: {leader.prenom} {leader.nom}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Membres:</p>
                    <div className="flex flex-wrap gap-2">
                      {group.studentIds.slice(0, 6).map((studentId) => {
                        const student = getStudentById(studentId);
                        return student ? (
                          <div key={studentId} className="flex items-center gap-1">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={student.avatar} />
                              <AvatarFallback className="text-xs">
                                {getInitials(student.nom, student.prenom)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs">
                              {student.prenom} {student.nom}
                            </span>
                          </div>
                        ) : null;
                      })}
                      {group.studentIds.length > 6 && (
                        <span className="text-xs text-muted-foreground">
                          +{group.studentIds.length - 6} autres
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="col-span-2">
            <Card>
              <CardContent className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Aucun groupe trouvé</h3>
                <p className="text-muted-foreground mb-4">
                  {selectedClasse !== 'all' 
                    ? 'Aucun groupe dans cette classe.'
                    : 'Commencez par créer votre premier groupe.'}
                </p>
                <Button onClick={() => setShowCreateGroup(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Créer un groupe
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}