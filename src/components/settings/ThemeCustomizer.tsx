import { useState } from 'react';
import { Palette, Monitor, Sun, Moon, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useTheme } from '@/contexts/ThemeContext';

export function ThemeCustomizer() {
  const { theme, toggleTheme, setTheme } = useTheme();
  const [selectedColor, setSelectedColor] = useState('#2563eb');

  const colorPresets = [
    { name: 'Bleu', value: '#2563eb', class: 'bg-blue-600' },
    { name: 'Vert', value: '#16a34a', class: 'bg-green-600' },
    { name: 'Rouge', value: '#dc2626', class: 'bg-red-600' },
    { name: 'Violet', value: '#7c3aed', class: 'bg-violet-600' },
    { name: 'Orange', value: '#ea580c', class: 'bg-orange-600' },
    { name: 'Rose', value: '#e11d48', class: 'bg-pink-600' },
  ];

  const applyColor = (color: string) => {
    setSelectedColor(color);
    // In a real app, you would update CSS variables
    document.documentElement.style.setProperty('--primary', color);
  };

  return (
    <div className="space-y-6">
      {/* Theme Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Thème d'Affichage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => setTheme('light')}
              className={`p-4 rounded-lg border-2 transition-all ${
                theme === 'light' ? 'border-primary bg-primary/5' : 'border-muted hover:border-muted-foreground/20'
              }`}
            >
              <Sun className="h-8 w-8 mx-auto mb-2" />
              <p className="font-medium">Clair</p>
            </button>
            
            <button
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-lg border-2 transition-all ${
                theme === 'dark' ? 'border-primary bg-primary/5' : 'border-muted hover:border-muted-foreground/20'
              }`}
            >
              <Moon className="h-8 w-8 mx-auto mb-2" />
              <p className="font-medium">Sombre</p>
            </button>
            
            <button
              onClick={toggleTheme}
              className="p-4 rounded-lg border-2 border-muted hover:border-muted-foreground/20 transition-all"
            >
              <Monitor className="h-8 w-8 mx-auto mb-2" />
              <p className="font-medium">Basculer</p>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Color Customization */}
      <Card>
        <CardHeader>
          <CardTitle>Couleurs Personnalisées</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-3 block">Couleur principale</Label>
            <div className="grid grid-cols-6 gap-3">
              {colorPresets.map((color) => (
                <button
                  key={color.value}
                  onClick={() => applyColor(color.value)}
                  className={`w-12 h-12 rounded-lg ${color.class} border-2 transition-all ${
                    selectedColor === color.value ? 'border-foreground scale-110' : 'border-transparent'
                  }`}
                  title={color.name}
                />
              ))}
            </div>
          </div>
          
          <div>
            <Label className="text-sm font-medium mb-2 block">Couleur personnalisée</Label>
            <div className="flex gap-2">
              <input
                type="color"
                value={selectedColor}
                onChange={(e) => applyColor(e.target.value)}
                className="w-12 h-10 rounded border"
              />
              <input
                type="text"
                value={selectedColor}
                onChange={(e) => applyColor(e.target.value)}
                className="flex-1 px-3 py-2 border rounded text-sm"
                placeholder="#2563eb"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Layout Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Préférences d'Interface</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Sidebar réduite par défaut</Label>
              <p className="text-sm text-muted-foreground">La barre latérale sera réduite au démarrage</p>
            </div>
            <Button variant="outline" size="sm">Activer</Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Mode compact</Label>
              <p className="text-sm text-muted-foreground">Interface plus dense avec moins d'espacement</p>
            </div>
            <Button variant="outline" size="sm">Désactiver</Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Animations réduites</Label>
              <p className="text-sm text-muted-foreground">Réduit les animations pour de meilleures performances</p>
            </div>
            <Button variant="outline" size="sm">Activer</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}