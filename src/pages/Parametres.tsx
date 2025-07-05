import { useState } from 'react';
import { Settings, Download, Palette, Building2, FileText, History } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExportManager } from '@/components/settings/ExportManager';
import { BrandingManager } from '@/components/settings/BrandingManager';
import { ThemeCustomizer } from '@/components/settings/ThemeCustomizer';

export default function Parametres() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
        <p className="text-muted-foreground">Configuration et personnalisation d'EduGrade</p>
      </div>

      <Tabs defaultValue="export" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="export" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </TabsTrigger>
          <TabsTrigger value="branding" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Établissements
          </TabsTrigger>
          <TabsTrigger value="themes" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Thèmes
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="export">
          <ExportManager />
        </TabsContent>

        <TabsContent value="branding">
          <BrandingManager />
        </TabsContent>

        <TabsContent value="themes">
          <ThemeCustomizer />
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Gestion des Templates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Fonctionnalité en cours de développement</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}