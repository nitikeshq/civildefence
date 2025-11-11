import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
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
  TrendingUp,
  FileText,
  Download,
  BarChart3,
  Activity
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, ComposedChart, Area } from "recharts";

const COLORS = ['#FF6B35', '#004E89', '#F77F00', '#06A77D', '#8338EC', '#06FFA5'];

export default function StateAdminDashboard() {
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

  const approvedVolunteers = volunteers.filter(v => v.status === "approved");
  const pendingVolunteers = volunteers.filter(v => v.status === "pending");
  const activeIncidents = incidents.filter(i => i.status !== "closed");
  const resolvedIncidents = incidents.filter(i => i.status === "resolved" || i.status === "closed");

  // State-wide district distribution
  const districtData = Array.from(new Set(volunteers.map(v => v.district))).map(district => ({
    name: district,
    volunteers: volunteers.filter(v => v.district === district).length,
    incidents: incidents.filter(i => i.district === district).length,
    inventory: inventory.filter(i => i.district === district).length,
  }));

  // Volunteer demographics
  const volunteerTypes = [
    { name: "Ex-Servicemen", value: volunteers.filter(v => v.isExServiceman).length },
    { name: "Civilians", value: volunteers.filter(v => !v.isExServiceman).length },
  ];

  // Incident severity state-wide
  const incidentSeverityData = [
    { severity: "Low", count: incidents.filter(i => i.severity === "low").length },
    { severity: "Medium", count: incidents.filter(i => i.severity === "medium").length },
    { severity: "High", count: incidents.filter(i => i.severity === "high").length },
    { severity: "Critical", count: incidents.filter(i => i.severity === "critical").length },
  ];

  // Inventory by category
  const inventoryByCategory = [
    { category: "Medical", count: inventory.filter(i => i.category === "medical_supplies").length },
    { category: "Communication", count: inventory.filter(i => i.category === "communication_equipment").length },
    { category: "Rescue", count: inventory.filter(i => i.category === "rescue_equipment").length },
    { category: "Vehicles", count: inventory.filter(i => i.category === "vehicles").length },
    { category: "Safety", count: inventory.filter(i => i.category === "safety_gear").length },
    { category: "Other", count: inventory.filter(i => i.category === "other").length },
  ];

  // Monthly performance data
  const performanceData = [
    { month: "Jan", volunteers: 145, incidents: 32, resolved: 28 },
    { month: "Feb", volunteers: 162, incidents: 45, resolved: 40 },
    { month: "Mar", volunteers: 181, incidents: 38, resolved: 35 },
    { month: "Apr", volunteers: 203, incidents: 42, resolved: 39 },
    { month: "May", volunteers: 225, incidents: 50, resolved: 46 },
    { month: "Jun", volunteers: volunteers.length, incidents: incidents.length, resolved: resolvedIncidents.length },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              State Administration Dashboard
            </h1>
            <p className="text-muted-foreground">
              Comprehensive oversight of all Civil Defence operations across Odisha
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Volunteers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{volunteers.length}</div>
                <p className="text-xs text-muted-foreground">
                  {approvedVolunteers.length} approved, {pendingVolunteers.length} pending
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Incidents</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{incidents.length}</div>
                <p className="text-xs text-muted-foreground">
                  {activeIncidents.length} active, {resolvedIncidents.length} resolved
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">State Inventory</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{inventory.length}</div>
                <p className="text-xs text-muted-foreground">
                  Equipment across state
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Districts Active</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{districtData.length}</div>
                <p className="text-xs text-muted-foreground">
                  Odisha state coverage
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>District-wise Resource Distribution</CardTitle>
                <CardDescription>Comprehensive view across all districts</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={districtData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="volunteers" fill="#004E89" name="Volunteers" />
                    <Bar dataKey="incidents" fill="#FF6B35" name="Incidents" />
                    <Bar dataKey="inventory" fill="#06A77D" name="Inventory" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Volunteer Demographics</CardTitle>
                <CardDescription>Ex-servicemen vs Civilian volunteers</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={volunteerTypes}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {volunteerTypes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>State-wide Incident Severity Analysis</CardTitle>
                <CardDescription>Breakdown of incidents by severity level</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={incidentSeverityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="severity" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#FF6B35" name="Incidents" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Inventory Distribution by Category</CardTitle>
                <CardDescription>Equipment and supplies across categories</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={inventoryByCategory} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="category" type="category" width={100} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#06A77D" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>State Performance Trends</CardTitle>
              <CardDescription>Volunteers, incidents, and resolution rates over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="volunteers" fill="#004E89" stroke="#004E89" fillOpacity={0.3} />
                  <Bar dataKey="incidents" fill="#FF6B35" />
                  <Line type="monotone" dataKey="resolved" stroke="#06A77D" strokeWidth={3} />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>MIS Reports & Data Export</CardTitle>
              <CardDescription>Comprehensive state-level reporting and analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Button className="w-full" variant="default" data-testid="button-state-summary">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  State Summary Report
                </Button>
                <Button className="w-full" variant="outline" data-testid="button-district-comparison">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  District Comparison
                </Button>
                <Button className="w-full" variant="outline" data-testid="button-performance-analytics">
                  <Activity className="mr-2 h-4 w-4" />
                  Performance Analytics
                </Button>
                <Button className="w-full" variant="outline" data-testid="button-custom-query">
                  <FileText className="mr-2 h-4 w-4" />
                  Custom Query Builder
                </Button>
                <Button className="w-full" variant="outline" data-testid="button-export-excel-all">
                  <Download className="mr-2 h-4 w-4" />
                  Export All Data (Excel)
                </Button>
                <Button className="w-full" variant="outline" data-testid="button-export-pdf-report">
                  <Download className="mr-2 h-4 w-4" />
                  Generate PDF Report
                </Button>
                <Button className="w-full" variant="outline" data-testid="button-export-csv">
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV Data
                </Button>
                <Button className="w-full" variant="outline" data-testid="button-scheduled-reports">
                  <FileText className="mr-2 h-4 w-4" />
                  Scheduled Reports
                </Button>
              </div>
            </CardContent>
          </Card>

          <LogoutCard />
        </div>
      </main>

      <Footer />
    </div>
  );
}
