import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, CheckCircle, XCircle, Eye, Phone, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Volunteer } from "@shared/schema";

export default function DistrictAdminVolunteers() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const { data: volunteers = [], isLoading } = useQuery<Volunteer[]>({
    queryKey: ["/api/volunteers"],
  });

  const approveMutation = useMutation({
    mutationFn: async (volunteerId: string) => {
      return await apiRequest(`/api/volunteers/${volunteerId}/status`, "PATCH", {
        status: "approved",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/volunteers"] });
      toast({
        title: "Success",
        description: "Volunteer approved successfully",
      });
      setShowDetailsDialog(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to approve volunteer",
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      return await apiRequest(`/api/volunteers/${id}/status`, "PATCH", {
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
      setShowDetailsDialog(false);
      setRejectionReason("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reject volunteer",
        variant: "destructive",
      });
    },
  });

  const handleApprove = (volunteerId: string) => {
    approveMutation.mutate(volunteerId);
  };

  const handleReject = () => {
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

  const filteredVolunteers = volunteers.filter(
    (v) =>
      v.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.phone?.includes(searchQuery)
  );

  const pendingVolunteers = filteredVolunteers.filter((v) => v.status === "pending");
  const approvedVolunteers = filteredVolunteers.filter((v) => v.status === "approved");
  const rejectedVolunteers = filteredVolunteers.filter((v) => v.status === "rejected");

  const getStatusBadge = (status: string | null) => {
    const variants: Record<string, { variant: "default" | "secondary" | "outline"; label: string }> = {
      pending: { variant: "secondary", label: "Pending" },
      approved: { variant: "default", label: "Approved" },
      rejected: { variant: "outline", label: "Rejected" },
    };
    const config = variants[status || "pending"] || variants.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const VolunteerTable = ({ volunteers }: { volunteers: Volunteer[] }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>District</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {volunteers.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center text-muted-foreground">
              No volunteers found
            </TableCell>
          </TableRow>
        ) : (
          volunteers.map((volunteer) => (
            <TableRow key={volunteer.id}>
              <TableCell className="font-medium">{volunteer.fullName}</TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-3 w-3" />
                    <span>{volunteer.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    <span>{volunteer.email}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell>{volunteer.district}</TableCell>
              <TableCell>
                <Badge variant="outline">
                  {volunteer.volunteerType === "ex_serviceman" ? "Ex-Serviceman" : "Civilian"}
                </Badge>
              </TableCell>
              <TableCell>{getStatusBadge(volunteer.status)}</TableCell>
              <TableCell>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setSelectedVolunteer(volunteer);
                    setShowDetailsDialog(true);
                  }}
                  data-testid={`button-view-${volunteer.id}`}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Volunteer Management</h1>
          <p className="text-muted-foreground">Approve and manage volunteer applications</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search volunteers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-volunteers"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingVolunteers.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedVolunteers.length}</div>
            <p className="text-xs text-muted-foreground">Active volunteers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredVolunteers.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="pending">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pending" data-testid="tab-pending">
                Pending ({pendingVolunteers.length})
              </TabsTrigger>
              <TabsTrigger value="approved" data-testid="tab-approved">
                Approved ({approvedVolunteers.length})
              </TabsTrigger>
              <TabsTrigger value="rejected" data-testid="tab-rejected">
                Rejected ({rejectedVolunteers.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="mt-4">
              <VolunteerTable volunteers={pendingVolunteers} />
            </TabsContent>

            <TabsContent value="approved" className="mt-4">
              <VolunteerTable volunteers={approvedVolunteers} />
            </TabsContent>

            <TabsContent value="rejected" className="mt-4">
              <VolunteerTable volunteers={rejectedVolunteers} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Volunteer Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Volunteer Details</DialogTitle>
            <DialogDescription>
              Review volunteer application and approve or reject
            </DialogDescription>
          </DialogHeader>

          {selectedVolunteer && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium">Full Name</p>
                  <p className="text-sm text-muted-foreground">{selectedVolunteer.fullName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Status</p>
                  {getStatusBadge(selectedVolunteer.status)}
                </div>
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{selectedVolunteer.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <p className="text-sm text-muted-foreground">{selectedVolunteer.phone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">District</p>
                  <p className="text-sm text-muted-foreground">{selectedVolunteer.district}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Volunteer Type</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedVolunteer.volunteerType === "ex_serviceman" ? "Ex-Serviceman" : "Civilian"}
                  </p>
                </div>
                {selectedVolunteer.dateOfBirth && (
                  <div>
                    <p className="text-sm font-medium">Date of Birth</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(selectedVolunteer.dateOfBirth).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {selectedVolunteer.gender && (
                  <div>
                    <p className="text-sm font-medium">Gender</p>
                    <p className="text-sm text-muted-foreground capitalize">{selectedVolunteer.gender}</p>
                  </div>
                )}
              </div>

              {selectedVolunteer.address && (
                <div>
                  <p className="text-sm font-medium">Address</p>
                  <p className="text-sm text-muted-foreground">{selectedVolunteer.address}</p>
                </div>
              )}

              {selectedVolunteer.skills && selectedVolunteer.skills.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedVolunteer.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedVolunteer.emergencyContact && (
                <div>
                  <p className="text-sm font-medium">Emergency Contact</p>
                  <p className="text-sm text-muted-foreground">{selectedVolunteer.emergencyContact}</p>
                </div>
              )}

              {selectedVolunteer.status === "rejected" && selectedVolunteer.rejectionReason && (
                <div>
                  <p className="text-sm font-medium">Rejection Reason</p>
                  <p className="text-sm text-muted-foreground">{selectedVolunteer.rejectionReason}</p>
                </div>
              )}
            </div>
          )}

          {selectedVolunteer?.status === "pending" && (
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDetailsDialog(false);
                  setShowRejectDialog(true);
                }}
                data-testid="button-reject"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
              <Button
                onClick={() => handleApprove(selectedVolunteer.id)}
                disabled={approveMutation.isPending}
                data-testid="button-approve"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Volunteer Application</DialogTitle>
            <DialogDescription>Please provide a reason for rejection</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Enter reason for rejection..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              data-testid="input-rejection-reason"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleReject}
              disabled={rejectMutation.isPending || !rejectionReason.trim()}
              data-testid="button-confirm-reject"
            >
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
