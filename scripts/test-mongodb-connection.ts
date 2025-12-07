// Load environment variables FIRST using require (synchronous)
require("dotenv").config({ path: require("path").resolve(process.cwd(), ".env.local") });

// Now import MongoDB modules (they will have access to MONGODB_URI)
import { connectToMongoDB, checkMongoDBHealth, getMongoDBInfo } from "../lib/mongodb";
import { User, Project, Application } from "../lib/models";

async function testConnection() {
  try {
    console.log("🔍 Testing MongoDB connection...\n");
    console.log(`📝 MONGODB_URI: ${process.env.MONGODB_URI ? "✅ Set" : "❌ Not set"}\n`);

    // Connect
    await connectToMongoDB();
    console.log("✅ Connected to MongoDB");

    // Health check
    const isHealthy = await checkMongoDBHealth();
    console.log(`✅ Health check: ${isHealthy ? "PASSED" : "FAILED"}`);

    // Get info
    const info = await getMongoDBInfo();
    console.log("\n📊 Database Info:");
    console.log(`   Database: ${info.database_name}`);
    console.log(`   Host: ${info.host}:${info.port}`);
    console.log(`   Version: ${info.version}`);
    console.log(`   Collections: ${info.collections}`);

    // Test collections
    console.log("\n📋 Testing Collections:");
    
    const userCount = await User.countDocuments();
    console.log(`   Users: ${userCount} documents`);

    const projectCount = await Project.countDocuments();
    console.log(`   Projects: ${projectCount} documents`);

    const applicationCount = await Application.countDocuments();
    console.log(`   Applications: ${applicationCount} documents`);

    console.log("\n✅ All tests passed! MongoDB is ready to use.");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Test failed:", error);
    process.exit(1);
  }
}

testConnection();
