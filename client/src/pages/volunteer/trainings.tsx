import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import {
  LayoutDashboard,
  ClipboardList,
  GraduationCap,
  User,
  Search,
  Calendar,
  MapPin,
  Users,
  CheckCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { type Training } from "@shared/schema";
import { format, isFuture, isPast } from "date-fns";

const navItems = [
  { label: "Dashboard", path: "/dashboard/volunteer", icon: LayoutDashboard },
  { label: "My Tasks", path: "/dashboard/volunteer/tasks", icon: ClipboardList },
  { label: "Training", path: "/dashboard/volunteer/trainings", icon: GraduationCap },
  { label: "Profile", path: "/dashboard/volunteer/profile", icon: User },
];

export default function VolunteerTrainings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch all available trainings
  const { data: trainings = [], isLoading } = useQuery<Training[]>({
    queryKey: ["/api/trainings"],
  });

  // Fetch user's registered trainings
  const { data: myTrainings = [] } = useQuery<Training[]>({
    queryKey: ["/api/my-trainings"],
  });

  const registerMutation = useMutation({
    mutationFn: async (trainingId: string) => {
      return await apiRequest("POST", `/api/trainings/${trainingId}/register`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        predicate: (query) => query.queryKey[0] === "/api/trainings" || query.queryKey[0] === "/api/my-trainings"
      });
      toast({ title: "Successfully registered for training" });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const unregisterMutation = useMutation({
    mutationFn: async (trainingId: string) => {
      return await apiRequest("DELETE", `/api/trainings/${trainingId}/register`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        predicate: (query) => query.queryKey[0] === "/api/trainings" || query.queryKey[0] === "/api/my-trainings"
      });
      toast({ title: "Successfully unregistered from training" });
    },
    onError: (error: Error) => {
      toast({
        title: "Unregistration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleRegister = (trainingId: string) => {
    registerMutation.mutate(trainingId);
  };

  const handleUnregister = (trainingId: string) => {
    unregisterMutation.mutate(trainingId);
  };

  const isRegistered = (trainingId: string) => {
    return myTrainings.some((t) => t.id === trainingId);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-500";
      case "ongoing":
        return "bg-green-500";
      case "completed":
        return "bg-gray-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const filteredTrainings = trainings.filter((training) => {
    const matchesSearch =
      training.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      training.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      training.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      training.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "registered" && isRegistered(training.id)) ||
      (statusFilter === "available" && !isRegistered(training.id)) ||
      (statusFilter === "upcoming" && (training.status ?? "upcoming") === "upcoming") ||
      (statusFilter === "ongoing" && (training.status ?? "upcoming") === "ongoing");

    return matchesSearch && matchesStatus;
  });

  const isFull = (training: Training) => {
    return training.enrolledCount >= training.capacity;
  };

  const canRegister = (training: Training) => {
    return !isRegistered(training.id) && !isFull(training) && training.status !== "cancelled" && training.status !== "completed";
  };

  return (
    <DashboardLayout navItems={navItems}>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Training Sessions</h1>
          <p className="text-muted-foreground">
            Browse and register for available training sessions
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Search Trainings</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by title, location, or district..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-trainings"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Filter by Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger data-testid="select-filter-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Trainings</SelectItem>
                    <SelectItem value="registered">My Registrations</SelectItem>
                    <SelectItem value="available">Available to Register</SelectItem>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="ongoing">Ongoing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trainings List */}
        <div className="space-y-4">
          {isLoading ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Loading trainings...
              </CardContent>
            </Card>
          ) : filteredTrainings.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No trainings found matching your criteria.
              </CardContent>
            </Card>
          ) : (
            filteredTrainings.map((training) => (
              <Card key={training.id} className="hover-elevate">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-xl" data-testid={`text-training-${training.id}`}>
                            {training.title}
                          </h3>
                          {isRegistered(training.id) && (
                            <Badge className="bg-green-500">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Registered
                            </Badge>
                          )}
                          {training.isStatewide && (
                            <Badge variant="outline" className="bg-purple-500/10">
                              Statewide
                            </Badge>
                          )}
                          <Badge className={getStatusBadgeColor(training.status ?? "upcoming")}>
                            {training.status ?? "upcoming"}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground">{training.description}</p>
                      </div>
                      <div className="flex gap-2">
                        {isRegistered(training.id) ? (
                          <Button
                            variant="outline"
                            onClick={() => handleUnregister(training.id)}
                            disabled={unregisterMutation.isPending}
                            data-testid={`button-unregister-${training.id}`}
                          >
                            {unregisterMutation.isPending ? "Unregistering..." : "Unregister"}
                          </Button>
                        ) : (
                          <Button
                            onClick={() => handleRegister(training.id)}
                            disabled={!canRegister(training) || registerMutation.isPending}
                            data-testid={`button-register-${training.id}`}
                          >
                            {registerMutation.isPending
                              ? "Registering..."
                              : isFull(training)
                              ? "Full"
                              : "Register"}
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">Start</div>
                          <div className="text-muted-foreground">
                            {format(new Date(training.startAt), "PPP p")}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">End</div>
                          <div className="text-muted-foreground">
                            {format(new Date(training.endAt), "PPP p")}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">Location</div>
                          <div className="text-muted-foreground">
                            {training.location}, {training.district}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">Enrollment</div>
                          <div className="text-muted-foreground">
                            {training.enrolledCount} / {training.capacity}
                          </div>
                        </div>
                      </div>
                    </div>

                    {training.skills && training.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        <span className="text-sm font-medium">Skills:</span>
                        {training.skills.map((skill, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
