import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { redirectToSignIn, getDashboardRouteFromRole } from "@/lib/authRedirect";
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
      // Use centralized redirect logic for consistency
      const targetPath = getDashboardRouteFromRole(user.role);
      setLocation(targetPath);
    }
  }, [user, isAuthenticated, isLoading, setLocation, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-lg">Redirecting to your dashboard...</div>
    </div>
  );
}
