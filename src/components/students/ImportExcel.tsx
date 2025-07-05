import { useState, useCallback } from 'react';
import { Upload, FileSpreadsheet, Check, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/hooks/use-toast';

interface ImportExcelProps {
  onClose: () => void;
}

interface ParsedStudent {
  nom: string;
  prenom: string;
  numero: string;
  classe: string;
  email?: string;
  etablissementId?: string;
  valid: boolean;
  errors: string[];
}

export function ImportExcel({ onClose }: ImportExcelProps) {
  const { etablissements, etudiants, addEtudiant } = useData();
  const { toast } = useToast();
  const [dragActive, setDragActive] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedStudent[]>([]);
  const [selectedEtablissement, setSelectedEtablissement] = useState<string>('');
  const [isImporting, setIsImporting] = useState(false);
  const [fileName, setFileName] = useState<string>('');

  // Simulate Excel file parsing
  const parseExcelFile = useCallback((file: File) => {
    setFileName(file.name);
    
    // Simulate parsing with mock data
    const mockData: ParsedStudent[] = [
      {
        nom: 'Dupont',
        prenom: 'Jean',
        numero: '2024003',
        classe: 'Terminale S',
        email: 'jean.dupont@lycee.fr',
        valid: true,
        errors: []
      },
      {
        nom: 'Martin',
        prenom: 'Sophie',
        numero: '2024004',
        classe: 'Terminale ES',
        email: 'sophie.martin@lycee.fr',
        valid: true,
        errors: []
      },
      {
        nom: 'Bernard',
        prenom: 'Pierre',
        numero: '2024001', // Already exists
        classe: 'Première L',
        email: '',
        valid: false,
        errors: ['Numéro étudiant déjà existant']
      },
      {
        nom: '',
        prenom: 'Marie',
        numero: '2024005',
        classe: 'Terminale S',
        email: 'marie@lycee.fr',
        valid: false,
        errors: ['Nom manquant']
      },
      {
        nom: 'Lemoine',
        prenom: 'Paul',
        numero: '2024006',
        classe: 'Seconde A',
        email: 'paul.lemoine@invalid-email',
        valid: false,
        errors: ['Email invalide']
      }
    ];

    // Validate data
    const validatedData = mockData.map(student => {
      const errors: string[] = [...student.errors];
      
      // Check if student number already exists
      if (etudiants.some(e => e.numero === student.numero)) {
        errors.push('Numéro étudiant déjà existant');
      }
      
      // Check required fields
      if (!student.nom.trim()) errors.push('Nom manquant');
      if (!student.prenom.trim()) errors.push('Prénom manquant');
      if (!student.numero.trim()) errors.push('Numéro étudiant manquant');
      if (!student.classe.trim()) errors.push('Classe manquante');
      
      // Check email format if provided
      if (student.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(student.email)) {
        errors.push('Email invalide');
      }

      return {
        ...student,
        valid: errors.length === 0,
        errors
      };
    });

    setParsedData(validatedData);
  }, [etudiants]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.includes('excel') || file.type.includes('spreadsheet') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        parseExcelFile(file);
      } else {
        toast({
          title: "Format de fichier invalide",
          description: "Veuillez sélectionner un fichier Excel (.xlsx ou .xls)",
          variant: "destructive",
        });
      }
    }
  }, [parseExcelFile, toast]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      parseExcelFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!selectedEtablissement) {
      toast({
        title: "Établissement requis",
        description: "Veuillez sélectionner un établissement pour l'import",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);
    try {
      const validStudents = parsedData.filter(student => student.valid);
      
      for (const student of validStudents) {
        await addEtudiant({
          nom: student.nom,
          prenom: student.prenom,
          numero: student.numero,
          classe: student.classe,
          email: student.email || undefined,
          etablissementId: selectedEtablissement,
        });
      }

      toast({
        title: "Import réussi",
        description: `${validStudents.length} étudiant(s) importé(s) avec succès.`,
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Erreur d'import",
        description: "Une erreur est survenue lors de l'import.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const validCount = parsedData.filter(s => s.valid).length;
  const invalidCount = parsedData.length - validCount;

  return (
    <div className="space-y-6">
      {!parsedData.length ? (
        <div className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Importez un fichier Excel (.xlsx ou .xls) contenant les colonnes suivantes :
              <strong> Nom, Prénom, Numéro, Classe, Email</strong>
            </AlertDescription>
          </Alert>

          <Card 
            className={`border-dashed border-2 transition-colors ${
              dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <CardContent className="p-12">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                  <FileSpreadsheet className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">Glissez votre fichier Excel ici</h3>
                  <p className="text-muted-foreground">ou cliquez pour sélectionner</p>
                </div>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileInput}
                    className="hidden"
                    id="file-input"
                  />
                  <Button asChild>
                    <label htmlFor="file-input" className="cursor-pointer">
                      <Upload className="h-4 w-4 mr-2" />
                      Sélectionner un fichier
                    </label>
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Formats supportés: .xlsx, .xls (max 10MB)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                Aperçu de l'import - {fileName}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex gap-4">
                  <Badge variant="default" className="bg-green-500">
                    <Check className="h-3 w-3 mr-1" />
                    {validCount} valides
                  </Badge>
                  {invalidCount > 0 && (
                    <Badge variant="destructive">
                      <X className="h-3 w-3 mr-1" />
                      {invalidCount} erreurs
                    </Badge>
                  )}
                </div>
                
                <Select value={selectedEtablissement} onValueChange={setSelectedEtablissement}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Sélectionner l'établissement" />
                  </SelectTrigger>
                  <SelectContent>
                    {etablissements.map((etablissement) => (
                      <SelectItem key={etablissement.id} value={etablissement.id}>
                        {etablissement.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="max-h-64 overflow-y-auto border rounded">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Statut</TableHead>
                      <TableHead>Nom</TableHead>
                      <TableHead>Prénom</TableHead>
                      <TableHead>Numéro</TableHead>
                      <TableHead>Classe</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Erreurs</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedData.map((student, index) => (
                      <TableRow key={index} className={student.valid ? '' : 'bg-destructive/5'}>
                        <TableCell>
                          {student.valid ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <X className="h-4 w-4 text-destructive" />
                          )}
                        </TableCell>
                        <TableCell>{student.nom}</TableCell>
                        <TableCell>{student.prenom}</TableCell>
                        <TableCell>{student.numero}</TableCell>
                        <TableCell>{student.classe}</TableCell>
                        <TableCell>{student.email || '-'}</TableCell>
                        <TableCell>
                          {student.errors.length > 0 && (
                            <div className="text-xs text-destructive">
                              {student.errors.join(', ')}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setParsedData([])}>
              Choisir un autre fichier
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button 
                onClick={handleImport}
                disabled={!selectedEtablissement || validCount === 0 || isImporting}
              >
                {isImporting ? 'Import en cours...' : `Importer ${validCount} étudiant(s)`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}