import {
  users,
  volunteers,
  incidents,
  inventory,
  type User,
  type UpsertUser,
  type Volunteer,
  type InsertVolunteer,
  type Incident,
  type InsertIncident,
  type InventoryItem,
  type InsertInventory,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, ilike, or } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Volunteer operations
  createVolunteer(volunteer: InsertVolunteer): Promise<Volunteer>;
  getVolunteer(id: string): Promise<Volunteer | undefined>;
  getVolunteersByStatus(status: string): Promise<Volunteer[]>;
  getVolunteersByDistrict(district: string): Promise<Volunteer[]>;
  getAllVolunteers(): Promise<Volunteer[]>;
  updateVolunteerStatus(id: string, status: string, approvedBy?: string, rejectionReason?: string): Promise<Volunteer>;
  
  // Incident operations
  createIncident(incident: InsertIncident): Promise<Incident>;
  getIncident(id: string): Promise<Incident | undefined>;
  getAllIncidents(): Promise<Incident[]>;
  getIncidentsByDistrict(district: string): Promise<Incident[]>;
  getIncidentsByStatus(status: string): Promise<Incident[]>;
  updateIncidentStatus(id: string, status: string, assignedTo?: string[]): Promise<Incident>;
  
  // Inventory operations
  createInventoryItem(item: InsertInventory): Promise<InventoryItem>;
  getInventoryItem(id: string): Promise<InventoryItem | undefined>;
  getAllInventory(): Promise<InventoryItem[]>;
  getInventoryByDistrict(district: string): Promise<InventoryItem[]>;
  updateInventoryItem(id: string, updates: Partial<InsertInventory>): Promise<InventoryItem>;
  deleteInventoryItem(id: string): Promise<void>;
  
  // Search operations
  searchVolunteers(query: string): Promise<Volunteer[]>;
  searchIncidents(query: string): Promise<Incident[]>;
  searchInventory(query: string): Promise<InventoryItem[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations (Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Volunteer operations
  async createVolunteer(volunteerData: InsertVolunteer): Promise<Volunteer> {
    const [volunteer] = await db.insert(volunteers).values(volunteerData).returning();
    return volunteer;
  }

  async getVolunteer(id: string): Promise<Volunteer | undefined> {
    const [volunteer] = await db.select().from(volunteers).where(eq(volunteers.id, id));
    return volunteer;
  }

  async getVolunteersByStatus(status: string): Promise<Volunteer[]> {
    return await db.select().from(volunteers).where(eq(volunteers.status, status as any)).orderBy(desc(volunteers.createdAt));
  }

  async getVolunteersByDistrict(district: string): Promise<Volunteer[]> {
    return await db.select().from(volunteers).where(eq(volunteers.district, district)).orderBy(desc(volunteers.createdAt));
  }

  async getAllVolunteers(): Promise<Volunteer[]> {
    return await db.select().from(volunteers).orderBy(desc(volunteers.createdAt));
  }

  async updateVolunteerStatus(id: string, status: string, approvedBy?: string, rejectionReason?: string): Promise<Volunteer> {
    const updates: any = {
      status: status as any,
      updatedAt: new Date(),
    };
    
    if (status === "approved") {
      updates.approvedBy = approvedBy;
      updates.approvedAt = new Date();
    }
    
    if (status === "rejected" && rejectionReason) {
      updates.rejectionReason = rejectionReason;
    }

    const [volunteer] = await db
      .update(volunteers)
      .set(updates)
      .where(eq(volunteers.id, id))
      .returning();
    return volunteer;
  }

  // Incident operations
  async createIncident(incidentData: InsertIncident): Promise<Incident> {
    const [incident] = await db.insert(incidents).values(incidentData).returning();
    return incident;
  }

  async getIncident(id: string): Promise<Incident | undefined> {
    const [incident] = await db.select().from(incidents).where(eq(incidents.id, id));
    return incident;
  }

  async getAllIncidents(): Promise<Incident[]> {
    return await db.select().from(incidents).orderBy(desc(incidents.createdAt));
  }

  async getIncidentsByDistrict(district: string): Promise<Incident[]> {
    return await db.select().from(incidents).where(eq(incidents.district, district)).orderBy(desc(incidents.createdAt));
  }

  async getIncidentsByStatus(status: string): Promise<Incident[]> {
    return await db.select().from(incidents).where(eq(incidents.status, status as any)).orderBy(desc(incidents.createdAt));
  }

  async updateIncidentStatus(id: string, status: string, assignedTo?: string[]): Promise<Incident> {
    const updates: any = {
      status: status as any,
      updatedAt: new Date(),
    };
    
    if (assignedTo) {
      updates.assignedTo = assignedTo;
    }
    
    if (status === "resolved") {
      updates.resolvedAt = new Date();
    }

    const [incident] = await db
      .update(incidents)
      .set(updates)
      .where(eq(incidents.id, id))
      .returning();
    return incident;
  }

  // Inventory operations
  async createInventoryItem(itemData: InsertInventory): Promise<InventoryItem> {
    const [item] = await db.insert(inventory).values(itemData).returning();
    return item;
  }

  async getInventoryItem(id: string): Promise<InventoryItem | undefined> {
    const [item] = await db.select().from(inventory).where(eq(inventory.id, id));
    return item;
  }

  async getAllInventory(): Promise<InventoryItem[]> {
    return await db.select().from(inventory).orderBy(desc(inventory.createdAt));
  }

  async getInventoryByDistrict(district: string): Promise<InventoryItem[]> {
    return await db.select().from(inventory).where(eq(inventory.district, district)).orderBy(desc(inventory.createdAt));
  }

  async updateInventoryItem(id: string, updates: Partial<InsertInventory>): Promise<InventoryItem> {
    const [item] = await db
      .update(inventory)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(inventory.id, id))
      .returning();
    return item;
  }

  async deleteInventoryItem(id: string): Promise<void> {
    await db.delete(inventory).where(eq(inventory.id, id));
  }

  // Search operations
  async searchVolunteers(query: string): Promise<Volunteer[]> {
    const searchPattern = `%${query}%`;
    return await db
      .select()
      .from(volunteers)
      .where(
        or(
          ilike(volunteers.fullName, searchPattern),
          ilike(volunteers.email, searchPattern),
          ilike(volunteers.phone, searchPattern),
          ilike(volunteers.district, searchPattern)
        )
      )
      .orderBy(desc(volunteers.createdAt));
  }

  async searchIncidents(query: string): Promise<Incident[]> {
    const searchPattern = `%${query}%`;
    return await db
      .select()
      .from(incidents)
      .where(
        or(
          ilike(incidents.title, searchPattern),
          ilike(incidents.description, searchPattern),
          ilike(incidents.location, searchPattern),
          ilike(incidents.district, searchPattern)
        )
      )
      .orderBy(desc(incidents.createdAt));
  }

  async searchInventory(query: string): Promise<InventoryItem[]> {
    const searchPattern = `%${query}%`;
    return await db
      .select()
      .from(inventory)
      .where(
        or(
          ilike(inventory.name, searchPattern),
          ilike(inventory.description, searchPattern),
          ilike(inventory.location, searchPattern),
          ilike(inventory.district, searchPattern)
        )
      )
      .orderBy(desc(inventory.createdAt));
  }
}

export const storage = new DatabaseStorage();
