import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, AlertTriangle, GraduationCap, MapPin } from "lucide-react";
import { Link } from "wouter";

interface DistrictStats {
  district: string;
  volunteers: {
    total: number;
    approved: number;
    pending: number;
  };
  incidents: {
    total: number;
    active: number;
    critical: number;
  };
  trainings: {
    total: number;
    upcoming: number;
  };
}

export default function DistrictMap() {
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);

  const { data: districtStats = [], isLoading } = useQuery<DistrictStats[]>({
    queryKey: ['/api/district-stats'],
  });

  const getDistrictColor = (district: DistrictStats) => {
    const volunteerCount = district.volunteers.approved;
    if (volunteerCount >= 20) return "bg-green-500/20 border-green-500 hover:bg-green-500/30";
    if (volunteerCount >= 10) return "bg-blue-500/20 border-blue-500 hover:bg-blue-500/30";
    if (volunteerCount >= 5) return "bg-yellow-500/20 border-yellow-500 hover:bg-yellow-500/30";
    return "bg-red-500/20 border-red-500 hover:bg-red-500/30";
  };

  const getStatusBadge = (count: number, label: string, variant: "default" | "secondary" | "destructive" | "outline") => (
    <Badge variant={variant} className="text-xs">
      {count} {label}
    </Badge>
  );

  const selectedStats = districtStats.find(d => d.district === selectedDistrict);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-6 border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <MapPin className="h-8 w-8" />
                Odisha District Map
              </h1>
              <p className="text-primary-foreground/80 mt-1">
                Interactive district-wise Civil Defence statistics
              </p>
            </div>
            <Link href="/dashboard/overview" asChild>
              <Button variant="outline" className="bg-white/10 border-white text-white hover:bg-white hover:text-foreground">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-muted/50 py-4 border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm font-semibold text-muted-foreground">Volunteer Strength:</span>
            <div className="flex gap-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-green-500/40 border border-green-500"></div>
                <span className="text-sm">20+ Volunteers</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-blue-500/40 border border-blue-500"></div>
                <span className="text-sm">10-19 Volunteers</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-yellow-500/40 border border-yellow-500"></div>
                <span className="text-sm">5-9 Volunteers</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-red-500/40 border border-red-500"></div>
                <span className="text-sm">&lt;5 Volunteers</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* District Grid */}
          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-4">Loading district data...</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {districtStats.map((district) => (
                  <Card
                    key={district.district}
                    className={`cursor-pointer transition-all hover-elevate ${getDistrictColor(district)} ${
                      selectedDistrict === district.district ? 'ring-2 ring-primary shadow-lg' : ''
                    }`}
                    onClick={() => setSelectedDistrict(district.district)}
                    data-testid={`card-district-${district.district}`}
                  >
                    <CardHeader className="p-3 pb-2">
                      <CardTitle className="text-sm font-bold text-foreground truncate">
                        {district.district}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-0 space-y-1">
                      <div className="flex items-center gap-1 text-xs">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span className="font-semibold">{district.volunteers.approved}</span>
                      </div>
                      {district.incidents.critical > 0 && (
                        <div className="flex items-center gap-1 text-xs text-destructive">
                          <AlertTriangle className="h-3 w-3" />
                          <span className="font-semibold">{district.incidents.critical}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Summary Stats */}
            {!isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Total Volunteers
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {districtStats.reduce((sum, d) => sum + d.volunteers.approved, 0)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {districtStats.reduce((sum, d) => sum + d.volunteers.pending, 0)} pending
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Active Incidents
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {districtStats.reduce((sum, d) => sum + d.incidents.active, 0)}
                    </div>
                    <p className="text-xs text-destructive mt-1">
                      {districtStats.reduce((sum, d) => sum + d.incidents.critical, 0)} critical
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      Training Programs
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {districtStats.reduce((sum, d) => sum + d.trainings.upcoming, 0)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">upcoming sessions</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* District Details Panel */}
          <div className="lg:col-span-1">
            {selectedStats ? (
              <Card className="sticky top-4">
                <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    {selectedStats.district} District
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Volunteers */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-foreground flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        Volunteers
                      </h3>
                      <span className="text-2xl font-bold text-primary">
                        {selectedStats.volunteers.total}
                      </span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {getStatusBadge(selectedStats.volunteers.approved, "Approved", "default")}
                      {getStatusBadge(selectedStats.volunteers.pending, "Pending", "secondary")}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-foreground flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-chart-2" />
                        Incidents
                      </h3>
                      <span className="text-2xl font-bold text-chart-2">
                        {selectedStats.incidents.total}
                      </span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {getStatusBadge(selectedStats.incidents.active, "Active", "secondary")}
                      {selectedStats.incidents.critical > 0 && 
                        getStatusBadge(selectedStats.incidents.critical, "Critical", "destructive")
                      }
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-foreground flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-chart-3" />
                        Trainings
                      </h3>
                      <span className="text-2xl font-bold text-chart-3">
                        {selectedStats.trainings.total}
                      </span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {getStatusBadge(selectedStats.trainings.upcoming, "Upcoming", "outline")}
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button 
                      className="w-full" 
                      onClick={() => setSelectedDistrict(null)}
                      data-testid="button-clear-selection"
                    >
                      Clear Selection
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="sticky top-4">
                <CardContent className="p-12 text-center">
                  <MapPin className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Click on a district to view detailed statistics
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
