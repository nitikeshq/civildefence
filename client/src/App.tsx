// Local password authentication
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
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
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      <Route path="/signin" component={SignIn} />
      {/* Redirect signup to volunteer registration */}
      <Route path="/signup">
        {() => {
          window.location.href = "/volunteer/register";
          return null;
        }}
      </Route>
      
      {/* Public routes - accessible without login */}
      <Route path="/volunteer/register" component={VolunteerRegistration} />
      
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={LandingPage} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          {/* Volunteer Routes */}
          <Route path="/dashboard/volunteer" component={VolunteerDashboard} />
          <Route path="/dashboard/volunteer/tasks" component={VolunteerTasks} />
          <Route path="/dashboard/volunteer/trainings" component={VolunteerTrainings} />
          <Route path="/dashboard/volunteer/profile" component={VolunteerProfile} />
          {/* Unified Admin Dashboard Routes - Role-based filtering */}
          <Route path="/dashboard/overview" component={DashboardOverview} />
          <Route path="/dashboard/volunteers" component={DashboardVolunteers} />
          <Route path="/dashboard/incidents" component={DashboardIncidents} />
          <Route path="/dashboard/tasks" component={DashboardTasks} />
          <Route path="/dashboard/trainings" component={DashboardTrainings} />
          <Route path="/dashboard/inventory" component={DashboardInventory} />
          <Route path="/dashboard/reports" component={DashboardReports} />
          <Route path="/dashboard/cms" component={CMSManager} />
          {/* Legacy CMS Routes */}
          <Route path="/cms/dashboard" component={CMSDashboard} />
          <Route path="/cms/:page" component={CMSDashboard} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
