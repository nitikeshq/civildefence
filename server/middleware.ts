import type { RequestHandler } from "express";
import { storage } from "./storage";

// Middleware to check if user is authenticated
export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized - please login" });
};

// Middleware to check user roles
export function requireRole(...allowedRoles: string[]): RequestHandler {
  return async (req: any, res, next) => {
    try {
      const user = req.user;
      if (!user || !user.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const userRole = user.role || "volunteer";
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({ 
          message: "Forbidden - insufficient permissions",
          requiredRoles: allowedRoles,
          userRole 
        });
      }

      // Attach user to request for later use
      req.authenticatedUser = user;
      next();
    } catch (error) {
      console.error("Role check error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
}
