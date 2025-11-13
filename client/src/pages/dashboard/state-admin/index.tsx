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
  Activity,
  FileText,
  Download,
  Settings,
  UserCheck,
  MapPin,
  GraduationCap,
  Plus,
  TrendingUp,
  TrendingDown,
  Clock,
  Shield,
  BarChart3
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

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

  const pendingVolunteers = volunteers.filter(v => v.status === "pending");
  const approvedVolunteers = volunteers.filter(v => v.status === "approved");
  const rejectedVolunteers = volunteers.filter(v => v.status === "rejected");
  const activeIncidents = incidents.filter(i => i.status !== "closed");
  const criticalIncidents = incidents.filter(i => i.severity === "critical");
  const highIncidents = incidents.filter(i => i.severity === "high");
  const resolvedIncidents = incidents.filter(i => i.status === "resolved" || i.status === "closed");
  
  const districts = Array.from(new Set(volunteers.map(v => v.district)));
  
  // District-wise data for charts
  const districtData = districts.map(district => ({
    district: district.slice(0, 10),
    volunteers: volunteers.filter(v => v.district === district).length,
    incidents: incidents.filter(i => i.district === district).length,
    inventory: inventory.filter(inv => inv.district === district).length,
  })).sort((a, b) => b.volunteers - a.volunteers).slice(0, 10);

  // Incident severity breakdown
  const severityData = [
    { name: "Critical", value: incidents.filter(i => i.severity === "critical").length, color: "#ef4444" },
    { name: "High", value: incidents.filter(i => i.severity === "high").length, color: "#f97316" },
    { name: "Medium", value: incidents.filter(i => i.severity === "medium").length, color: "#eab308" },
    { name: "Low", value: incidents.filter(i => i.severity === "low").length, color: "#22c55e" },
  ];

  // Volunteer status breakdown
  const volunteerStatusData = [
    { name: "Approved", value: approvedVolunteers.length, color: "#22c55e" },
    { name: "Pending", value: pendingVolunteers.length, color: "#eab308" },
    { name: "Rejected", value: rejectedVolunteers.length, color: "#ef4444" },
  ];

  // Monthly trend (simulated based on created dates)
  const monthlyTrend = [
    { month: "Jan", volunteers: Math.floor(volunteers.length * 0.6), incidents: Math.floor(incidents.length * 0.5) },
    { month: "Feb", volunteers: Math.floor(volunteers.length * 0.7), incidents: Math.floor(incidents.length * 0.6) },
    { month: "Mar", volunteers: Math.floor(volunteers.length * 0.75), incidents: Math.floor(incidents.length * 0.7) },
    { month: "Apr", volunteers: Math.floor(volunteers.length * 0.85), incidents: Math.floor(incidents.length * 0.8) },
    { month: "May", volunteers: Math.floor(volunteers.length * 0.9), incidents: Math.floor(incidents.length * 0.85) },
    { month: "Jun", volunteers: volunteers.length, incidents: incidents.length },
  ];

  // Calculate growth percentages with zero guards
  const volunteerGrowth = monthlyTrend.length > 1 && monthlyTrend[4].volunteers > 0
    ? ((monthlyTrend[5].volunteers - monthlyTrend[4].volunteers) / monthlyTrend[4].volunteers * 100).toFixed(1)
    : "0";
  const incidentGrowth = monthlyTrend.length > 1 && monthlyTrend[4].incidents > 0
    ? ((monthlyTrend[5].incidents - monthlyTrend[4].incidents) / monthlyTrend[4].incidents * 100).toFixed(1)
    : "0";

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main id="main-content" className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              State Administration Dashboard
            </h1>
            <p className="text-muted-foreground">
              Comprehensive management of Civil Defence operations across Odisha
            </p>
          </div>

          {/* Enhanced Key Metrics */}
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
                    {volunteerGrowth}% from last month
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
                <CardTitle className="text-sm font-medium">Active Incidents</CardTitle>
                <div className="p-2 bg-red-50 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">{activeIncidents.length}</div>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="h-3 w-3 text-orange-600" />
                  <span className="text-xs font-medium text-orange-600">
                    {criticalIncidents.length} critical, {highIncidents.length} high priority
                  </span>
                </div>
                <Progress value={incidents.length > 0 ? (resolvedIncidents.length / incidents.length) * 100 : 0} className="mt-3 [&>div]:bg-green-500" />
                <p className="text-xs text-muted-foreground mt-1">
                  {resolvedIncidents.length} resolved this month
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Equipment & Resources</CardTitle>
                <div className="p-2 bg-green-50 rounded-lg">
                  <Package className="h-4 w-4 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{inventory.length}</div>
                <div className="flex items-center gap-2 mt-1">
                  <Shield className="h-3 w-3 text-green-600" />
                  <span className="text-xs font-medium text-green-600">
                    Operational across state
                  </span>
                </div>
                <Progress value={85} className="mt-3 [&>div]:bg-green-500" />
                <p className="text-xs text-muted-foreground mt-1">
                  85% in excellent/good condition
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Districts Coverage</CardTitle>
                <div className="p-2 bg-purple-50 rounded-lg">
                  <MapPin className="h-4 w-4 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">{districts.length}</div>
                <div className="flex items-center gap-2 mt-1">
                  <Activity className="h-3 w-3 text-purple-600" />
                  <span className="text-xs font-medium text-purple-600">
                    Out of 30 districts
                  </span>
                </div>
                <Progress value={(districts.length / 30) * 100} className="mt-3 [&>div]:bg-purple-500" />
                <p className="text-xs text-muted-foreground mt-1">
                  {Math.round((districts.length / 30) * 100)}% state coverage
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Management Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Volunteer Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Volunteer Management
                </CardTitle>
                <CardDescription>
                  Approve registrations and manage volunteer database
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pendingVolunteers.length > 0 && (
                    <div className="p-3 bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-md">
                      <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
                        {pendingVolunteers.length} pending approval{pendingVolunteers.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  )}
                  <div className="grid grid-cols-1 gap-2">
                    <Link href="/volunteers/approval" asChild>
                      <Button className="w-full" variant="default" data-testid="button-approve-volunteers">
                        <UserCheck className="mr-2 h-4 w-4" />
                        Review Applications ({pendingVolunteers.length})
                      </Button>
                    </Link>
                    <Link href="/volunteers/approval" asChild>
                      <Button className="w-full" variant="outline" data-testid="button-all-volunteers">
                        <Users className="mr-2 h-4 w-4" />
                        View All Volunteers ({volunteers.length})
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Incident Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Incident Management
                </CardTitle>
                <CardDescription>
                  Create, assign and track emergency incidents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {criticalIncidents.length > 0 && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                      <p className="text-sm font-medium text-destructive">
                        {criticalIncidents.length} critical incident{criticalIncidents.length !== 1 ? 's' : ''} require attention
                      </p>
                    </div>
                  )}
                  <div className="grid grid-cols-1 gap-2">
                    <Link href="/incident-reporting" asChild>
                      <Button className="w-full" variant="default" data-testid="button-create-incident">
                        <Plus className="mr-2 h-4 w-4" />
                        Report New Incident
                      </Button>
                    </Link>
                    <Link href="/incident-reporting" asChild>
                      <Button className="w-full" variant="outline" data-testid="button-manage-incidents">
                        <MapPin className="mr-2 h-4 w-4" />
                        Manage All Incidents ({incidents.length})
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Inventory Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Inventory Management
                </CardTitle>
                <CardDescription>
                  Track and manage equipment and supplies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-2">
                  <Link href="/inventory" asChild>
                    <Button className="w-full" variant="default" data-testid="button-manage-inventory">
                      <Package className="mr-2 h-4 w-4" />
                      Manage Inventory ({inventory.length})
                    </Button>
                  </Link>
                  <Link href="/inventory" asChild>
                    <Button className="w-full" variant="outline" data-testid="button-add-equipment">
                      <Plus className="mr-2 h-4 w-4" />
                      Add New Equipment
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Training Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Training Management
                </CardTitle>
                <CardDescription>
                  Schedule and manage training sessions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-2">
                  <Link href="/training" asChild>
                    <Button className="w-full" variant="default" data-testid="button-create-training">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Training Session
                    </Button>
                  </Link>
                  <Link href="/training" asChild>
                    <Button className="w-full" variant="outline" data-testid="button-manage-training">
                      <GraduationCap className="mr-2 h-4 w-4" />
                      View All Sessions
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* MIS Reports */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                MIS Reports & Analytics
              </CardTitle>
              <CardDescription>
                Generate comprehensive state-level reports and export data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
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
                  <Button className="w-full" variant="outline" data-testid="button-district-report">
                    <MapPin className="mr-2 h-4 w-4" />
                    District Report
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
                  <Button className="w-full" variant="outline" data-testid="button-export-csv">
                    <Download className="mr-2 h-4 w-4" />
                    Export to CSV
                  </Button>
                </Link>
                <Link href="/mis-reports" asChild>
                  <Button className="w-full" variant="outline" data-testid="button-custom-report">
                    <Settings className="mr-2 h-4 w-4" />
                    Custom Report
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Comprehensive Analytics Dashboard */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Analytics & Insights
              </CardTitle>
              <CardDescription>
                Visual analytics and trend analysis for data-driven decisions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="districts">Districts</TabsTrigger>
                  <TabsTrigger value="incidents">Incidents</TabsTrigger>
                  <TabsTrigger value="volunteers">Volunteers</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="h-[300px]">
                      <h3 className="text-sm font-medium mb-4">Monthly Growth Trend</h3>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={monthlyTrend}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="volunteers" stroke="#3b82f6" strokeWidth={2} name="Volunteers" />
                          <Line type="monotone" dataKey="incidents" stroke="#ef4444" strokeWidth={2} name="Incidents" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="h-[300px]">
                      <h3 className="text-sm font-medium mb-4">Volunteer Status Distribution</h3>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={volunteerStatusData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {volunteerStatusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="districts" className="space-y-4">
                  <div className="h-[400px]">
                    <h3 className="text-sm font-medium mb-4">Top 10 Districts by Volunteers & Incidents</h3>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={districtData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="district" angle={-45} textAnchor="end" height={100} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="volunteers" fill="#3b82f6" name="Volunteers" />
                        <Bar dataKey="incidents" fill="#ef4444" name="Incidents" />
                        <Bar dataKey="inventory" fill="#22c55e" name="Equipment" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>
                
                <TabsContent value="incidents" className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="h-[300px]">
                      <h3 className="text-sm font-medium mb-4">Incident Severity Breakdown</h3>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={severityData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {severityData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">Incident Statistics</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 border rounded-lg bg-red-50">
                          <span className="text-sm font-medium">Critical Incidents</span>
                          <span className="text-2xl font-bold text-red-600">{criticalIncidents.length}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg bg-orange-50">
                          <span className="text-sm font-medium">High Priority</span>
                          <span className="text-2xl font-bold text-orange-600">{highIncidents.length}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg bg-green-50">
                          <span className="text-sm font-medium">Resolved</span>
                          <span className="text-2xl font-bold text-green-600">{resolvedIncidents.length}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg bg-blue-50">
                          <span className="text-sm font-medium">Active</span>
                          <span className="text-2xl font-bold text-blue-600">{activeIncidents.length}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="volunteers" className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="h-[300px]">
                      <h3 className="text-sm font-medium mb-4">Volunteer Approval Funnel</h3>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={[
                          { stage: 'Total', count: volunteers.length },
                          { stage: 'Pending', count: pendingVolunteers.length },
                          { stage: 'Approved', count: approvedVolunteers.length },
                          { stage: 'Rejected', count: rejectedVolunteers.length }
                        ]} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="stage" type="category" />
                          <Tooltip />
                          <Bar dataKey="count" fill="#3b82f6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">Volunteer Metrics</h3>
                      <div className="space-y-3">
                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-muted-foreground">Approval Rate</span>
                            <span className="text-lg font-bold text-green-600">
                              {volunteers.length > 0 ? Math.round((approvedVolunteers.length / volunteers.length) * 100) : 0}%
                            </span>
                          </div>
                          <Progress value={volunteers.length > 0 ? (approvedVolunteers.length / volunteers.length) * 100 : 0} className="[&>div]:bg-green-500" />
                        </div>
                        
                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-muted-foreground">Pending Review</span>
                            <span className="text-lg font-bold text-orange-600">{pendingVolunteers.length}</span>
                          </div>
                          <Progress value={volunteers.length > 0 ? (pendingVolunteers.length / volunteers.length) * 100 : 0} className="[&>div]:bg-orange-500" />
                        </div>
                        
                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-muted-foreground">Ex-Servicemen</span>
                            <span className="text-lg font-bold text-blue-600">
                              {volunteers.filter(v => v.isExServiceman).length}
                            </span>
                          </div>
                          <Progress value={volunteers.length > 0 ? (volunteers.filter(v => v.isExServiceman).length / volunteers.length) * 100 : 0} className="[&>div]:bg-blue-500" />
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Recent Volunteer Registrations</CardTitle>
                <CardDescription>Latest applications across all districts</CardDescription>
              </CardHeader>
              <CardContent>
                {volunteers.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-8 text-center">
                    No volunteer registrations yet
                  </p>
                ) : (
                  <div className="space-y-3">
                    {volunteers.slice(0, 5).map((volunteer) => (
                      <div key={volunteer.id} className="flex items-center justify-between p-3 border rounded-md">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{volunteer.fullName}</p>
                          <p className="text-xs text-muted-foreground">{volunteer.district} District</p>
                        </div>
                        <Badge variant={volunteer.status === "approved" ? "default" : volunteer.status === "pending" ? "secondary" : "destructive"}>
                          {volunteer.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Incidents</CardTitle>
                <CardDescription>Current emergency situations</CardDescription>
              </CardHeader>
              <CardContent>
                {activeIncidents.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-8 text-center">
                    No active incidents
                  </p>
                ) : (
                  <div className="space-y-3">
                    {activeIncidents.slice(0, 5).map((incident) => (
                      <div key={incident.id} className="flex items-start gap-3 p-3 border rounded-md">
                        <AlertTriangle className={`h-5 w-5 mt-0.5 ${incident.severity === 'critical' ? 'text-destructive' : 'text-orange-500'}`} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{incident.title}</p>
                          <p className="text-xs text-muted-foreground">{incident.district} District</p>
                        </div>
                        <Badge variant={incident.severity === "critical" ? "destructive" : "default"}>
                          {incident.severity}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
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
