import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { redirectToSignIn } from "@/lib/authRedirect";
import type { Volunteer } from "@shared/schema";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Check, X } from "lucide-react";
import { Link } from "wouter";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function VolunteerApproval() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);

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

  const { data: volunteers = [] } = useQuery<Volunteer[]>({
    queryKey: ["/api/volunteers", searchQuery],
    queryFn: async () => {
      const url = searchQuery 
        ? `/api/volunteers?search=${encodeURIComponent(searchQuery)}`
        : "/api/volunteers?status=pending";
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch volunteers");
      return response.json();
    },
    enabled: isAuthenticated,
  });

  const approveMutation = useMutation({
    mutationFn: async (volunteerId: string) => {
      await apiRequest(`/api/volunteers/${volunteerId}/status`, "PATCH", {
        status: "approved",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/volunteers"] });
      toast({
        title: "Success",
        description: "Volunteer approved successfully",
      });
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
        description: error.message || "Failed to approve volunteer",
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      await apiRequest(`/api/volunteers/${id}/status`, "PATCH", {
        status: "rejected",
        rejectionReason: reason,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/volunteers"] });
      toast({
        title: "Success",
        description: "Volunteer application rejected",
      });
      setShowRejectDialog(false);
      setRejectionReason("");
      setSelectedVolunteer(null);
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
        description: error.message || "Failed to reject volunteer",
        variant: "destructive",
      });
    },
  });

  const handleApprove = (volunteerId: string) => {
    approveMutation.mutate(volunteerId);
  };

  const handleReject = (volunteer: Volunteer) => {
    setSelectedVolunteer(volunteer);
    setShowRejectDialog(true);
  };

  const confirmReject = () => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for rejection",
        variant: "destructive",
      });
      return;
    }
    if (!selectedVolunteer) return;
    rejectMutation.mutate({ id: selectedVolunteer.id, reason: rejectionReason });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user?.role || user.role === "volunteer") {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>
                You don't have permission to access this page. Only administrators can approve volunteers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/">
                <Button>Return to Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      approved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    };
    return colors[status] || colors.pending;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main id="main-content" className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <Link href="/">
            <Button variant="ghost" className="mb-6" data-testid="button-back">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>

          <Card>
            <CardHeader>
              <CardTitle>Volunteer Approval</CardTitle>
              <CardDescription>
                Review and approve volunteer applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search volunteers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    data-testid="input-search"
                  />
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>District</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {volunteers.length > 0 ? (
                      volunteers.map(volunteer => (
                        <TableRow key={volunteer.id} data-testid={`row-volunteer-${volunteer.id}`}>
                          <TableCell className="font-medium">{volunteer.fullName}</TableCell>
                          <TableCell>{volunteer.email}</TableCell>
                          <TableCell>{volunteer.phone}</TableCell>
                          <TableCell>{volunteer.district}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(volunteer.status ?? "pending")}>
                              {volunteer.status ?? "pending"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {volunteer.status === "pending" && (
                              <div className="flex gap-2 justify-end">
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => handleApprove(volunteer.id)}
                                  disabled={approveMutation.isPending}
                                  data-testid={`button-approve-${volunteer.id}`}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleReject(volunteer)}
                                  disabled={rejectMutation.isPending}
                                  data-testid={`button-reject-${volunteer.id}`}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          {searchQuery ? "No volunteers found matching your search" : "No pending volunteer applications"}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Volunteer Application</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this application. This will be communicated to the applicant.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Enter rejection reason..."
            rows={4}
            data-testid="input-rejection-reason"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)} data-testid="button-cancel-reject">
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmReject}
              disabled={rejectMutation.isPending}
              data-testid="button-confirm-reject"
            >
              {rejectMutation.isPending ? "Rejecting..." : "Confirm Rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
