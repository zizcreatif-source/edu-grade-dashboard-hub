import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  ClipboardList, 
  Settings,
  GraduationCap,
  Globe
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { SyncStatus } from "@/components/offline/SyncStatus";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";

const navigationItems = [
  { 
    title: "Dashboard", 
    url: "/dashboard", 
    icon: LayoutDashboard,
    description: "Vue d'ensemble"
  },
  { 
    title: "Cours", 
    url: "/cours", 
    icon: BookOpen,
    description: "Gestion des cours"
  },
  { 
    title: "Étudiants", 
    url: "/etudiants", 
    icon: Users,
    description: "Liste des étudiants"
  },
  { 
    title: "Notes", 
    url: "/notes", 
    icon: ClipboardList,
    description: "Saisie et consultation"
  },
  { 
    title: "Ma Page", 
    url: "/", 
    icon: Globe,
    description: "Page d'accueil publique"
  },
  { 
    title: "Paramètres", 
    url: "/parametres", 
    icon: Settings,
    description: "Configuration"
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return currentPath === "/dashboard";
    }
    return currentPath.startsWith(path);
  };

  const getNavClasses = (path: string) => {
    const baseClasses = "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200";
    if (isActive(path)) {
      return `${baseClasses} bg-primary text-primary-foreground shadow-sm`;
    }
    return `${baseClasses} text-muted-foreground hover:bg-accent hover:text-accent-foreground`;
  };

  return (
    <Sidebar className={collapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarHeader className="border-b border-border/40 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-glow">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            {!collapsed && (
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                  EduGrade
                </h1>
                <p className="text-xs text-muted-foreground">Gestion des notes</p>
              </div>
            )}
          </div>
          {!collapsed && (
            <div className="flex items-center gap-1">
              <SyncStatus />
              <NotificationCenter />
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            {!collapsed ? "Navigation" : ""}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end={item.url === "/"} 
                      className={getNavClasses(item.url)}
                      title={collapsed ? item.title : undefined}
                    >
                      <item.icon className={`${collapsed ? "h-5 w-5" : "h-4 w-4"} shrink-0`} />
                      {!collapsed && (
                        <div className="flex-1">
                          <div className="font-medium">{item.title}</div>
                          <div className="text-xs opacity-70">{item.description}</div>
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}