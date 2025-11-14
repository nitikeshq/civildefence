import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { UserPlus, ShieldCheck, Info } from "lucide-react";
import AccessibilityBar from "@/components/AccessibilityBar";

const signUpSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  district: z.string().optional(),
  role: z.enum(["volunteer", "district_admin", "department_admin", "state_admin"]).default("volunteer"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignUpForm = z.infer<typeof signUpSchema>;

const districts = [
  "Angul", "Balangir", "Balasore", "Bargarh", "Bhadrak", "Boudh",
  "Cuttack", "Deogarh", "Dhenkanal", "Gajapati", "Ganjam", "Jagatsinghpur",
  "Jajpur", "Jharsuguda", "Kalahandi", "Kandhamal", "Kendrapara", "Kendujhar",
  "Khordha", "Koraput", "Malkangiri", "Mayurbhanj", "Nabarangpur", "Nayagarh",
  "Nuapada", "Puri", "Rayagada", "Sambalpur", "Sonepur", "Sundargarh"
];

export default function SignUp() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const form = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      email: "",
      firstName: "",
      lastName: "",
      district: "",
      role: "volunteer",
    },
  });

  const signupMutation = useMutation({
    mutationFn: async (data: SignUpForm) => {
      const { confirmPassword, ...signupData } = data;
      return apiRequest("/api/auth/signup", "POST", signupData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Account created successfully. Please sign in.",
      });
      setLocation("/signin");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SignUpForm) => {
    signupMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background">
      <AccessibilityBar />
      
      <div className="bg-primary text-primary-foreground py-4 border-b-4 border-primary/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Directorate General</h1>
              <h2 className="text-lg md:text-xl font-semibold text-primary-foreground/95">Fire Services, Civil Defence & Home Guards</h2>
              <p className="text-sm md:text-base text-primary-foreground/90">Ministry of Home Affairs, Government of India</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/">
                <a>
                  <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20" data-testid="link-home">
                    ← Back to Home
                  </Button>
                </a>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-5xl">
          <Card className="shadow-xl">
            <CardHeader className="space-y-3 pb-8">
              <div className="flex justify-center mb-2">
                <div className="p-4 bg-primary/10 rounded-full">
                  <UserPlus className="h-14 w-14 text-primary" />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold text-center">Create New Account</CardTitle>
              <CardDescription className="text-center text-lg">
                Register to access Civil Defence services and resources
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 flex items-start gap-3">
                <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-semibold text-foreground mb-1">Registration Information</p>
                  <p className="text-muted-foreground">
                    Complete this form to create your Civil Defence account. All fields marked with an asterisk (*) are required. 
                    Your account will be created with volunteer access by default.
                  </p>
                </div>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-primary" />
                      Personal Information
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base">First Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter first name" className="h-11 text-base" {...field} data-testid="input-firstname" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base">Last Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter last name" className="h-11 text-base" {...field} data-testid="input-lastname" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">Email Address (Optional)</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="your.email@example.com" className="h-11 text-base" {...field} data-testid="input-email" />
                          </FormControl>
                          <FormDescription>Used for account recovery and notifications</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="district"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">District (Optional)</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-11 text-base" data-testid="select-district">
                                <SelectValue placeholder="Select your district" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {districts.map((district) => (
                                <SelectItem key={district} value={district}>
                                  {district}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="border-t pt-6 space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-primary" />
                      Account Security
                    </h3>

                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">Username *</FormLabel>
                          <FormControl>
                            <Input placeholder="Choose a unique username" className="h-11 text-base" {...field} data-testid="input-username" />
                          </FormControl>
                          <FormDescription>Minimum 3 characters, will be used for login</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base">Password *</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Create a strong password" className="h-11 text-base" {...field} data-testid="input-password" />
                            </FormControl>
                            <FormDescription>Minimum 8 characters</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base">Confirm Password *</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Re-enter your password" className="h-11 text-base" {...field} data-testid="input-confirm-password" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button 
                      type="submit" 
                      className="w-full h-12 text-lg font-semibold" 
                      disabled={signupMutation.isPending}
                      data-testid="button-signup"
                    >
                      {signupMutation.isPending ? "Creating Account..." : "Create Account"}
                    </Button>
                  </div>
                </form>
              </Form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-card px-3 text-muted-foreground">Already have an account?</span>
                </div>
              </div>

              <Link href="/signin">
                <a className="block">
                  <Button variant="outline" className="w-full h-11 text-base" data-testid="link-signin">
                    Sign In Instead
                  </Button>
                </a>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
