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
import DistrictAdminDashboard from "@/pages/dashboard/district-admin";
import DepartmentAdminDashboard from "@/pages/dashboard/department-admin";
import StateAdminDashboard from "@/pages/dashboard/state-admin";
import CMSDashboard from "@/pages/dashboard/cms-manager";
import VolunteerRegistration from "@/pages/VolunteerRegistration";
import IncidentReporting from "@/pages/IncidentReporting";
import InventoryManagement from "@/pages/InventoryManagement";
import VolunteerApproval from "@/pages/VolunteerApproval";
import MISReports from "@/pages/MISReports";
import TrainingManagement from "@/pages/TrainingManagement";
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
          <Route path="/dashboard/volunteer" component={VolunteerDashboard} />
          <Route path="/dashboard/district-admin" component={DistrictAdminDashboard} />
          <Route path="/dashboard/department-admin" component={DepartmentAdminDashboard} />
          <Route path="/dashboard/state-admin" component={StateAdminDashboard} />
          <Route path="/cms/dashboard" component={CMSDashboard} />
          <Route path="/cms/:page" component={CMSDashboard} />
          <Route path="/incident-reporting" component={IncidentReporting} />
          <Route path="/incidents/report" component={IncidentReporting} />
          <Route path="/inventory" component={InventoryManagement} />
          <Route path="/volunteers/approval" component={VolunteerApproval} />
          <Route path="/mis-reports" component={MISReports} />
          <Route path="/training" component={TrainingManagement} />
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
