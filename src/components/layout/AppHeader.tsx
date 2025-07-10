import { Moon, Sun, User, Bell, LogOut } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { HelpSystem } from "@/components/help/HelpSystem";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { UserProfile } from "@/components/profile/UserProfile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useState } from "react";

export function AppHeader() {
  const { theme, toggleTheme } = useTheme();
  const { user, profile, signOut } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleDialogChange = (isOpen: boolean, setterFunction: (value: boolean) => void) => {
    setterFunction(isOpen);
    if (!isOpen) {
      // Small delay to prevent immediate reopening
      setTimeout(() => {
        setShowProfile(false);
        setShowNotifications(false);
      }, 100);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-2 sm:px-4">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div className="hidden sm:flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-semibold">Tableau de bord</h2>
            <Badge variant="secondary" className="text-xs bg-gradient-to-r from-primary/10 to-accent/10">
              v1.0
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-3">
          {/* Help System */}
          <HelpSystem />

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9"
            title={`Basculer vers le thème ${theme === 'light' ? 'sombre' : 'clair'}`}
          >
            {theme === 'light' ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </Button>

          {/* Notifications */}
          <Dialog open={showNotifications} onOpenChange={(isOpen) => handleDialogChange(isOpen, setShowNotifications)}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                title="Notifications"
              >
                <Bell className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Centre de notifications</DialogTitle>
              </DialogHeader>
              <NotificationCenter />
            </DialogContent>
          </Dialog>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="h-9 px-2 gap-2 hover:bg-accent"
              >
               <Avatar className="h-7 w-7">
                 <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.display_name || user?.email} />
                 <AvatarFallback className="bg-gradient-to-br from-primary to-primary-glow text-primary-foreground text-xs">
                   {profile?.display_name?.split(' ').map(n => n[0]).join('').toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                 </AvatarFallback>
               </Avatar>
               <div className="hidden sm:flex flex-col items-start">
                 <span className="text-sm font-medium">{profile?.display_name || user?.email}</span>
                 <span className="text-xs text-muted-foreground capitalize">{profile?.role}</span>
               </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 z-50">
               <DropdownMenuLabel className="flex items-center gap-3 p-3">
                 <Avatar className="h-10 w-10">
                   <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.display_name || user?.email} />
                   <AvatarFallback className="bg-gradient-to-br from-primary to-primary-glow text-primary-foreground">
                     {profile?.display_name?.split(' ').map(n => n[0]).join('').toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                   </AvatarFallback>
                 </Avatar>
                 <div className="flex-1">
                   <div className="font-medium">{profile?.display_name || user?.email}</div>
                   <div className="text-sm text-muted-foreground">{user?.email}</div>
                   <Badge variant="outline" className="mt-1 capitalize text-xs">
                     {profile?.role}
                   </Badge>
                 </div>
               </DropdownMenuLabel>
              <DropdownMenuSeparator />
               <Dialog open={showProfile} onOpenChange={(isOpen) => handleDialogChange(isOpen, setShowProfile)}>
                 <DialogTrigger asChild>
                   <DropdownMenuItem 
                     className="gap-2 cursor-pointer"
                     onSelect={(e) => {
                       e.preventDefault();
                       setShowProfile(true);
                     }}
                   >
                     <User className="h-4 w-4" />
                     <span>Profil</span>
                   </DropdownMenuItem>
                 </DialogTrigger>
                 <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
                   <DialogHeader>
                     <DialogTitle>Profil utilisateur</DialogTitle>
                   </DialogHeader>
                   <UserProfile onClose={() => setShowProfile(false)} />
                 </DialogContent>
               </Dialog>
               <DropdownMenuItem 
                 className="gap-2 cursor-pointer"
                 onClick={() => setShowNotifications(true)}
               >
                 <Bell className="h-4 w-4" />
                 <span>Notifications</span>
               </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="gap-2 cursor-pointer text-destructive focus:text-destructive" 
                onClick={signOut}
              >
                <LogOut className="h-4 w-4" />
                <span>Déconnexion</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}