import {
  users,
  volunteers,
  incidents,
  inventory,
  assignments,
  trainings,
  trainingRegistrations,
  translations,
  heroBanners,
  aboutContent,
  services,
  siteSettings,
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
  type Training,
  type InsertTraining,
  type TrainingRegistration,
  type InsertTrainingRegistration,
  type Translation,
  type InsertTranslation,
  type HeroBanner,
  type InsertHeroBanner,
  type AboutContent,
  type InsertAboutContent,
  type Service,
  type InsertService,
  type SiteSetting,
  type InsertSiteSetting,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, ilike, or, gte } from "drizzle-orm";

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
  updateIncident(id: string, updates: Partial<InsertIncident>): Promise<Incident>;
  updateIncidentStatus(id: string, status: string, assignedTo?: string[]): Promise<Incident>;
  deleteIncident(id: string): Promise<void>;
  
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
  
  // Training operations
  createTraining(training: InsertTraining): Promise<Training>;
  getTraining(id: string): Promise<Training | undefined>;
  getAllTrainings(): Promise<Training[]>;
  getTrainingsByDistrict(district: string): Promise<Training[]>;
  updateTraining(id: string, updates: Partial<InsertTraining>): Promise<Training>;
  deleteTraining(id: string): Promise<void>;
  
  // Training Registration operations
  registerForTraining(trainingId: string, userId: string): Promise<TrainingRegistration>;
  unregisterFromTraining(trainingId: string, userId: string): Promise<void>;
  getTrainingRegistrations(trainingId: string): Promise<TrainingRegistration[]>;
  getUserTrainingRegistrations(userId: string): Promise<Training[]>;
  isUserRegisteredForTraining(trainingId: string, userId: string): Promise<boolean>;
  
  // Volunteer profile
  getVolunteerByUserId(userId: string): Promise<Volunteer | undefined>;
  
  // District statistics
  getDistrictStats(district?: string): Promise<any[]>;
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

  async updateIncident(id: string, updates: Partial<InsertIncident>): Promise<Incident> {
    const [incident] = await db
      .update(incidents)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(incidents.id, id))
      .returning();
    return incident;
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

  async deleteIncident(id: string): Promise<void> {
    await db.delete(incidents).where(eq(incidents.id, id));
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

  // Training operations
  async createTraining(trainingData: InsertTraining): Promise<Training> {
    const [training] = await db.insert(trainings).values(trainingData).returning();
    return training;
  }

  async getTraining(id: string): Promise<Training | undefined> {
    const [training] = await db
      .select({
        training: trainings,
        enrolledCount: sql<number>`(SELECT COUNT(*) FROM ${trainingRegistrations} WHERE ${trainingRegistrations.trainingId} = ${trainings.id})`,
      })
      .from(trainings)
      .where(eq(trainings.id, id));
    
    if (!training) return undefined;
    return { ...training.training, enrolledCount: training.enrolledCount };
  }

  async getAllTrainings(): Promise<Training[]> {
    const results = await db
      .select({
        training: trainings,
        enrolledCount: sql<number>`(SELECT COUNT(*) FROM ${trainingRegistrations} WHERE ${trainingRegistrations.trainingId} = ${trainings.id})`,
      })
      .from(trainings)
      .orderBy(desc(trainings.startAt));
    
    return results.map(r => ({ ...r.training, enrolledCount: r.enrolledCount }));
  }

  async getTrainingsByDistrict(district: string): Promise<Training[]> {
    const results = await db
      .select({
        training: trainings,
        enrolledCount: sql<number>`(SELECT COUNT(*) FROM ${trainingRegistrations} WHERE ${trainingRegistrations.trainingId} = ${trainings.id})`,
      })
      .from(trainings)
      .where(or(eq(trainings.district, district), eq(trainings.isStatewide, true)))
      .orderBy(desc(trainings.startAt));
    
    return results.map(r => ({ ...r.training, enrolledCount: r.enrolledCount }));
  }

  async updateTraining(id: string, updates: Partial<InsertTraining>): Promise<Training> {
    const [training] = await db
      .update(trainings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(trainings.id, id))
      .returning();
    return training;
  }

  async deleteTraining(id: string): Promise<void> {
    await db.delete(trainingRegistrations).where(eq(trainingRegistrations.trainingId, id));
    await db.delete(trainings).where(eq(trainings.id, id));
  }

  // Training Registration operations
  async registerForTraining(trainingId: string, userId: string): Promise<TrainingRegistration> {
    const volunteer = await this.getVolunteerByUserId(userId);
    if (!volunteer) {
      throw new Error("Volunteer profile not found for user");
    }

    const existing = await db
      .select()
      .from(trainingRegistrations)
      .where(
        and(
          eq(trainingRegistrations.trainingId, trainingId),
          eq(trainingRegistrations.volunteerId, volunteer.id)
        )
      );

    if (existing.length > 0) {
      throw new Error("Already registered for this training");
    }

    const training = await this.getTraining(trainingId);
    if (!training) {
      throw new Error("Training not found");
    }

    if (training.enrolledCount >= training.capacity) {
      throw new Error("Training is at full capacity");
    }

    const [registration] = await db
      .insert(trainingRegistrations)
      .values({
        trainingId,
        volunteerId: volunteer.id,
      })
      .returning();

    return registration;
  }

  async unregisterFromTraining(trainingId: string, userId: string): Promise<void> {
    const volunteer = await this.getVolunteerByUserId(userId);
    if (!volunteer) {
      throw new Error("Volunteer profile not found for user");
    }

    await db
      .delete(trainingRegistrations)
      .where(
        and(
          eq(trainingRegistrations.trainingId, trainingId),
          eq(trainingRegistrations.volunteerId, volunteer.id)
        )
      );
  }

  async getTrainingRegistrations(trainingId: string): Promise<TrainingRegistration[]> {
    return await db
      .select()
      .from(trainingRegistrations)
      .where(eq(trainingRegistrations.trainingId, trainingId));
  }

  async getUserTrainingRegistrations(userId: string): Promise<Training[]> {
    const volunteer = await this.getVolunteerByUserId(userId);
    if (!volunteer) return [];

    const registrations = await db
      .select()
      .from(trainingRegistrations)
      .where(eq(trainingRegistrations.volunteerId, volunteer.id));

    const trainingIds = registrations.map(r => r.trainingId);
    if (trainingIds.length === 0) return [];

    const results = await db
      .select({
        training: trainings,
        enrolledCount: sql<number>`(SELECT COUNT(*) FROM ${trainingRegistrations} WHERE ${trainingRegistrations.trainingId} = ${trainings.id})`,
      })
      .from(trainings)
      .where(sql`${trainings.id} = ANY(${trainingIds})`);

    return results.map(r => ({ ...r.training, enrolledCount: r.enrolledCount }));
  }

  async isUserRegisteredForTraining(trainingId: string, userId: string): Promise<boolean> {
    const volunteer = await this.getVolunteerByUserId(userId);
    if (!volunteer) return false;

    const [registration] = await db
      .select()
      .from(trainingRegistrations)
      .where(
        and(
          eq(trainingRegistrations.trainingId, trainingId),
          eq(trainingRegistrations.volunteerId, volunteer.id)
        )
      );

    return !!registration;
  }

  // Volunteer profile
  async getVolunteerByUserId(userId: string): Promise<Volunteer | undefined> {
    const [volunteer] = await db
      .select()
      .from(volunteers)
      .where(eq(volunteers.userId, userId));
    return volunteer;
  }

  // District statistics - aggregated data for all districts or specific district
  async getDistrictStats(district?: string): Promise<any[]> {
    // Get all Odisha districts
    const allDistricts = [
      "Angul", "Balangir", "Balasore", "Bargarh", "Bhadrak", "Boudh",
      "Cuttack", "Deogarh", "Dhenkanal", "Gajapati", "Ganjam", "Jagatsinghpur",
      "Jajpur", "Jharsuguda", "Kalahandi", "Kandhamal", "Kendrapara", "Kendujhar",
      "Khordha", "Koraput", "Malkangiri", "Mayurbhanj", "Nabarangpur", "Nayagarh",
      "Nuapada", "Puri", "Rayagada", "Sambalpur", "Subarnapur", "Sundargarh"
    ];

    const districtsToQuery = district ? [district] : allDistricts;
    const stats = [];

    for (const dist of districtsToQuery) {
      const [volunteerStats] = await db
        .select({
          total: sql<number>`COUNT(*)`,
          approved: sql<number>`COUNT(CASE WHEN ${volunteers.status} = 'approved' THEN 1 END)`,
          pending: sql<number>`COUNT(CASE WHEN ${volunteers.status} = 'pending' THEN 1 END)`,
        })
        .from(volunteers)
        .where(eq(volunteers.district, dist));

      const [incidentStats] = await db
        .select({
          total: sql<number>`COUNT(*)`,
          active: sql<number>`COUNT(CASE WHEN ${incidents.status} IN ('reported', 'assigned', 'in_progress') THEN 1 END)`,
          critical: sql<number>`COUNT(CASE WHEN ${incidents.severity} = 'critical' THEN 1 END)`,
        })
        .from(incidents)
        .where(eq(incidents.district, dist));

      const [trainingStats] = await db
        .select({
          total: sql<number>`COUNT(*)`,
          upcoming: sql<number>`COUNT(CASE WHEN ${trainings.status} = 'scheduled' THEN 1 END)`,
        })
        .from(trainings)
        .where(
          or(
            eq(trainings.district, dist),
            eq(trainings.isStatewide, true)
          )
        );

      stats.push({
        district: dist,
        volunteers: {
          total: Number(volunteerStats?.total || 0),
          approved: Number(volunteerStats?.approved || 0),
          pending: Number(volunteerStats?.pending || 0),
        },
        incidents: {
          total: Number(incidentStats?.total || 0),
          active: Number(incidentStats?.active || 0),
          critical: Number(incidentStats?.critical || 0),
        },
        trainings: {
          total: Number(trainingStats?.total || 0),
          upcoming: Number(trainingStats?.upcoming || 0),
        },
      });
    }

    return stats;
  }
}

export const storage = new DatabaseStorage();
