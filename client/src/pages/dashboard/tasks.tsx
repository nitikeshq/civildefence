import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ODISHA_DISTRICTS } from "@shared/constants";
import { getAdminNavItems } from "@/lib/roleUtils";
import { ClipboardList, Plus, UserPlus, Calendar } from "lucide-react";
import type { Incident, Volunteer, Assignment } from "@shared/schema";

export default function TasksPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedIncident, setSelectedIncident] = useState<string>("");
  const [selectedVolunteers, setSelectedVolunteers] = useState<string[]>([]);
  const [taskRole, setTaskRole] = useState("");
  const [taskNotes, setTaskNotes] = useState("");

  // Get navigation items based on user role
  const navItems = user ? getAdminNavItems(user.role) : [];

  // Determine district for filtering
  const isDistrictAdmin = user?.role === "district_admin";
  const isDepartmentAdmin = user?.role === "department_admin" || user?.role === "state_admin";
  const userDistrict = isDistrictAdmin ? (user?.district || "") : selectedDistrict;

  // Fetch incidents (for district admin: only their district, for department admin: selected district)
  const { data: incidents = [] } = useQuery<Incident[]>({
    queryKey: ["/api/incidents", userDistrict || "all"],
    queryFn: async () => {
      const url = userDistrict && userDistrict !== "all"
        ? `/api/incidents?district=${encodeURIComponent(userDistrict)}`
        : "/api/incidents";
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) {
        throw new Error(`${res.status}: ${await res.text()}`);
      }
      return res.json();
    },
    enabled: isDistrictAdmin || (isDepartmentAdmin && !!selectedDistrict),
  });

  // Fetch volunteers from selected district
  const { data: volunteers = [] } = useQuery<Volunteer[]>({
    queryKey: ["/api/volunteers", userDistrict || "all", "approved"],
    queryFn: async () => {
      const url = userDistrict && userDistrict !== "all"
        ? `/api/volunteers?district=${encodeURIComponent(userDistrict)}&status=approved`
        : "/api/volunteers?status=approved";
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) {
        throw new Error(`${res.status}: ${await res.text()}`);
      }
      return res.json();
    },
    enabled: !!userDistrict,
  });

  // Fetch all assignments
  const { data: assignments = [] } = useQuery<Assignment[]>({
    queryKey: ["/api/assignments"],
  });

  // Create assignment mutation
  const createAssignmentMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/assignments", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assignments"] });
      toast({
        title: "Success",
        description: "Task assigned successfully",
      });
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to assign task",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setSelectedIncident("");
    setSelectedVolunteers([]);
    setTaskRole("");
    setTaskNotes("");
    if (isDepartmentAdmin) {
      setSelectedDistrict("");
    }
  };

  const handleCreateAssignments = () => {
    if (!selectedIncident || selectedVolunteers.length === 0) {
      toast({
        title: "Error",
        description: "Please select an incident and at least one volunteer",
        variant: "destructive",
      });
      return;
    }

    // Create assignments for each selected volunteer
    selectedVolunteers.forEach((volunteerId) => {
      createAssignmentMutation.mutate({
        volunteerId,
        incidentId: selectedIncident,
        role: taskRole || "Volunteer",
        notes: taskNotes,
      });
    });
  };

  const toggleVolunteerSelection = (volunteerId: string) => {
    setSelectedVolunteers((prev) =>
      prev.includes(volunteerId)
        ? prev.filter((id) => id !== volunteerId)
        : [...prev, volunteerId]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "assigned":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  return (
    <DashboardLayout 
      navItems={navItems} 
      title="Task Management"
      subtitle={isDepartmentAdmin ? "All Districts" : (isDistrictAdmin ? user?.district || "" : "")}
    >
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Task Management</h1>
            <p className="text-muted-foreground mt-1">
              Assign volunteers to incidents and tasks
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-task">
                <Plus className="h-4 w-4 mr-2" />
                Assign Task
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Assign Volunteers to Task</DialogTitle>
                <DialogDescription>
                  Select an incident and assign volunteers from the selected district. 
                  <strong className="block mt-2 text-foreground">Note: Each selected volunteer will receive an individual task assignment for this incident.</strong>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                {/* District Selection (only for Department Admin) */}
                {isDepartmentAdmin && (
                  <div className="space-y-2">
                    <Label htmlFor="district">Select District *</Label>
                    <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                      <SelectTrigger data-testid="select-district">
                        <SelectValue placeholder="Choose a district" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Districts</SelectItem>
                        {ODISHA_DISTRICTS.map((district: string) => (
                          <SelectItem key={district} value={district}>
                            {district}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Show district for district admin */}
                {isDistrictAdmin && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium">District: {user?.district}</p>
                  </div>
                )}

                {/* Incident Selection */}
                {userDistrict && (
                  <div className="space-y-2">
                    <Label htmlFor="incident">Select Incident/Task *</Label>
                    <Select value={selectedIncident} onValueChange={setSelectedIncident}>
                      <SelectTrigger data-testid="select-incident">
                        <SelectValue placeholder="Choose an incident" />
                      </SelectTrigger>
                      <SelectContent>
                        {incidents.map((incident) => (
                          <SelectItem key={incident.id} value={incident.id}>
                            {incident.title} - {incident.severity}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {incidents.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        No incidents found for this district
                      </p>
                    )}
                  </div>
                )}

                {/* Role/Position */}
                {userDistrict && (
                  <div className="space-y-2">
                    <Label htmlFor="role">Role/Position</Label>
                    <Input
                      id="role"
                      placeholder="e.g., Rescue Team Leader, Medical Support"
                      value={taskRole}
                      onChange={(e) => setTaskRole(e.target.value)}
                      data-testid="input-role"
                    />
                  </div>
                )}

                {/* Notes */}
                {userDistrict && (
                  <div className="space-y-2">
                    <Label htmlFor="notes">Instructions/Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Add any specific instructions for the volunteers"
                      value={taskNotes}
                      onChange={(e) => setTaskNotes(e.target.value)}
                      rows={3}
                      data-testid="textarea-notes"
                    />
                  </div>
                )}

                {/* Volunteer Selection */}
                {userDistrict && volunteers.length > 0 && (
                  <div className="space-y-2">
                    <Label>Select Volunteers *</Label>
                    <div className="border rounded-lg p-3 max-h-60 overflow-y-auto space-y-2">
                      {volunteers.map((volunteer) => (
                        <div
                          key={volunteer.id}
                          className={`p-3 rounded-md border cursor-pointer hover-elevate ${
                            selectedVolunteers.includes(volunteer.id)
                              ? "border-primary bg-primary/5"
                              : "border-border"
                          }`}
                          onClick={() => toggleVolunteerSelection(volunteer.id)}
                          data-testid={`volunteer-${volunteer.id}`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{volunteer.fullName}</p>
                              <p className="text-sm text-muted-foreground">
                                {volunteer.email} • {volunteer.phone}
                              </p>
                              {volunteer.skills && volunteer.skills.length > 0 && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Skills: {volunteer.skills.join(", ")}
                                </p>
                              )}
                            </div>
                            {selectedVolunteers.includes(volunteer.id) && (
                              <UserPlus className="h-5 w-5 text-primary" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {selectedVolunteers.length} volunteer(s) selected
                    </p>
                  </div>
                )}

                {userDistrict && volunteers.length === 0 && (
                  <div className="p-4 border border-dashed rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">
                      No approved volunteers found in {userDistrict}
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateAssignments}
                    disabled={!selectedIncident || selectedVolunteers.length === 0 || createAssignmentMutation.isPending}
                    data-testid="button-assign"
                  >
                    {createAssignmentMutation.isPending ? "Assigning..." : "Assign Task"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Assignments List */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Assignments</CardTitle>
            <CardDescription>View all task assignments</CardDescription>
          </CardHeader>
          <CardContent>
            {assignments.length === 0 ? (
              <div className="text-center py-8">
                <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No tasks assigned yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {assignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="p-4 border rounded-lg hover-elevate"
                    data-testid={`assignment-${assignment.id}`}
                  >
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{assignment.role || "Task Assignment"}</p>
                          <Badge className={getStatusColor(assignment.status || "assigned")}>
                            {assignment.status}
                          </Badge>
                        </div>
                        {assignment.notes && (
                          <p className="text-sm text-muted-foreground mb-2">{assignment.notes}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {assignment.assignedAt
                              ? new Date(assignment.assignedAt).toLocaleDateString()
                              : "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
