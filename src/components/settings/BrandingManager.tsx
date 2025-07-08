import { useState } from 'react';
import { Building2, Upload, Palette, Settings, Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/hooks/use-toast';

export function BrandingManager() {
  const { etablissements, addEtablissement, updateEtablissement, deleteEtablissement } = useData();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      nom: '',
      noteMin: 0,
      noteMax: 20,
      couleurPrimaire: '#2563eb',
      logo: null as File | null,
    }
  });

  const handleSubmit = (data: any) => {
    try {
      if (editingId) {
        updateEtablissement(editingId, {
          nom: data.nom,
          configuration: {
            noteMin: data.noteMin,
            noteMax: data.noteMax,
            coefficients: { controle: 1, examen: 2, tp: 1.5, oral: 1 }
          }
        });
        toast({ title: "Établissement modifié", description: "Les modifications ont été sauvegardées." });
      } else {
        // Si un logo est uploadé, l'utiliser, sinon générer un avatar
        let logoUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(data.nom)}&background=${data.couleurPrimaire.slice(1)}&color=ffffff`;
        
        if (data.logo) {
          // Créer une URL temporaire pour le fichier uploadé
          logoUrl = URL.createObjectURL(data.logo);
        }
        
        addEtablissement({
          nom: data.nom,
          logo: logoUrl,
          configuration: {
            noteMin: data.noteMin,
            noteMax: data.noteMax,
            coefficients: { controle: 1, examen: 2, tp: 1.5, oral: 1 }
          }
        });
        toast({ title: "Établissement créé", description: "Le nouvel établissement a été ajouté." });
      }
      setShowForm(false);
      setEditingId(null);
      form.reset();
    } catch (error) {
      toast({ title: "Erreur", description: "Impossible de sauvegarder.", variant: "destructive" });
    }
  };

  const handleEdit = (etablissement: any) => {
    setEditingId(etablissement.id);
    form.reset({
      nom: etablissement.nom,
      noteMin: etablissement.configuration.noteMin,
      noteMax: etablissement.configuration.noteMax,
      couleurPrimaire: '#2563eb',
    });
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Gestion des Universités/Instituts</h3>
          <p className="text-sm text-muted-foreground">Configurez vos universités/instituts et leur branding</p>
        </div>
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingId(null); form.reset(); }}>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle université/institut
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingId ? 'Modifier l\'université/institut' : 'Nouvelle université/institut'}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="nom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom de l'université/institut</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ex: Université Paris-Sorbonne" />
                      </FormControl>
                    </FormItem>
                  )}
                 />
                 <FormField
                   control={form.control}
                   name="logo"
                   render={({ field: { value, onChange, ...field } }) => (
                     <FormItem>
                       <FormLabel>Logo de l'université/institut</FormLabel>
                       <FormControl>
                         <Input
                           {...field}
                           type="file"
                           accept="image/*"
                           onChange={(e) => {
                             const file = e.target.files?.[0];
                             onChange(file);
                           }}
                         />
                       </FormControl>
                     </FormItem>
                   )}
                 />
                 <div className="grid grid-cols-2 gap-4">
                   <FormField
                     control={form.control}
                     name="noteMin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Note minimum</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="noteMax"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Note maximum</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
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

      <div className="grid gap-4 md:grid-cols-2">
        {etablissements.map((etablissement) => (
          <Card key={etablissement.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img 
                    src={etablissement.logo} 
                    alt={etablissement.nom}
                    className="w-12 h-12 rounded-lg"
                  />
                  <div>
                    <CardTitle className="text-lg">{etablissement.nom}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Notes: {etablissement.configuration.noteMin} - {etablissement.configuration.noteMax}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(etablissement)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-destructive"
                    onClick={() => {
                      deleteEtablissement(etablissement.id);
                      toast({ title: "Établissement supprimé", description: "L'établissement a été supprimé." });
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Coefficients:</span>
                  <span>Contrôle: {etablissement.configuration.coefficients.controle}</span>
                </div>
                <div className="flex justify-between">
                  <span></span>
                  <span>Examen: {etablissement.configuration.coefficients.examen}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}