import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Users, Search, Eye, Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Label } from "@/components/ui/label";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useScopedVolunteers } from "@/hooks/useScopedData";
import { getDashboardTitle, getDashboardSubtitle, getNavigationItems } from "@/lib/roleUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { LayoutDashboard, AlertTriangle, Package, BarChart3, ClipboardList, Activity } from "lucide-react";
import type { Volunteer } from "@shared/schema";

export default function DashboardVolunteers() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const { data: volunteers = [], isLoading } = useScopedVolunteers();

  // Navigation items with icons
  const navItemsWithIcons = getNavigationItems(user?.role).map((item) => {
    const iconMap: Record<string, any> = {
      LayoutDashboard,
      Users,
      AlertTriangle,
      Package,
      BarChart3,
      ClipboardList,
    };
    return {
      ...item,
      icon: iconMap[item.icon] || Activity,
    };
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
      v.phone?.includes(searchQuery) ||
      v.district?.toLowerCase().includes(searchQuery.toLowerCase())
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

  return (
    <DashboardLayout 
      navItems={navItemsWithIcons} 
      title={getDashboardTitle(user?.role)}
      subtitle={getDashboardSubtitle(user?.role, user?.district)}
    >
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Volunteers Management</h1>
            <p className="text-muted-foreground mt-1">
              Review and approve volunteer applications
            </p>
          </div>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search volunteers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-volunteers"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card data-testid="card-pending-volunteers">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? "..." : pendingVolunteers.length}</div>
            </CardContent>
          </Card>
          <Card data-testid="card-approved-volunteers">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <Check className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? "..." : approvedVolunteers.length}</div>
            </CardContent>
          </Card>
          <Card data-testid="card-rejected-volunteers">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <X className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? "..." : rejectedVolunteers.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Volunteers Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Volunteers ({filteredVolunteers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : filteredVolunteers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No volunteers found
              </div>
            ) : (
              <div className="space-y-2">
                {filteredVolunteers.map((volunteer) => (
                  <div
                    key={volunteer.id}
                    className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-md border hover-elevate"
                    data-testid={`volunteer-${volunteer.id}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{volunteer.fullName}</p>
                      <p className="text-sm text-muted-foreground">
                        {volunteer.email} • {volunteer.phone}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        District: {volunteer.district}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {getStatusBadge(volunteer.status)}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedVolunteer(volunteer);
                          setShowDetailsDialog(true);
                        }}
                        data-testid={`button-view-${volunteer.id}`}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Volunteer Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Volunteer Details</DialogTitle>
            <DialogDescription>
              Review volunteer application information
            </DialogDescription>
          </DialogHeader>
          {selectedVolunteer && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Full Name</Label>
                  <p className="text-sm">{selectedVolunteer.fullName}</p>
                </div>
                <div>
                  <Label>District</Label>
                  <p className="text-sm">{selectedVolunteer.district}</p>
                </div>
                <div>
                  <Label>Email</Label>
                  <p className="text-sm">{selectedVolunteer.email}</p>
                </div>
                <div>
                  <Label>Phone</Label>
                  <p className="text-sm">{selectedVolunteer.phone}</p>
                </div>
                <div className="col-span-2">
                  <Label>Address</Label>
                  <p className="text-sm">{selectedVolunteer.address}</p>
                </div>
                <div>
                  <Label>Date of Birth</Label>
                  <p className="text-sm">{selectedVolunteer.dateOfBirth || "N/A"}</p>
                </div>
                <div>
                  <Label>Ex-Serviceman</Label>
                  <p className="text-sm">{selectedVolunteer.isExServiceman ? "Yes" : "No"}</p>
                </div>
                {selectedVolunteer.skills && selectedVolunteer.skills.length > 0 && (
                  <div className="col-span-2">
                    <Label>Skills</Label>
                    <p className="text-sm">{selectedVolunteer.skills.join(", ")}</p>
                  </div>
                )}
                <div className="col-span-2">
                  <Label>Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedVolunteer.status)}</div>
                </div>
                {selectedVolunteer.rejectionReason && (
                  <div className="col-span-2">
                    <Label>Rejection Reason</Label>
                    <p className="text-sm text-destructive">{selectedVolunteer.rejectionReason}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            {selectedVolunteer?.status === "pending" && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setShowRejectDialog(true)}
                  data-testid="button-reject-volunteer"
                >
                  <X className="h-4 w-4 mr-1" />
                  Reject
                </Button>
                <Button
                  onClick={() => handleApprove(selectedVolunteer.id)}
                  disabled={approveMutation.isPending}
                  data-testid="button-approve-volunteer"
                >
                  <Check className="h-4 w-4 mr-1" />
                  Approve
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Volunteer Application</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejection. The volunteer will be able to reapply.
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label htmlFor="rejection-reason">Rejection Reason *</Label>
            <Textarea
              id="rejection-reason"
              placeholder="Enter reason for rejection..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="mt-2"
              rows={4}
              data-testid="textarea-rejection-reason"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={rejectMutation.isPending || !rejectionReason.trim()}
              data-testid="button-confirm-reject"
            >
              Reject Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
