import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function LogoutCard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout", undefined);
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

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case "state_admin":
        return "State Administrator";
      case "department_admin":
        return "Department Administrator";
      case "district_admin":
        return "District Administrator";
      case "volunteer":
        return "Volunteer";
      default:
        return "User";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Settings</CardTitle>
        <CardDescription>Your profile and session management</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-muted rounded-md">
            <User className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="font-medium" data-testid="text-user-name">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-muted-foreground" data-testid="text-user-role">
                {user?.role ? getRoleDisplay(user.role) : "User"}
              </p>
              {user?.district && (
                <p className="text-xs text-muted-foreground">
                  {user.district} District
                </p>
              )}
            </div>
          </div>
          <Button 
            onClick={handleLogout} 
            variant="destructive" 
            className="w-full"
            data-testid="button-logout"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
