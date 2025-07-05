import { useState } from 'react';
import { HelpCircle, Search, Book, Video, FileText, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const helpCategories = [
  {
    id: 'getting-started',
    title: 'Premiers pas',
    icon: Book,
    articles: [
      {
        title: 'Configuration initiale',
        description: 'Comment configurer votre université et vos paramètres',
        content: 'Guide pour configurer votre établissement...',
        tags: ['débutant', 'configuration']
      },
      {
        title: 'Créer votre premier cours',
        description: 'Étapes pour ajouter un cours et ses évaluations',
        content: 'Processus de création d\'un cours...',
        tags: ['cours', 'débutant']
      },
      {
        title: 'Importer des étudiants',
        description: 'Comment importer une liste d\'étudiants depuis Excel',
        content: 'Guide d\'importation des étudiants...',
        tags: ['étudiants', 'excel', 'import']
      }
    ]
  },
  {
    id: 'grades',
    title: 'Gestion des notes',
    icon: FileText,
    articles: [
      {
        title: 'Saisie des notes',
        description: 'Comment saisir et modifier les notes efficacement',
        content: 'Guide de saisie des notes...',
        tags: ['notes', 'saisie']
      },
      {
        title: 'Calculs et moyennes',
        description: 'Comprendre les calculs de moyennes et coefficients',
        content: 'Explication des calculs...',
        tags: ['calculs', 'moyennes']
      },
      {
        title: 'Export et impression',
        description: 'Exporter les notes vers Excel ou PDF',
        content: 'Guide d\'export...',
        tags: ['export', 'pdf', 'excel']
      }
    ]
  },
  {
    id: 'troubleshooting',
    title: 'Résolution de problèmes',
    icon: MessageCircle,
    articles: [
      {
        title: 'Problèmes de synchronisation',
        description: 'Que faire si la synchronisation ne fonctionne pas',
        content: 'Guide de dépannage sync...',
        tags: ['sync', 'problème']
      },
      {
        title: 'Récupération de données',
        description: 'Comment récupérer des données perdues',
        content: 'Guide de récupération...',
        tags: ['données', 'récupération']
      }
    ]
  }
];

const faqs = [
  {
    question: "Comment modifier le système de notation ?",
    answer: "Allez dans Paramètres > Branding, éditez votre université et modifiez les notes min/max."
  },
  {
    question: "Les notes se synchronisent-elles automatiquement ?",
    answer: "Oui, les modifications sont automatiquement synchronisées quand vous êtes en ligne."
  },
  {
    question: "Comment gérer les étudiants absents ?",
    answer: "Lors de la saisie des notes, cochez la case 'Absent' pour l'étudiant concerné."
  },
  {
    question: "Peut-on importer des données depuis d'autres logiciels ?",
    answer: "Oui, vous pouvez importer des étudiants via Excel. D'autres formats seront supportés prochainement."
  }
];

interface HelpSystemProps {
  trigger?: React.ReactNode;
}

export function HelpSystem({ trigger }: HelpSystemProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<any>(null);

  const filteredContent = helpCategories.map(category => ({
    ...category,
    articles: category.articles.filter(article =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  })).filter(category => category.articles.length > 0);

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon" title="Aide">
            <HelpCircle className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Centre d'aide EduGrade
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Barre de recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher dans l'aide..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Tabs defaultValue="guides" className="h-[500px]">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="guides">Guides</TabsTrigger>
              <TabsTrigger value="faq">FAQ</TabsTrigger>
              <TabsTrigger value="videos">Vidéos</TabsTrigger>
            </TabsList>

            <TabsContent value="guides" className="space-y-4 overflow-y-auto h-[450px]">
              {filteredContent.map((category) => (
                <div key={category.id}>
                  <div className="flex items-center gap-2 mb-3">
                    <category.icon className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">{category.title}</h3>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    {category.articles.map((article, index) => (
                      <Card key={index} className="cursor-pointer hover:bg-accent/50 transition-colors"
                            onClick={() => setSelectedArticle(article)}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">{article.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-2">
                            {article.description}
                          </p>
                          <div className="flex gap-1 flex-wrap">
                            {article.tags.map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="faq" className="space-y-4 overflow-y-auto h-[450px]">
              {filteredFaqs.map((faq, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-sm">{faq.question}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="videos" className="space-y-4 overflow-y-auto h-[450px]">
              <div className="text-center py-12">
                <Video className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">Vidéos de formation</h3>
                <p className="text-muted-foreground mb-4">
                  Les tutoriels vidéo seront bientôt disponibles pour vous aider à maîtriser EduGrade.
                </p>
                <Button variant="outline">Être notifié</Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Modal d'article détaillé */}
        {selectedArticle && (
          <Dialog open={!!selectedArticle} onOpenChange={() => setSelectedArticle(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{selectedArticle.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-muted-foreground">{selectedArticle.description}</p>
                <div className="prose prose-sm max-w-none">
                  <p>{selectedArticle.content}</p>
                </div>
                <div className="flex gap-1 flex-wrap">
                  {selectedArticle.tags.map((tag: string) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
}