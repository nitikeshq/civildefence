import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
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

export default function InventoryManagement() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: inventory } = useQuery({
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
      
      <main className="flex-1 bg-muted/30">
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
                <Button data-testid="button-add-item">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
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
                    {inventory && inventory.length > 0 ? (
                      inventory.map((item: any) => (
                        <TableRow key={item.id} data-testid={`row-inventory-${item.id}`}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>
                            <Badge className={getCategoryColor(item.category)}>
                              {item.category.replace(/_/g, " ")}
                            </Badge>
                          </TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>
                            <Badge className={getConditionColor(item.condition)}>
                              {item.condition.replace(/_/g, " ")}
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
