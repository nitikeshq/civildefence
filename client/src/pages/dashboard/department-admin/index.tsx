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
  Download
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area } from "recharts";

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
  const activeIncidents = incidents.filter(i => i.status !== "closed");
  
  // District-wise volunteer distribution
  const districtData = Array.from(new Set(volunteers.map(v => v.district))).map(district => ({
    district,
    volunteers: volunteers.filter(v => v.district === district).length,
    incidents: incidents.filter(i => i.district === district).length,
  }));

  // Monthly trend data (mock data for demonstration)
  const monthlyTrend = [
    { month: "Jan", volunteers: 45, incidents: 12 },
    { month: "Feb", volunteers: 52, incidents: 15 },
    { month: "Mar", volunteers: 61, incidents: 18 },
    { month: "Apr", volunteers: 73, incidents: 14 },
    { month: "May", volunteers: 85, incidents: 20 },
    { month: "Jun", volunteers: volunteers.length, incidents: incidents.length },
  ];

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
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Volunteers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{volunteers.length}</div>
                <p className="text-xs text-muted-foreground">
                  {approvedVolunteers.length} approved
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
                  {activeIncidents.length} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Inventory</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{inventory.length}</div>
                <p className="text-xs text-muted-foreground">
                  Across all districts
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Districts Covered</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{districtData.length}</div>
                <p className="text-xs text-muted-foreground">
                  Active operations
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
