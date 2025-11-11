import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LogoutCard from "@/components/LogoutCard";
import type { Volunteer, Incident, InventoryItem } from "@shared/schema";
import { redirectToSignIn } from "@/lib/authRedirect";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  AlertTriangle, 
  Package, 
  CheckCircle,
  Clock,
  UserPlus,
  FileText
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ['#FF6B35', '#004E89', '#F77F00', '#06A77D'];

export default function DistrictAdminDashboard() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();

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
    enabled: isAuthenticated,
  });

  const { data: incidents = [] } = useQuery<Incident[]>({
    queryKey: ["/api/incidents"],
    enabled: isAuthenticated,
  });

  const { data: inventory = [] } = useQuery<InventoryItem[]>({
    queryKey: ["/api/inventory"],
    enabled: isAuthenticated,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const districtVolunteers = volunteers.filter(v => v.district === user?.district);
  const districtIncidents = incidents.filter(i => i.district === user?.district);
  const districtInventory = inventory.filter(i => i.district === user?.district);

  const pendingVolunteers = districtVolunteers.filter(v => v.status === "pending");
  const approvedVolunteers = districtVolunteers.filter(v => v.status === "approved");
  const activeIncidents = districtIncidents.filter(i => i.status !== "closed");

  // Volunteer status breakdown for pie chart
  const volunteerStatusData = [
    { name: "Pending", value: districtVolunteers.filter(v => v.status === "pending").length },
    { name: "Approved", value: districtVolunteers.filter(v => v.status === "approved").length },
    { name: "Rejected", value: districtVolunteers.filter(v => v.status === "rejected").length },
  ];

  // Incident severity breakdown for bar chart
  const incidentSeverityData = [
    { name: "Low", count: districtIncidents.filter(i => i.severity === "low").length },
    { name: "Medium", count: districtIncidents.filter(i => i.severity === "medium").length },
    { name: "High", count: districtIncidents.filter(i => i.severity === "high").length },
    { name: "Critical", count: districtIncidents.filter(i => i.severity === "critical").length },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              District Administration Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage volunteers and incidents in {user?.district} District
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Volunteers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{districtVolunteers.length}</div>
                <p className="text-xs text-muted-foreground">
                  {approvedVolunteers.length} approved
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{pendingVolunteers.length}</div>
                <p className="text-xs text-muted-foreground">
                  Awaiting your review
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Incidents</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{activeIncidents.length}</div>
                <p className="text-xs text-muted-foreground">
                  Requires attention
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Inventory Items</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{districtInventory.length}</div>
                <p className="text-xs text-muted-foreground">
                  Equipment & supplies
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Volunteer Status Distribution</CardTitle>
                <CardDescription>Breakdown of volunteer applications</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={volunteerStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {volunteerStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Incident Severity Levels</CardTitle>
                <CardDescription>Current incidents by severity</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={incidentSeverityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#FF6B35" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Recent Volunteer Applications</CardTitle>
                <CardDescription>Latest registration requests</CardDescription>
              </CardHeader>
              <CardContent>
                {pendingVolunteers.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-8 text-center">
                    No pending applications
                  </p>
                ) : (
                  <div className="space-y-4">
                    {pendingVolunteers.slice(0, 5).map((volunteer) => (
                      <div key={volunteer.id} className="flex items-center justify-between p-3 border rounded-md">
                        <div className="flex items-center gap-3">
                          <UserPlus className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">{volunteer.fullName}</p>
                            <p className="text-xs text-muted-foreground">{volunteer.email}</p>
                          </div>
                        </div>
                        <Badge variant="secondary">Pending</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>District administration tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3">
                  <Link href="/volunteers/approval">
                    <Button className="w-full" variant="default" data-testid="button-approve-volunteers">
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Review Volunteer Applications ({pendingVolunteers.length})
                    </Button>
                  </Link>
                  <Link href="/incident-reporting">
                    <Button className="w-full" variant="outline" data-testid="button-report-incident">
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      Report New Incident
                    </Button>
                  </Link>
                  <Link href="/inventory">
                    <Button className="w-full" variant="outline" data-testid="button-manage-inventory">
                      <Package className="mr-2 h-4 w-4" />
                      Manage Inventory
                    </Button>
                  </Link>
                  <Button className="w-full" variant="outline" data-testid="button-generate-report">
                    <FileText className="mr-2 h-4 w-4" />
                    Generate District Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <LogoutCard />
        </div>
      </main>

      <Footer />
    </div>
  );
}
