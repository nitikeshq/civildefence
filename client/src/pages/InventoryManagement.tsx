import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { redirectToSignIn } from "@/lib/authRedirect";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertInventorySchema, type InventoryItem, type InsertInventory } from "@shared/schema";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus, Search } from "lucide-react";
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

const districts = ["Angul", "Balangir", "Balasore", "Bargarh", "Bhadrak", "Boudh", "Cuttack", "Deogarh", "Dhenkanal", "Gajapati", "Ganjam", "Jagatsinghpur", "Jajpur", "Jharsuguda", "Kalahandi", "Kandhamal", "Kendrapara", "Kendujhar", "Khordha", "Koraput", "Malkangiri", "Mayurbhanj", "Nabarangpur", "Nayagarh", "Nuapada", "Puri", "Rayagada", "Sambalpur", "Subarnapur", "Sundargarh"];

export default function InventoryManagement() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const form = useForm<InsertInventory>({
    resolver: zodResolver(insertInventorySchema),
    defaultValues: {
      name: "",
      category: "other",
      description: "",
      quantity: 0,
      condition: "good",
      location: "",
      district: "",
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

  const { data: inventory = [] } = useQuery<InventoryItem[]>({
    queryKey: ["/api/inventory", searchQuery],
    queryFn: async () => {
      const url = searchQuery 
        ? `/api/inventory?search=${encodeURIComponent(searchQuery)}`
        : "/api/inventory";
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch inventory");
      return response.json();
    },
    enabled: isAuthenticated,
  });

  const createItemMutation = useMutation({
    mutationFn: async (data: InsertInventory) => {
      const response = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create inventory item");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      toast({
        title: "Success",
        description: "Inventory item added successfully",
      });
      form.reset();
      setDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertInventory) => {
    createItemMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      medical_supplies: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      communication_equipment: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      rescue_equipment: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      vehicles: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      safety_gear: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      other: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
    };
    return colors[category] || colors.other;
  };

  const getConditionColor = (condition: string) => {
    const colors: Record<string, string> = {
      excellent: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      good: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      fair: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      poor: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      needs_repair: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    };
    return colors[condition] || colors.fair;
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
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Inventory Management</CardTitle>
                  <CardDescription>
                    Manage equipment, supplies, and resources
                  </CardDescription>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button data-testid="button-add-item">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Item
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add New Inventory Item</DialogTitle>
                      <DialogDescription>
                        Add equipment, supplies, or resources to the inventory system
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Item Name *</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., First Aid Kit" {...field} data-testid="input-name" />
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
                                <FormLabel>Category *</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-category">
                                      <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="medical_supplies">Medical Supplies</SelectItem>
                                    <SelectItem value="communication_equipment">Communication Equipment</SelectItem>
                                    <SelectItem value="rescue_equipment">Rescue Equipment</SelectItem>
                                    <SelectItem value="vehicles">Vehicles</SelectItem>
                                    <SelectItem value="safety_gear">Safety Gear</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Detailed description of the item..." 
                                  {...field} 
                                  value={field.value || ""}
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
                            name="quantity"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Quantity *</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="0" 
                                    {...field}
                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                    data-testid="input-quantity"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="condition"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Condition *</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-condition">
                                      <SelectValue placeholder="Select condition" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="excellent">Excellent</SelectItem>
                                    <SelectItem value="good">Good</SelectItem>
                                    <SelectItem value="fair">Fair</SelectItem>
                                    <SelectItem value="poor">Poor</SelectItem>
                                    <SelectItem value="needs_repair">Needs Repair</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="location"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Location *</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., Warehouse A, Shelf 5" {...field} data-testid="input-location" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
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
                          <Button type="submit" disabled={createItemMutation.isPending} data-testid="button-submit">
                            {createItemMutation.isPending ? "Adding..." : "Add Item"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search inventory..."
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
                      <TableHead>Category</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Condition</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>District</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventory.length > 0 ? (
                      inventory.map(item => (
                        <TableRow key={item.id} data-testid={`row-inventory-${item.id}`}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>
                            <Badge className={getCategoryColor(item.category ?? "other")}>
                              {item.category?.replace(/_/g, " ") ?? "other"}
                            </Badge>
                          </TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>
                            <Badge className={getConditionColor(item.condition ?? "fair")}>
                              {item.condition?.replace(/_/g, " ") ?? "fair"}
                            </Badge>
                          </TableCell>
                          <TableCell>{item.location}</TableCell>
                          <TableCell>{item.district}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" data-testid={`button-edit-${item.id}`}>
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          {searchQuery ? "No items found matching your search" : "No inventory items found"}
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

      <Footer />
    </div>
  );
}
