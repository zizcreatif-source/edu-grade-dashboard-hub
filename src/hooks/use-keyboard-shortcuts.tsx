import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from './use-toast';

interface ShortcutConfig {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  action: () => void;
  description: string;
}

export function useKeyboardShortcuts() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const shortcuts: ShortcutConfig[] = [
    {
      key: 'h',
      ctrlKey: true,
      action: () => navigate('/'),
      description: 'Aller au Dashboard'
    },
    {
      key: 'c',
      ctrlKey: true,
      altKey: true,
      action: () => navigate('/cours'),
      description: 'Aller aux Cours'
    },
    {
      key: 'e',
      ctrlKey: true,
      altKey: true,
      action: () => navigate('/etudiants'),
      description: 'Aller aux Étudiants'
    },
    {
      key: 'n',
      ctrlKey: true,
      altKey: true,
      action: () => navigate('/notes'),
      description: 'Aller aux Notes'
    },
    {
      key: 's',
      ctrlKey: true,
      altKey: true,
      action: () => navigate('/parametres'),
      description: 'Aller aux Paramètres'
    },
    {
      key: '/',
      ctrlKey: true,
      action: () => {
        toast({
          title: "Raccourcis clavier",
          description: (
            <div className="space-y-1 text-xs">
              <div>Ctrl+H : Dashboard</div>
              <div>Ctrl+Alt+C : Cours</div>
              <div>Ctrl+Alt+E : Étudiants</div>
              <div>Ctrl+Alt+N : Notes</div>
              <div>Ctrl+Alt+S : Paramètres</div>
              <div>Ctrl+/ : Aide raccourcis</div>
            </div>
          ),
          duration: 5000,
        });
      },
      description: 'Afficher les raccourcis'
    }
  ];

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ne pas déclencher si l'utilisateur tape dans un input
      if (event.target instanceof HTMLInputElement || 
          event.target instanceof HTMLTextAreaElement ||
          event.target instanceof HTMLSelectElement) {
        return;
      }

      shortcuts.forEach(shortcut => {
        const ctrlMatch = shortcut.ctrlKey ? event.ctrlKey : !event.ctrlKey;
        const altMatch = shortcut.altKey ? event.altKey : !event.altKey;
        const shiftMatch = shortcut.shiftKey ? event.shiftKey : !event.shiftKey;

        if (event.key.toLowerCase() === shortcut.key.toLowerCase() && 
            ctrlMatch && altMatch && shiftMatch) {
          event.preventDefault();
          shortcut.action();
        }
      });
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [navigate, toast]);

  return { shortcuts };
}