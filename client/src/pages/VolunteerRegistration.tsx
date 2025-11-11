import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { insertVolunteerSchema } from "@shared/schema";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { redirectToSignIn } from "@/lib/authRedirect";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

const formSchema = insertVolunteerSchema.extend({
  skills: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function VolunteerRegistration() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();

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

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      address: "",
      district: "",
      dateOfBirth: "",
      isExServiceman: false,
      serviceHistory: "",
      skills: "",
      qualifications: "",
      medicalHistory: "",
      emergencyContact: "",
      emergencyPhone: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const { skills, ...rest } = data;
      const volunteerData = {
        ...rest,
        skills: skills ? skills.split(",").map(s => s.trim()) : [],
      };
      await apiRequest("/api/volunteers", "POST", volunteerData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/volunteers"] });
      toast({
        title: "Success",
        description: "Volunteer registration submitted successfully. Awaiting approval.",
      });
      navigate("/");
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: error.message || "Failed to submit volunteer registration",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Link href="/">
            <Button variant="ghost" className="mb-6" data-testid="button-back">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>

          <Card>
            <CardHeader>
              <CardTitle>Volunteer Registration</CardTitle>
              <CardDescription>
                Register to become a Civil Defence volunteer. Your application will be reviewed by district administrators.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter full name" data-testid="input-fullname" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email *</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" placeholder="Enter email" data-testid="input-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter phone number" data-testid="input-phone" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="district"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>District *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter district" data-testid="input-district" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="dateOfBirth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of Birth</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value ?? ""} type="date" data-testid="input-dob" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="emergencyContact"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Emergency Contact</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value ?? ""} placeholder="Emergency contact name" data-testid="input-emergency-contact" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="emergencyPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Emergency Phone</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value ?? ""} placeholder="Emergency phone number" data-testid="input-emergency-phone" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address *</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Enter complete address" data-testid="input-address" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="skills"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Skills (comma-separated)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., First Aid, Swimming, Communication" data-testid="input-skills" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="qualifications"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Qualifications</FormLabel>
                        <FormControl>
                          <Textarea {...field} value={field.value ?? ""} placeholder="Enter educational and professional qualifications" data-testid="input-qualifications" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isExServiceman"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value ?? false}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-ex-serviceman"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            I am an Ex-Serviceman
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  {form.watch("isExServiceman") && (
                    <FormField
                      control={form.control}
                      name="serviceHistory"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Service History</FormLabel>
                          <FormControl>
                            <Textarea {...field} value={field.value ?? ""} placeholder="Enter service history details" data-testid="input-service-history" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="medicalHistory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Medical History</FormLabel>
                        <FormControl>
                          <Textarea {...field} value={field.value ?? ""} placeholder="Enter any relevant medical history" data-testid="input-medical-history" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-3">
                    <Button 
                      type="submit" 
                      disabled={mutation.isPending}
                      data-testid="button-submit"
                    >
                      {mutation.isPending ? "Submitting..." : "Submit Registration"}
                    </Button>
                    <Link href="/">
                      <Button type="button" variant="outline" data-testid="button-cancel">
                        Cancel
                      </Button>
                    </Link>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
