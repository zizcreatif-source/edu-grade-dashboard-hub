import { useState } from 'react';
import { Download, CheckCircle, AlertTriangle, History, RefreshCw, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

interface Version {
  version: string;
  type: 'latest' | 'stable' | 'legacy';
  date: string;
  size: string;
  changelog: string[];
  critical: boolean;
}

export function VersionManager() {
  const { toast } = useToast();
  const [currentVersion] = useState('2.1.3');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateProgress, setUpdateProgress] = useState(0);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);

  const versions: Version[] = [
    {
      version: '2.2.0',
      type: 'latest',
      date: new Date().toISOString().split('T')[0],
      size: '12.3 MB',
      changelog: [
        'Nouveau système d\'export Excel avancé',
        'Interface de notation tactile améliorée',
        'Calculs statistiques optimisés',
        'Correction bugs mineurs d\'affichage'
      ],
      critical: false
    },
    {
      version: '2.1.3',
      type: 'stable',
      date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      size: '11.8 MB',
      changelog: [
        'Version actuelle stable',
        'Toutes les fonctionnalités testées',
        'Performance optimisée'
      ],
      critical: false
    }
  ];

  const handleUpdate = async (version: Version) => {
    setIsUpdating(true);
    setUpdateProgress(0);

    // Simulate update process
    const steps = [
      'Sauvegarde des données...',
      'Téléchargement de la mise à jour...',
      'Vérification de la compatibilité...',
      'Installation en cours...',
      'Finalisation...'
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUpdateProgress((i + 1) * 20);
      
      toast({
        title: "Mise à jour en cours",
        description: steps[i],
      });
    }

    setIsUpdating(false);
    setUpdateProgress(100);
    
    toast({
      title: "Mise à jour terminée",
      description: `EduGrade a été mis à jour vers la version ${version.version}`,
    });
  };

  const getVersionBadge = (type: Version['type']) => {
    switch (type) {
      case 'latest':
        return <Badge className="bg-primary text-primary-foreground">Dernière</Badge>;
      case 'stable':
        return <Badge className="bg-green-600 text-white">Stable</Badge>;
      case 'legacy':
        return <Badge variant="outline">Legacy</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Version */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Version Actuelle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">EduGrade v{currentVersion}</p>
              <p className="text-sm text-muted-foreground">Installée le {new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR')}</p>
            </div>
            <div className="text-right">
              <Badge className="bg-green-600 text-white mb-2">Stable</Badge>
              <p className="text-sm text-muted-foreground">Dernière vérification: {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Update Progress */}
      {isUpdating && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-medium">Mise à jour en cours...</p>
                <p className="text-sm">{updateProgress}%</p>
              </div>
              <Progress value={updateProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Versions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Versions Disponibles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {versions.map((version) => (
              <div key={version.version} className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium">Version {version.version}</h3>
                    {getVersionBadge(version.type)}
                    {version.critical && (
                      <Badge variant="destructive" className="text-xs">
                        <Shield className="h-3 w-3 mr-1" />
                        Critique
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{new Date(version.date).toLocaleDateString('fr-FR')}</span>
                    <span>{version.size}</span>
                    <span>{version.changelog.length} nouveautés</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setSelectedVersion(version)}>
                        <History className="h-4 w-4 mr-2" />
                        Détails
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Changelog - Version {version.version}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          {getVersionBadge(version.type)}
                          <span className="text-sm text-muted-foreground">
                            Publiée le {new Date(version.date).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                        
                        <div className="space-y-2">
                          <h4 className="font-medium">Nouveautés et corrections:</h4>
                          <ul className="space-y-1">
                            {version.changelog.map((item, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm">
                                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {version.critical && (
                          <Alert>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                              Cette version contient des corrections de sécurité critiques. 
                              La mise à jour est fortement recommandée.
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>

                  {version.version !== currentVersion && (
                    <Button 
                      size="sm"
                      onClick={() => handleUpdate(version)}
                      disabled={isUpdating}
                      variant={version.critical ? "default" : "outline"}
                    >
                      {isUpdating ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4 mr-2" />
                      )}
                      {version.version > currentVersion ? 'Mettre à jour' : 'Rétrograder'}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Update Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Paramètres de Mise à Jour</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Mises à jour automatiques</p>
              <p className="text-sm text-muted-foreground">
                Télécharger et installer les mises à jour de sécurité automatiquement
              </p>
            </div>
            <Button variant="outline" size="sm">Activé</Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Notifications de mise à jour</p>
              <p className="text-sm text-muted-foreground">
                Recevoir une notification quand une nouvelle version est disponible
              </p>
            </div>
            <Button variant="outline" size="sm">Activé</Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Sauvegarde avant mise à jour</p>
              <p className="text-sm text-muted-foreground">
                Créer automatiquement une sauvegarde avant chaque mise à jour
              </p>
            </div>
            <Button variant="outline" size="sm">Activé</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}