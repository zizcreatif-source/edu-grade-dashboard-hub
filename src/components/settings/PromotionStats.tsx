import { useState } from 'react';
import { TrendingUp, Users, Award, BarChart3, Calendar, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/contexts/DataContext';

export function PromotionStats() {
  const { cours, etudiants, notes } = useData();
  
  // Calculer les statistiques par promotion/classe
  const getPromotionStats = () => {
    const promotions = new Map();
    
    etudiants.forEach(etudiant => {
      const key = `${etudiant.classe} - ${etudiant.anneeScolaire}`;
      if (!promotions.has(key)) {
        promotions.set(key, {
          classe: etudiant.classe,
          anneeScolaire: etudiant.anneeScolaire,
          etudiants: [],
          cours: new Set(),
          moyenneGenerale: 0,
          taux_reussite: 0
        });
      }
      promotions.get(key).etudiants.push(etudiant);
    });
    
    // Ajouter les cours et calculer les moyennes
    promotions.forEach((promotion, key) => {
      const coursPromotion = cours.filter(c => c.classe === promotion.classe);
      coursPromotion.forEach(c => promotion.cours.add(c.nom));
      
      // Calculer la moyenne générale
      const notesPromotion = notes.filter(note => 
        promotion.etudiants.some(e => e.id === note.etudiantId)
      );
      
      if (notesPromotion.length > 0) {
        const moyenne = notesPromotion.reduce((sum, note) => sum + note.note, 0) / notesPromotion.length;
        promotion.moyenneGenerale = Math.round(moyenne * 100) / 100;
        promotion.taux_reussite = Math.round((notesPromotion.filter(n => n.note >= 10).length / notesPromotion.length) * 100);
      }
    });
    
    return Array.from(promotions.values());
  };

  const promotionStats = getPromotionStats();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Statistiques par Promotion</h3>
        <p className="text-sm text-muted-foreground">Vue d'ensemble des performances par classe et année scolaire</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {promotionStats.map((promotion, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  {promotion.classe}
                </CardTitle>
                <Badge variant="outline">
                  {promotion.anneeScolaire}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Étudiants</span>
                  </div>
                  <p className="text-2xl font-bold">{promotion.etudiants.length}</p>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Cours</span>
                  </div>
                  <p className="text-2xl font-bold">{promotion.cours.size}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Moyenne générale</span>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="font-semibold">{promotion.moyenneGenerale}/20</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Taux de réussite</span>
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-blue-500" />
                    <span className="font-semibold">{promotion.taux_reussite}%</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t">
                <div className="flex flex-wrap gap-1">
                  {Array.from(promotion.cours).slice(0, 3).map((coursNom, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {String(coursNom)}
                    </Badge>
                  ))}
                  {promotion.cours.size > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{promotion.cours.size - 3}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {promotionStats.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucune donnée disponible</h3>
              <p className="text-sm text-muted-foreground text-center">
                Ajoutez des étudiants et des cours pour voir les statistiques par promotion.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {promotionStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Résumé global
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">
                  {promotionStats.reduce((sum, p) => sum + p.etudiants.length, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total étudiants</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-500">
                  {promotionStats.length}
                </p>
                <p className="text-sm text-muted-foreground">Promotions</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-500">
                  {Math.round((promotionStats.reduce((avg, p) => avg + p.moyenneGenerale, 0) / promotionStats.length || 0) * 100) / 100}/20
                </p>
                <p className="text-sm text-muted-foreground">Moyenne globale</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-500">
                  {Math.round(promotionStats.reduce((avg, p) => avg + p.taux_reussite, 0) / promotionStats.length) || 0}%
                </p>
                <p className="text-sm text-muted-foreground">Réussite moyenne</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}