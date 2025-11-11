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

    if (user && isAuthenticated) {
      switch (user.role) {
        case "volunteer":
          setLocation("/dashboard/volunteer");
          break;
        case "district_admin":
          setLocation("/dashboard/district-admin");
          break;
        case "department_admin":
          setLocation("/dashboard/department-admin");
          break;
        case "state_admin":
          setLocation("/dashboard/state-admin");
          break;
        default:
          setLocation("/dashboard/volunteer");
      }
    }
  }, [user, isAuthenticated, isLoading, setLocation, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-lg">Redirecting to your dashboard...</div>
    </div>
  );
}
