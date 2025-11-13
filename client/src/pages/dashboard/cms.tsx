import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { getAdminNavItems } from "@/lib/roleUtils";
import { useAuth } from "@/hooks/useAuth";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Translation, HeroBanner, AboutContent, Service, SiteSetting } from "@shared/schema";

export default function CMSManager() {
  const { user } = useAuth();
  const navItems = useMemo(() => getAdminNavItems(user?.role || ""), [user?.role]);

  return (
    <DashboardLayout navItems={navItems}>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">CMS Manager</h1>
          <p className="text-muted-foreground" data-testid="text-page-subtitle">
            Manage website content, translations, and settings
          </p>
        </div>

        <Tabs defaultValue="translations" className="space-y-4">
          <TabsList data-testid="tabs-cms-sections">
            <TabsTrigger value="translations" data-testid="tab-translations">Translations</TabsTrigger>
            <TabsTrigger value="hero-banners" data-testid="tab-hero-banners">Hero Banners</TabsTrigger>
            <TabsTrigger value="about" data-testid="tab-about">About Content</TabsTrigger>
            <TabsTrigger value="services" data-testid="tab-services">Services</TabsTrigger>
            <TabsTrigger value="settings" data-testid="tab-settings">Site Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="translations">
            <TranslationsManager />
          </TabsContent>

          <TabsContent value="hero-banners">
            <HeroBannersManager />
          </TabsContent>

          <TabsContent value="about">
            <AboutContentManager />
          </TabsContent>

          <TabsContent value="services">
            <ServicesManager />
          </TabsContent>

          <TabsContent value="settings">
            <SiteSettingsManager />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

function TranslationsManager() {
  const { data: translations, isLoading } = useQuery<Translation[]>({
    queryKey: ['/api/cms/translations'],
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <div>
          <CardTitle data-testid="text-section-title">Translations</CardTitle>
          <CardDescription>Manage bilingual content (English & Odia)</CardDescription>
        </div>
        <Button data-testid="button-add-translation">
          <Plus className="w-4 h-4 mr-2" />
          Add Translation
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-muted-foreground">Loading translations...</p>
        ) : (
          <div className="text-sm text-muted-foreground">
            {translations?.length || 0} translation(s) found. Form implementation pending.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function HeroBannersManager() {
  const { data: banners, isLoading } = useQuery<HeroBanner[]>({
    queryKey: ['/api/cms/hero-banners'],
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <div>
          <CardTitle data-testid="text-section-title">Hero Banners</CardTitle>
          <CardDescription>Manage homepage slider images and content</CardDescription>
        </div>
        <Button data-testid="button-add-hero-banner">
          <Plus className="w-4 h-4 mr-2" />
          Add Banner
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-muted-foreground">Loading hero banners...</p>
        ) : (
          <div className="text-sm text-muted-foreground">
            {banners?.length || 0} banner(s) found. Form implementation pending.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AboutContentManager() {
  const { data: content, isLoading } = useQuery<AboutContent[]>({
    queryKey: ['/api/cms/about'],
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <div>
          <CardTitle data-testid="text-section-title">About Content</CardTitle>
          <CardDescription>Manage about section blocks and information</CardDescription>
        </div>
        <Button data-testid="button-add-about-content">
          <Plus className="w-4 h-4 mr-2" />
          Add Content Block
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-muted-foreground">Loading about content...</p>
        ) : (
          <div className="text-sm text-muted-foreground">
            {content?.length || 0} content block(s) found. Form implementation pending.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ServicesManager() {
  const { data: services, isLoading } = useQuery<Service[]>({
    queryKey: ['/api/cms/services'],
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <div>
          <CardTitle data-testid="text-section-title">Services</CardTitle>
          <CardDescription>Manage services offered by Civil Defence</CardDescription>
        </div>
        <Button data-testid="button-add-service">
          <Plus className="w-4 h-4 mr-2" />
          Add Service
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-muted-foreground">Loading services...</p>
        ) : (
          <div className="text-sm text-muted-foreground">
            {services?.length || 0} service(s) found. Form implementation pending.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SiteSettingsManager() {
  const { data: settings, isLoading } = useQuery<SiteSetting[]>({
    queryKey: ['/api/cms/settings'],
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <div>
          <CardTitle data-testid="text-section-title">Site Settings</CardTitle>
          <CardDescription>Manage general site configuration</CardDescription>
        </div>
        <Button data-testid="button-add-setting">
          <Plus className="w-4 h-4 mr-2" />
          Add Setting
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-muted-foreground">Loading site settings...</p>
        ) : (
          <div className="text-sm text-muted-foreground">
            {settings?.length || 0} setting(s) found. Form implementation pending.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
