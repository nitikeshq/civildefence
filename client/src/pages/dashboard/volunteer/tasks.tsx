import { useQuery, useMutation } from "@tanstack/react-query";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import {
  LayoutDashboard,
  ClipboardList,
  GraduationCap,
  User,
  CheckCircle,
  Clock,
  AlertTriangle,
  MapPin,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Assignment } from "@shared/schema";

const navItems = [
  { label: "Dashboard", path: "/dashboard/volunteer", icon: LayoutDashboard },
  { label: "My Tasks", path: "/dashboard/volunteer/tasks", icon: ClipboardList },
  { label: "Training", path: "/dashboard/volunteer/trainings", icon: GraduationCap },
  { label: "Profile", path: "/dashboard/volunteer/profile", icon: User },
];

export default function MyTasks() {
  const { toast } = useToast();

  const { data: assignments = [], isLoading } = useQuery<Assignment[]>({
    queryKey: ["/api/my-assignments"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return await apiRequest(`/api/assignments/${id}/status`, "PATCH", { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-assignments"] });
      toast({
        title: "Success",
        description: "Task status updated successfully",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update task status",
      });
    },
  });

  const activeAssignments = assignments.filter(
    (a) => a.status === "assigned" || a.status === "in_progress"
  );
  const completedAssignments = assignments.filter((a) => a.status === "completed");

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "in_progress":
        return <Clock className="h-5 w-5 text-blue-600" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-orange-600" />;
    }
  };

  const getStatusBadge = (status: string | null) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      assigned: "outline",
      in_progress: "secondary",
      completed: "default",
    };
    return (
      <Badge variant={variants[status || "assigned"] || "outline"}>
        {status || "assigned"}
      </Badge>
    );
  };

  return (
    <DashboardLayout navItems={navItems}>
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Tasks</h1>
          <p className="text-muted-foreground mt-1">
            Manage your assigned tasks and incident responses
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card data-testid="card-active-tasks">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeAssignments.length}</div>
              <p className="text-xs text-muted-foreground">
                Currently assigned to you
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-in-progress">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {assignments.filter((a) => a.status === "in_progress").length}
              </div>
              <p className="text-xs text-muted-foreground">
                Tasks you're working on
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-completed">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedAssignments.length}</div>
              <p className="text-xs text-muted-foreground">
                Successfully completed
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tasks Tabs */}
        <Tabs defaultValue="active" className="w-full">
          <TabsList>
            <TabsTrigger value="active" data-testid="tab-active-tasks">
              Active Tasks ({activeAssignments.length})
            </TabsTrigger>
            <TabsTrigger value="completed" data-testid="tab-completed-tasks">
              Completed ({completedAssignments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4 mt-4">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 bg-muted animate-pulse rounded-md" />
                ))}
              </div>
            ) : activeAssignments.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium text-muted-foreground">
                    No active tasks
                  </p>
                  <p className="text-sm text-muted-foreground">
                    You're all caught up! Check back later for new assignments.
                  </p>
                </CardContent>
              </Card>
            ) : (
              activeAssignments.map((assignment) => (
                <Card key={assignment.id} data-testid={`task-${assignment.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {getStatusIcon(assignment.status || "assigned")}
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg truncate">
                            {assignment.role || "Volunteer Assignment"}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>
                              Assigned: {new Date(assignment.assignedAt!).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      {getStatusBadge(assignment.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {assignment.notes && (
                      <p className="text-sm text-muted-foreground mb-4">
                        {assignment.notes}
                      </p>
                    )}
                    <div className="flex gap-2 flex-wrap">
                      {assignment.status === "assigned" && (
                        <Button
                          size="sm"
                          data-testid={`button-start-${assignment.id}`}
                          onClick={() =>
                            updateStatusMutation.mutate({
                              id: assignment.id,
                              status: "in_progress",
                            })
                          }
                          disabled={updateStatusMutation.isPending}
                        >
                          <Clock className="h-4 w-4 mr-2" />
                          Start Task
                        </Button>
                      )}
                      {assignment.status === "in_progress" && (
                        <Button
                          size="sm"
                          data-testid={`button-complete-${assignment.id}`}
                          onClick={() =>
                            updateStatusMutation.mutate({
                              id: assignment.id,
                              status: "completed",
                            })
                          }
                          disabled={updateStatusMutation.isPending}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark Complete
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4 mt-4">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 bg-muted animate-pulse rounded-md" />
                ))}
              </div>
            ) : completedAssignments.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium text-muted-foreground">
                    No completed tasks yet
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Completed tasks will appear here
                  </p>
                </CardContent>
              </Card>
            ) : (
              completedAssignments.map((assignment) => (
                <Card key={assignment.id} data-testid={`completed-task-${assignment.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {getStatusIcon(assignment.status || "completed")}
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg truncate">
                            {assignment.role || "Volunteer Assignment"}
                          </CardTitle>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>
                                Completed: {assignment.completedAt ? new Date(assignment.completedAt).toLocaleDateString() : "N/A"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      {getStatusBadge(assignment.status)}
                    </div>
                  </CardHeader>
                  {assignment.notes && (
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {assignment.notes}
                      </p>
                    </CardContent>
                  )}
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
