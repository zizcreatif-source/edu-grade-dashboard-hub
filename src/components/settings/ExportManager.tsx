import { useState } from 'react';
import { Download, FileSpreadsheet, FileText, BarChart3, History, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/hooks/use-toast';

export function ExportManager() {
  const { cours, etudiants, notes, evaluations, etablissements, groupes } = useData();
  const { toast } = useToast();
  
  const [selectedEtablissement, setSelectedEtablissement] = useState('');
  const [selectedCours, setSelectedCours] = useState('');
  const [selectedAnneeScolaire, setSelectedAnneeScolaire] = useState('');
  const [exportType, setExportType] = useState<'ecole' | 'notes' | 'stats' | 'presence'>('ecole');
  const [selectedColumns, setSelectedColumns] = useState<string[]>(['nom', 'prenom', 'notes']);
  const [includeLogo, setIncludeLogo] = useState(true);

  const exportTypes = [
    { value: 'ecole', label: 'Export par école/université', icon: Building2 },
    { value: 'notes', label: 'Notes par évaluation', icon: FileSpreadsheet },
    { value: 'stats', label: 'Statistiques de promotion', icon: BarChart3 },
    { value: 'presence', label: 'Feuilles de présence', icon: FileText },
  ];

  const availableColumns = [
    { id: 'nom', label: 'Nom' },
    { id: 'prenom', label: 'Prénom' },
    { id: 'numero', label: 'Numéro étudiant' },
    { id: 'notes', label: 'Notes' },
    { id: 'moyennes', label: 'Moyennes' },
    { id: 'responsable', label: 'Responsable de classe' },
    { id: 'groupes', label: 'Groupes d\'appartenance' },
    { id: 'signature', label: 'Signature' },
  ];

  // Get unique school years
  const anneesScoolaires = [...new Set([
    ...cours.map(c => c.anneeScolaire),
    ...etudiants.map(e => e.anneeScolaire)
  ])].filter(Boolean).sort().reverse();

  const handleExport = () => {
    if (exportType === 'ecole' && !selectedEtablissement) {
      toast({
        title: "Sélection requise",
        description: "Veuillez sélectionner un établissement à exporter.",
        variant: "destructive",
      });
      return;
    }

    const etablissement = etablissements.find(e => e.id === selectedEtablissement);
    let csvContent = '';
    
    // Header with logo reference
    if (includeLogo && etablissement?.logo) {
      csvContent += `LOGO: ${etablissement.logo}\n`;
    }
    csvContent += `EXPORT COMPLET - ${etablissement?.nom || 'École'}\n`;
    csvContent += `Année scolaire: ${selectedAnneeScolaire === 'all' || !selectedAnneeScolaire ? 'Toutes' : selectedAnneeScolaire}\n`;
    csvContent += `Date d'export: ${new Date().toLocaleDateString('fr-FR')}\n\n`;

    // Export by classes with class managers
    const schoolStudents = etudiants.filter(e => {
      if (e.etablissementId !== selectedEtablissement) return false;
      if (selectedAnneeScolaire && selectedAnneeScolaire !== 'all' && e.anneeScolaire !== selectedAnneeScolaire) return false;
      return true;
    });

    const classeGroups = schoolStudents.reduce((acc, student) => {
      if (!acc[student.classe]) acc[student.classe] = [];
      acc[student.classe].push(student);
      return acc;
    }, {} as Record<string, any[]>);

    Object.entries(classeGroups).forEach(([classe, students]) => {
      const classCourse = cours.find(c => c.classe === classe && c.etablissementId === selectedEtablissement);
      
      csvContent += `\n=== CLASSE: ${classe} ===\n`;
      if (classCourse?.responsableClasse) {
        csvContent += `Responsable: ${classCourse.responsableClasse}\n`;
      }
      csvContent += `Nombre d'étudiants: ${students.length}\n\n`;

      const headers = selectedColumns.map(col => 
        availableColumns.find(ac => ac.id === col)?.label || col
      ).join(',');
      csvContent += headers + '\n';

      students.forEach(student => {
        const row = selectedColumns.map(col => {
          switch (col) {
            case 'nom': return student.nom;
            case 'prenom': return student.prenom;
            case 'numero': return student.numero;
            case 'notes': {
              const studentNotes = notes.filter(n => n.etudiantId === student.id);
              return studentNotes.map(n => {
                const noteStr = `${n.evaluation}: ${n.note}`;
                return n.commentaire ? `${noteStr} (${n.commentaire})` : noteStr;
              }).join('; ');
            }
            case 'moyennes': {
              const studentNotes = notes.filter(n => n.etudiantId === student.id);
              if (studentNotes.length === 0) return '0';
              const average = studentNotes.reduce((sum, n) => sum + n.note, 0) / studentNotes.length;
              return average.toFixed(1);
            }
            case 'responsable': return classCourse?.responsableClasse || '';
            case 'groupes': {
              const studentGroups = groupes.filter(g => g.etudiantIds.includes(student.id));
              return studentGroups.map(g => g.nom).join('; ');
            }
            case 'signature': return '';
            default: return '';
          }
        }).join(',');
        csvContent += row + '\n';
      });
    });

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `export_${etablissement?.nom.replace(/\s+/g, '_')}_${selectedAnneeScolaire || 'complet'}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export réussi",
      description: `Les données ont été exportées avec succès.`,
    });
    
    // Force re-render to show button again
    setTimeout(() => {
      setSelectedEtablissement(selectedEtablissement);
    }, 100);
  };

  const toggleColumn = (columnId: string) => {
    setSelectedColumns(prev => 
      prev.includes(columnId)
        ? prev.filter(id => id !== columnId)
        : [...prev, columnId]
    );
  };

  return (
    <Tabs value={exportType} onValueChange={(value: any) => setExportType(value)} className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        {exportTypes.map((type) => (
          <TabsTrigger key={type.value} value={type.value} className="flex items-center gap-2">
            <type.icon className="h-4 w-4" />
            {type.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="ecole">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Export par École/Université
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium mb-2 block">École/Université *</label>
                <Select value={selectedEtablissement} onValueChange={setSelectedEtablissement}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un établissement" />
                  </SelectTrigger>
                  <SelectContent>
                    {etablissements.map((etablissement) => (
                      <SelectItem key={etablissement.id} value={etablissement.id}>
                        <div className="flex items-center gap-2">
                          <div className="relative w-4 h-4 bg-primary/10 rounded flex items-center justify-center text-xs font-semibold overflow-hidden">
                            {etablissement.logo ? (
                              <img 
                                src={etablissement.logo} 
                                alt="" 
                                className="w-full h-full rounded object-contain"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const parent = target.parentElement;
                                  if (parent) {
                                    const fallback = parent.querySelector('.select-fallback') as HTMLElement;
                                    if (fallback) fallback.style.display = 'flex';
                                  }
                                }}
                              />
                            ) : null}
                            <div className={`select-fallback ${etablissement.logo ? 'hidden' : 'flex'} absolute inset-0 bg-primary rounded items-center justify-center text-primary-foreground`}>
                              {etablissement.nom.split(' ').map(word => word.charAt(0)).join('').slice(0, 2).toUpperCase()}
                            </div>
                          </div>
                          {etablissement.nom}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Année scolaire</label>
                <Select value={selectedAnneeScolaire} onValueChange={setSelectedAnneeScolaire}>
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes les années" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les années</SelectItem>
                    {anneesScoolaires.map((annee) => (
                      <SelectItem key={annee} value={annee}>
                        {annee}
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
                Inclure le logo de l'université/institut
              </label>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleExport} disabled={!selectedEtablissement}>
                <Download className="h-4 w-4 mr-2" />
                Exporter l'établissement complet
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Placeholder for other tabs */}
      <TabsContent value="notes">
        <Card>
          <CardContent className="p-8 text-center">
            <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Export par notes - En développement</p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="stats">
        <Card>
          <CardContent className="p-8 text-center">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Export statistiques - En développement</p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="presence">
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Export feuilles de présence - En développement</p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}