import { useState } from 'react';
import { Palette, Monitor, Sun, Moon, Smartphone, Brush, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/contexts/ThemeContext';

export function ThemeCustomizer() {
  const { theme, toggleTheme, setTheme } = useTheme();
  const [selectedColor, setSelectedColor] = useState('hsl(221.2 83.2% 53.3%)');
  const [compactMode, setCompactMode] = useState(false);
  const [reducedAnimations, setReducedAnimations] = useState(false);
  const [collapsedSidebar, setCollapsedSidebar] = useState(false);

  const colorPresets = [
    { name: 'Bleu EduGrade', value: 'hsl(221.2 83.2% 53.3%)', hex: '#2563eb', gradient: 'from-blue-500 to-blue-600' },
    { name: 'Vert Éducation', value: 'hsl(142.1 76.2% 36.3%)', hex: '#16a34a', gradient: 'from-green-500 to-green-600' },
    { name: 'Violet Académique', value: 'hsl(262.1 83.3% 57.8%)', hex: '#7c3aed', gradient: 'from-violet-500 to-violet-600' },
    { name: 'Orange Créatif', value: 'hsl(24.6 95% 53.1%)', hex: '#ea580c', gradient: 'from-orange-500 to-orange-600' },
    { name: 'Rose Moderne', value: 'hsl(346.8 77.2% 49.8%)', hex: '#e11d48', gradient: 'from-pink-500 to-pink-600' },
    { name: 'Bleu Marine', value: 'hsl(217.2 91.2% 59.8%)', hex: '#3b82f6', gradient: 'from-blue-600 to-blue-700' },
  ];

  const applyColor = (hslValue: string, hexValue: string) => {
    setSelectedColor(hslValue);
    // Extract HSL values from the string and apply them properly
    const hslMatch = hslValue.match(/hsl\(([^)]+)\)/);
    if (hslMatch) {
      const hslParts = hslMatch[1].split(/\s+/);
      if (hslParts.length >= 3) {
        document.documentElement.style.setProperty('--primary', `${hslParts[0]} ${hslParts[1]} ${hslParts[2]}`);
      }
    }
    document.documentElement.style.setProperty('--primary-foreground', '210 40% 98%');
  };

  const toggleCompactMode = () => {
    setCompactMode(!compactMode);
    document.documentElement.classList.toggle('compact-mode', !compactMode);
  };

  const toggleAnimations = () => {
    setReducedAnimations(!reducedAnimations);
    document.documentElement.classList.toggle('reduced-motion', !reducedAnimations);
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
            <div className="grid grid-cols-3 gap-4">
              {colorPresets.map((color) => (
                <button
                  key={color.value}
                  onClick={() => applyColor(color.value, color.hex)}
                  className={`relative p-4 rounded-xl bg-gradient-to-r ${color.gradient} border-2 transition-all hover:scale-105 ${
                    selectedColor === color.value ? 'border-foreground ring-2 ring-primary/20' : 'border-transparent'
                  }`}
                  title={color.name}
                >
                  <div className="text-white text-sm font-medium">{color.name}</div>
                  <div className="text-white/80 text-xs">{color.hex}</div>
                  {selectedColor === color.value && (
                    <div className="absolute top-2 right-2">
                      <Eye className="h-4 w-4 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <Label className="text-sm font-medium mb-2 block">Couleur personnalisée</Label>
            <div className="flex gap-2">
              <input
                type="color"
                value={colorPresets.find(c => c.value === selectedColor)?.hex || '#2563eb'}
                onChange={(e) => {
                  const hexValue = e.target.value;
                  // Convert hex to HSL manually for better compatibility
                  const r = parseInt(hexValue.slice(1, 3), 16) / 255;
                  const g = parseInt(hexValue.slice(3, 5), 16) / 255;
                  const b = parseInt(hexValue.slice(5, 7), 16) / 255;
                  
                  const max = Math.max(r, g, b);
                  const min = Math.min(r, g, b);
                  const l = (max + min) / 2;
                  
                  let h = 0, s = 0;
                  if (max !== min) {
                    const d = max - min;
                    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                    switch (max) {
                      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                      case g: h = (b - r) / d + 2; break;
                      case b: h = (r - g) / d + 4; break;
                    }
                    h /= 6;
                  }
                  
                  const hslValue = `hsl(${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%)`;
                  applyColor(hslValue, hexValue);
                }}
                className="w-12 h-10 rounded border"
              />
              <input
                type="text"
                value={selectedColor}
                onChange={(e) => applyColor(e.target.value, e.target.value)}
                className="flex-1 px-3 py-2 border rounded text-sm"
                placeholder="hsl(221.2 83.2% 53.3%)"
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
            <Switch checked={collapsedSidebar} onCheckedChange={setCollapsedSidebar} />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Mode compact</Label>
              <p className="text-sm text-muted-foreground">Interface plus dense avec moins d'espacement</p>
            </div>
            <Switch checked={compactMode} onCheckedChange={toggleCompactMode} />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Animations réduites</Label>
              <p className="text-sm text-muted-foreground">Réduit les animations pour de meilleures performances</p>
            </div>
            <Switch checked={reducedAnimations} onCheckedChange={toggleAnimations} />
          </div>
          
          <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Brush className="h-4 w-4 text-primary" />
              <Label className="font-medium text-primary">Aperçu du thème</Label>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Voici un aperçu de votre thème personnalisé avec les couleurs sélectionnées.
            </p>
            <div className="flex gap-2">
              <Button size="sm">Bouton principal</Button>
              <Button variant="outline" size="sm">Bouton secondaire</Button>
              <Button variant="ghost" size="sm">Bouton fantôme</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}