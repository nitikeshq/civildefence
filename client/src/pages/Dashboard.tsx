import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { redirectToSignIn } from "@/lib/authRedirect";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "Please sign in to continue",
        variant: "destructive",
      });
      setTimeout(() => {
        redirectToSignIn();
      }, 500);
      return;
    }

    if (user && isAuthenticated && user.role) {
      // Role-to-path mapping - State and Department Admin merged to unified dashboard
      const rolePaths: Record<string, string> = {
        volunteer: "/dashboard/volunteer",
        district_admin: "/dashboard/district-admin",
        department_admin: "/dashboard/admin",
        state_admin: "/dashboard/admin",
        cms_manager: "/cms/dashboard",
      };

      const targetPath = rolePaths[user.role];
      if (targetPath) {
        setLocation(targetPath);
      } else {
        console.error("Unknown role:", user.role);
        toast({
          title: "Error",
          description: "Unknown user role. Please contact support.",
          variant: "destructive",
        });
        redirectToSignIn();
      }
    }
  }, [user, isAuthenticated, isLoading, setLocation, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-lg">Redirecting to your dashboard...</div>
    </div>
  );
}
