import { MongoClient } from "mongodb";
import * as dotenv from "dotenv";

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("❌ MONGODB_URI is not set in environment variables");
  process.exit(1);
}

async function testConnection() {
  let client;
  try {
    console.log("🔍 Testing MongoDB connection...");
    console.log(`📝 URI: ${uri.replace(/:[^:@]+@/, ":****@")}\n`);

    client = new MongoClient(uri);
    await client.connect();

    console.log("✅ MongoDB connected successfully");

    // Test database access
    const db = client.db();
    const dbName = db.databaseName;
    console.log(`📊 Database: ${dbName}`);

    // List collections
    const collections = await db.listCollections().toArray();
    console.log(`📋 Collections (${collections.length}):`);
    collections.forEach((col) => {
      console.log(`   - ${col.name}`);
    });

    // Test ping
    await db.admin().ping();
    console.log("✅ Ping successful");

    await client.close();
    console.log("\n✅ Connection test completed successfully");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    if (client) {
      await client.close().catch(() => {});
    }
    process.exit(1);
  }
}

testConnection();

