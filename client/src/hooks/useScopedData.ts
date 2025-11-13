// Hook for role-scoped data access

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { filterDataByRole } from "@/lib/roleUtils";
import type { Volunteer, Incident, InventoryItem } from "@shared/schema";

export function useScopedVolunteers() {
  const { user } = useAuth();
  
  const { data: allVolunteers = [], ...queryState } = useQuery<Volunteer[]>({
    queryKey: ["/api/volunteers"],
  });

  const scopedData = filterDataByRole(allVolunteers, user?.role, user?.district);

  return {
    data: scopedData,
    ...queryState,
  };
}

export function useScopedIncidents() {
  const { user } = useAuth();
  
  const { data: allIncidents = [], ...queryState } = useQuery<Incident[]>({
    queryKey: ["/api/incidents"],
  });

  const scopedData = filterDataByRole(allIncidents, user?.role, user?.district);

  return {
    data: scopedData,
    ...queryState,
  };
}

export function useScopedInventory() {
  const { user } = useAuth();
  
  const { data: allInventory = [], ...queryState } = useQuery<InventoryItem[]>({
    queryKey: ["/api/inventory"],
  });

  const scopedData = filterDataByRole(allInventory, user?.role, user?.district);

  return {
    data: scopedData,
    ...queryState,
  };
}
