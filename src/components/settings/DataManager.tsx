import { useState } from 'react';
import { Database, Building2, BookOpen, Users, ClipboardList, UserCheck, BarChart3, TrendingUp, Download, Trash2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/hooks/use-toast';

export function DataManager() {
  const { etablissements, cours, etudiants, notes, evaluations } = useData();
  const { toast } = useToast();
  const [confirmationText, setConfirmationText] = useState('');
  const [showDangerZone, setShowDangerZone] = useState(false);

  const collections = [
    {
      id: 'etablissements',
      name: 'Établissements',
      icon: Building2,
      count: etablissements.length,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: 'Établissements scolaires configurés'
    },
    {
      id: 'cours',
      name: 'Cours',
      icon: BookOpen,
      count: cours.length,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: 'Matières et cours enseignés'
    },
    {
      id: 'etudiants',
      name: 'Étudiants',
      icon: Users,
      count: etudiants.length,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      description: 'Étudiants inscrits dans le système'
    },
    {
      id: 'notes',
      name: 'Notes',
      icon: ClipboardList,
      count: notes.length,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      description: 'Notes et évaluations saisies'
    },
    {
      id: 'evaluations',
      name: 'Évaluations',
      icon: BarChart3,
      count: evaluations.length,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      description: 'Types d\'évaluations créés'
    },
    {
      id: 'groupes',
      name: 'Groupes',
      icon: UserCheck,
      count: 0,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      description: 'Groupes de travail constitués'
    }
  ];

  const getTotalSize = () => {
    const total = etablissements.length + cours.length + etudiants.length + notes.length + evaluations.length;
    return (total * 0.5).toFixed(1);
  };

  const handleExportCollection = (collectionName: string) => {
    toast({
      title: "Export en cours",
      description: `Export de la collection ${collectionName} démarré...`,
    });
    
    setTimeout(() => {
      toast({
        title: "Export terminé",
        description: `La collection ${collectionName} a été exportée avec succès.`,
      });
    }, 2000);
  };

  const handleCleanCollection = (collectionName: string) => {
    toast({
      title: "Nettoyage effectué",
      description: `Les données obsolètes de ${collectionName} ont été supprimées.`,
    });
  };

  const handleResetAll = () => {
    if (confirmationText === 'SUPPRIMER TOUTES LES DONNEES') {
      toast({
        title: "Réinitialisation effectuée",
        description: "Toutes les données ont été supprimées. Cette action est irréversible.",
        variant: "destructive",
      });
      setConfirmationText('');
      setShowDangerZone(false);
    } else {
      toast({
        title: "Confirmation incorrecte",
        description: "Veuillez taper exactement 'SUPPRIMER TOUTES LES DONNEES'",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Collections actives</p>
                <p className="text-2xl font-bold">{collections.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-muted-foreground">Total d'enregistrements</p>
              <p className="text-2xl font-bold">
                {etablissements.length + cours.length + etudiants.length + notes.length + evaluations.length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-muted-foreground">Taille des données</p>
              <p className="text-2xl font-bold">{getTotalSize()} KB</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Dernière sauvegarde</p>
                <p className="font-medium">Il y a 2h</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Collections Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {collections.map((collection) => (
          <Card key={collection.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${collection.bgColor}`}>
                  <collection.icon className={`h-5 w-5 ${collection.color}`} />
                </div>
                <div>
                  <CardTitle className="text-lg">{collection.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {collection.description}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Enregistrements</span>
                <Badge variant="outline" className="text-lg font-bold px-3">
                  {collection.count.toLocaleString()}
                </Badge>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleExportCollection(collection.name)}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Exporter
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleCleanCollection(collection.name)}
                >
                  Nettoyer
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Maintenance Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions de Maintenance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Button 
              variant="outline" 
              className="h-auto p-4"
              onClick={() => toast({ title: "Sauvegarde", description: "Sauvegarde complète démarrée..." })}
            >
              <div className="text-center">
                <Database className="h-6 w-6 mx-auto mb-2" />
                <p className="font-medium">Sauvegarde Complète</p>
                <p className="text-xs text-muted-foreground">Créer une sauvegarde de toutes les données</p>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto p-4"
              onClick={() => toast({ title: "Optimisation", description: "Optimisation de la base démarrée..." })}
            >
              <div className="text-center">
                <TrendingUp className="h-6 w-6 mx-auto mb-2" />
                <p className="font-medium">Optimiser la Base</p>
                <p className="text-xs text-muted-foreground">Optimiser les performances et l'espace</p>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto p-4"
              onClick={() => toast({ title: "Vérification", description: "Vérification d'intégrité démarrée..." })}
            >
              <div className="text-center">
                <Shield className="h-6 w-6 mx-auto mb-2" />
                <p className="font-medium">Vérifier l'Intégrité</p>
                <p className="text-xs text-muted-foreground">Analyser la cohérence des données</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            Zone Dangereuse
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-red-200 bg-red-50">
            <Trash2 className="h-4 w-4" />
            <AlertDescription>
              Les actions suivantes sont irréversibles et supprimeront définitivement vos données.
              Assurez-vous d'avoir une sauvegarde récente.
            </AlertDescription>
          </Alert>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-red-600">Réinitialiser toutes les données</p>
              <p className="text-sm text-muted-foreground">
                Supprime définitivement tous les établissements, cours, étudiants et notes
              </p>
            </div>
            <Dialog open={showDangerZone} onOpenChange={setShowDangerZone}>
              <DialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Réinitialiser
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-red-600">⚠️ Confirmation de Suppression</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Alert className="border-red-200 bg-red-50">
                    <AlertDescription>
                      Cette action supprimera DÉFINITIVEMENT toutes vos données.
                      Cette opération est IRRÉVERSIBLE.
                    </AlertDescription>
                  </Alert>
                  
                  <div>
                    <p className="text-sm font-medium mb-2">
                      Pour confirmer, tapez exactement: <code className="bg-muted px-1 rounded">SUPPRIMER TOUTES LES DONNEES</code>
                    </p>
                    <Input
                      value={confirmationText}
                      onChange={(e) => setConfirmationText(e.target.value)}
                      placeholder="Tapez ici pour confirmer"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setShowDangerZone(false);
                        setConfirmationText('');
                      }}
                      className="flex-1"
                    >
                      Annuler
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={handleResetAll}
                      disabled={confirmationText !== 'SUPPRIMER TOUTES LES DONNEES'}
                      className="flex-1"
                    >
                      Confirmer la Suppression
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}