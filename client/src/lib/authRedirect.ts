// Utility for handling authentication redirects

export function redirectToSignIn() {
  window.location.href = "/signin";
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
