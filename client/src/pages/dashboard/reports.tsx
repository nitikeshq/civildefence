import { useMemo } from "react";
import { BarChart3, Download, Users, AlertTriangle, Package, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useScopedVolunteers, useScopedIncidents, useScopedInventory } from "@/hooks/useScopedData";
import { getDashboardTitle, getDashboardSubtitle, getNavigationItems, getRolePermissions } from "@/lib/roleUtils";
import { 
  downloadCSV, 
  downloadExcel, 
  prepareVolunteersForExport, 
  prepareIncidentsForExport, 
  prepareInventoryForExport 
} from "@/lib/exportUtils";
import { LayoutDashboard, ClipboardList, Activity } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

const COLORS = ["#FF9933", "#138808", "#000080", "#FFA500", "#FFD700", "#FF4500"];

export default function DashboardReports() {
  const { user } = useAuth();
  const permissions = getRolePermissions(user?.role);

  // Navigation items with icons
  const navItemsWithIcons = getNavigationItems(user?.role).map((item) => {
    const iconMap: Record<string, any> = {
      LayoutDashboard,
      Users,
      AlertTriangle,
      Package,
      BarChart3,
      ClipboardList,
    };
    return {
      ...item,
      icon: iconMap[item.icon] || Activity,
    };
  });

  // Only state-level users can access reports - early return before fetching hooks
  if (permissions.scope !== "state") {
    return (
      <DashboardLayout 
        navItems={navItemsWithIcons} 
        title={getDashboardTitle(user?.role)}
        subtitle={getDashboardSubtitle(user?.role, user?.district)}
      >
        <div className="p-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">
                Reports are only available for state-level administrators
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // Only fetch data after authorization check
  const { data: volunteers = [] } = useScopedVolunteers();
  const { data: incidents = [] } = useScopedIncidents();
  const { data: inventory = [] } = useScopedInventory();

  // ========== 1. VOLUNTEER PIPELINE REPORT ==========
  const volunteerStats = useMemo(() => {
    const byStatus = {
      pending: volunteers.filter((v) => v.status === "pending").length,
      approved: volunteers.filter((v) => v.status === "approved").length,
      rejected: volunteers.filter((v) => v.status === "rejected").length,
    };

    const byDistrict = volunteers.reduce((acc, v) => {
      const district = v.district || "Unknown";
      acc[district] = (acc[district] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const districtData = Object.entries(byDistrict)
      .map(([district, count]) => ({ district, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 districts

    const statusData = [
      { name: "Pending", value: byStatus.pending, color: COLORS[0] },
      { name: "Approved", value: byStatus.approved, color: COLORS[1] },
      { name: "Rejected", value: byStatus.rejected, color: COLORS[2] },
    ];

    return { byStatus, districtData, statusData };
  }, [volunteers]);

  // ========== 2. INCIDENT RESPONSE REPORT ==========
  const incidentStats = useMemo(() => {
    const bySeverity = {
      low: incidents.filter((i) => i.severity === "low").length,
      medium: incidents.filter((i) => i.severity === "medium").length,
      high: incidents.filter((i) => i.severity === "high").length,
      critical: incidents.filter((i) => i.severity === "critical").length,
    };

    const byStatus = {
      reported: incidents.filter((i) => i.status === "reported").length,
      assigned: incidents.filter((i) => i.status === "assigned").length,
      in_progress: incidents.filter((i) => i.status === "in_progress").length,
      resolved: incidents.filter((i) => i.status === "resolved").length,
      closed: incidents.filter((i) => i.status === "closed").length,
    };

    const severityData = [
      { name: "Low", value: bySeverity.low },
      { name: "Medium", value: bySeverity.medium },
      { name: "High", value: bySeverity.high },
      { name: "Critical", value: bySeverity.critical },
    ];

    const statusData = [
      { name: "Reported", count: byStatus.reported },
      { name: "Assigned", count: byStatus.assigned },
      { name: "In Progress", count: byStatus.in_progress },
      { name: "Resolved", count: byStatus.resolved },
      { name: "Closed", count: byStatus.closed },
    ];

    return { bySeverity, byStatus, severityData, statusData };
  }, [incidents]);

  // ========== 3. INVENTORY HEALTH REPORT ==========
  const inventoryStats = useMemo(() => {
    const byCategory = inventory.reduce((acc, item) => {
      const category = item.category || "Unknown";
      acc[category] = (acc[category] || 0) + (item.quantity || 0);
      return acc;
    }, {} as Record<string, number>);

    const byCondition = {
      excellent: inventory.filter((i) => i.condition === "excellent").length,
      good: inventory.filter((i) => i.condition === "good").length,
      fair: inventory.filter((i) => i.condition === "fair").length,
      poor: inventory.filter((i) => i.condition === "poor").length,
      needs_repair: inventory.filter((i) => i.condition === "needs_repair").length,
    };

    const categoryData = Object.entries(byCategory).map(([category, quantity]) => ({
      category,
      quantity,
    }));

    const conditionData = [
      { name: "Excellent", value: byCondition.excellent, color: COLORS[1] },
      { name: "Good", value: byCondition.good, color: COLORS[4] },
      { name: "Fair", value: byCondition.fair, color: COLORS[3] },
      { name: "Poor", value: byCondition.poor, color: COLORS[0] },
      { name: "Needs Repair", value: byCondition.needs_repair, color: COLORS[2] },
    ];

    const lowStockCount = inventory.filter((i) => i.quantity < 10).length;

    return { byCategory, byCondition, categoryData, conditionData, lowStockCount };
  }, [inventory]);

  // ========== 4. READINESS KPIs ==========
  const readinessKPIs = useMemo(() => {
    const totalVolunteers = volunteers.length;
    const activeVolunteers = volunteers.filter((v) => v.status === "approved").length;
    const volunteerReadiness = totalVolunteers > 0 ? (activeVolunteers / totalVolunteers) * 100 : 0;

    const totalIncidents = incidents.length;
    const resolvedIncidents = incidents.filter(
      (i) => i.status === "resolved" || i.status === "closed"
    ).length;
    const incidentResolutionRate = totalIncidents > 0 ? (resolvedIncidents / totalIncidents) * 100 : 0;

    const totalInventory = inventory.length;
    const goodInventory = inventory.filter(
      (i) => i.condition === "excellent" || i.condition === "good"
    ).length;
    const inventoryHealth = totalInventory > 0 ? (goodInventory / totalInventory) * 100 : 0;

    const overallReadiness = (volunteerReadiness + incidentResolutionRate + inventoryHealth) / 3;

    return {
      volunteerReadiness: volunteerReadiness.toFixed(1),
      incidentResolutionRate: incidentResolutionRate.toFixed(1),
      inventoryHealth: inventoryHealth.toFixed(1),
      overallReadiness: overallReadiness.toFixed(1),
    };
  }, [volunteers, incidents, inventory]);

  // Export handlers
  const handleExportVolunteers = (format: "csv" | "excel") => {
    const data = prepareVolunteersForExport(volunteers);
    if (format === "csv") {
      downloadCSV(data, "volunteers-report");
    } else {
      downloadExcel(data, "volunteers-report");
    }
  };

  const handleExportIncidents = (format: "csv" | "excel") => {
    const data = prepareIncidentsForExport(incidents);
    if (format === "csv") {
      downloadCSV(data, "incidents-report");
    } else {
      downloadExcel(data, "incidents-report");
    }
  };

  const handleExportInventory = (format: "csv" | "excel") => {
    const data = prepareInventoryForExport(inventory);
    if (format === "csv") {
      downloadCSV(data, "inventory-report");
    } else {
      downloadExcel(data, "inventory-report");
    }
  };

  return (
    <DashboardLayout 
      navItems={navItemsWithIcons} 
      title={getDashboardTitle(user?.role)}
      subtitle={getDashboardSubtitle(user?.role, user?.district)}
    >
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive insights and data exports for Odisha Civil Defence
          </p>
        </div>

        {/* ========== READINESS KPIs ========== */}
        <div>
          <h2 className="text-xl font-bold mb-4">Overall Readiness KPIs</h2>
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overall Readiness</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{readinessKPIs.overallReadiness}%</div>
                <p className="text-xs text-muted-foreground mt-1">System-wide score</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Volunteer Readiness</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{readinessKPIs.volunteerReadiness}%</div>
                <p className="text-xs text-muted-foreground mt-1">Approved volunteers</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Incident Resolution</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{readinessKPIs.incidentResolutionRate}%</div>
                <p className="text-xs text-muted-foreground mt-1">Resolved incidents</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Inventory Health</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{readinessKPIs.inventoryHealth}%</div>
                <p className="text-xs text-muted-foreground mt-1">Good condition items</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ========== 1. VOLUNTEER PIPELINE REPORT ========== */}
        <Card>
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4">
            <div>
              <CardTitle>Volunteer Pipeline Report</CardTitle>
              <CardDescription>Volunteer distribution and approval status</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleExportVolunteers("csv")}
                data-testid="button-export-volunteers-csv"
              >
                <Download className="h-4 w-4 mr-1" />
                CSV
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleExportVolunteers("excel")}
                data-testid="button-export-volunteers-excel"
              >
                <Download className="h-4 w-4 mr-1" />
                Excel
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Status Distribution Pie Chart */}
              <div>
                <h3 className="text-sm font-medium mb-4">Status Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={volunteerStats.statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {volunteerStats.statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Top Districts Bar Chart */}
              <div>
                <h3 className="text-sm font-medium mb-4">Top 10 Districts by Volunteers</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={volunteerStats.districtData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="district" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill={COLORS[0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{volunteerStats.byStatus.pending}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold text-green-600">{volunteerStats.byStatus.approved}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{volunteerStats.byStatus.rejected}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ========== 2. INCIDENT RESPONSE REPORT ========== */}
        <Card>
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4">
            <div>
              <CardTitle>Incident Response Report</CardTitle>
              <CardDescription>Incident severity and status tracking</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleExportIncidents("csv")}
                data-testid="button-export-incidents-csv"
              >
                <Download className="h-4 w-4 mr-1" />
                CSV
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleExportIncidents("excel")}
                data-testid="button-export-incidents-excel"
              >
                <Download className="h-4 w-4 mr-1" />
                Excel
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Severity Breakdown */}
              <div>
                <h3 className="text-sm font-medium mb-4">Severity Breakdown</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={incidentStats.severityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill={COLORS[3]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Status Distribution */}
              <div>
                <h3 className="text-sm font-medium mb-4">Status Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={incidentStats.statusData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill={COLORS[0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t">
              <div>
                <p className="text-sm text-muted-foreground">Low</p>
                <p className="text-2xl font-bold">{incidentStats.bySeverity.low}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Medium</p>
                <p className="text-2xl font-bold">{incidentStats.bySeverity.medium}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">High</p>
                <p className="text-2xl font-bold text-orange-600">{incidentStats.bySeverity.high}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Critical</p>
                <p className="text-2xl font-bold text-red-600">{incidentStats.bySeverity.critical}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ========== 3. INVENTORY HEALTH REPORT ========== */}
        <Card>
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4">
            <div>
              <CardTitle>Inventory Health Report</CardTitle>
              <CardDescription>Equipment and supply tracking</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleExportInventory("csv")}
                data-testid="button-export-inventory-csv"
              >
                <Download className="h-4 w-4 mr-1" />
                CSV
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleExportInventory("excel")}
                data-testid="button-export-inventory-excel"
              >
                <Download className="h-4 w-4 mr-1" />
                Excel
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Category Distribution */}
              <div>
                <h3 className="text-sm font-medium mb-4">Quantity by Category</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={inventoryStats.categoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="quantity" fill={COLORS[1]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Condition Distribution */}
              <div>
                <h3 className="text-sm font-medium mb-4">Condition Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={inventoryStats.conditionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {inventoryStats.conditionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
              <div>
                <p className="text-sm text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold">{inventory.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Low Stock</p>
                <p className="text-2xl font-bold text-orange-600">{inventoryStats.lowStockCount}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Needs Repair</p>
                <p className="text-2xl font-bold text-red-600">{inventoryStats.byCondition.needs_repair}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
