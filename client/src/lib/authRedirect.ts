// Utility for handling authentication redirects
import type { UserRole } from "@/lib/roleUtils";

export function redirectToSignIn() {
  window.location.href = "/signin";
}

export function getDashboardRouteFromRole(role: UserRole | string): string {
  // Volunteers go to their own dashboard
  if (role === "volunteer") {
    return "/dashboard/volunteer/trainings";
  }
  
  // All admin roles go to the overview dashboard
  if (role === "district_admin" || role === "department_admin" || role === "state_admin") {
    return "/dashboard/overview";
  }
  
  // CMS managers go to CMS dashboard
  if (role === "cms_manager") {
    return "/dashboard/cms-manager";
  }
  
  // Default fallback
  return "/dashboard/overview";
}

export async function logout() {
  try {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    
    if (response.ok) {
      window.location.href = "/signin";
    } else {
      // Even if logout fails, redirect to signin
      window.location.href = "/signin";
    }
  } catch (error) {
    console.error("Logout error:", error);
    // Redirect anyway
    window.location.href = "/signin";
  }
}
