import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { Volunteer, Incident, InventoryItem } from "@shared/schema";
import { redirectToSignIn } from "@/lib/authRedirect";
import { useToast } from "@/hooks/use-toast";
import { Download, FileText, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from "recharts";

const COLORS = ['#FF6B35', '#004E89', '#F77F00', '#06A77D', '#8338EC', '#06FFA5'];

export default function MISReports() {
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

  // Data processing
  const districts = Array.from(new Set(volunteers.map(v => v.district)));
  
  const districtData = districts.map(district => ({
    name: district,
    volunteers: volunteers.filter(v => v.district === district).length,
    incidents: incidents.filter(i => i.district === district).length,
    inventory: inventory.filter(i => i.district === district).length,
  }));

  const volunteerStatusData = [
    { name: "Pending", value: volunteers.filter(v => v.status === "pending").length },
    { name: "Approved", value: volunteers.filter(v => v.status === "approved").length },
    { name: "Rejected", value: volunteers.filter(v => v.status === "rejected").length },
  ];

  const incidentSeverityData = [
    { severity: "Low", count: incidents.filter(i => i.severity === "low").length },
    { severity: "Medium", count: incidents.filter(i => i.severity === "medium").length },
    { severity: "High", count: incidents.filter(i => i.severity === "high").length },
    { severity: "Critical", count: incidents.filter(i => i.severity === "critical").length },
  ];

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
      
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              MIS Reports & Analytics
            </h1>
            <p className="text-muted-foreground">
              Comprehensive data visualization and reporting dashboard
            </p>
          </div>

          {/* Export Buttons */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Export Reports</CardTitle>
              <CardDescription>Download data in various formats</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <Button className="w-full" variant="default" data-testid="button-export-excel">
                  <Download className="mr-2 h-4 w-4" />
                  Export to Excel
                </Button>
                <Button className="w-full" variant="outline" data-testid="button-export-pdf">
                  <Download className="mr-2 h-4 w-4" />
                  Export to PDF
                </Button>
                <Button className="w-full" variant="outline" data-testid="button-export-csv">
                  <Download className="mr-2 h-4 w-4" />
                  Export to CSV
                </Button>
                <Button className="w-full" variant="outline" data-testid="button-print">
                  <FileText className="mr-2 h-4 w-4" />
                  Print Report
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* District-wise Distribution */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>District-wise Resource Distribution</CardTitle>
              <CardDescription>Volunteers, incidents, and inventory across all districts</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Volunteer Status */}
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
                      outerRadius={100}
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

            {/* Incident Severity */}
            <Card>
              <CardHeader>
                <CardTitle>Incident Severity Analysis</CardTitle>
                <CardDescription>Distribution by severity level</CardDescription>
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
          </div>

          {/* Monthly Trends */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Monthly Trends</CardTitle>
              <CardDescription>Volunteer registrations and incidents over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="volunteers" stroke="#004E89" strokeWidth={3} name="Volunteers" />
                  <Line type="monotone" dataKey="incidents" stroke="#FF6B35" strokeWidth={3} name="Incidents" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Cumulative Growth */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Cumulative Growth Analysis</CardTitle>
              <CardDescription>Overall performance trends</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="volunteers" stackId="1" stroke="#004E89" fill="#004E89" fillOpacity={0.6} name="Volunteers" />
                  <Area type="monotone" dataKey="incidents" stackId="1" stroke="#FF6B35" fill="#FF6B35" fillOpacity={0.6} name="Incidents" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Summary Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Summary Statistics</CardTitle>
              <CardDescription>Key metrics and insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 border rounded-md">
                  <p className="text-4xl font-bold text-primary">{volunteers.length}</p>
                  <p className="text-sm text-muted-foreground mt-2">Total Volunteers</p>
                </div>
                <div className="text-center p-4 border rounded-md">
                  <p className="text-4xl font-bold text-destructive">{incidents.length}</p>
                  <p className="text-sm text-muted-foreground mt-2">Total Incidents</p>
                </div>
                <div className="text-center p-4 border rounded-md">
                  <p className="text-4xl font-bold text-green-600">{inventory.length}</p>
                  <p className="text-sm text-muted-foreground mt-2">Equipment Items</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
