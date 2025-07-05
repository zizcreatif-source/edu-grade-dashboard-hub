import { useState } from 'react';
import { ChevronLeft, ChevronRight, X, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface UserGuideProps {
  isOpen: boolean;
  onClose: () => void;
  steps?: GuideStep[];
}

interface GuideStep {
  title: string;
  content: string;
  target?: string;
  image?: string;
  action?: () => void;
}

const defaultSteps: GuideStep[] = [
  {
    title: "Bienvenue dans EduGrade !",
    content: "EduGrade est votre assistant de gestion des notes pour l'enseignement supérieur. Ce guide vous aidera à démarrer rapidement.",
    image: "/placeholder.svg"
  },
  {
    title: "Configuration de votre université",
    content: "Commencez par configurer votre université ou institut dans les paramètres. Définissez le système de notation et les coefficients par défaut.",
    target: "[data-guide='settings']",
    action: () => console.log("Navigate to settings")
  },
  {
    title: "Créer vos cours",
    content: "Ajoutez vos cours avec leurs informations (code, crédits, semestre). Vous pourrez ensuite y ajouter des évaluations.",
    target: "[data-guide='courses']"
  },
  {
    title: "Importer vos étudiants",
    content: "Importez facilement votre liste d'étudiants depuis un fichier Excel ou ajoutez-les manuellement.",
    target: "[data-guide='students']"
  },
  {
    title: "Créer des évaluations",
    content: "Pour chaque cours, créez des évaluations (contrôles, examens, TP) avec leurs coefficients respectifs.",
    target: "[data-guide='evaluations']"
  },
  {
    title: "Saisir les notes",
    content: "Saisissez les notes dans la grille intuitive. Les moyennes se calculent automatiquement selon vos coefficients.",
    target: "[data-guide='grades']"
  },
  {
    title: "Exporter vos données",
    content: "Exportez les notes vers Excel, générez des statistiques ou des feuilles de présence selon vos besoins.",
    target: "[data-guide='export']"
  },
  {
    title: "Mode hors-ligne",
    content: "Travaillez même sans connexion ! Vos modifications se synchroniseront automatiquement dès que vous serez reconnecté.",
    target: "[data-guide='sync']"
  },
  {
    title: "Prêt à commencer !",
    content: "Vous avez maintenant toutes les clés en main pour utiliser EduGrade efficacement. N'hésitez pas à consulter l'aide intégrée si besoin.",
    image: "/placeholder.svg"
  }
];

export function UserGuide({ isOpen, onClose, steps = defaultSteps }: UserGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  if (!isOpen) return null;

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      if (step.action) {
        step.action();
      }
    } else {
      onClose();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipGuide = () => {
    localStorage.setItem('edugrade-guide-completed', 'true');
    onClose();
  };

  // Overlay pour mettre en évidence l'élément ciblé
  const highlightTarget = step.target ? document.querySelector(step.target) : null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      {/* Spotlight effect pour l'élément ciblé */}
      {highlightTarget && (
        <div 
          className="absolute border-2 border-primary rounded-lg shadow-lg transition-all duration-300"
          style={{
            top: highlightTarget.getBoundingClientRect().top - 4,
            left: highlightTarget.getBoundingClientRect().left - 4,
            width: highlightTarget.getBoundingClientRect().width + 8,
            height: highlightTarget.getBoundingClientRect().height + 8,
            zIndex: 51
          }}
        />
      )}

      {/* Guide modal */}
      <div className="absolute top-4 right-4 w-96 max-w-[calc(100vw-2rem)]">
        <Card className="shadow-2xl border-2">
          <CardContent className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {currentStep + 1}/{steps.length}
                </Badge>
                {isPlaying && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Play className="h-3 w-3" />
                    Auto
                  </div>
                )}
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Progress */}
            <Progress value={progress} className="mb-4" />

            {/* Content */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">{step.title}</h3>
              
              {step.image && (
                <div className="bg-muted rounded-lg p-4 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full mx-auto flex items-center justify-center mb-2">
                    <div className="w-8 h-8 bg-primary/20 rounded-full"></div>
                  </div>
                  <p className="text-xs text-muted-foreground">Illustration</p>
                </div>
              )}

              <p className="text-sm text-muted-foreground leading-relaxed">
                {step.content}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between mt-6">
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Précédent
                </Button>
                <Button variant="ghost" size="sm" onClick={skipGuide}>
                  Passer
                </Button>
              </div>

              <div className="flex gap-2">
                <Button
                  variant={isPlaying ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  <Play className="h-4 w-4" />
                </Button>
                <Button onClick={nextStep}>
                  {currentStep === steps.length - 1 ? 'Terminer' : 'Suivant'}
                  {currentStep < steps.length - 1 && (
                    <ChevronRight className="h-4 w-4 ml-1" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Hook pour gérer l'état du guide
export function useUserGuide() {
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [hasSeenGuide, setHasSeenGuide] = useState(
    localStorage.getItem('edugrade-guide-completed') === 'true'
  );

  const startGuide = () => {
    setIsGuideOpen(true);
  };

  const closeGuide = () => {
    setIsGuideOpen(false);
    setHasSeenGuide(true);
    localStorage.setItem('edugrade-guide-completed', 'true');
  };

  const resetGuide = () => {
    localStorage.removeItem('edugrade-guide-completed');
    setHasSeenGuide(false);
  };

  return {
    isGuideOpen,
    hasSeenGuide,
    startGuide,
    closeGuide,
    resetGuide
  };
}