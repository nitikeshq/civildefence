import { ReactNode } from "react";
import { useLocation } from "wouter";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import cmPhoto from "@assets/cm-photo.jpg";

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface DashboardLayoutProps {
  children: ReactNode;
  navItems: NavItem[];
  title: string;
  subtitle?: string;
}

export default function DashboardLayout({
  children,
  navItems,
  title,
  subtitle,
}: DashboardLayoutProps) {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout", undefined);
      queryClient.clear();
      toast({
        title: "Logged out successfully",
        description: "You have been signed out of your account",
      });
      setLocation("/signin");
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar
          title={title}
          subtitle={subtitle || "Civil Defence, Odisha"}
          navItems={navItems}
          user={
            user
              ? {
                  firstName: user.firstName,
                  lastName: user.lastName,
                  email: user.email,
                }
              : undefined
          }
        />
        <div className="flex flex-col flex-1">
          <header className="flex items-center justify-between gap-4 p-4 border-b min-h-[57px] bg-gradient-to-r from-orange-600 to-orange-500 dark:from-orange-700 dark:to-orange-600">
            <div className="flex items-center gap-4">
              <SidebarTrigger data-testid="button-sidebar-toggle" className="text-white hover:bg-white/20" />
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-white/20">
                  <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                  </svg>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-semibold text-white">Civil Defence Department</p>
                  <p className="text-xs text-white/90">Government of Odisha</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden lg:flex items-center gap-3 px-3 py-1 rounded-md bg-white/10 backdrop-blur-sm">
                <img 
                  src={cmPhoto} 
                  alt="Hon'ble Chief Minister"
                  className="h-10 w-10 rounded-full object-cover ring-2 ring-white/30"
                  data-testid="img-cm-photo"
                />
                <div className="text-right">
                  <p className="text-xs text-white/80">Hon'ble Chief Minister</p>
                  <p className="text-xs font-medium text-white">Mohan Ch. Majhi</p>
                </div>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
                data-testid="button-logout"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </header>
          <main className="flex-1 overflow-auto bg-background">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
