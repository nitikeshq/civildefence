import { sql } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  boolean,
  integer,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User roles enum
export const userRoleEnum = pgEnum("user_role", [
  "volunteer",
  "district_admin",
  "department_admin",
  "state_admin",
]);

// Users table for local password authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: varchar("username").unique().notNull(),
  password_hash: text("password_hash").notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: userRoleEnum("role").default("volunteer"),
  district: varchar("district"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Insert schema for user signup (client sends password, server creates password_hash)
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  password_hash: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;

// Volunteer status enum
export const volunteerStatusEnum = pgEnum("volunteer_status", [
  "pending",
  "approved",
  "rejected",
]);

// Volunteers table
export const volunteers = pgTable("volunteers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  fullName: varchar("full_name").notNull(),
  email: varchar("email").notNull(),
  phone: varchar("phone").notNull(),
  address: text("address").notNull(),
  district: varchar("district").notNull(),
  dateOfBirth: varchar("date_of_birth"),
  isExServiceman: boolean("is_ex_serviceman").default(false),
  serviceHistory: text("service_history"),
  skills: text("skills").array(),
  qualifications: text("qualifications"),
  medicalHistory: text("medical_history"),
  emergencyContact: varchar("emergency_contact"),
  emergencyPhone: varchar("emergency_phone"),
  idProofUrl: varchar("id_proof_url"),
  certificateUrl: varchar("certificate_url"),
  photoUrl: varchar("photo_url"),
  status: volunteerStatusEnum("status").default("pending"),
  approvedBy: varchar("approved_by"),
  approvedAt: timestamp("approved_at"),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertVolunteerSchema = createInsertSchema(volunteers).omit({
  id: true,
  status: true,
  approvedBy: true,
  approvedAt: true,
  rejectionReason: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertVolunteer = z.infer<typeof insertVolunteerSchema>;
export type Volunteer = typeof volunteers.$inferSelect;

// Incident severity enum
export const incidentSeverityEnum = pgEnum("incident_severity", [
  "low",
  "medium",
  "high",
  "critical",
]);

// Incident status enum
export const incidentStatusEnum = pgEnum("incident_status", [
  "reported",
  "assigned",
  "in_progress",
  "resolved",
  "closed",
]);

// Incidents table
export const incidents = pgTable("incidents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reportedBy: varchar("reported_by").references(() => users.id),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  location: varchar("location").notNull(),
  latitude: varchar("latitude"),
  longitude: varchar("longitude"),
  district: varchar("district").notNull(),
  severity: incidentSeverityEnum("severity").default("medium"),
  status: incidentStatusEnum("status").default("reported"),
  assignedTo: varchar("assigned_to").array(),
  resolvedBy: varchar("resolved_by"),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertIncidentSchema = createInsertSchema(incidents).omit({
  id: true,
  status: true,
  assignedTo: true,
  resolvedBy: true,
  resolvedAt: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertIncident = z.infer<typeof insertIncidentSchema>;
export type Incident = typeof incidents.$inferSelect;

// Equipment category enum
export const equipmentCategoryEnum = pgEnum("equipment_category", [
  "medical_supplies",
  "communication_equipment",
  "rescue_equipment",
  "vehicles",
  "safety_gear",
  "other",
]);

// Equipment condition enum
export const equipmentConditionEnum = pgEnum("equipment_condition", [
  "excellent",
  "good",
  "fair",
  "poor",
  "needs_repair",
]);

// Inventory table
export const inventory = pgTable("inventory", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  category: equipmentCategoryEnum("category").notNull(),
  description: text("description"),
  quantity: integer("quantity").notNull().default(0),
  condition: equipmentConditionEnum("condition").default("good"),
  location: varchar("location").notNull(),
  district: varchar("district").notNull(),
  lastInspection: timestamp("last_inspection"),
  nextInspection: timestamp("next_inspection"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertInventorySchema = createInsertSchema(inventory).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertInventory = z.infer<typeof insertInventorySchema>;
export type InventoryItem = typeof inventory.$inferSelect;

// Districts reference table for hierarchical data access
export const districts = pgTable("districts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull().unique(),
  code: varchar("code").notNull().unique(),
  state: varchar("state").default("Odisha"),
  region: varchar("region"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type District = typeof districts.$inferSelect;

// Departments reference table
export const departments = pgTable("departments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type Department = typeof departments.$inferSelect;

// Training sessions for volunteer training management
export const trainingSessions = pgTable("training_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  departmentId: varchar("department_id").references(() => departments.id),
  district: varchar("district"),
  scheduledAt: timestamp("scheduled_at").notNull(),
  duration: integer("duration"),
  capacity: integer("capacity").default(50),
  location: varchar("location"),
  instructor: varchar("instructor"),
  status: varchar("status").default("scheduled"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertTrainingSessionSchema = createInsertSchema(trainingSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertTrainingSession = z.infer<typeof insertTrainingSessionSchema>;
export type TrainingSession = typeof trainingSessions.$inferSelect;

// Assignments table - links volunteers to incidents and training sessions
export const assignmentStatusEnum = pgEnum("assignment_status", [
  "assigned",
  "accepted",
  "in_progress",
  "completed",
  "declined",
]);

export const assignments = pgTable("assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  volunteerId: varchar("volunteer_id").references(() => volunteers.id).notNull(),
  incidentId: varchar("incident_id").references(() => incidents.id),
  trainingSessionId: varchar("training_session_id").references(() => trainingSessions.id),
  role: varchar("role"),
  status: assignmentStatusEnum("status").default("assigned"),
  assignedBy: varchar("assigned_by").references(() => users.id),
  assignedAt: timestamp("assigned_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertAssignmentSchema = createInsertSchema(assignments).omit({
  id: true,
  assignedAt: true,
  completedAt: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAssignment = z.infer<typeof insertAssignmentSchema>;
export type Assignment = typeof assignments.$inferSelect;
