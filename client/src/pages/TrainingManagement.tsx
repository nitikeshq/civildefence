import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus, GraduationCap } from "lucide-react";
import { Link } from "wouter";
import { redirectToSignIn } from "@/lib/authRedirect";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

const districts = ["Angul", "Balangir", "Balasore", "Bargarh", "Bhadrak", "Boudh", "Cuttack", "Deogarh", "Dhenkanal", "Gajapati", "Ganjam", "Jagatsinghpur", "Jajpur", "Jharsuguda", "Kalahandi", "Kandhamal", "Kendrapara", "Kendujhar", "Khordha", "Koraput", "Malkangiri", "Mayurbhanj", "Nabarangpur", "Nayagarh", "Nuapada", "Puri", "Rayagada", "Sambalpur", "Subarnapur", "Sundargarh"];

const trainingSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  district: z.string().min(1, "District is required"),
  venue: z.string().min(1, "Venue is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  duration: z.string().min(1, "Duration is required"),
  maxParticipants: z.number().min(1, "Must have at least 1 participant"),
  instructor: z.string().min(1, "Instructor name is required"),
});

type TrainingForm = z.infer<typeof trainingSchema>;

interface TrainingSession {
  id: string;
  title: string;
  district: string;
  venue: string;
  date: string;
  time: string;
  participants: number;
  maxParticipants: number;
  status: "upcoming" | "ongoing" | "completed";
}

const mockSessions: TrainingSession[] = [
  {
    id: "1",
    title: "Emergency Response Training",
    district: "Khordha",
    venue: "Civil Defence HQ, Bhubaneswar",
    date: "2025-11-20",
    time: "10:00 AM",
    participants: 25,
    maxParticipants: 50,
    status: "upcoming",
  },
  {
    id: "2",
    title: "First Aid & Medical Assistance",
    district: "Cuttack",
    venue: "District Training Center",
    date: "2025-11-18",
    time: "2:00 PM",
    participants: 40,
    maxParticipants: 40,
    status: "upcoming",
  },
];

export default function TrainingManagement() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sessions] = useState<TrainingSession[]>(mockSessions);

  const form = useForm<TrainingForm>({
    resolver: zodResolver(trainingSchema),
    defaultValues: {
      title: "",
      description: "",
      district: "",
      venue: "",
      date: "",
      time: "",
      duration: "",
      maxParticipants: 30,
      instructor: "",
    },
  });

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

  const onSubmit = (data: TrainingForm) => {
    toast({
      title: "Success",
      description: "Training session created successfully",
    });
    form.reset();
    setDialogOpen(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      upcoming: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      ongoing: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      completed: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
    };
    return colors[status] || colors.upcoming;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main id="main-content" className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <Link href="/" asChild>
            <Button variant="ghost" className="mb-6" data-testid="button-back">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>

          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-6 w-6" />
                    Training Management
                  </CardTitle>
                  <CardDescription>
                    Schedule and manage volunteer training sessions
                  </CardDescription>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button data-testid="button-create-training">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Training Session
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Create Training Session</DialogTitle>
                      <DialogDescription>
                        Schedule a new training session for volunteers
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Training Title *</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., Emergency Response Training" {...field} data-testid="input-title" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Training objectives and topics covered..." 
                                  {...field}
                                  data-testid="input-description"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="district"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>District *</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-district">
                                      <SelectValue placeholder="Select district" />
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

                          <FormField
                            control={form.control}
                            name="venue"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Venue *</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., District Training Center" {...field} data-testid="input-venue" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Date *</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} data-testid="input-date" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="time"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Time *</FormLabel>
                                <FormControl>
                                  <Input type="time" {...field} data-testid="input-time" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="duration"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Duration *</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., 3 hours" {...field} data-testid="input-duration" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="maxParticipants"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Max Participants *</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="30" 
                                    {...field}
                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                    data-testid="input-max-participants"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="instructor"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Instructor Name *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Instructor's full name" {...field} data-testid="input-instructor" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="flex gap-3 justify-end pt-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setDialogOpen(false)}
                            data-testid="button-cancel"
                          >
                            Cancel
                          </Button>
                          <Button type="submit" data-testid="button-submit">
                            Create Training Session
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sessions.length === 0 ? (
                  <p className="text-center text-muted-foreground py-12">
                    No training sessions scheduled yet
                  </p>
                ) : (
                  sessions.map((session) => (
                    <Card key={session.id} className="hover-elevate" data-testid={`card-session-${session.id}`}>
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold">{session.title}</h3>
                              <Badge className={getStatusColor(session.status)}>
                                {session.status}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                              <p><strong>District:</strong> {session.district}</p>
                              <p><strong>Venue:</strong> {session.venue}</p>
                              <p><strong>Date:</strong> {new Date(session.date).toLocaleDateString()}</p>
                              <p><strong>Time:</strong> {session.time}</p>
                              <p><strong>Participants:</strong> {session.participants}/{session.maxParticipants}</p>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button variant="outline" size="sm" data-testid={`button-view-${session.id}`}>
                              View Details
                            </Button>
                            <Button variant="outline" size="sm" data-testid={`button-manage-${session.id}`}>
                              Manage
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
