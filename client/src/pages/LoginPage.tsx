import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, ArrowLeft, Loader2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getDashboardRouteFromRole } from "@/lib/authRedirect";
import type { User } from "@shared/schema";
import odishaLogo from "@assets/generated_images/Odisha_government_emblem_a49e5a90.png";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const response = await apiRequest("POST", "/api/auth/login", credentials);
      const user = await response.json() as User;
      return user;
    },
    onSuccess: async (user) => {
      // Invalidate the auth query to refresh user state
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      
      // Show success message
      const displayName = user.firstName || user.username;
      toast({
        title: "Login Successful",
        description: `Welcome back, ${displayName}!`,
      });
      
      // Redirect to appropriate dashboard based on role
      const dashboardRoute = getDashboardRouteFromRole(user.role || "volunteer");
      setLocation(dashboardRoute);
    },
    onError: (error: Error) => {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid username or password",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ username, password });
  };

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="flex justify-center mb-6">
          <img src={odishaLogo} alt="Government of Odisha" className="h-20 w-auto" />
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Civil Defence Portal
          </h1>
          <p className="text-muted-foreground">Government of Odisha</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm font-medium">
              Username or Email
            </Label>
            <Input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              data-testid="input-username"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              data-testid="input-password"
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded" data-testid="checkbox-remember" />
              <span className="text-muted-foreground">Remember me</span>
            </label>
            <a href="#" className="text-primary hover:underline" data-testid="link-forgot-password">
              Forgot Password?
            </a>
          </div>

          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={loginMutation.isPending}
            data-testid="button-submit-login"
          >
            {loginMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging in...
              </>
            ) : (
              <>
                <Shield className="mr-2 h-4 w-4" />
                Login
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 text-center space-y-3">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <a href="#" className="text-primary hover:underline font-medium" data-testid="link-register">
              Register as Volunteer
            </a>
          </p>

          <Link href="/">
            <a className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground" data-testid="link-back-home">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </a>
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            Secured by Government of Odisha IT Infrastructure
          </p>
        </div>
      </Card>
    </div>
  );
}
