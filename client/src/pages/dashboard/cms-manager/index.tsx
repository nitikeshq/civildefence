import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { redirectToSignIn } from "@/lib/authRedirect";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/DashboardLayout";
import CMSSidebar from "@/components/CMSSidebar";
import { 
  Languages, 
  Image, 
  Info, 
  Briefcase,
  Users,
  Activity
} from "lucide-react";

export default function CMSDashboard() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();

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

    if (!isLoading && user?.role !== "cms_manager") {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    }
  }, [isAuthenticated, isLoading, user, toast]);

  const statsCards = [
    {
      title: "Translations",
      value: "2 Languages",
      description: "English & Odia",
      icon: Languages,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Hero Banners",
      value: "3",
      description: "Active banners",
      icon: Image,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "About Sections",
      value: "4",
      description: "Content sections",
      icon: Info,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Services",
      value: "6",
      description: "Service offerings",
      icon: Briefcase,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Total Users",
      value: "5",
      description: "System users",
      icon: Users,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
    {
      title: "System Status",
      value: "Active",
      description: "All systems operational",
      icon: Activity,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <DashboardLayout sidebar={<CMSSidebar />}>
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            CMS Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage website content, translations, and site settings
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {statsCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common CMS management tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <a
                  href="/cms/translations"
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors"
                >
                  <Languages className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Manage Translations</p>
                    <p className="text-sm text-muted-foreground">Edit text in English & Odia</p>
                  </div>
                </a>
                <a
                  href="/cms/banners"
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors"
                >
                  <Image className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Edit Hero Banners</p>
                    <p className="text-sm text-muted-foreground">Update homepage slider</p>
                  </div>
                </a>
                <a
                  href="/cms/services"
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors"
                >
                  <Briefcase className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Update Services</p>
                    <p className="text-sm text-muted-foreground">Manage service offerings</p>
                  </div>
                </a>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest content updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-2 rounded-full bg-green-500"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Hero banner updated</p>
                    <p className="text-xs text-muted-foreground">Today at 10:30 AM</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-2 rounded-full bg-blue-500"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Translation added</p>
                    <p className="text-xs text-muted-foreground">Yesterday at 3:15 PM</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-2 rounded-full bg-purple-500"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Service description updated</p>
                    <p className="text-xs text-muted-foreground">2 days ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
