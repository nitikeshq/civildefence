import { storage } from "./storage";
import { hashPassword } from "./auth";
import { db } from "./db";
import { incidents, inventory, volunteers } from "@shared/schema";

async function seedDatabase() {
  console.log("Seeding database with test users...");

  const testUsers = [
    {
      username: "volunteer1",
      password: "volunteer123",
      firstName: "Ravi",
      lastName: "Kumar",
      email: "ravi.kumar@example.com",
      role: "volunteer" as const,
      district: "Khordha",
    },
    {
      username: "volunteer2",
      password: "volunteer123",
      firstName: "Priya",
      lastName: "Patel",
      email: "priya.patel@example.com",
      role: "volunteer" as const,
      district: "Puri",
    },
    {
      username: "volunteer3",
      password: "volunteer123",
      firstName: "Suresh",
      lastName: "Rao",
      email: "suresh.rao@example.com",
      role: "volunteer" as const,
      district: "Cuttack",
    },
    {
      username: "volunteer4",
      password: "volunteer123",
      firstName: "Anjali",
      lastName: "Sharma",
      email: "anjali.sharma@example.com",
      role: "volunteer" as const,
      district: "Balasore",
    },
    {
      username: "volunteer5",
      password: "volunteer123",
      firstName: "Deepak",
      lastName: "Singh",
      email: "deepak.singh@example.com",
      role: "volunteer" as const,
      district: "Ganjam",
    },
    {
      username: "volunteer6",
      password: "volunteer123",
      firstName: "Kavita",
      lastName: "Nayak",
      email: "kavita.nayak@example.com",
      role: "volunteer" as const,
      district: "Sambalpur",
    },
    {
      username: "volunteer7",
      password: "volunteer123",
      firstName: "Rajesh",
      lastName: "Mishra",
      email: "rajesh.mishra@example.com",
      role: "volunteer" as const,
      district: "Mayurbhanj",
    },
    {
      username: "volunteer8",
      password: "volunteer123",
      firstName: "Sita",
      lastName: "Devi",
      email: "sita.devi@example.com",
      role: "volunteer" as const,
      district: "Jagatsinghpur",
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

  const createdUsers = new Map<string, any>();

  for (const userData of testUsers) {
    try {
      const { password, ...userInfo } = userData;
      const password_hash = await hashPassword(password);
      
      // Check if user already exists
      const existing = await storage.getUserByUsername(userInfo.username);
      if (existing) {
        console.log(`User ${userInfo.username} already exists, skipping...`);
        createdUsers.set(userInfo.username, existing);
        continue;
      }

      const user = await storage.createUser({
        ...userInfo,
        password_hash,
      });

      createdUsers.set(userInfo.username, user);
      console.log(`✓ Created user: ${user.username} (${user.role})`);
    } catch (error) {
      console.error(`✗ Failed to create user ${userData.username}:`, error);
    }
  }

  // Seed volunteer registrations
  console.log("\n👥 Seeding volunteer registrations...");
  const volunteerRegistrations = [
    {
      username: "volunteer1",
      fullName: "Ravi Kumar",
      email: "ravi.kumar@example.com",
      phone: "+91 9876543210",
      address: "123 Main Street, Bhubaneswar, Khordha",
      district: "Khordha",
      dateOfBirth: "1985-03-15",
      isExServiceman: true,
      serviceHistory: "Indian Army, 10 years service, Medical Corps",
      skills: ["First Aid", "Disaster Response", "Medical Support"],
      qualifications: "B.Sc in Nursing, Advanced Trauma Life Support Certificate",
      emergencyContact: "Meera Kumar",
      emergencyPhone: "+91 9876543211",
      status: "approved" as const,
    },
    {
      username: "volunteer2",
      fullName: "Priya Patel",
      email: "priya.patel@example.com",
      phone: "+91 9876543212",
      address: "456 Beach Road, Puri",
      district: "Puri",
      dateOfBirth: "1990-07-22",
      isExServiceman: false,
      skills: ["Communication", "Crowd Management", "Translation"],
      qualifications: "M.A. in Social Work",
      emergencyContact: "Rahul Patel",
      emergencyPhone: "+91 9876543213",
      status: "approved" as const,
    },
    {
      username: "volunteer3",
      fullName: "Suresh Rao",
      email: "suresh.rao@example.com",
      phone: "+91 9876543214",
      address: "789 River Road, Cuttack",
      district: "Cuttack",
      dateOfBirth: "1982-11-30",
      isExServiceman: true,
      serviceHistory: "Indian Navy, 15 years service, Engineering Branch",
      skills: ["Rescue Operations", "Swimming", "Technical Repairs"],
      qualifications: "B.E. in Mechanical Engineering",
      emergencyContact: "Lakshmi Rao",
      emergencyPhone: "+91 9876543215",
      status: "pending" as const,
    },
    {
      username: "volunteer4",
      fullName: "Anjali Sharma",
      email: "anjali.sharma@example.com",
      phone: "+91 9876543216",
      address: "321 Hill View, Balasore",
      district: "Balasore",
      dateOfBirth: "1995-05-10",
      isExServiceman: false,
      skills: ["Teaching", "Child Care", "Counseling"],
      qualifications: "B.Ed., M.A. in Psychology",
      emergencyContact: "Vikram Sharma",
      emergencyPhone: "+91 9876543217",
      status: "approved" as const,
    },
    {
      username: "volunteer5",
      fullName: "Deepak Singh",
      email: "deepak.singh@example.com",
      phone: "+91 9876543218",
      address: "654 Market Road, Berhampur, Ganjam",
      district: "Ganjam",
      dateOfBirth: "1988-09-18",
      isExServiceman: true,
      serviceHistory: "Border Security Force, 8 years service",
      skills: ["Security", "Logistics", "Vehicle Operation"],
      qualifications: "Diploma in Security Management",
      emergencyContact: "Sunita Singh",
      emergencyPhone: "+91 9876543219",
      status: "pending" as const,
    },
    {
      username: "volunteer6",
      fullName: "Kavita Nayak",
      email: "kavita.nayak@example.com",
      phone: "+91 9876543220",
      address: "987 Temple Street, Sambalpur",
      district: "Sambalpur",
      dateOfBirth: "1992-12-05",
      isExServiceman: false,
      skills: ["Healthcare", "Public Health", "Vaccination"],
      qualifications: "B.Pharm, Certified Pharmacist",
      emergencyContact: "Anil Nayak",
      emergencyPhone: "+91 9876543221",
      status: "approved" as const,
    },
    {
      username: "volunteer7",
      fullName: "Rajesh Mishra",
      email: "rajesh.mishra@example.com",
      phone: "+91 9876543222",
      address: "147 Forest Colony, Baripada, Mayurbhanj",
      district: "Mayurbhanj",
      dateOfBirth: "1987-04-28",
      isExServiceman: false,
      skills: ["Firefighting", "Emergency Response", "Heavy Equipment"],
      qualifications: "Diploma in Fire Safety Engineering",
      emergencyContact: "Geeta Mishra",
      emergencyPhone: "+91 9876543223",
      status: "pending" as const,
    },
    {
      username: "volunteer8",
      fullName: "Sita Devi",
      email: "sita.devi@example.com",
      phone: "+91 9876543224",
      address: "258 Coastal Road, Paradip, Jagatsinghpur",
      district: "Jagatsinghpur",
      dateOfBirth: "1993-08-14",
      isExServiceman: false,
      skills: ["Food Distribution", "Relief Work", "Community Organization"],
      qualifications: "B.A. in Social Science",
      emergencyContact: "Ram Devi",
      emergencyPhone: "+91 9876543225",
      status: "approved" as const,
    },
  ];

  for (const volData of volunteerRegistrations) {
    try {
      const user = createdUsers.get(volData.username);
      if (!user) {
        console.log(`User ${volData.username} not found, skipping volunteer registration...`);
        continue;
      }

      const { username, ...volInfo } = volData;
      
      // Check if volunteer registration already exists
      const existing = await storage.getVolunteerByUserId(user.id);
      if (existing) {
        console.log(`Volunteer registration for ${volData.fullName} already exists, skipping...`);
        continue;
      }

      await db.insert(volunteers).values({
        userId: user.id,
        ...volInfo,
      });

      console.log(`✓ Created volunteer registration: ${volInfo.fullName} (${volInfo.district})`);
    } catch (error) {
      console.error(`✗ Failed to create volunteer registration for ${volData.fullName}:`, error);
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
