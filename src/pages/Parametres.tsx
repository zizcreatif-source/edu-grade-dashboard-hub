import { useState } from 'react';
import { Settings, Download, Palette, Building2, History, Database, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExportManager } from '@/components/settings/ExportManager';
import { BrandingManager } from '@/components/settings/BrandingManager';
import { ThemeCustomizer } from '@/components/settings/ThemeCustomizer';
import { VersionManager } from '@/components/settings/VersionManager';
import { DataManager } from '@/components/settings/DataManager';
import { LandingPageManager } from '@/components/settings/LandingPageManager';



export default function Parametres() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
        <p className="text-muted-foreground">Configuration et personnalisation d'EduGrade</p>
      </div>

        <Tabs defaultValue="landing" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1">
          <TabsTrigger value="landing" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <Globe className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">Landing</span>
          </TabsTrigger>
          <TabsTrigger value="export" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <Download className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">Export</span>
          </TabsTrigger>
          <TabsTrigger value="branding" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <Building2 className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Établissements</span>
            <span className="sm:hidden">Établis.</span>
          </TabsTrigger>
          <TabsTrigger value="themes" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <Palette className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">Thèmes</span>
          </TabsTrigger>
          <TabsTrigger value="versions" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">Versions</span>
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <Database className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">Données</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="landing">
          <LandingPageManager />
        </TabsContent>

        <TabsContent value="export">
          <ExportManager />
        </TabsContent>

        <TabsContent value="branding">
          <BrandingManager />
        </TabsContent>

        <TabsContent value="themes">
          <ThemeCustomizer />
        </TabsContent>


        <TabsContent value="versions">
          <VersionManager />
        </TabsContent>

        <TabsContent value="data">
          <DataManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}