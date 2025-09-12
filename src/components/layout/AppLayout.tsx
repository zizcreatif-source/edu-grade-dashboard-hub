import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-background via-background to-accent/5">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <AppHeader />
          <main className="flex-1 p-2 sm:p-4 lg:p-6">
            <div className="max-w-7xl mx-auto w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}