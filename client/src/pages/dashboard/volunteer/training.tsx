import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import {
  LayoutDashboard,
  ClipboardList,
  GraduationCap,
  User,
  Calendar,
  MapPin,
  Clock,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { TrainingSession } from "@shared/schema";

const navItems = [
  { label: "Dashboard", path: "/dashboard/volunteer", icon: LayoutDashboard },
  { label: "My Tasks", path: "/dashboard/volunteer/tasks", icon: ClipboardList },
  { label: "Training", path: "/dashboard/volunteer/trainings", icon: GraduationCap },
  { label: "Profile", path: "/dashboard/volunteer/profile", icon: User },
];

export default function Training() {
  const { data: trainingSessions = [], isLoading } = useQuery<TrainingSession[]>({
    queryKey: ["/api/training-sessions"],
  });

  const now = new Date();
  const upcomingSessions = trainingSessions.filter(
    (t) => new Date(t.scheduledAt) > now && t.status === "scheduled"
  );
  const pastSessions = trainingSessions.filter(
    (t) => new Date(t.scheduledAt) <= now || t.status === "completed"
  );

  return (
    <DashboardLayout navItems={navItems} title="Volunteer Portal">
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Training Sessions</h1>
          <p className="text-muted-foreground mt-1">
            View and register for upcoming civil defence training programs
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card data-testid="card-upcoming-training">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Sessions</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingSessions.length}</div>
              <p className="text-xs text-muted-foreground">
                Available to register
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-completed-training">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pastSessions.length}</div>
              <p className="text-xs text-muted-foreground">
                Training sessions attended
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-total-training">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{trainingSessions.length}</div>
              <p className="text-xs text-muted-foreground">
                All training sessions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Training Tabs */}
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList>
            <TabsTrigger value="upcoming" data-testid="tab-upcoming">
              Upcoming ({upcomingSessions.length})
            </TabsTrigger>
            <TabsTrigger value="past" data-testid="tab-past">
              Past ({pastSessions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4 mt-4">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-40 bg-muted animate-pulse rounded-md" />
                ))}
              </div>
            ) : upcomingSessions.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium text-muted-foreground">
                    No upcoming training sessions
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Check back later for new training opportunities
                  </p>
                </CardContent>
              </Card>
            ) : (
              upcomingSessions.map((session) => (
                <Card key={session.id} data-testid={`training-${session.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-xl">{session.title}</CardTitle>
                        {session.description && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {session.description}
                          </p>
                        )}
                      </div>
                      <Badge variant="outline">{session.status || "Scheduled"}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          Date: <span className="text-foreground font-medium">
                            {new Date(session.scheduledAt).toLocaleDateString()}
                          </span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          Time: <span className="text-foreground font-medium">
                            {new Date(session.scheduledAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </span>
                      </div>
                      {session.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            Location: <span className="text-foreground font-medium">
                              {session.location}
                            </span>
                          </span>
                        </div>
                      )}
                      {session.capacity && (
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            Capacity: <span className="text-foreground font-medium">
                              {session.capacity} participants
                            </span>
                          </span>
                        </div>
                      )}
                      {session.duration && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            Duration: <span className="text-foreground font-medium">
                              {session.duration} minutes
                            </span>
                          </span>
                        </div>
                      )}
                      {session.instructor && (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            Instructor: <span className="text-foreground font-medium">
                              {session.instructor}
                            </span>
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" data-testid={`button-register-${session.id}`}>
                        Register Now
                      </Button>
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4 mt-4">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="h-40 bg-muted animate-pulse rounded-md" />
                ))}
              </div>
            ) : pastSessions.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <GraduationCap className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium text-muted-foreground">
                    No past training sessions
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Attended sessions will appear here
                  </p>
                </CardContent>
              </Card>
            ) : (
              pastSessions.map((session) => (
                <Card key={session.id} data-testid={`past-training-${session.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-xl">{session.title}</CardTitle>
                        {session.description && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {session.description}
                          </p>
                        )}
                      </div>
                      <Badge variant="secondary">Completed</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          Completed: <span className="text-foreground font-medium">
                            {new Date(session.scheduledAt).toLocaleDateString()}
                          </span>
                        </span>
                      </div>
                      {session.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            Location: <span className="text-foreground font-medium">
                              {session.location}
                            </span>
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
