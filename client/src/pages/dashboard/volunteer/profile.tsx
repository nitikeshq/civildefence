import { useQuery, useMutation } from "@tanstack/react-query";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import {
  LayoutDashboard,
  ClipboardList,
  GraduationCap,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Award,
  Shield,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import type { Volunteer } from "@shared/schema";

const navItems = [
  { label: "Dashboard", path: "/dashboard/volunteer", icon: LayoutDashboard },
  { label: "My Tasks", path: "/dashboard/volunteer/tasks", icon: ClipboardList },
  { label: "Training", path: "/dashboard/volunteer/trainings", icon: GraduationCap },
  { label: "Profile", path: "/dashboard/volunteer/profile", icon: User },
];

export default function Profile() {
  const { user } = useAuth();

  const { data: volunteer, isLoading } = useQuery<Volunteer>({
    queryKey: ["/api/my-volunteer-profile"],
  });

  const getInitials = (fullName: string | null) => {
    if (!fullName) return "V";
    const names = fullName.trim().split(" ");
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    const first = names[0].charAt(0);
    const last = names[names.length - 1].charAt(0);
    return `${first}${last}`.toUpperCase();
  };

  const getStatusBadge = (status: string | null) => {
    const variants: Record<string, { variant: "default" | "secondary" | "outline"; label: string }> = {
      approved: { variant: "default", label: "Approved" },
      pending: { variant: "secondary", label: "Pending Approval" },
      rejected: { variant: "outline", label: "Rejected" },
    };
    const config = variants[status || "pending"] || variants.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <DashboardLayout navItems={navItems} title="Volunteer Portal">
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
          <p className="text-muted-foreground mt-1">
            View and manage your volunteer profile information
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <div className="h-48 bg-muted animate-pulse rounded-md" />
            <div className="h-64 bg-muted animate-pulse rounded-md" />
          </div>
        ) : (
          <>
            {/* Profile Header Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-6 flex-wrap">
                  <Avatar className="h-24 w-24">
                    <AvatarFallback className="text-2xl">
                      {getInitials(volunteer?.fullName || user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : null)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h2 className="text-2xl font-bold">
                        {user?.firstName} {user?.lastName}
                      </h2>
                      {volunteer?.status && getStatusBadge(volunteer.status)}
                    </div>
                    <p className="text-muted-foreground mt-1">Civil Defence Volunteer</p>
                    <div className="flex items-center gap-4 mt-4 text-sm flex-wrap">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{user?.email}</span>
                      </div>
                      {volunteer?.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{volunteer.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button variant="outline" data-testid="button-edit-profile">
                    Edit Profile
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Personal Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Full Name</p>
                      <p className="font-medium mt-1">
                        {volunteer?.fullName || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Date of Birth</p>
                      <p className="font-medium mt-1">
                        {volunteer?.dateOfBirth || "Not provided"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Address</p>
                    <p className="font-medium mt-1">
                      {volunteer?.address || "Not provided"}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">District</p>
                      <p className="font-medium mt-1">{volunteer?.district || "Not specified"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Phone</p>
                      <p className="font-medium mt-1">{volunteer?.phone || "Not provided"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Volunteer Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {volunteer?.isExServiceman && (
                    <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-md">
                      <Shield className="h-5 w-5 text-primary" />
                      <span className="font-medium">Ex-Serviceman</span>
                    </div>
                  )}
                  {volunteer?.serviceHistory && (
                    <div>
                      <p className="text-muted-foreground text-sm">Service History</p>
                      <p className="font-medium mt-1">{volunteer.serviceHistory}</p>
                    </div>
                  )}
                  {volunteer?.qualifications && (
                    <div>
                      <p className="text-muted-foreground text-sm">Qualifications</p>
                      <p className="font-medium mt-1">{volunteer.qualifications}</p>
                    </div>
                  )}
                  {volunteer?.skills && volunteer.skills.length > 0 && (
                    <div>
                      <p className="text-muted-foreground text-sm mb-2">Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {volunteer.skills.map((skill, index) => (
                          <Badge key={index} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {volunteer?.emergencyContact && (
                    <div className="pt-4 border-t">
                      <p className="text-muted-foreground text-sm font-medium mb-3">
                        Emergency Contact
                      </p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Name</p>
                          <p className="font-medium mt-1">
                            {volunteer.emergencyContact}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Phone</p>
                          <p className="font-medium mt-1">
                            {volunteer.emergencyPhone || "Not provided"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Documents */}
            {(volunteer?.idProofUrl || volunteer?.certificateUrl || volunteer?.photoUrl) && (
              <Card>
                <CardHeader>
                  <CardTitle>Uploaded Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {volunteer.idProofUrl && (
                      <div className="flex items-center justify-between p-4 border rounded-md">
                        <div>
                          <p className="font-medium">ID Proof</p>
                          <p className="text-sm text-muted-foreground">Document</p>
                        </div>
                        <Button size="sm" variant="outline">
                          View
                        </Button>
                      </div>
                    )}
                    {volunteer.certificateUrl && (
                      <div className="flex items-center justify-between p-4 border rounded-md">
                        <div>
                          <p className="font-medium">Certificate</p>
                          <p className="text-sm text-muted-foreground">Document</p>
                        </div>
                        <Button size="sm" variant="outline">
                          View
                        </Button>
                      </div>
                    )}
                    {volunteer.photoUrl && (
                      <div className="flex items-center justify-between p-4 border rounded-md">
                        <div>
                          <p className="font-medium">Photo</p>
                          <p className="text-sm text-muted-foreground">Image</p>
                        </div>
                        <Button size="sm" variant="outline">
                          View
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Registration Info */}
            {volunteer && (
              <Card>
                <CardHeader>
                  <CardTitle>Registration Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Registration Date</p>
                      <p className="font-medium mt-1">
                        {volunteer.createdAt
                          ? new Date(volunteer.createdAt).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Status</p>
                      <div className="mt-1">{getStatusBadge(volunteer.status)}</div>
                    </div>
                    {volunteer.approvedBy && volunteer.approvedAt && (
                      <div>
                        <p className="text-muted-foreground">Approved On</p>
                        <p className="font-medium mt-1">
                          {new Date(volunteer.approvedAt).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
