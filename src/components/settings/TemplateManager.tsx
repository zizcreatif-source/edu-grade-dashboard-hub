import { useState } from 'react';
import { FileText, Plus, Edit, Trash2, Download, Upload, Eye, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';

interface Template {
  id: string;
  nom: string;
  type: 'bulletin' | 'releve' | 'attestation' | 'certificat';
  description: string;
  colonnes: string[];
  format: 'A4' | 'A3' | 'Letter';
  orientation: 'portrait' | 'landscape';
  dateCreation: string;
  utilisation: number;
}

export function TemplateManager() {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<Template[]>([
    {
      id: '1',
      nom: 'Bulletin Standard',
      type: 'bulletin',
      description: 'Bulletin de notes standard avec moyennes par matière',
      colonnes: ['nom', 'prenom', 'classe', 'moyennes', 'rang', 'appreciation'],
      format: 'A4',
      orientation: 'portrait',
      dateCreation: '2024-01-01',
      utilisation: 45
    },
    {
      id: '2',
      nom: 'Relevé de Notes Détaillé',
      type: 'releve',
      description: 'Relevé détaillé avec toutes les évaluations',
      colonnes: ['nom', 'prenom', 'numero', 'notes', 'coefficients', 'signature'],
      format: 'A4',
      orientation: 'landscape',
      dateCreation: '2024-01-15',
      utilisation: 23
    },
    {
      id: '3',
      nom: 'Attestation de Réussite',
      type: 'attestation',
      description: 'Attestation officielle de réussite d\'examen',
      colonnes: ['nom', 'prenom', 'dateNaissance', 'resultat', 'mention'],
      format: 'A4',
      orientation: 'portrait',
      dateCreation: '2024-02-01',
      utilisation: 12
    }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

  const form = useForm({
    defaultValues: {
      nom: '',
      type: 'bulletin' as 'bulletin' | 'releve' | 'attestation' | 'certificat',
      description: '',
      format: 'A4' as 'A4' | 'A3' | 'Letter',
      orientation: 'portrait' as 'portrait' | 'landscape',
      colonnes: [] as string[]
    }
  });

  const availableColumns = [
    { id: 'nom', label: 'Nom' },
    { id: 'prenom', label: 'Prénom' },
    { id: 'numero', label: 'Numéro étudiant' },
    { id: 'classe', label: 'Classe' },
    { id: 'dateNaissance', label: 'Date de naissance' },
    { id: 'notes', label: 'Notes détaillées' },
    { id: 'moyennes', label: 'Moyennes' },
    { id: 'coefficients', label: 'Coefficients' },
    { id: 'rang', label: 'Rang' },
    { id: 'mention', label: 'Mention' },
    { id: 'appreciation', label: 'Appréciation' },
    { id: 'signature', label: 'Signature' },
    { id: 'logo', label: 'Logo établissement' },
    { id: 'responsable', label: 'Responsable' }
  ];

  const typeLabels = {
    bulletin: 'Bulletin de Notes',
    releve: 'Relevé de Notes',
    attestation: 'Attestation',
    certificat: 'Certificat'
  };

  const handleSubmit = (data: any) => {
    const newTemplate: Template = {
      id: editingId || Date.now().toString(),
      nom: data.nom,
      type: data.type,
      description: data.description,
      colonnes: data.colonnes,
      format: data.format,
      orientation: data.orientation,
      dateCreation: editingId ? templates.find(t => t.id === editingId)?.dateCreation || new Date().toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      utilisation: editingId ? templates.find(t => t.id === editingId)?.utilisation || 0 : 0
    };

    if (editingId) {
      setTemplates(prev => prev.map(t => t.id === editingId ? newTemplate : t));
      toast({ title: "Template modifié", description: "Le template a été mis à jour avec succès." });
    } else {
      setTemplates(prev => [...prev, newTemplate]);
      toast({ title: "Template créé", description: "Le nouveau template a été créé avec succès." });
    }

    setShowForm(false);
    setEditingId(null);
    form.reset();
  };

  const handleEdit = (template: Template) => {
    setEditingId(template.id);
    form.reset({
      nom: template.nom,
      type: template.type,
      description: template.description,
      format: template.format,
      orientation: template.orientation,
      colonnes: template.colonnes
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
    toast({ title: "Template supprimé", description: "Le template a été supprimé avec succès." });
  };

  const handleDuplicate = (template: Template) => {
    const newTemplate: Template = {
      ...template,
      id: Date.now().toString(),
      nom: `${template.nom} (Copie)`,
      dateCreation: new Date().toISOString().split('T')[0],
      utilisation: 0
    };
    setTemplates(prev => [...prev, newTemplate]);
    toast({ title: "Template dupliqué", description: "Le template a été dupliqué avec succès." });
  };

  const handleExport = (template: Template) => {
    const data = JSON.stringify(template, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `template_${template.nom.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Template exporté", description: "Le template a été exporté avec succès." });
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const template = JSON.parse(e.target?.result as string);
          const newTemplate: Template = {
            ...template,
            id: Date.now().toString(),
            dateCreation: new Date().toISOString().split('T')[0],
            utilisation: 0
          };
          setTemplates(prev => [...prev, newTemplate]);
          toast({ title: "Template importé", description: "Le template a été importé avec succès." });
        } catch (error) {
          toast({ title: "Erreur d'import", description: "Fichier template invalide.", variant: "destructive" });
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Gestion des Templates</h3>
          <p className="text-sm text-muted-foreground">Créez et gérez vos modèles d'export personnalisés</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Importer
            </Button>
          </div>
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingId(null); form.reset(); }}>
                <Plus className="h-4 w-4 mr-2" />
                Nouveau Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? 'Modifier le Template' : 'Nouveau Template'}
                </DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="nom"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom du template</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Ex: Bulletin Standard" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type de document</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.entries(typeLabels).map(([value, label]) => (
                                <SelectItem key={value} value={value}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Description du template..." />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="format"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Format</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="A4">A4</SelectItem>
                              <SelectItem value="A3">A3</SelectItem>
                              <SelectItem value="Letter">Letter</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="orientation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Orientation</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="portrait">Portrait</SelectItem>
                              <SelectItem value="landscape">Paysage</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div>
                    <FormLabel className="text-sm font-medium mb-3 block">Colonnes à inclure</FormLabel>
                    <div className="grid gap-2 md:grid-cols-3 max-h-40 overflow-y-auto border rounded p-3">
                      {availableColumns.map((column) => (
                        <div key={column.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={column.id}
                            checked={form.watch('colonnes').includes(column.id)}
                            onChange={(e) => {
                              const current = form.getValues('colonnes');
                              const updated = e.target.checked
                                ? [...current, column.id]
                                : current.filter(id => id !== column.id);
                              form.setValue('colonnes', updated);
                            }}
                            className="rounded"
                          />
                          <label htmlFor={column.id} className="text-sm">
                            {column.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                      Annuler
                    </Button>
                    <Button type="submit">
                      {editingId ? 'Modifier' : 'Créer'}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{template.nom}</CardTitle>
                  <Badge variant="outline" className="mt-1">
                    {typeLabels[template.type]}
                  </Badge>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => setPreviewTemplate(template)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(template)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDuplicate(template)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleExport(template)}>
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-destructive"
                    onClick={() => handleDelete(template.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Format:</span>
                  <span>{template.format} • {template.orientation === 'portrait' ? 'Portrait' : 'Paysage'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Colonnes:</span>
                  <span>{template.colonnes.length} éléments</span>
                </div>
                <div className="flex justify-between">
                  <span>Utilisé:</span>
                  <span>{template.utilisation} fois</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Aperçu - {previewTemplate?.nom}</DialogTitle>
          </DialogHeader>
          {previewTemplate && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded">
                <div>
                  <h4 className="font-medium mb-2">Configuration</h4>
                  <div className="space-y-1 text-sm">
                    <div>Type: {typeLabels[previewTemplate.type]}</div>
                    <div>Format: {previewTemplate.format}</div>
                    <div>Orientation: {previewTemplate.orientation === 'portrait' ? 'Portrait' : 'Paysage'}</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Statistiques</h4>
                  <div className="space-y-1 text-sm">
                    <div>Créé le: {new Date(previewTemplate.dateCreation).toLocaleDateString('fr-FR')}</div>
                    <div>Utilisations: {previewTemplate.utilisation}</div>
                    <div>Colonnes: {previewTemplate.colonnes.length}</div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Colonnes incluses</h4>
                <div className="flex flex-wrap gap-2">
                  {previewTemplate.colonnes.map(col => {
                    const column = availableColumns.find(ac => ac.id === col);
                    return (
                      <Badge key={col} variant="secondary">
                        {column?.label || col}
                      </Badge>
                    );
                  })}
                </div>
              </div>
              
              <div className="border-2 border-dashed border-muted p-8 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Aperçu du document généré avec ce template
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {previewTemplate.format} • {previewTemplate.orientation === 'portrait' ? 'Portrait' : 'Paysage'}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}