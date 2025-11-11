import cmPhoto from "@assets/generated_images/Chief_Minister_portrait_photo_7d74c372.png";
import odishaLogo from "@assets/generated_images/Odisha_government_emblem_a49e5a90.png";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/authRedirect";
import { LogOut, User } from "lucide-react";

export default function Header() {
  const { user } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  const getRoleDisplay = (role: string | null | undefined) => {
    switch (role) {
      case "volunteer":
        return "Volunteer";
      case "district_admin":
        return "District Admin";
      case "department_admin":
        return "Department Admin";
      case "state_admin":
        return "State Admin";
      default:
        return "User";
    }
  };

  return (
    <div className="bg-background border-b-4 border-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={odishaLogo}
              alt="Government of Odisha Emblem"
              className="h-16 md:h-20 w-auto"
              data-testid="img-odisha-logo"
            />
          </div>

          <div className="flex-1 text-center">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground leading-tight">
              Civil Defence Department
            </h1>
            <p className="text-sm md:text-base text-muted-foreground mt-1">
              Government of Odisha
            </p>
          </div>

          <div className="flex flex-col items-end gap-3">
            <div className="flex flex-col items-center gap-2">
              <img
                src={cmPhoto}
                alt="Hon'ble Chief Minister of Odisha"
                className="h-16 md:h-20 w-auto rounded-md"
                data-testid="img-cm-photo"
              />
              <p className="text-xs font-medium text-center hidden sm:block">
                Hon'ble Chief Minister
              </p>
            </div>

            {user && (
              <div className="flex items-center gap-3 border-t pt-3">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div className="text-right">
                    <p className="font-medium" data-testid="text-user-name">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground" data-testid="text-user-role">
                      {getRoleDisplay(user.role)}
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={handleLogout} 
                  variant="outline" 
                  size="sm"
                  data-testid="button-logout"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
