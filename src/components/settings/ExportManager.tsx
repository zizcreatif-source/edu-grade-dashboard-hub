import { useState } from 'react';
import { Download, FileSpreadsheet, FileText, BarChart3, History, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/hooks/use-toast';

export function ExportManager() {
  const { cours, etudiants, notes, evaluations, etablissements } = useData();
  const { toast } = useToast();
  
  const [selectedCours, setSelectedCours] = useState('');
  const [exportType, setExportType] = useState<'notes' | 'bulletins' | 'stats'>('notes');
  const [selectedColumns, setSelectedColumns] = useState<string[]>(['nom', 'prenom', 'notes']);
  const [includeLogo, setIncludeLogo] = useState(true);

  const exportTypes = [
    { value: 'notes', label: 'Notes par évaluation', icon: FileSpreadsheet },
    { value: 'bulletins', label: 'Bulletins individuels', icon: FileText },
    { value: 'stats', label: 'Statistiques de classe', icon: BarChart3 },
  ];

  const availableColumns = [
    { id: 'nom', label: 'Nom' },
    { id: 'prenom', label: 'Prénom' },
    { id: 'numero', label: 'Numéro étudiant' },
    { id: 'notes', label: 'Notes' },
    { id: 'moyennes', label: 'Moyennes' },
    { id: 'commentaires', label: 'Commentaires' },
    { id: 'absences', label: 'Absences' },
  ];

  const handleExport = () => {
    if (!selectedCours) {
      toast({
        title: "Sélection requise",
        description: "Veuillez sélectionner un cours à exporter.",
        variant: "destructive",
      });
      return;
    }

    // Simulate export
    const course = cours.find(c => c.id === selectedCours);
    const courseNotes = notes.filter(n => n.coursId === selectedCours);
    
    let csvContent = '';
    
    if (exportType === 'notes') {
      // Export notes
      const headers = selectedColumns.map(col => 
        availableColumns.find(ac => ac.id === col)?.label || col
      ).join(',');
      
      csvContent = headers + '\n';
      
      const courseStudents = etudiants.filter(e => e.classe === course?.classe);
      courseStudents.forEach(student => {
        const row = selectedColumns.map(col => {
          switch (col) {
            case 'nom': return student.nom;
            case 'prenom': return student.prenom;
            case 'numero': return student.numero;
            case 'notes': {
              const studentNotes = courseNotes.filter(n => n.etudiantId === student.id);
              return studentNotes.map(n => `${n.evaluation}: ${n.note}`).join('; ');
            }
            case 'moyennes': {
              const studentNotes = courseNotes.filter(n => n.etudiantId === student.id);
              if (studentNotes.length === 0) return '0';
              const weighted = studentNotes.reduce((sum, n) => sum + (n.note * n.coefficient), 0);
              const totalCoeff = studentNotes.reduce((sum, n) => sum + n.coefficient, 0);
              return totalCoeff > 0 ? (weighted / totalCoeff).toFixed(1) : '0';
            }
            default: return '';
          }
        }).join(',');
        csvContent += row + '\n';
      });
    }

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `export_${course?.nom}_${exportType}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export réussi",
      description: `Les données ont été exportées avec succès.`,
    });
  };

  const toggleColumn = (columnId: string) => {
    setSelectedColumns(prev => 
      prev.includes(columnId)
        ? prev.filter(id => id !== columnId)
        : [...prev, columnId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Export Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Configuration d'Export
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium mb-2 block">Cours à exporter</label>
              <Select value={selectedCours} onValueChange={setSelectedCours}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un cours" />
                </SelectTrigger>
                <SelectContent>
                  {cours.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.nom} - {course.classe}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Type d'export</label>
              <Select value={exportType} onValueChange={(value: any) => setExportType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {exportTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <type.icon className="h-4 w-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-3 block">Colonnes à inclure</label>
            <div className="grid gap-2 md:grid-cols-3">
              {availableColumns.map((column) => (
                <div key={column.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={column.id}
                    checked={selectedColumns.includes(column.id)}
                    onCheckedChange={() => toggleColumn(column.id)}
                  />
                  <label htmlFor={column.id} className="text-sm">
                    {column.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="logo"
              checked={includeLogo}
              onCheckedChange={(checked) => setIncludeLogo(checked as boolean)}
            />
            <label htmlFor="logo" className="text-sm">
              Inclure le logo de l'établissement
            </label>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleExport} disabled={!selectedCours}>
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Export Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Exports ce mois</p>
                <p className="text-2xl font-bold">12</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Dernier export</p>
                <p className="font-medium">Il y a 2 jours</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-muted-foreground">Format préféré</p>
              <p className="font-medium">Excel (.xlsx)</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}