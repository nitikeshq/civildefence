import {
  users,
  volunteers,
  incidents,
  inventory,
  assignments,
  type User,
  type UpsertUser,
  type Volunteer,
  type InsertVolunteer,
  type Incident,
  type InsertIncident,
  type InventoryItem,
  type InsertInventory,
  type Assignment,
  type InsertAssignment,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, ilike, or } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (Local Auth)
  getUser(id: string): Promise<User | undefined>;
  getUserById(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: UpsertUser): Promise<User>;
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
  
  // Assignment operations
  getAllAssignments(): Promise<Assignment[]>;
  createAssignment(assignment: InsertAssignment): Promise<Assignment>;
  getMyAssignments(userId: string): Promise<any[]>;
  updateAssignmentStatus(id: string, status: string, userId: string): Promise<any>;
  
  // Training session operations
  getAllTrainingSessions(): Promise<any[]>;
  getMyTrainingSessions(userId: string): Promise<any[]>;
  
  // Volunteer profile
  getVolunteerByUserId(userId: string): Promise<Volunteer | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User operations (Local Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserById(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    if (!email) return undefined;
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: UpsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
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

  // Assignment operations
  async getAllAssignments(): Promise<Assignment[]> {
    return await db
      .select()
      .from(assignments)
      .orderBy(desc(assignments.createdAt));
  }

  async createAssignment(assignment: InsertAssignment): Promise<Assignment> {
    const [newAssignment] = await db
      .insert(assignments)
      .values(assignment)
      .returning();
    return newAssignment;
  }

  async getMyAssignments(userId: string): Promise<any[]> {
    // First get the volunteer record for this user
    const [volunteer] = await db
      .select()
      .from(volunteers)
      .where(eq(volunteers.userId, userId));
    
    if (!volunteer) {
      return [];
    }

    // Then get assignments for this volunteer using volunteerId
    const { assignments } = await import("@shared/schema");
    return await db
      .select()
      .from(assignments)
      .where(eq(assignments.volunteerId, volunteer.id))
      .orderBy(desc(assignments.createdAt));
  }

  async updateAssignmentStatus(id: string, status: string, userId: string): Promise<any> {
    // First get the volunteer record for this user to verify ownership
    const [volunteer] = await db
      .select()
      .from(volunteers)
      .where(eq(volunteers.userId, userId));
    
    if (!volunteer) {
      throw new Error("Volunteer not found");
    }

    // Verify the assignment belongs to this volunteer
    const { assignments } = await import("@shared/schema");
    const [existingAssignment] = await db
      .select()
      .from(assignments)
      .where(eq(assignments.id, id));
    
    if (!existingAssignment) {
      throw new Error("Assignment not found");
    }
    
    if (existingAssignment.volunteerId !== volunteer.id) {
      throw new Error("Unauthorized: Assignment does not belong to this volunteer");
    }

    // Update the assignment
    const [assignment] = await db
      .update(assignments)
      .set({ 
        status: status as any,
        completedAt: status === "completed" ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(assignments.id, id))
      .returning();
    return assignment;
  }

  // Training session operations
  async getAllTrainingSessions(): Promise<any[]> {
    const { trainingSessions } = await import("@shared/schema");
    return await db
      .select()
      .from(trainingSessions)
      .orderBy(desc(trainingSessions.scheduledAt));
  }

  async getMyTrainingSessions(userId: string): Promise<any[]> {
    // NOTE: Temporary stub implementation - returns all training sessions
    // TODO: In production, this should:
    // 1. Query a volunteer_training_registrations table to find sessions the volunteer registered for
    // 2. Or filter sessions where the volunteer's ID appears in an attendees array
    // For now, volunteers see all available sessions (feature-complete for demo)
    return this.getAllTrainingSessions();
  }

  // Volunteer profile
  async getVolunteerByUserId(userId: string): Promise<Volunteer | undefined> {
    const [volunteer] = await db
      .select()
      .from(volunteers)
      .where(eq(volunteers.userId, userId));
    return volunteer;
  }
}

export const storage = new DatabaseStorage();
