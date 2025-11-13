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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  insertTranslationSchema,
  insertHeroBannerSchema,
  insertAboutContentSchema,
  insertServiceSchema,
  insertSiteSettingSchema,
  type InsertTranslation,
  type Translation,
  type InsertHeroBanner,
  type HeroBanner,
  type InsertAboutContent,
  type AboutContent,
  type InsertService,
  type Service,
  type InsertSiteSetting,
  type SiteSetting,
} from "@shared/schema";

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

// Translations Manager - handles key/language/value structure
const translationSchema = z.object({
  key: z.string().min(1, "Key is required"),
  language: z.enum(["en", "or"]),
  value: z.string().min(1, "Value is required"),
  category: z.string().optional(),
});

type TranslationForm = z.infer<typeof translationSchema>;
type Translation = TranslationForm & { id: string; createdAt: Date | null; updatedAt: Date | null };

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
      language: "en",
      value: "",
      category: "",
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
        language: item.language as "en" | "or",
        value: item.value,
        category: item.category || "",
      });
    } else {
      setEditingItem(null);
      form.reset({
        key: "",
        language: "en",
        value: "",
        category: "",
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
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Key</TableHead>
                    <TableHead>Language</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {translations.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-sm">{item.key}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-primary/10 text-primary">
                          {item.language === 'en' ? 'English' : 'Odia'}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-md truncate">{item.value}</TableCell>
                      <TableCell className="text-muted-foreground">{item.category || "-"}</TableCell>
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
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Translation" : "Add Translation"}</DialogTitle>
            <DialogDescription>
              {editingItem ? "Update the translation details" : "Create a new translation entry"}
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
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Language</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="or">Odia</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Value</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter translation text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., navigation, homepage" {...field} />
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

// Hero Banners Manager - bilingual fields in same record
const heroBannerSchema = z.object({
  title_en: z.string().min(1, "English title is required"),
  title_or: z.string().min(1, "Odia title is required"),
  subtitle_en: z.string().min(1, "English subtitle is required"),
  subtitle_or: z.string().min(1, "Odia subtitle is required"),
  imageUrl: z.string().min(1, "Image URL is required"),
  buttonText_en: z.string().optional(),
  buttonText_or: z.string().optional(),
  buttonLink: z.string().optional(),
  order: z.coerce.number().min(0, "Order must be >= 0").default(0),
  isActive: z.boolean().default(true),
});

type HeroBannerForm = z.infer<typeof heroBannerSchema>;
type HeroBanner = HeroBannerForm & { id: string; createdAt: Date | null; updatedAt: Date | null };

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
      title_en: "",
      title_or: "",
      subtitle_en: "",
      subtitle_or: "",
      imageUrl: "",
      buttonText_en: "",
      buttonText_or: "",
      buttonLink: "",
      order: 0,
      isActive: true,
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
        title_en: item.title_en,
        title_or: item.title_or,
        subtitle_en: item.subtitle_en,
        subtitle_or: item.subtitle_or,
        imageUrl: item.imageUrl,
        buttonText_en: item.buttonText_en || "",
        buttonText_or: item.buttonText_or || "",
        buttonLink: item.buttonLink || "",
        order: item.order || 0,
        isActive: item.isActive ?? true,
      });
    } else {
      setEditingItem(null);
      form.reset({
        title_en: "",
        title_or: "",
        subtitle_en: "",
        subtitle_or: "",
        imageUrl: "",
        buttonText_en: "",
        buttonText_or: "",
        buttonLink: "",
        order: 0,
        isActive: true,
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
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Title (EN)</TableHead>
                    <TableHead>Title (OR)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {banners.sort((a, b) => (a.order || 0) - (b.order || 0)).map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.order}</TableCell>
                      <TableCell className="font-semibold">{item.title_en}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{item.title_or}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          item.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                        }`}>
                          {item.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </TableCell>
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
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Hero Banner" : "Add Hero Banner"}</DialogTitle>
            <DialogDescription>
              {editingItem ? "Update the hero banner details" : "Create a new hero banner for the homepage"}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title_en"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title (English)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter English title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="title_or"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title (Odia)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter Odia title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="subtitle_en"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subtitle (English)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter English subtitle" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="subtitle_or"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subtitle (Odia)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter Odia subtitle" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/image.jpg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="buttonText_en"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Button Text (English) - Optional</FormLabel>
                      <FormControl>
                        <Input placeholder="Learn More" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="buttonText_or"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Button Text (Odia) - Optional</FormLabel>
                      <FormControl>
                        <Input placeholder="Odia button text" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="buttonLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Button Link - Optional</FormLabel>
                    <FormControl>
                      <Input placeholder="/page or https://example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
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
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Active
                        </FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Show this banner on the website
                        </p>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
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

// About Content Manager
const aboutContentSchema = z.object({
  section: z.string().min(1, "Section name is required"),
  title_en: z.string().min(1, "English title is required"),
  title_or: z.string().min(1, "Odia title is required"),
  content_en: z.string().min(1, "English content is required"),
  content_or: z.string().min(1, "Odia content is required"),
  iconName: z.string().optional(),
  order: z.coerce.number().min(0).default(0),
  isActive: z.boolean().default(true),
});

type AboutContentForm = z.infer<typeof aboutContentSchema>;
type AboutContent = AboutContentForm & { id: string; createdAt: Date | null; updatedAt: Date | null };

function AboutContentManager() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AboutContent | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: content = [], isLoading } = useQuery<AboutContent[]>({
    queryKey: ['/api/cms/about'],
  });

  const form = useForm<AboutContentForm>({
    resolver: zodResolver(aboutContentSchema),
    defaultValues: {
      section: "",
      title_en: "",
      title_or: "",
      content_en: "",
      content_or: "",
      iconName: "",
      order: 0,
      isActive: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: AboutContentForm) =>
      apiRequest('/api/cms/about', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cms/about'] });
      toast({ title: "Success", description: "Content created successfully" });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create content", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: AboutContentForm }) =>
      apiRequest(`/api/cms/about/${id}`, 'PATCH', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cms/about'] });
      toast({ title: "Success", description: "Content updated successfully" });
      setIsDialogOpen(false);
      setEditingItem(null);
      form.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update content", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/api/cms/about/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cms/about'] });
      toast({ title: "Success", description: "Content deleted successfully" });
      setDeleteId(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete content", variant: "destructive" });
    },
  });

  const handleOpenDialog = (item?: AboutContent) => {
    if (item) {
      setEditingItem(item);
      form.reset({
        section: item.section,
        title_en: item.title_en,
        title_or: item.title_or,
        content_en: item.content_en,
        content_or: item.content_or,
        iconName: item.iconName || "",
        order: item.order || 0,
        isActive: item.isActive ?? true,
      });
    } else {
      setEditingItem(null);
      form.reset();
    }
    setIsDialogOpen(true);
  };

  const onSubmit = (data: AboutContentForm) => {
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
            <CardTitle>About Content</CardTitle>
            <CardDescription>Manage about section content blocks</CardDescription>
          </div>
          <Button onClick={() => handleOpenDialog()} data-testid="button-add-about">
            <Plus className="w-4 h-4 mr-2" />
            Add Content
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Loading content...</p>
          ) : content.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No content blocks yet. Click "Add Content" to create one.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Section</TableHead>
                    <TableHead>Title (EN)</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {content.sort((a, b) => (a.order || 0) - (b.order || 0)).map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.section}</TableCell>
                      <TableCell>{item.title_en}</TableCell>
                      <TableCell>{item.order}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          item.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                        }`}>
                          {item.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="ghost" onClick={() => handleOpenDialog(item)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setDeleteId(item.id)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit About Content" : "Add About Content"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="section"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Section Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., mission, vision, history" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title_en"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title (English)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="title_or"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title (Odia)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="content_en"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content (English)</FormLabel>
                      <FormControl>
                        <Textarea rows={5} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="content_or"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content (Odia)</FormLabel>
                      <FormControl>
                        <Textarea rows={5} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="iconName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Icon Name (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Shield" {...field} />
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
                      <FormLabel>Order</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Active</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
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
            <AlertDialogTitle>Delete Content</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure? This action cannot be undone.
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

// Services Manager
const serviceSchema = z.object({
  title_en: z.string().min(1, "English title is required"),
  title_or: z.string().min(1, "Odia title is required"),
  description_en: z.string().min(1, "English description is required"),
  description_or: z.string().min(1, "Odia description is required"),
  iconName: z.string().min(1, "Icon name is required"),
  color: z.string().default("text-primary"),
  bgColor: z.string().default("bg-primary/10"),
  order: z.coerce.number().min(0).default(0),
  isActive: z.boolean().default(true),
});

type ServiceForm = z.infer<typeof serviceSchema>;
type Service = ServiceForm & { id: string; createdAt: Date | null; updatedAt: Date | null };

function ServicesManager() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Service | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: services = [], isLoading } = useQuery<Service[]>({
    queryKey: ['/api/cms/services'],
  });

  const form = useForm<ServiceForm>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      title_en: "",
      title_or: "",
      description_en: "",
      description_or: "",
      iconName: "",
      color: "text-primary",
      bgColor: "bg-primary/10",
      order: 0,
      isActive: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: ServiceForm) =>
      apiRequest('/api/cms/services', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cms/services'] });
      toast({ title: "Success", description: "Service created successfully" });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create service", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ServiceForm }) =>
      apiRequest(`/api/cms/services/${id}`, 'PATCH', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cms/services'] });
      toast({ title: "Success", description: "Service updated successfully" });
      setIsDialogOpen(false);
      setEditingItem(null);
      form.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update service", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/api/cms/services/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cms/services'] });
      toast({ title: "Success", description: "Service deleted successfully" });
      setDeleteId(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete service", variant: "destructive" });
    },
  });

  const handleOpenDialog = (item?: Service) => {
    if (item) {
      setEditingItem(item);
      form.reset({
        title_en: item.title_en,
        title_or: item.title_or,
        description_en: item.description_en,
        description_or: item.description_or,
        iconName: item.iconName,
        color: item.color || "text-primary",
        bgColor: item.bgColor || "bg-primary/10",
        order: item.order || 0,
        isActive: item.isActive ?? true,
      });
    } else {
      setEditingItem(null);
      form.reset();
    }
    setIsDialogOpen(true);
  };

  const onSubmit = (data: ServiceForm) => {
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
            <CardTitle>Services</CardTitle>
            <CardDescription>Manage services offered by Civil Defence</CardDescription>
          </div>
          <Button onClick={() => handleOpenDialog()} data-testid="button-add-service">
            <Plus className="w-4 h-4 mr-2" />
            Add Service
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Loading services...</p>
          ) : services.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No services yet. Click "Add Service" to create one.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Icon</TableHead>
                    <TableHead>Title (EN)</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.sort((a, b) => (a.order || 0) - (b.order || 0)).map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-sm">{item.iconName}</TableCell>
                      <TableCell className="font-semibold">{item.title_en}</TableCell>
                      <TableCell>{item.order}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          item.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                        }`}>
                          {item.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="ghost" onClick={() => handleOpenDialog(item)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setDeleteId(item.id)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Service" : "Add Service"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title_en"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title (English)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="title_or"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title (Odia)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="description_en"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (English)</FormLabel>
                      <FormControl>
                        <Textarea rows={4} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description_or"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Odia)</FormLabel>
                      <FormControl>
                        <Textarea rows={4} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="iconName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Icon Name (lucide-react)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Shield, Activity" {...field} />
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
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Text Color Class</FormLabel>
                      <FormControl>
                        <Input placeholder="text-primary" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bgColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Background Color Class</FormLabel>
                      <FormControl>
                        <Input placeholder="bg-primary/10" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Active</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
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
            <AlertDialogTitle>Delete Service</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure? This action cannot be undone.
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

// Site Settings Manager
const siteSettingSchema = z.object({
  key: z.string().min(1, "Key is required"),
  value: z.string().optional(),
  description: z.string().optional(),
});

type SiteSettingForm = z.infer<typeof siteSettingSchema>;
type SiteSetting = SiteSettingForm & { id: string; createdAt: Date | null; updatedAt: Date | null };

function SiteSettingsManager() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SiteSetting | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: settings = [], isLoading } = useQuery<SiteSetting[]>({
    queryKey: ['/api/cms/settings'],
  });

  const form = useForm<SiteSettingForm>({
    resolver: zodResolver(siteSettingSchema),
    defaultValues: {
      key: "",
      value: "",
      description: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: SiteSettingForm) =>
      apiRequest('/api/cms/settings', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cms/settings'] });
      toast({ title: "Success", description: "Setting created successfully" });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create setting", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: SiteSettingForm }) =>
      apiRequest(`/api/cms/settings/${id}`, 'PATCH', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cms/settings'] });
      toast({ title: "Success", description: "Setting updated successfully" });
      setIsDialogOpen(false);
      setEditingItem(null);
      form.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update setting", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/api/cms/settings/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cms/settings'] });
      toast({ title: "Success", description: "Setting deleted successfully" });
      setDeleteId(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete setting", variant: "destructive" });
    },
  });

  const handleOpenDialog = (item?: SiteSetting) => {
    if (item) {
      setEditingItem(item);
      form.reset({
        key: item.key,
        value: item.value || "",
        description: item.description || "",
      });
    } else {
      setEditingItem(null);
      form.reset();
    }
    setIsDialogOpen(true);
  };

  const onSubmit = (data: SiteSettingForm) => {
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
            <CardTitle>Site Settings</CardTitle>
            <CardDescription>Manage general site configuration and constants</CardDescription>
          </div>
          <Button onClick={() => handleOpenDialog()} data-testid="button-add-setting">
            <Plus className="w-4 h-4 mr-2" />
            Add Setting
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Loading settings...</p>
          ) : settings.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No settings yet. Click "Add Setting" to create one.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Key</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {settings.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono font-semibold">{item.key}</TableCell>
                      <TableCell className="max-w-md truncate">{item.value || "-"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{item.description || "-"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="ghost" onClick={() => handleOpenDialog(item)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setDeleteId(item.id)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Setting" : "Add Setting"}</DialogTitle>
            <DialogDescription>
              {editingItem ? "Update the site setting" : "Create a new site setting"}
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
                      <Input placeholder="e.g., site_title, contact_email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Value</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter setting value" {...field} />
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
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="What this setting controls" {...field} />
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
            <AlertDialogTitle>Delete Setting</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure? This action cannot be undone.
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
