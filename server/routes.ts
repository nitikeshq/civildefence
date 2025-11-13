// Local password authentication
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, hashPassword } from "./auth";
import passport from "passport";
import { insertVolunteerSchema, insertIncidentSchema, insertInventorySchema, insertUserSchema } from "@shared/schema";
import { requireRole, isAuthenticated } from "./middleware";
import { z } from "zod";

// Validation schemas for mutations
const updateVolunteerStatusSchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]),
  rejectionReason: z.string().optional(),
});

const updateIncidentStatusSchema = z.object({
  status: z.enum(["reported", "assigned", "in_progress", "resolved", "closed"]),
  assignedTo: z.array(z.string()).optional(),
});

const updateInventorySchema = z.object({
  name: z.string().optional(),
  category: z.enum(["medical_supplies", "communication_equipment", "rescue_equipment", "vehicles", "safety_gear", "other"]).optional(),
  description: z.string().optional(),
  quantity: z.number().int().min(0).optional(),
  condition: z.enum(["excellent", "good", "fair", "poor", "needs_repair"]).optional(),
  location: z.string().optional(),
  district: z.string().optional(),
  lastInspection: z.coerce.date().optional(),
  nextInspection: z.coerce.date().optional(),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.post('/api/auth/signup', async (req, res) => {
    try {
      const { password, ...userData } = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Check if email already exists (if provided)
      if (userData.email) {
        const existingEmail = await storage.getUserByEmail(userData.email);
        if (existingEmail) {
          return res.status(400).json({ message: "Email already exists" });
        }
      }
      
      // Hash password and create user
      const password_hash = await hashPassword(password);
      const user = await storage.createUser({ ...userData, password_hash });
      
      // Don't return password_hash
      const { password_hash: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      console.error("Error creating user:", error);
      res.status(400).json({ message: error.message || "Failed to create user" });
    }
  });

  app.post('/api/auth/login', passport.authenticate('local'), (req, res) => {
    // If we get here, authentication was successful
    const { password_hash, ...userWithoutPassword } = req.user as any;
    res.json(userWithoutPassword);
  });

  app.post('/api/auth/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      // Destroy the session completely
      req.session.destroy((destroyErr) => {
        if (destroyErr) {
          console.error("Error destroying session:", destroyErr);
        }
        // Clear the session cookie
        res.clearCookie('connect.sid');
        res.json({ message: "Logged out successfully" });
      });
    });
  });

  app.get('/api/auth/me', isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const { password_hash, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Volunteer routes
  app.post('/api/volunteers', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.user as any).id;
      const volunteerData = insertVolunteerSchema.parse({ ...req.body, userId });
      const volunteer = await storage.createVolunteer(volunteerData);
      res.json(volunteer);
    } catch (error: any) {
      console.error("Error creating volunteer:", error);
      res.status(400).json({ message: error.message || "Failed to create volunteer" });
    }
  });

  // Admin-only: View all volunteers or filter by status/district
  app.get('/api/volunteers', isAuthenticated, requireRole("district_admin", "department_admin", "state_admin"), async (req: any, res) => {
    try {
      const { status, district, search } = req.query;
      const user = req.authenticatedUser;
      
      let volunteers;
      if (search) {
        volunteers = await storage.searchVolunteers(search as string);
      } else if (status) {
        volunteers = await storage.getVolunteersByStatus(status as string);
      } else if (district) {
        volunteers = await storage.getVolunteersByDistrict(district as string);
      } else {
        volunteers = await storage.getAllVolunteers();
      }
      
      // District admins can only see volunteers from their district
      if (user.role === "district_admin" && user.district) {
        volunteers = volunteers.filter((v: any) => v.district === user.district);
      }
      
      res.json(volunteers);
    } catch (error) {
      console.error("Error fetching volunteers:", error);
      res.status(500).json({ message: "Failed to fetch volunteers" });
    }
  });

  app.get('/api/volunteers/:id', isAuthenticated, requireRole("district_admin", "department_admin", "state_admin"), async (req, res) => {
    try {
      const volunteer = await storage.getVolunteer(req.params.id);
      if (!volunteer) {
        return res.status(404).json({ message: "Volunteer not found" });
      }
      res.json(volunteer);
    } catch (error) {
      console.error("Error fetching volunteer:", error);
      res.status(500).json({ message: "Failed to fetch volunteer" });
    }
  });

  // Admin-only: Approve/reject volunteers
  app.patch('/api/volunteers/:id/status', isAuthenticated, requireRole("district_admin", "department_admin", "state_admin"), async (req: any, res) => {
    try {
      const validatedData = updateVolunteerStatusSchema.parse(req.body);
      const approvedBy = (req.user as any).id;
      
      const volunteer = await storage.updateVolunteerStatus(
        req.params.id,
        validatedData.status,
        approvedBy,
        validatedData.rejectionReason
      );
      res.json(volunteer);
    } catch (error: any) {
      console.error("Error updating volunteer status:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update volunteer status" });
    }
  });

  // Incident routes
  app.post('/api/incidents', isAuthenticated, async (req: any, res) => {
    try {
      const reportedBy = (req.user as any).id;
      const incidentData = insertIncidentSchema.parse({ ...req.body, reportedBy });
      const incident = await storage.createIncident(incidentData);
      res.json(incident);
    } catch (error: any) {
      console.error("Error creating incident:", error);
      res.status(400).json({ message: error.message || "Failed to create incident" });
    }
  });

  app.get('/api/incidents', isAuthenticated, async (req: any, res) => {
    try {
      const { status, district, search } = req.query;
      const user = req.user as any;
      
      let incidents;
      if (search) {
        incidents = await storage.searchIncidents(search as string);
      } else if (status) {
        incidents = await storage.getIncidentsByStatus(status as string);
      } else if (district) {
        incidents = await storage.getIncidentsByDistrict(district as string);
      } else {
        incidents = await storage.getAllIncidents();
      }
      
      // Regular users can only see incidents they reported
      // District admins see incidents from their district
      // Department and state admins see all
      if (user.role === "volunteer") {
        incidents = incidents.filter((i: any) => i.reportedBy === user.id);
      } else if (user.role === "district_admin" && user.district) {
        incidents = incidents.filter((i: any) => i.district === user.district);
      }
      
      res.json(incidents);
    } catch (error) {
      console.error("Error fetching incidents:", error);
      res.status(500).json({ message: "Failed to fetch incidents" });
    }
  });

  app.get('/api/incidents/:id', isAuthenticated, async (req: any, res) => {
    try {
      const incident = await storage.getIncident(req.params.id);
      if (!incident) {
        return res.status(404).json({ message: "Incident not found" });
      }
      
      // Check access: users can view incidents they reported, admins can view all in their scope
      const user = req.user as any;
      
      if (user.role === "volunteer" && incident.reportedBy !== user.id) {
        return res.status(403).json({ message: "Forbidden - you can only view incidents you reported" });
      }
      
      if (user.role === "district_admin" && user.district && incident.district !== user.district) {
        return res.status(403).json({ message: "Forbidden - you can only view incidents from your district" });
      }
      
      res.json(incident);
    } catch (error) {
      console.error("Error fetching incident:", error);
      res.status(500).json({ message: "Failed to fetch incident" });
    }
  });

  // Admin-only: Update incident status
  app.patch('/api/incidents/:id/status', isAuthenticated, requireRole("district_admin", "department_admin", "state_admin"), async (req: any, res) => {
    try {
      const validatedData = updateIncidentStatusSchema.parse(req.body);
      const incident = await storage.updateIncidentStatus(
        req.params.id,
        validatedData.status,
        validatedData.assignedTo
      );
      res.json(incident);
    } catch (error: any) {
      console.error("Error updating incident status:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update incident status" });
    }
  });

  // Inventory routes - Admin-only access
  app.post('/api/inventory', isAuthenticated, requireRole("district_admin", "department_admin", "state_admin"), async (req: any, res) => {
    try {
      const itemData = insertInventorySchema.parse(req.body);
      const item = await storage.createInventoryItem(itemData);
      res.json(item);
    } catch (error: any) {
      console.error("Error creating inventory item:", error);
      res.status(400).json({ message: error.message || "Failed to create inventory item" });
    }
  });

  app.get('/api/inventory', isAuthenticated, requireRole("district_admin", "department_admin", "state_admin"), async (req: any, res) => {
    try {
      const { district, search } = req.query;
      const user = req.authenticatedUser;
      
      let items;
      if (search) {
        items = await storage.searchInventory(search as string);
      } else if (district) {
        items = await storage.getInventoryByDistrict(district as string);
      } else {
        items = await storage.getAllInventory();
      }
      
      // District admins can only see inventory from their district
      if (user.role === "district_admin" && user.district) {
        items = items.filter((i: any) => i.district === user.district);
      }
      
      res.json(items);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      res.status(500).json({ message: "Failed to fetch inventory" });
    }
  });

  app.get('/api/inventory/:id', isAuthenticated, requireRole("district_admin", "department_admin", "state_admin"), async (req, res) => {
    try {
      const item = await storage.getInventoryItem(req.params.id);
      if (!item) {
        return res.status(404).json({ message: "Inventory item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Error fetching inventory item:", error);
      res.status(500).json({ message: "Failed to fetch inventory item" });
    }
  });

  app.patch('/api/inventory/:id', isAuthenticated, requireRole("district_admin", "department_admin", "state_admin"), async (req: any, res) => {
    try {
      const validatedData = updateInventorySchema.parse(req.body);
      const item = await storage.updateInventoryItem(req.params.id, validatedData);
      res.json(item);
    } catch (error: any) {
      console.error("Error updating inventory item:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update inventory item" });
    }
  });

  app.delete('/api/inventory/:id', isAuthenticated, requireRole("department_admin", "state_admin"), async (req, res) => {
    try {
      await storage.deleteInventoryItem(req.params.id);
      res.json({ message: "Inventory item deleted successfully" });
    } catch (error) {
      console.error("Error deleting inventory item:", error);
      res.status(500).json({ message: "Failed to delete inventory item" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
