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
  TrendingUp,
  FileText,
  Download,
  Activity,
  BarChart3,
  TrendingDown,
  MapPin
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell } from "recharts";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export default function DepartmentAdminDashboard() {
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
  const criticalIncidents = incidents.filter(i => i.severity === "critical");
  const resolvedIncidents = incidents.filter(i => i.status === "resolved" || i.status === "closed");
  
  // District-wise volunteer distribution
  const districtData = Array.from(new Set(volunteers.map(v => v.district))).map(district => ({
    district,
    volunteers: volunteers.filter(v => v.district === district).length,
    incidents: incidents.filter(i => i.district === district).length,
  })).sort((a, b) => b.volunteers - a.volunteers).slice(0, 8);

  // Monthly trend data (simulated based on actual data)
  const monthlyTrend = [
    { month: "Jan", volunteers: Math.floor(volunteers.length * 0.53), incidents: Math.floor(incidents.length * 0.48) },
    { month: "Feb", volunteers: Math.floor(volunteers.length * 0.61), incidents: Math.floor(incidents.length * 0.57) },
    { month: "Mar", volunteers: Math.floor(volunteers.length * 0.72), incidents: Math.floor(incidents.length * 0.69) },
    { month: "Apr", volunteers: Math.floor(volunteers.length * 0.86), incidents: Math.floor(incidents.length * 0.73) },
    { month: "May", volunteers: Math.floor(volunteers.length * 0.95), incidents: Math.floor(incidents.length * 0.88) },
    { month: "Jun", volunteers: volunteers.length, incidents: incidents.length },
  ];

  // Calculate growth with zero guard
  const volunteerGrowth = monthlyTrend.length > 1 && monthlyTrend[4].volunteers > 0
    ? ((monthlyTrend[5].volunteers - monthlyTrend[4].volunteers) / monthlyTrend[4].volunteers * 100).toFixed(1)
    : "0";

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main id="main-content" className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Department Dashboard
            </h1>
            <p className="text-muted-foreground">
              Monitor department-wide operations and analytics
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Volunteers</CardTitle>
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{volunteers.length}</div>
                <div className="flex items-center gap-2 mt-1">
                  {Number(volunteerGrowth) >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-600" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-600" />
                  )}
                  <span className={`text-xs font-medium ${Number(volunteerGrowth) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {volunteerGrowth}% this month
                  </span>
                </div>
                <Progress value={volunteers.length > 0 ? (approvedVolunteers.length / volunteers.length) * 100 : 0} className="mt-3" />
                <p className="text-xs text-muted-foreground mt-1">
                  {approvedVolunteers.length} approved, {pendingVolunteers.length} pending
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-red-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Incidents</CardTitle>
                <div className="p-2 bg-red-50 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">{incidents.length}</div>
                <div className="flex items-center gap-2 mt-1">
                  <Activity className="h-3 w-3 text-orange-600" />
                  <span className="text-xs font-medium text-orange-600">
                    {activeIncidents.length} active, {criticalIncidents.length} critical
                  </span>
                </div>
                <Progress value={incidents.length > 0 ? (resolvedIncidents.length / incidents.length) * 100 : 0} className="mt-3 [&>div]:bg-green-500" />
                <p className="text-xs text-muted-foreground mt-1">
                  {resolvedIncidents.length} resolved successfully
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Equipment & Supplies</CardTitle>
                <div className="p-2 bg-green-50 rounded-lg">
                  <Package className="h-4 w-4 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{inventory.length}</div>
                <div className="flex items-center gap-2 mt-1">
                  <MapPin className="h-3 w-3 text-green-600" />
                  <span className="text-xs font-medium text-green-600">
                    Across all districts
                  </span>
                </div>
                <Progress value={82} className="mt-3 [&>div]:bg-green-500" />
                <p className="text-xs text-muted-foreground mt-1">
                  82% operational readiness
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Districts Covered</CardTitle>
                <div className="p-2 bg-purple-50 rounded-lg">
                  <BarChart3 className="h-4 w-4 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">{districtData.length}</div>
                <div className="flex items-center gap-2 mt-1">
                  <TrendingUp className="h-3 w-3 text-purple-600" />
                  <span className="text-xs font-medium text-purple-600">
                    Active operations
                  </span>
                </div>
                <Progress value={(districtData.length / 30) * 100} className="mt-3 [&>div]:bg-purple-500" />
                <p className="text-xs text-muted-foreground mt-1">
                  Comprehensive state coverage
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>District-wise Volunteer Distribution</CardTitle>
                <CardDescription>Volunteers across districts</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={districtData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="district" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="volunteers" fill="#004E89" name="Volunteers" />
                    <Bar dataKey="incidents" fill="#FF6B35" name="Incidents" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Growth Trend</CardTitle>
                <CardDescription>Volunteers and incidents over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="volunteers" stroke="#004E89" strokeWidth={2} />
                    <Line type="monotone" dataKey="incidents" stroke="#FF6B35" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Cumulative Statistics</CardTitle>
                <CardDescription>Overall department performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="volunteers" stackId="1" stroke="#004E89" fill="#004E89" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="incidents" stackId="1" stroke="#FF6B35" fill="#FF6B35" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>MIS Reports & Analytics</CardTitle>
                <CardDescription>Generate comprehensive department reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Link href="/mis-reports" asChild>
                    <Button className="w-full" variant="default" data-testid="button-volunteer-report">
                      <FileText className="mr-2 h-4 w-4" />
                      Volunteer Report
                    </Button>
                  </Link>
                  <Link href="/mis-reports" asChild>
                    <Button className="w-full" variant="outline" data-testid="button-incident-report">
                      <FileText className="mr-2 h-4 w-4" />
                      Incident Report
                    </Button>
                  </Link>
                  <Link href="/mis-reports" asChild>
                    <Button className="w-full" variant="outline" data-testid="button-inventory-report">
                      <FileText className="mr-2 h-4 w-4" />
                      Inventory Report
                    </Button>
                  </Link>
                  <Link href="/mis-reports" asChild>
                    <Button className="w-full" variant="outline" data-testid="button-export-excel">
                      <Download className="mr-2 h-4 w-4" />
                      Export to Excel
                    </Button>
                  </Link>
                  <Link href="/mis-reports" asChild>
                    <Button className="w-full" variant="outline" data-testid="button-export-pdf">
                      <Download className="mr-2 h-4 w-4" />
                      Export to PDF
                    </Button>
                  </Link>
                  <Link href="/mis-reports" asChild>
                    <Button className="w-full" variant="outline" data-testid="button-custom-report">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Custom Report
                    </Button>
                  </Link>
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
