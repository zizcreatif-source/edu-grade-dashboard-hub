import { useState } from 'react';
import { FileDown, School, Calendar, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useData, Etudiant, Evaluation, Cours } from '@/contexts/DataContext';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';

interface GradePdfExporterProps {
  coursId: string;
  evaluationId: string;
  students: Etudiant[];
}

export function GradePdfExporter({ coursId, evaluationId, students }: GradePdfExporterProps) {
  const { notes, evaluations, cours, etablissements } = useData();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const evaluation = evaluations.find(e => e.id === evaluationId);
  const course = cours.find(c => c.id === coursId);
  const etablissement = etablissements[0]; // Premier établissement

  const generatePDF = async () => {
    if (!evaluation || !course) return;

    setIsGenerating(true);
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.width;
      const pageHeight = pdf.internal.pageSize.height;
      const margin = 20;
      let yPosition = margin;

      // Header avec logo
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      
      // Si il y a un logo d'établissement et qu'il n'est pas l'avatar par défaut
      if (etablissement?.logo && !etablissement.logo.includes('ui-avatars.com')) {
        try {
          // Charger l'image et la convertir en base64
          const response = await fetch(etablissement.logo);
          const blob = await response.blob();
          const reader = new FileReader();
          
          await new Promise((resolve) => {
            reader.onload = () => {
              try {
                const base64Data = reader.result as string;
                pdf.addImage(base64Data, 'JPEG', margin, yPosition, 30, 30);
                yPosition += 35;
              } catch (error) {
                console.log('Erreur lors de l\'ajout du logo au PDF:', error);
              }
              resolve(null);
            };
            reader.readAsDataURL(blob);
          });
        } catch (error) {
          console.log('Logo non chargé, continuons sans');
        }
      }

      // Titre principal
      pdf.text(etablissement?.nom || 'Établissement', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;
      
      pdf.setFontSize(16);
      pdf.text(`Relevé de notes - ${course.nom}`, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 8;
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Évaluation: ${evaluation.nom} (${evaluation.type})`, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 6;
      pdf.text(`Classe: ${course.classe} - Date: ${new Date(evaluation.date).toLocaleDateString('fr-FR')}`, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 20;

      // Tableau des notes
      const tableHeaders = ['N°', 'Nom', 'Prénom', 'Note /20', 'Appréciation'];
      const headerHeight = 8;
      const rowHeight = 10;
      const colWidths = [20, 50, 50, 25, 50];
      
      // En-têtes du tableau
      pdf.setFillColor(240, 240, 240);
      pdf.rect(margin, yPosition, pageWidth - 2 * margin, headerHeight, 'F');
      
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      
      let xPosition = margin + 2;
      tableHeaders.forEach((header, index) => {
        pdf.text(header, xPosition, yPosition + 5);
        xPosition += colWidths[index];
      });
      
      yPosition += headerHeight;

      // Données des étudiants
      pdf.setFont('helvetica', 'normal');
      
      const studentGrades = students.map(student => {
        const note = notes.find(n => 
          n.etudiantId === student.id && 
          n.coursId === coursId && 
          n.evaluation === evaluation.nom
        );
        return { student, note: note?.note || null };
      }).sort((a, b) => a.student.nom.localeCompare(b.student.nom));

      studentGrades.forEach((item, index) => {
        const { student, note } = item;
        
        // Nouvelle page si nécessaire
        if (yPosition > pageHeight - 40) {
          pdf.addPage();
          yPosition = margin;
        }

        // Alternance de couleur de fond
        if (index % 2 === 0) {
          pdf.setFillColor(248, 249, 250);
          pdf.rect(margin, yPosition, pageWidth - 2 * margin, rowHeight, 'F');
        }

        xPosition = margin + 2;
        
        // Numéro
        pdf.text(student.numero, xPosition, yPosition + 6);
        xPosition += colWidths[0];
        
        // Nom
        pdf.text(student.nom, xPosition, yPosition + 6);
        xPosition += colWidths[1];
        
        // Prénom
        pdf.text(student.prenom, xPosition, yPosition + 6);
        xPosition += colWidths[2];
        
        // Note
        const noteText = note !== null ? note.toString() : '-';
        pdf.text(noteText, xPosition, yPosition + 6);
        xPosition += colWidths[3];
        
        // Appréciation et commentaire
        let appreciation = '-';
        const noteRecord = notes.find(n => 
          n.etudiantId === student.id && 
          n.coursId === coursId && 
          n.evaluation === evaluation.nom
        );
        
        if (note !== null) {
          if (note >= 16) appreciation = 'Excellent';
          else if (note >= 14) appreciation = 'Bien';
          else if (note >= 12) appreciation = 'Assez bien';
          else if (note >= 10) appreciation = 'Passable';
          else appreciation = 'Insuffisant';
          
          // Ajouter le commentaire si présent
          if (noteRecord?.commentaire) {
            appreciation += ` - ${noteRecord.commentaire}`;
          }
        }
        
        // Utiliser une taille de police plus petite pour les commentaires longs
        const maxLength = 30;
        if (appreciation.length > maxLength) {
          pdf.setFontSize(8);
        }
        pdf.text(appreciation.substring(0, 60), xPosition, yPosition + 6);
        pdf.setFontSize(10); // Reset font size
        
        yPosition += rowHeight;
      });

      // Statistiques
      const validNotes = studentGrades.filter(item => item.note !== null).map(item => item.note!);
      if (validNotes.length > 0) {
        yPosition += 10;
        
        pdf.setFont('helvetica', 'bold');
        pdf.text('Statistiques de la classe:', margin, yPosition);
        yPosition += 8;
        
        pdf.setFont('helvetica', 'normal');
        
        const average = validNotes.reduce((sum, note) => sum + note, 0) / validNotes.length;
        const min = Math.min(...validNotes);
        const max = Math.max(...validNotes);
        const passCount = validNotes.filter(note => note >= 10).length;
        const passRate = (passCount / validNotes.length) * 100;
        
        pdf.text(`Moyenne de classe: ${average.toFixed(2)}/20`, margin, yPosition);
        yPosition += 6;
        pdf.text(`Note minimale: ${min}/20`, margin, yPosition);
        yPosition += 6;
        pdf.text(`Note maximale: ${max}/20`, margin, yPosition);
        yPosition += 6;
        pdf.text(`Taux de réussite: ${passRate.toFixed(1)}% (${passCount}/${validNotes.length} étudiants)`, margin, yPosition);
      }

      // Pied de page
      pdf.setFontSize(8);
      pdf.setTextColor(128, 128, 128);
      pdf.text(`Document généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, 
        pageWidth / 2, pageHeight - 10, { align: 'center' });

      // Sauvegarde
      const fileName = `notes_${course.nom}_${evaluation.nom}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

      toast({
        title: "PDF généré avec succès",
        description: `Le relevé de notes a été téléchargé: ${fileName}`,
      });

    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer le PDF.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (!evaluation || !course) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Sélectionnez un cours et une évaluation pour exporter</p>
        </CardContent>
      </Card>
    );
  }

  const studentNotes = students.map(student => {
    const note = notes.find(n => 
      n.etudiantId === student.id && 
      n.coursId === coursId && 
      n.evaluation === evaluation.nom
    );
    return { student, note: note?.note || null };
  });

  const gradedCount = studentNotes.filter(item => item.note !== null).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileDown className="h-5 w-5 mr-2" />
          Export PDF
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Aperçu de l'export */}
        <div className="p-4 bg-muted rounded-lg space-y-3">
          <div className="flex items-center space-x-2">
            <School className="h-4 w-4 text-primary" />
            <span className="font-medium">{etablissement?.nom || 'Mon Établissement'}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-primary" />
            <span>{course.nom} - {evaluation.nom}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-primary" />
            <span>{gradedCount}/{students.length} étudiants notés</span>
          </div>
        </div>

        {/* Aperçu des données */}
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {studentNotes.slice(0, 5).map((item, index) => (
            <div key={item.student.id} className="flex items-center justify-between p-2 border rounded">
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={item.student.avatar} />
                  <AvatarFallback className="text-xs">
                    {item.student.prenom.charAt(0)}{item.student.nom.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">
                    {item.student.prenom} {item.student.nom}
                  </p>
                  <p className="text-xs text-muted-foreground">N° {item.student.numero}</p>
                </div>
              </div>
              <div>
                {item.note !== null ? (
                  <Badge variant="outline">{item.note}/20</Badge>
                ) : (
                  <Badge variant="secondary">Non noté</Badge>
                )}
              </div>
            </div>
          ))}
          
          {studentNotes.length > 5 && (
            <p className="text-sm text-muted-foreground text-center py-2">
              ... et {studentNotes.length - 5} autres étudiants
            </p>
          )}
        </div>

        <Button 
          onClick={generatePDF}
          disabled={isGenerating || gradedCount === 0}
          className="w-full"
          size="lg"
        >
          <FileDown className="h-4 w-4 mr-2" />
          {isGenerating ? 'Génération du PDF...' : 'Télécharger le relevé PDF'}
        </Button>

        {gradedCount === 0 && (
          <p className="text-sm text-muted-foreground text-center">
            Aucune note saisie pour cette évaluation
          </p>
        )}
      </CardContent>
    </Card>
  );
}