import { storage } from "./storage";
import { hashPassword } from "./auth";
import { db } from "./db";
import { incidents, inventory } from "@shared/schema";

async function seedDatabase() {
  console.log("Seeding database with test users...");

  const testUsers = [
    {
      username: "volunteer1",
      password: "volunteer123",
      firstName: "John",
      lastName: "Volunteer",
      email: "volunteer@example.com",
      role: "volunteer" as const,
      district: "Khordha",
    },
    {
      username: "district_admin",
      password: "district123",
      firstName: "District",
      lastName: "Administrator",
      email: "district.admin@odisha.gov.in",
      role: "district_admin" as const,
      district: "Khordha",
    },
    {
      username: "dept_admin",
      password: "department123",
      firstName: "Department",
      lastName: "Administrator",
      email: "dept.admin@odisha.gov.in",
      role: "department_admin" as const,
      district: "Bhubaneswar",
    },
    {
      username: "state_admin",
      password: "state123",
      firstName: "State",
      lastName: "Administrator",
      email: "state.admin@odisha.gov.in",
      role: "state_admin" as const,
      district: "Bhubaneswar",
    },
    {
      username: "cms_manager",
      password: "cms123",
      firstName: "CMS",
      lastName: "Manager",
      email: "cms.manager@odisha.gov.in",
      role: "cms_manager" as const,
      district: "Bhubaneswar",
    },
  ];

  for (const userData of testUsers) {
    try {
      const { password, ...userInfo } = userData;
      const password_hash = await hashPassword(password);
      
      // Check if user already exists
      const existing = await storage.getUserByUsername(userInfo.username);
      if (existing) {
        console.log(`User ${userInfo.username} already exists, skipping...`);
        continue;
      }

      const user = await storage.createUser({
        ...userInfo,
        password_hash,
      });

      console.log(`✓ Created user: ${user.username} (${user.role})`);
    } catch (error) {
      console.error(`✗ Failed to create user ${userData.username}:`, error);
    }
  }

  // Seed incidents
  console.log("\n🔥 Seeding incidents...");
  const sampleIncidents = [
    {
      title: "Flood in Coastal Area",
      description: "Heavy rainfall causing flooding in low-lying areas near the coast",
      location: "Balasore Beach Road",
      district: "Balasore",
      severity: "high" as const,
      status: "reported" as const,
    },
    {
      title: "Cyclone Warning - Severe",
      description: "IMD issued severe cyclone warning for coastal districts, evacuation recommended",
      location: "Puri Coast",
      district: "Puri",
      severity: "critical" as const,
      status: "assigned" as const,
    },
    {
      title: "Landslide on Highway NH-26",
      description: "Heavy rains triggered landslide blocking National Highway 26",
      location: "Koraput-Jeypore Highway",
      district: "Koraput",
      severity: "high" as const,
      status: "in_progress" as const,
    },
    {
      title: "Fire in Industrial Area",
      description: "Fire breakout in industrial complex, multiple units affected",
      location: "Angul Industrial Estate",
      district: "Angul",
      severity: "critical" as const,
      status: "reported" as const,
    },
    {
      title: "Road Accident - NH16",
      description: "Multi-vehicle collision on NH-16 near toll plaza",
      location: "Cuttack-Bhubaneswar Expressway",
      district: "Cuttack",
      severity: "medium" as const,
      status: "resolved" as const,
    },
    {
      title: "Building Collapse Alert",
      description: "Old residential building showing cracks, residents evacuated",
      location: "Unit-4, Bhubaneswar",
      district: "Khordha",
      severity: "high" as const,
      status: "in_progress" as const,
    },
    {
      title: "Boat Capsized - River Mahanadi",
      description: "Fishing boat capsized in Mahanadi river, rescue operation ongoing",
      location: "Mahanadi River, Sambalpur",
      district: "Sambalpur",
      severity: "critical" as const,
      status: "assigned" as const,
    },
    {
      title: "Forest Fire Alert",
      description: "Forest fire detected in Similipal reserve area",
      location: "Similipal National Park",
      district: "Mayurbhanj",
      severity: "high" as const,
      status: "reported" as const,
    },
  ];

  for (const incident of sampleIncidents) {
    try {
      await db.insert(incidents).values(incident);
      console.log(`✓ Added incident: ${incident.title}`);
    } catch (error) {
      console.error(`✗ Failed to add incident ${incident.title}:`, error);
    }
  }

  // Seed inventory
  console.log("\n📦 Seeding inventory...");
  const sampleInventory = [
    {
      name: "First Aid Kits - Type A",
      category: "medical_supplies" as const,
      description: "Complete first aid kit with bandages, antiseptics, and basic medicines",
      quantity: 150,
      condition: "excellent" as const,
      location: "District Headquarters - Storage Room 1",
      district: "Jagatsinghpur",
      lastInspection: new Date("2025-01-05"),
      nextInspection: new Date("2025-04-05"),
    },
    {
      name: "Walkie-Talkie Sets - Professional",
      category: "communication_equipment" as const,
      description: "Professional grade walkie-talkie with 10km range, waterproof",
      quantity: 45,
      condition: "good" as const,
      location: "Communication Center",
      district: "Jagatsinghpur",
      lastInspection: new Date("2024-12-15"),
      nextInspection: new Date("2025-03-15"),
    },
    {
      name: "Rescue Boats - Inflatable",
      category: "rescue_equipment" as const,
      description: "Inflatable rescue boats with motor, capacity 8 persons each",
      quantity: 12,
      condition: "excellent" as const,
      location: "Flood Response Station",
      district: "Puri",
      lastInspection: new Date("2025-01-10"),
      nextInspection: new Date("2025-04-10"),
    },
    {
      name: "Emergency Ambulances",
      category: "vehicles" as const,
      description: "Fully equipped ambulances with advanced life support systems",
      quantity: 5,
      condition: "good" as const,
      location: "District Hospital Parking",
      district: "Cuttack",
      lastInspection: new Date("2025-01-01"),
      nextInspection: new Date("2025-02-01"),
    },
    {
      name: "Safety Helmets - High Impact",
      category: "safety_gear" as const,
      description: "High-impact resistant safety helmets, ISI certified",
      quantity: 200,
      condition: "excellent" as const,
      location: "Equipment Storage - Shelf 3",
      district: "Khordha",
      lastInspection: new Date("2024-12-20"),
      nextInspection: new Date("2025-03-20"),
    },
    {
      name: "Life Jackets - Adult Size",
      category: "safety_gear" as const,
      description: "Coast guard approved life jackets, adult size (50+ kg)",
      quantity: 180,
      condition: "good" as const,
      location: "Coastal Safety Unit",
      district: "Balasore",
      lastInspection: new Date("2025-01-08"),
      nextInspection: new Date("2025-04-08"),
    },
    {
      name: "Fire Extinguishers - ABC Type",
      category: "rescue_equipment" as const,
      description: "Multi-purpose dry chemical fire extinguishers, 5kg capacity",
      quantity: 8,
      condition: "needs_repair" as const,
      location: "Fire Station Annexe",
      district: "Angul",
      lastInspection: new Date("2024-11-15"),
      nextInspection: new Date("2025-02-15"),
    },
    {
      name: "Portable Generators - 5KVA",
      category: "other" as const,
      description: "5KVA diesel generators for emergency power backup",
      quantity: 18,
      condition: "good" as const,
      location: "Backup Power Depot",
      district: "Ganjam",
      lastInspection: new Date("2024-12-28"),
      nextInspection: new Date("2025-03-28"),
    },
    {
      name: "Stretchers - Foldable Aluminum",
      category: "medical_supplies" as const,
      description: "Lightweight aluminum foldable stretchers with safety straps",
      quantity: 35,
      condition: "fair" as const,
      location: "Medical Equipment Room",
      district: "Puri",
      lastInspection: new Date("2024-12-01"),
      nextInspection: new Date("2025-03-01"),
    },
    {
      name: "Satellite Phones - Emergency",
      category: "communication_equipment" as const,
      description: "Emergency satellite communication devices with global coverage",
      quantity: 6,
      condition: "excellent" as const,
      location: "Command Center",
      district: "Jagatsinghpur",
      lastInspection: new Date("2025-01-12"),
      nextInspection: new Date("2025-04-12"),
    },
    {
      name: "Water Pumps - High Capacity",
      category: "rescue_equipment" as const,
      description: "High capacity water pumps for flood rescue, 1000L/min",
      quantity: 15,
      condition: "good" as const,
      location: "Flood Equipment Store",
      district: "Kendrapara",
      lastInspection: new Date("2025-01-03"),
      nextInspection: new Date("2025-04-03"),
    },
    {
      name: "Emergency Tents - Family Size",
      category: "other" as const,
      description: "Waterproof emergency tents, capacity 6 persons each",
      quantity: 50,
      condition: "excellent" as const,
      location: "Relief Material Warehouse",
      district: "Gajapati",
      lastInspection: new Date("2024-12-22"),
      nextInspection: new Date("2025-03-22"),
    },
    {
      name: "Rescue Ropes - Heavy Duty",
      category: "rescue_equipment" as const,
      description: "Heavy duty nylon rescue ropes, 30m length, 500kg capacity",
      quantity: 75,
      condition: "good" as const,
      location: "Rescue Equipment Store",
      district: "Koraput",
      lastInspection: new Date("2024-12-18"),
      nextInspection: new Date("2025-03-18"),
    },
    {
      name: "LED Emergency Lights",
      category: "other" as const,
      description: "Rechargeable LED emergency lights, 12hr backup",
      quantity: 120,
      condition: "excellent" as const,
      location: "Electrical Equipment Room",
      district: "Sambalpur",
      lastInspection: new Date("2025-01-07"),
      nextInspection: new Date("2025-04-07"),
    },
    {
      name: "Medical Oxygen Cylinders",
      category: "medical_supplies" as const,
      description: "Medical oxygen cylinders with regulators, 10L capacity",
      quantity: 25,
      condition: "good" as const,
      location: "Medical Gas Storage",
      district: "Mayurbhanj",
      lastInspection: new Date("2025-01-02"),
      nextInspection: new Date("2025-02-02"),
    },
  ];

  for (const item of sampleInventory) {
    try {
      await db.insert(inventory).values(item);
      console.log(`✓ Added inventory: ${item.name}`);
    } catch (error) {
      console.error(`✗ Failed to add inventory ${item.name}:`, error);
    }
  }

  console.log("\n✅ Database seeding completed successfully!");
  process.exit(0);
}

seedDatabase().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});
