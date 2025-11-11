import { storage } from "./storage";
import { hashPassword } from "./auth";

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

  console.log("\nDatabase seeding completed!");
  process.exit(0);
}

seedDatabase().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});
