// Local password authentication
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { SiteSettingsProvider } from "@/contexts/SiteSettingsContext";
import LandingPage from "@/pages/LandingPage";
import SignIn from "@/pages/SignIn";
import SignUp from "@/pages/SignUp";
import Dashboard from "@/pages/Dashboard";
import VolunteerDashboard from "@/pages/dashboard/volunteer";
import VolunteerTasks from "@/pages/dashboard/volunteer/tasks";
import VolunteerProfile from "@/pages/dashboard/volunteer/profile";
import DashboardOverview from "@/pages/dashboard/overview";
import DashboardVolunteers from "@/pages/dashboard/volunteers";
import DashboardIncidents from "@/pages/dashboard/incidents";
import DashboardInventory from "@/pages/dashboard/inventory";
import DashboardReports from "@/pages/dashboard/reports";
import DashboardTasks from "@/pages/dashboard/tasks";
import DashboardTrainings from "@/pages/dashboard/trainings";
import VolunteerTrainings from "@/pages/volunteer/trainings";
import CMSDashboard from "@/pages/dashboard/cms-manager";
import CMSManager from "@/pages/dashboard/cms";
import VolunteerRegistration from "@/pages/VolunteerRegistration";
import DistrictMap from "@/pages/DistrictMap";
import NotFound from "@/pages/not-found";
import { redirectToSignIn } from "@/lib/authRedirect";
import { useEffect } from "react";

function ProtectedRoute({ component: Component, ...rest }: { component: any, path: string }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      redirectToSignIn();
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Redirecting to sign in...</div>
      </div>
    );
  }

  return <Component />;
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {/* Public routes */}
      <Route path="/signin" component={SignIn} />
      <Route path="/signup">
        {() => {
          window.location.href = "/volunteer/register";
          return null;
        }}
      </Route>
      <Route path="/volunteer/register" component={VolunteerRegistration} />
      
      {/* Landing or Dashboard based on auth */}
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={LandingPage} />
      ) : (
        <Route path="/" component={Dashboard} />
      )}
      
      {/* Protected Routes */}
      <Route path="/dashboard/volunteer">
        {() => <ProtectedRoute component={VolunteerDashboard} path="/dashboard/volunteer" />}
      </Route>
      <Route path="/dashboard/volunteer/tasks">
        {() => <ProtectedRoute component={VolunteerTasks} path="/dashboard/volunteer/tasks" />}
      </Route>
      <Route path="/dashboard/volunteer/trainings">
        {() => <ProtectedRoute component={VolunteerTrainings} path="/dashboard/volunteer/trainings" />}
      </Route>
      <Route path="/dashboard/volunteer/profile">
        {() => <ProtectedRoute component={VolunteerProfile} path="/dashboard/volunteer/profile" />}
      </Route>
      <Route path="/dashboard/overview">
        {() => <ProtectedRoute component={DashboardOverview} path="/dashboard/overview" />}
      </Route>
      <Route path="/dashboard/volunteers">
        {() => <ProtectedRoute component={DashboardVolunteers} path="/dashboard/volunteers" />}
      </Route>
      <Route path="/dashboard/incidents">
        {() => <ProtectedRoute component={DashboardIncidents} path="/dashboard/incidents" />}
      </Route>
      <Route path="/dashboard/tasks">
        {() => <ProtectedRoute component={DashboardTasks} path="/dashboard/tasks" />}
      </Route>
      <Route path="/dashboard/trainings">
        {() => <ProtectedRoute component={DashboardTrainings} path="/dashboard/trainings" />}
      </Route>
      <Route path="/dashboard/inventory">
        {() => <ProtectedRoute component={DashboardInventory} path="/dashboard/inventory" />}
      </Route>
      <Route path="/dashboard/reports">
        {() => <ProtectedRoute component={DashboardReports} path="/dashboard/reports" />}
      </Route>
      <Route path="/dashboard/cms">
        {() => <ProtectedRoute component={CMSManager} path="/dashboard/cms" />}
      </Route>
      <Route path="/dashboard/district-map">
        {() => <ProtectedRoute component={DistrictMap} path="/dashboard/district-map" />}
      </Route>
      <Route path="/cms/dashboard">
        {() => <ProtectedRoute component={CMSDashboard} path="/cms/dashboard" />}
      </Route>
      <Route path="/cms/:page">
        {() => <ProtectedRoute component={CMSDashboard} path="/cms/:page" />}
      </Route>
      
      {/* 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SiteSettingsProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </SiteSettingsProvider>
    </QueryClientProvider>
  );
}

export default App;
