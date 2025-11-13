import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import {
  LayoutDashboard,
  ClipboardList,
  GraduationCap,
  User,
  CheckCircle,
  Clock,
  AlertTriangle,
  Calendar,
  XCircle,
  ShieldCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useLocation } from "wouter";
import type { Assignment, TrainingSession, Volunteer } from "@shared/schema";

const navItems = [
  { label: "Dashboard", path: "/dashboard/volunteer", icon: LayoutDashboard },
  { label: "My Tasks", path: "/dashboard/volunteer/tasks", icon: ClipboardList },
  { label: "Training", path: "/dashboard/volunteer/training", icon: GraduationCap },
  { label: "Profile", path: "/dashboard/volunteer/profile", icon: User },
];

export default function VolunteerDashboard() {
  const [, setLocation] = useLocation();

  const { data: volunteerProfile, isLoading: loadingProfile } = useQuery<Volunteer>({
    queryKey: ["/api/my-volunteer-profile"],
  });

  const { data: assignments = [], isLoading: loadingAssignments } = useQuery<Assignment[]>({
    queryKey: ["/api/my-assignments"],
  });

  const { data: trainingSessions = [], isLoading: loadingTraining } = useQuery<TrainingSession[]>({
    queryKey: ["/api/my-training"],
  });

  // Calculate metrics
  const activeAssignments = assignments.filter(
    (a) => a.status === "assigned" || a.status === "in_progress"
  );
  const completedAssignments = assignments.filter((a) => a.status === "completed");

  const upcomingTraining = trainingSessions.filter(
    (t) => new Date(t.scheduledAt) > new Date()
  );
  const completedTraining = trainingSessions.filter(
    (t) => t.status === "completed"
  );

  const isLoading = loadingAssignments || loadingTraining || loadingProfile;

  // Get status badge variant and icon
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "approved":
        return {
          variant: "default" as const,
          icon: CheckCircle,
          title: "Application Approved",
          description: "Your volunteer application has been approved. You can now participate in incidents and training.",
          alertVariant: "default" as const,
        };
      case "pending":
        return {
          variant: "secondary" as const,
          icon: Clock,
          title: "Application Pending",
          description: "Your volunteer application is currently under review. You will be notified once it has been reviewed by the admin.",
          alertVariant: "default" as const,
        };
      case "rejected":
        return {
          variant: "destructive" as const,
          icon: XCircle,
          title: "Application Rejected",
          description: volunteerProfile?.rejectionReason || "Your volunteer application was not approved. Please contact the administrator for more information.",
          alertVariant: "destructive" as const,
        };
      default:
        return {
          variant: "secondary" as const,
          icon: ShieldCheck,
          title: "Application Status",
          description: "Your application status is being processed.",
          alertVariant: "default" as const,
        };
    }
  };

  const statusDisplay = volunteerProfile ? getStatusDisplay(volunteerProfile.status || "pending") : null;
  const StatusIcon = statusDisplay?.icon;

  return (
    <DashboardLayout navItems={navItems} title="Volunteer Portal">
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            View your tasks, training, and volunteer activities
          </p>
        </div>

        {/* Application Status Alert */}
        {volunteerProfile && statusDisplay && StatusIcon && (
          <Alert variant={statusDisplay.alertVariant} data-testid="alert-application-status">
            <StatusIcon className="h-5 w-5" />
            <AlertTitle className="text-lg font-semibold">{statusDisplay.title}</AlertTitle>
            <AlertDescription className="mt-2">
              {statusDisplay.description}
              {volunteerProfile.status === "rejected" && (
                <div className="mt-3">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setLocation("/dashboard/volunteer/profile")}
                    data-testid="button-update-application"
                  >
                    Update Application
                  </Button>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {loadingProfile && (
          <div className="h-24 bg-muted animate-pulse rounded-lg" />
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Active Tasks */}
          <Card data-testid="card-active-tasks">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-8 bg-muted animate-pulse rounded" />
              ) : (
                <>
                  <div className="text-2xl font-bold" data-testid="text-active-tasks">
                    {activeAssignments.length}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Tasks in progress
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Completed Tasks */}
          <Card data-testid="card-completed-tasks">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-8 bg-muted animate-pulse rounded" />
              ) : (
                <>
                  <div className="text-2xl font-bold" data-testid="text-completed-tasks">
                    {completedAssignments.length}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Total completed
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Training */}
          <Card data-testid="card-upcoming-training">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Training</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-8 bg-muted animate-pulse rounded" />
              ) : (
                <>
                  <div className="text-2xl font-bold" data-testid="text-upcoming-training">
                    {upcomingTraining.length}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Sessions scheduled
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Training Completed */}
          <Card data-testid="card-training-completed">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Training Completed</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-8 bg-muted animate-pulse rounded" />
              ) : (
                <>
                  <div className="text-2xl font-bold" data-testid="text-training-completed">
                    {completedTraining.length}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Total sessions
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Active Tasks List */}
        {activeAssignments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Active Tasks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {activeAssignments.slice(0, 5).map((assignment) => (
                <div
                  key={assignment.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-lg border hover-elevate"
                  data-testid={`task-${assignment.id}`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                      {assignment.status === "in_progress" ? (
                        <Clock className="h-5 w-5 text-primary" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {assignment.role || "Task Assignment"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {assignment.status === "in_progress" ? "In Progress" : "Assigned"}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" data-testid={`badge-${assignment.status}`}>
                    {assignment.status}
                  </Badge>
                </div>
              ))}
              {activeAssignments.length > 5 && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setLocation("/dashboard/volunteer/tasks")}
                  data-testid="button-view-all-tasks"
                >
                  View All Tasks ({activeAssignments.length})
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Upcoming Training */}
        {upcomingTraining.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Training Sessions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingTraining.slice(0, 3).map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-lg border hover-elevate"
                  data-testid={`training-${session.id}`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                      <GraduationCap className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{session.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(session.scheduledAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">{session.status || "Scheduled"}</Badge>
                </div>
              ))}
              {upcomingTraining.length > 3 && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setLocation("/dashboard/volunteer/training")}
                  data-testid="button-view-all-training"
                >
                  View All Training ({upcomingTraining.length})
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* No Active Tasks Message */}
        {!isLoading && activeAssignments.length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>No Active Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                You don't have any active tasks at the moment. Check back later for new assignments.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
