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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import type { Assignment, TrainingSession } from "@shared/schema";

const navItems = [
  { label: "Dashboard", path: "/dashboard/volunteer", icon: LayoutDashboard },
  { label: "My Tasks", path: "/dashboard/volunteer/tasks", icon: ClipboardList },
  { label: "Training", path: "/dashboard/volunteer/training", icon: GraduationCap },
  { label: "Profile", path: "/dashboard/volunteer/profile", icon: User },
];

export default function VolunteerDashboard() {
  const [, setLocation] = useLocation();

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

  const isLoading = loadingAssignments || loadingTraining;

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
