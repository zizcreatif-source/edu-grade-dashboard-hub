import { useEffect } from 'react';
import { UserGuide, useUserGuide } from '@/components/help/UserGuide';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, BookOpen } from 'lucide-react';

export function WelcomeGuide() {
  const { isGuideOpen, hasSeenGuide, startGuide, closeGuide } = useUserGuide();

  // Afficher automatiquement le guide pour les nouveaux utilisateurs
  useEffect(() => {
    if (!hasSeenGuide) {
      const timer = setTimeout(() => {
        startGuide();
      }, 2000); // Attendre 2 secondes après le chargement
      
      return () => clearTimeout(timer);
    }
  }, [hasSeenGuide, startGuide]);

  return (
    <>
      {/* Carte d'invitation au guide pour les utilisateurs existants */}
      {hasSeenGuide && (
        <Card className="border-dashed hover:border-solid transition-all duration-200 hover:shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="h-5 w-5 text-primary" />
              Besoin d'aide ?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Découvrez ou redécouvrez les fonctionnalités d'EduGrade avec notre guide interactif.
            </p>
            <Button onClick={startGuide} variant="outline" size="sm" className="gap-2">
              <Play className="h-4 w-4" />
              Lancer le guide
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Guide utilisateur */}
      <UserGuide 
        isOpen={isGuideOpen} 
        onClose={closeGuide}
      />
    </>
  );
}