import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { Volunteer, Incident, InventoryItem } from "@shared/schema";
import { redirectToSignIn, logout } from "@/lib/authRedirect";
import { 
  Users, 
  AlertTriangle, 
  Package, 
  FileText,
  LogOut,
  UserPlus,
  AlertCircle,
  Box
} from "lucide-react";

export default function Dashboard() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();

  // Redirect to signin if not authenticated
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
  }, [isAuthenticated, isLoading, toast]);

  const { data: volunteers = [] } = useQuery<Volunteer[]>({ 
    queryKey: ["/api/volunteers"],
    enabled: isAuthenticated 
  });
  const { data: incidents = [] } = useQuery<Incident[]>({ 
    queryKey: ["/api/incidents"],
    enabled: isAuthenticated 
  });
  const { data: inventory = [] } = useQuery<InventoryItem[]>({ 
    queryKey: ["/api/inventory"],
    enabled: isAuthenticated 
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
  };

  const pendingVolunteers = volunteers.filter(v => v.status === "pending");
  const activeIncidents = incidents.filter(i => i.status !== "closed");

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Welcome, {user?.firstName || 'User'}</h1>
              <p className="text-muted-foreground">Civil Defence Department Portal</p>
            </div>
            <Button onClick={handleLogout} variant="outline" data-testid="button-logout">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card data-testid="card-volunteers">
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Volunteers</CardTitle>
                <Users className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-volunteer-count">{volunteers?.length || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {pendingVolunteers.length} pending approval
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-incidents">
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Incidents</CardTitle>
                <AlertTriangle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-incident-count">{activeIncidents.length}</div>
                <p className="text-xs text-muted-foreground">
                  {incidents.length} total reported
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-inventory">
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Inventory Items</CardTitle>
                <Package className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-inventory-count">{inventory.length}</div>
                <p className="text-xs text-muted-foreground">
                  Equipment and supplies
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-reports">
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">MIS Reports</CardTitle>
                <FileText className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">
                  Generated this month
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and operations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/volunteer/register">
                  <Button className="w-full justify-start" variant="outline" data-testid="button-register-volunteer">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Register as Volunteer
                  </Button>
                </Link>
                <Link href="/incidents/report">
                  <Button className="w-full justify-start" variant="outline" data-testid="button-report-incident">
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Report Incident
                  </Button>
                </Link>
                <Link href="/inventory">
                  <Button className="w-full justify-start" variant="outline" data-testid="button-manage-inventory">
                    <Box className="mr-2 h-4 w-4" />
                    Manage Inventory
                  </Button>
                </Link>
                {(user?.role === "district_admin" || user?.role === "department_admin" || user?.role === "state_admin") && (
                  <Link href="/volunteers/approval">
                    <Button className="w-full justify-start" variant="outline" data-testid="button-approve-volunteers">
                      <Users className="mr-2 h-4 w-4" />
                      Approve Volunteers
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest updates and actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingVolunteers.length > 0 && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2" />
                      <div>
                        <p className="text-sm font-medium">{pendingVolunteers.length} volunteer applications pending</p>
                        <p className="text-xs text-muted-foreground">Requires admin approval</p>
                      </div>
                    </div>
                  )}
                  {activeIncidents.length > 0 && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-destructive rounded-full mt-2" />
                      <div>
                        <p className="text-sm font-medium">{activeIncidents.length} active incidents</p>
                        <p className="text-xs text-muted-foreground">Require attention</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                    <div>
                      <p className="text-sm font-medium">System operational</p>
                      <p className="text-xs text-muted-foreground">All services running</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
