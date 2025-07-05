import { useState, useCallback } from 'react';
import { Upload, FileSpreadsheet, Check, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

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
  const [selectedClasse, setSelectedClasse] = useState<string>('');
  const [isImporting, setIsImporting] = useState(false);
  const [fileName, setFileName] = useState<string>('');

  // Parse Excel file using XLSX library
  const parseExcelFile = useCallback((file: File) => {
    console.log('Parsing file:', file.name, 'Type:', file.type, 'Size:', file.size);
    setFileName(file.name);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        console.log('File read successfully, processing...');
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        console.log('Workbook sheets:', workbook.SheetNames);
        
        // Get first worksheet
        const worksheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[worksheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];
        console.log('Raw data from Excel:', jsonData);
        
        if (jsonData.length < 2) {
          console.log('File is empty or has no data rows');
          toast({
            title: "Fichier vide",
            description: "Le fichier Excel ne contient pas de données.",
            variant: "destructive",
          });
          return;
        }
        
        const headers = jsonData[0].map(h => h?.toString().toLowerCase().trim());
        const rows = jsonData.slice(1);
        console.log('Headers found:', headers);
        console.log('Number of data rows:', rows.length);
        
        // Map columns
        const nomIndex = headers.findIndex(h => h.includes('nom'));
        const prenomIndex = headers.findIndex(h => h.includes('prénom') || h.includes('prenom'));
        const numeroIndex = headers.findIndex(h => h.includes('numéro') || h.includes('numero') || h.includes('matricule'));
        const classeIndex = headers.findIndex(h => h.includes('classe'));
        const emailIndex = headers.findIndex(h => h.includes('email') || h.includes('mail'));
        
        console.log('Column mapping:', { nomIndex, prenomIndex, numeroIndex, classeIndex, emailIndex });
        
        if (nomIndex === -1 || prenomIndex === -1 || numeroIndex === -1) {
          console.log('Required columns missing');
          toast({
            title: "Colonnes manquantes",
            description: "Le fichier doit contenir au minimum les colonnes: Nom, Prénom, Numéro",
            variant: "destructive",
          });
          return;
        }
        
        // Parse students data
        const studentsData: ParsedStudent[] = rows
          .filter(row => row && row.length > 0 && row.some(cell => cell !== undefined && cell !== ''))
          .map((row, index) => {
            const nom = row[nomIndex]?.toString().trim() || '';
            const prenom = row[prenomIndex]?.toString().trim() || '';
            const numero = row[numeroIndex]?.toString().trim() || '';
            const classe = classeIndex !== -1 ? row[classeIndex]?.toString().trim() || '' : '';
            const email = emailIndex !== -1 ? row[emailIndex]?.toString().trim() || '' : '';
            
            const errors: string[] = [];
            
            // Check required fields
            if (!nom) errors.push('Nom manquant');
            if (!prenom) errors.push('Prénom manquant');
            if (!numero) errors.push('Numéro manquant');
            
            // Check if student number already exists
            if (numero && etudiants.some(e => e.numero === numero)) {
              errors.push('Numéro étudiant déjà existant');
            }
            
            // Check email format if provided
            if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
              errors.push('Email invalide');
            }
            
            return {
              nom,
              prenom,
              numero,
              classe,
              email: email || undefined,
              valid: errors.length === 0,
              errors
            };
          });
        
        console.log('Parsed students data:', studentsData);
        setParsedData(studentsData);
        
      } catch (error) {
        console.error('Error parsing Excel file:', error);
        toast({
          title: "Erreur de lecture",
          description: "Impossible de lire le fichier Excel. Vérifiez le format.",
          variant: "destructive",
        });
      }
    };
    
    reader.onerror = (error) => {
      console.error('FileReader error:', error);
      toast({
        title: "Erreur de lecture",
        description: "Impossible de lire le fichier.",
        variant: "destructive",
      });
    };
    
    reader.readAsArrayBuffer(file);
  }, [etudiants, toast]);

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
        const classeFinale = student.classe || selectedClasse;
        
        if (!classeFinale) {
          toast({
            title: "Classe manquante",
            description: "Veuillez spécifier une classe par défaut ou inclure la classe dans le fichier Excel",
            variant: "destructive",
          });
          setIsImporting(false);
          return;
        }
        
        await addEtudiant({
          nom: student.nom,
          prenom: student.prenom,
          numero: student.numero,
          classe: classeFinale,
          email: student.email || undefined,
          etablissementId: selectedEtablissement,
          anneeScolaire: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label htmlFor="etablissement">Établissement *</Label>
                  <Select value={selectedEtablissement} onValueChange={setSelectedEtablissement}>
                    <SelectTrigger>
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
                
                <div className="space-y-2">
                  <Label htmlFor="classe">Classe par défaut</Label>
                  <Input
                    id="classe"
                    value={selectedClasse}
                    onChange={(e) => setSelectedClasse(e.target.value)}
                    placeholder="Ex: Terminale S"
                  />
                  <p className="text-xs text-muted-foreground">
                    Utilisée si la classe n'est pas spécifiée dans le fichier
                  </p>
                </div>
              </div>

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