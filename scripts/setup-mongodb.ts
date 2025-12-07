// Load environment variables FIRST (for standalone scripts)
require("dotenv").config({ path: require("path").resolve(process.cwd(), ".env.local") });

import { connectToMongoDB } from "../lib/mongodb";
import { User, FacultyProfile, StudentProfile, Project, Application, LoginActivity } from "../lib/models";

async function setupMongoDB() {
  try {
    console.log("🚀 Setting up MongoDB database...");
    
    // Connect to MongoDB
    await connectToMongoDB();
    console.log("✅ Connected to MongoDB");

    // Create indexes
    console.log("📊 Creating indexes...");
    
    // User indexes
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ role: 1 });
    console.log("✅ User indexes created");

    // Faculty Profile indexes
    await FacultyProfile.collection.createIndex({ faculty_id: 1 }, { unique: true });
    await FacultyProfile.collection.createIndex({ user_id: 1 });
    await FacultyProfile.collection.createIndex({ department: 1 });
    console.log("✅ Faculty Profile indexes created");

    // Student Profile indexes
    await StudentProfile.collection.createIndex({ registration_number: 1 }, { unique: true });
    await StudentProfile.collection.createIndex({ user_id: 1 });
    await StudentProfile.collection.createIndex({ department: 1 });
    await StudentProfile.collection.createIndex({ year: 1 });
    console.log("✅ Student Profile indexes created");

    // Project indexes
    await Project.collection.createIndex({ faculty_id: 1 });
    await Project.collection.createIndex({ status: 1 });
    await Project.collection.createIndex({ created_at: 1 });
    console.log("✅ Project indexes created");

    // Application indexes
    await Application.collection.createIndex({ project_id: 1, student_id: 1 }, { unique: true });
    await Application.collection.createIndex({ project_id: 1 });
    await Application.collection.createIndex({ student_id: 1 });
    await Application.collection.createIndex({ status: 1 });
    await Application.collection.createIndex({ applied_at: 1 });
    console.log("✅ Application indexes created");

    // Login Activity indexes
    await LoginActivity.collection.createIndex({ user_id: 1 });
    await LoginActivity.collection.createIndex({ timestamp: 1 });
    await LoginActivity.collection.createIndex({ success: 1 });
    console.log("✅ Login Activity indexes created");

    console.log("✅ Database setup completed successfully!");
    console.log("📊 All collections and indexes created");

    // Show collection status
    const { mongoose } = await import("../lib/mongodb");
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log("📋 Collections:", collections.map((c) => c.name).join(", "));
  } catch (error) {
    console.error("❌ Database setup failed:", error);
    process.exit(1);
  }
}

// Run setup if called directly
if (require.main === module) {
  setupMongoDB()
    .then(() => {
      console.log("🎉 Setup complete!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Setup failed:", error);
      process.exit(1);
    });
}

export { setupMongoDB };
