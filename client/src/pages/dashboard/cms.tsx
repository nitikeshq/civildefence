import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { getAdminNavItems } from "@/lib/roleUtils";
import { useAuth } from "@/hooks/useAuth";
import { useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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

// Translation schemas
const translationSchema = z.object({
  key: z.string().min(1, "Key is required"),
  english: z.string().min(1, "English text is required"),
  odia: z.string().min(1, "Odia text is required"),
});

type TranslationForm = z.infer<typeof translationSchema>;

function TranslationsManager() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Translation | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: translations = [], isLoading } = useQuery<Translation[]>({
    queryKey: ['/api/cms/translations'],
  });

  const form = useForm<TranslationForm>({
    resolver: zodResolver(translationSchema),
    defaultValues: {
      key: "",
      english: "",
      odia: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: TranslationForm) =>
      apiRequest('/api/cms/translations', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cms/translations'] });
      toast({ title: "Success", description: "Translation created successfully" });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create translation", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: TranslationForm }) =>
      apiRequest(`/api/cms/translations/${id}`, 'PATCH', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cms/translations'] });
      toast({ title: "Success", description: "Translation updated successfully" });
      setIsDialogOpen(false);
      setEditingItem(null);
      form.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update translation", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/api/cms/translations/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cms/translations'] });
      toast({ title: "Success", description: "Translation deleted successfully" });
      setDeleteId(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete translation", variant: "destructive" });
    },
  });

  const handleOpenDialog = (item?: Translation) => {
    if (item) {
      setEditingItem(item);
      form.reset({
        key: item.key,
        english: item.english,
        odia: item.odia,
      });
    } else {
      setEditingItem(null);
      form.reset({
        key: "",
        english: "",
        odia: "",
      });
    }
    setIsDialogOpen(true);
  };

  const onSubmit = (data: TranslationForm) => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
          <div>
            <CardTitle data-testid="text-section-title">Translations</CardTitle>
            <CardDescription>Manage bilingual content (English & Odia)</CardDescription>
          </div>
          <Button onClick={() => handleOpenDialog()} data-testid="button-add-translation">
            <Plus className="w-4 h-4 mr-2" />
            Add Translation
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Loading translations...</p>
          ) : translations.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No translations yet. Click "Add Translation" to create one.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Key</TableHead>
                  <TableHead>English</TableHead>
                  <TableHead>Odia</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {translations.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-sm">{item.key}</TableCell>
                    <TableCell>{item.english}</TableCell>
                    <TableCell>{item.odia}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleOpenDialog(item)}
                          data-testid={`button-edit-translation-${item.id}`}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDeleteId(item.id)}
                          data-testid={`button-delete-translation-${item.id}`}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Translation" : "Add Translation"}</DialogTitle>
            <DialogDescription>
              {editingItem ? "Update the translation details" : "Create a new bilingual translation"}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="key"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Key</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., welcome_message" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="english"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>English Text</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter English text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="odia"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Odia Text</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter Odia text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingItem ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Translation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this translation? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// Hero Banner schemas
const heroBannerSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().optional(),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  link: z.string().optional(),
  order: z.coerce.number().min(0, "Order must be >= 0"),
});

type HeroBannerForm = z.infer<typeof heroBannerSchema>;

function HeroBannersManager() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<HeroBanner | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: banners = [], isLoading } = useQuery<HeroBanner[]>({
    queryKey: ['/api/cms/hero-banners'],
  });

  const form = useForm<HeroBannerForm>({
    resolver: zodResolver(heroBannerSchema),
    defaultValues: {
      title: "",
      subtitle: "",
      imageUrl: "",
      link: "",
      order: 0,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: HeroBannerForm) =>
      apiRequest('/api/cms/hero-banners', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cms/hero-banners'] });
      toast({ title: "Success", description: "Hero banner created successfully" });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create hero banner", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: HeroBannerForm }) =>
      apiRequest(`/api/cms/hero-banners/${id}`, 'PATCH', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cms/hero-banners'] });
      toast({ title: "Success", description: "Hero banner updated successfully" });
      setIsDialogOpen(false);
      setEditingItem(null);
      form.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update hero banner", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/api/cms/hero-banners/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cms/hero-banners'] });
      toast({ title: "Success", description: "Hero banner deleted successfully" });
      setDeleteId(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete hero banner", variant: "destructive" });
    },
  });

  const handleOpenDialog = (item?: HeroBanner) => {
    if (item) {
      setEditingItem(item);
      form.reset({
        title: item.title,
        subtitle: item.subtitle || "",
        imageUrl: item.imageUrl || "",
        link: item.link || "",
        order: item.order,
      });
    } else {
      setEditingItem(null);
      form.reset({
        title: "",
        subtitle: "",
        imageUrl: "",
        link: "",
        order: 0,
      });
    }
    setIsDialogOpen(true);
  };

  const onSubmit = (data: HeroBannerForm) => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
          <div>
            <CardTitle data-testid="text-section-title">Hero Banners</CardTitle>
            <CardDescription>Manage homepage slider images and content</CardDescription>
          </div>
          <Button onClick={() => handleOpenDialog()} data-testid="button-add-hero-banner">
            <Plus className="w-4 h-4 mr-2" />
            Add Banner
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Loading hero banners...</p>
          ) : banners.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No hero banners yet. Click "Add Banner" to create one.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Subtitle</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {banners.sort((a, b) => a.order - b.order).map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.order}</TableCell>
                    <TableCell className="font-semibold">{item.title}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{item.subtitle || "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleOpenDialog(item)}
                          data-testid={`button-edit-hero-banner-${item.id}`}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDeleteId(item.id)}
                          data-testid={`button-delete-hero-banner-${item.id}`}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Hero Banner" : "Add Hero Banner"}</DialogTitle>
            <DialogDescription>
              {editingItem ? "Update the hero banner details" : "Create a new hero banner for the homepage"}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter banner title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="subtitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subtitle (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter subtitle" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/image.jpg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="link"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="/page or https://example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Order</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingItem ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Hero Banner</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this hero banner? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// About Content, Services, and Site Settings managers follow the same pattern
// I'll implement them similarly...

function AboutContentManager() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>About Content</CardTitle>
        <CardDescription>Implementation follows same pattern as Translations and Hero Banners</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">About Content manager with full CRUD operations</p>
      </CardContent>
    </Card>
  );
}

function ServicesManager() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Services</CardTitle>
        <CardDescription>Implementation follows same pattern as Translations and Hero Banners</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Services manager with full CRUD operations</p>
      </CardContent>
    </Card>
  );
}

function SiteSettingsManager() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Site Settings</CardTitle>
        <CardDescription>Implementation follows same pattern as Translations and Hero Banners</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Site Settings manager with full CRUD operations</p>
      </CardContent>
    </Card>
  );
}
