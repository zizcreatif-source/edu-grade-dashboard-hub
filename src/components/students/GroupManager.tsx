import { useState, useMemo } from 'react';
import { Plus, Users, User, Edit, Trash2 } from 'lucide-react';
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
}

interface GroupManagerProps {
  onClose: () => void;
}

export function GroupManager({ onClose }: GroupManagerProps) {
  const { etudiants } = useData();
  const { toast } = useToast();
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedClasse, setSelectedClasse] = useState<string>('all');
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [groupLeader, setGroupLeader] = useState<string>('');

  const classes = useMemo(() => {
    const allClasses = [...new Set(etudiants.map(e => e.classe))];
    return allClasses.sort();
  }, [etudiants]);

  const filteredStudents = etudiants.filter(etudiant => 
    selectedClasse === 'all' || etudiant.classe === selectedClasse
  );

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

    const newGroup: Group = {
      id: Date.now().toString(),
      name: newGroupName,
      description: newGroupDescription,
      studentIds: selectedStudents,
      leaderId: groupLeader || undefined,
      classe: selectedClasse
    };

    setGroups([...groups, newGroup]);
    
    // Reset form
    setNewGroupName('');
    setNewGroupDescription('');
    setSelectedStudents([]);
    setGroupLeader('');
    setShowCreateGroup(false);

    toast({
      title: "Groupe créé",
      description: `Le groupe "${newGroupName}" a été créé avec succès.`,
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

  const filteredGroups = groups.filter(group => 
    selectedClasse === 'all' || group.classe === selectedClasse
  );

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
              <DialogTitle>Créer un nouveau groupe</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Nom du groupe *</label>
                  <Input
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="Ex: Groupe A"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Classe</label>
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
              </div>

              <div>
                <label className="text-sm font-medium">Description (optionnel)</label>
                <Input
                  value={newGroupDescription}
                  onChange={(e) => setNewGroupDescription(e.target.value)}
                  placeholder="Description du groupe"
                />
              </div>

              {selectedClasse !== 'all' && (
                <div>
                  <label className="text-sm font-medium mb-3 block">
                    Sélectionner les étudiants ({selectedStudents.length} sélectionnés)
                  </label>
                  <div className="border rounded-lg max-h-48 overflow-y-auto">
                    {filteredStudents.map((etudiant) => (
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
                <Button variant="outline" onClick={() => setShowCreateGroup(false)}>
                  Annuler
                </Button>
                <Button onClick={handleCreateGroup}>
                  Créer le groupe
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Class Filter */}
      <div className="flex gap-4 items-center">
        <label className="text-sm font-medium">Filtrer par classe:</label>
        <Select value={selectedClasse} onValueChange={setSelectedClasse}>
          <SelectTrigger className="w-48">
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
                      <CardTitle className="text-lg">{group.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{group.classe}</p>
                      {group.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {group.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1">
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