import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { LogIn, ShieldCheck, Users, Building2, Settings } from "lucide-react";
import AccessibilityBar from "@/components/AccessibilityBar";

const signInSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type SignInForm = z.infer<typeof signInSchema>;

const testCredentials = [
  {
    role: "Volunteer",
    username: "volunteer1",
    password: "volunteer123",
    icon: Users,
    description: "Basic access for registered volunteers",
    color: "text-blue-600 dark:text-blue-400",
  },
  {
    role: "District Admin",
    username: "district_admin",
    password: "district123",
    icon: Building2,
    description: "Manage district-level operations",
    color: "text-green-600 dark:text-green-400",
  },
  {
    role: "Department Admin (State)",
    username: "dept_admin",
    password: "department123",
    icon: ShieldCheck,
    description: "State-level department administration",
    color: "text-orange-600 dark:text-orange-400",
  },
  {
    role: "CMS Manager",
    username: "cms_manager",
    password: "cms123",
    icon: Settings,
    description: "Content management & site configuration",
    color: "text-purple-600 dark:text-purple-400",
  },
];

export default function SignIn() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const form = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: SignInForm) => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Login failed");
      }
      
      return response.json();
    },
    onSuccess: async () => {
      // Clear all cached queries first
      queryClient.clear();
      // Refetch user data to ensure fresh state
      await queryClient.refetchQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Success",
        description: "Logged in successfully",
      });
      setLocation("/");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SignInForm) => {
    loginMutation.mutate(data);
  };

  const handleQuickLogin = (username: string, password: string) => {
    form.setValue("username", username);
    form.setValue("password", password);
    loginMutation.mutate({ username, password });
  };

  return (
    <div className="min-h-screen bg-background">
      <AccessibilityBar />
      
      <div className="bg-primary text-primary-foreground py-4 border-b-4 border-primary/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Civil Defence Department</h1>
              <p className="text-sm md:text-base text-primary-foreground/90">Government of Odisha</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/" asChild>
                <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20" data-testid="link-home">
                  ← Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="shadow-xl">
              <CardHeader className="space-y-3 pb-8">
                <div className="flex justify-center mb-2">
                  <div className="p-4 bg-primary/10 rounded-full">
                    <LogIn className="h-14 w-14 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-3xl font-bold text-center">Sign In</CardTitle>
                <CardDescription className="text-center text-lg">
                  Access your Civil Defence account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">Username</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter your username" 
                              className="h-11 text-base"
                              {...field} 
                              data-testid="input-username"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">Password</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Enter your password" 
                              className="h-11 text-base"
                              {...field}
                              data-testid="input-password"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full h-11 text-base font-semibold" 
                      disabled={loginMutation.isPending}
                      data-testid="button-signin"
                    >
                      {loginMutation.isPending ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                </Form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-card px-3 text-muted-foreground">New to the portal?</span>
                  </div>
                </div>

                <Link href="/signup" asChild>
                  <Button variant="outline" className="w-full h-11 text-base" data-testid="link-signup">
                    Create New Account
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="shadow-xl bg-gradient-to-br from-card to-accent/5">
              <CardHeader className="space-y-3">
                <CardTitle className="text-2xl font-bold">Quick Access - Test Credentials</CardTitle>
                <CardDescription className="text-base">
                  For testing purposes, use these credentials to access different role dashboards
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {testCredentials.map((cred, index) => {
                  const Icon = cred.icon;
                  return (
                    <Card key={index} className="hover-elevate active-elevate-2 cursor-pointer transition-all" onClick={() => handleQuickLogin(cred.username, cred.password)}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-lg bg-accent/10 ${cred.color}`}>
                            <Icon className="h-6 w-6" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className={`font-semibold text-lg ${cred.color}`}>{cred.role}</h3>
                            <p className="text-sm text-muted-foreground mb-2">{cred.description}</p>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="text-muted-foreground">Username:</span>
                                <p className="font-mono font-medium">{cred.username}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Password:</span>
                                <p className="font-mono font-medium">{cred.password}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

                <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <p className="text-sm text-center text-muted-foreground">
                    <strong className="text-foreground">Note:</strong> Click any credential card to auto-fill and login instantly
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
