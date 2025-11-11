import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { Assignment, Incident, TrainingSession } from "@shared/schema";
import { redirectToSignIn } from "@/lib/authRedirect";
import { useToast } from "@/hooks/use-toast";
import { 
  AlertTriangle, 
  Calendar,
  CheckCircle,
  Clock,
  MapPin
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function VolunteerDashboard() {
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

  const { data: assignments = [] } = useQuery<Assignment[]>({
    queryKey: ["/api/my-assignments"],
    enabled: isAuthenticated,
  });

  const { data: incidents = [] } = useQuery<Incident[]>({
    queryKey: ["/api/my-incidents"],
    enabled: isAuthenticated,
  });

  const { data: trainingSessions = [] } = useQuery<TrainingSession[]>({
    queryKey: ["/api/my-training"],
    enabled: isAuthenticated,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const activeAssignments = assignments.filter(a => 
    a.status === "assigned" || a.status === "in_progress"
  );
  const completedAssignments = assignments.filter(a => a.status === "completed");
  const upcomingTraining = trainingSessions.filter(t => 
    new Date(t.scheduledAt) > new Date()
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Welcome, {user?.firstName || "Volunteer"}
            </h1>
            <p className="text-muted-foreground">
              Your volunteer dashboard - Track your assignments and training
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Assignments</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeAssignments.length}</div>
                <p className="text-xs text-muted-foreground">
                  Incidents assigned to you
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completedAssignments.length}</div>
                <p className="text-xs text-muted-foreground">
                  Successfully completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Upcoming Training</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{upcomingTraining.length}</div>
                <p className="text-xs text-muted-foreground">
                  Training sessions scheduled
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>My Active Incidents</CardTitle>
                <CardDescription>
                  Incidents currently assigned to you
                </CardDescription>
              </CardHeader>
              <CardContent>
                {activeAssignments.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-8 text-center">
                    No active assignments at the moment
                  </p>
                ) : (
                  <div className="space-y-4">
                    {incidents.slice(0, 5).map((incident) => (
                      <div key={incident.id} className="flex items-start gap-3 p-3 border rounded-md">
                        <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium truncate">{incident.title}</p>
                            <Badge variant={
                              incident.severity === "critical" ? "destructive" :
                              incident.severity === "high" ? "default" : "secondary"
                            } data-testid={`badge-severity-${incident.id}`}>
                              {incident.severity}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{incident.location}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Training Sessions</CardTitle>
                <CardDescription>
                  Your scheduled training programs
                </CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingTraining.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-8 text-center">
                    No upcoming training sessions
                  </p>
                ) : (
                  <div className="space-y-4">
                    {upcomingTraining.slice(0, 5).map((training) => (
                      <div key={training.id} className="flex items-start gap-3 p-3 border rounded-md">
                        <Calendar className="h-5 w-5 text-primary mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium mb-1">{training.title}</p>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{new Date(training.scheduledAt).toLocaleDateString()}</span>
                          </div>
                          {training.location && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                              <MapPin className="h-3 w-3" />
                              <span className="truncate">{training.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks for volunteers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Link href="/incident-reporting">
                    <Button className="w-full" variant="default" data-testid="button-report-incident">
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      Report Incident
                    </Button>
                  </Link>
                  <Button className="w-full" variant="outline" data-testid="button-view-profile">
                    View My Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
