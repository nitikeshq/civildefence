// Based on Replit Auth blueprint
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertVolunteerSchema, insertIncidentSchema, insertInventorySchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Volunteer routes
  app.post('/api/volunteers', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const volunteerData = insertVolunteerSchema.parse({ ...req.body, userId });
      const volunteer = await storage.createVolunteer(volunteerData);
      res.json(volunteer);
    } catch (error: any) {
      console.error("Error creating volunteer:", error);
      res.status(400).json({ message: error.message || "Failed to create volunteer" });
    }
  });

  app.get('/api/volunteers', isAuthenticated, async (req, res) => {
    try {
      const { status, district, search } = req.query;
      
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
      
      res.json(volunteers);
    } catch (error) {
      console.error("Error fetching volunteers:", error);
      res.status(500).json({ message: "Failed to fetch volunteers" });
    }
  });

  app.get('/api/volunteers/:id', isAuthenticated, async (req, res) => {
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

  app.patch('/api/volunteers/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const { status, rejectionReason } = req.body;
      const approvedBy = req.user.claims.sub;
      const volunteer = await storage.updateVolunteerStatus(
        req.params.id,
        status,
        approvedBy,
        rejectionReason
      );
      res.json(volunteer);
    } catch (error) {
      console.error("Error updating volunteer status:", error);
      res.status(500).json({ message: "Failed to update volunteer status" });
    }
  });

  // Incident routes
  app.post('/api/incidents', isAuthenticated, async (req: any, res) => {
    try {
      const reportedBy = req.user.claims.sub;
      const incidentData = insertIncidentSchema.parse({ ...req.body, reportedBy });
      const incident = await storage.createIncident(incidentData);
      res.json(incident);
    } catch (error: any) {
      console.error("Error creating incident:", error);
      res.status(400).json({ message: error.message || "Failed to create incident" });
    }
  });

  app.get('/api/incidents', isAuthenticated, async (req, res) => {
    try {
      const { status, district, search } = req.query;
      
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
      
      res.json(incidents);
    } catch (error) {
      console.error("Error fetching incidents:", error);
      res.status(500).json({ message: "Failed to fetch incidents" });
    }
  });

  app.get('/api/incidents/:id', isAuthenticated, async (req, res) => {
    try {
      const incident = await storage.getIncident(req.params.id);
      if (!incident) {
        return res.status(404).json({ message: "Incident not found" });
      }
      res.json(incident);
    } catch (error) {
      console.error("Error fetching incident:", error);
      res.status(500).json({ message: "Failed to fetch incident" });
    }
  });

  app.patch('/api/incidents/:id/status', isAuthenticated, async (req, res) => {
    try {
      const { status, assignedTo } = req.body;
      const incident = await storage.updateIncidentStatus(req.params.id, status, assignedTo);
      res.json(incident);
    } catch (error) {
      console.error("Error updating incident status:", error);
      res.status(500).json({ message: "Failed to update incident status" });
    }
  });

  // Inventory routes
  app.post('/api/inventory', isAuthenticated, async (req, res) => {
    try {
      const itemData = insertInventorySchema.parse(req.body);
      const item = await storage.createInventoryItem(itemData);
      res.json(item);
    } catch (error: any) {
      console.error("Error creating inventory item:", error);
      res.status(400).json({ message: error.message || "Failed to create inventory item" });
    }
  });

  app.get('/api/inventory', isAuthenticated, async (req, res) => {
    try {
      const { district, search } = req.query;
      
      let items;
      if (search) {
        items = await storage.searchInventory(search as string);
      } else if (district) {
        items = await storage.getInventoryByDistrict(district as string);
      } else {
        items = await storage.getAllInventory();
      }
      
      res.json(items);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      res.status(500).json({ message: "Failed to fetch inventory" });
    }
  });

  app.get('/api/inventory/:id', isAuthenticated, async (req, res) => {
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

  app.patch('/api/inventory/:id', isAuthenticated, async (req, res) => {
    try {
      const item = await storage.updateInventoryItem(req.params.id, req.body);
      res.json(item);
    } catch (error) {
      console.error("Error updating inventory item:", error);
      res.status(500).json({ message: "Failed to update inventory item" });
    }
  });

  app.delete('/api/inventory/:id', isAuthenticated, async (req, res) => {
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
