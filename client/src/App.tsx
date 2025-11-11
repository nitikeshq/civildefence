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
import VolunteerRegistration from "@/pages/VolunteerRegistration";
import IncidentReporting from "@/pages/IncidentReporting";
import InventoryManagement from "@/pages/InventoryManagement";
import VolunteerApproval from "@/pages/VolunteerApproval";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      <Route path="/signin" component={SignIn} />
      <Route path="/signup" component={SignUp} />
      
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={LandingPage} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/dashboard/volunteer" component={VolunteerDashboard} />
          <Route path="/volunteer/register" component={VolunteerRegistration} />
          <Route path="/incident-reporting" component={IncidentReporting} />
          <Route path="/incidents/report" component={IncidentReporting} />
          <Route path="/inventory" component={InventoryManagement} />
          <Route path="/volunteers/approval" component={VolunteerApproval} />
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
