import { useState } from 'react';
import { Settings, Download, Palette, Building2, History, Database, Globe, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExportManager } from '@/components/settings/ExportManager';
import { BrandingManager } from '@/components/settings/BrandingManager';
import { ThemeCustomizer } from '@/components/settings/ThemeCustomizer';
import { VersionManager } from '@/components/settings/VersionManager';
import { DataManager } from '@/components/settings/DataManager';
import { LandingPageManager } from '@/components/settings/LandingPageManager';
import { PromotionStats } from '@/components/settings/PromotionStats';


export default function Parametres() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
        <p className="text-muted-foreground">Configuration et personnalisation d'EduGrade</p>
      </div>

        <Tabs defaultValue="landing" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="landing" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Landing
          </TabsTrigger>
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
          <TabsTrigger value="promotions" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Promotions
          </TabsTrigger>
          <TabsTrigger value="versions" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Versions
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Données
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

        <TabsContent value="promotions">
          <PromotionStats />
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