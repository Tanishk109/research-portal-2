import mongoose from "mongoose";

// Get MongoDB URI from environment variable (required)
let MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL;

if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI in your environment variables");
}

// Ensure database name is included in the connection string
// If the URI doesn't have a database name, append /research_portal
try {
  if (MONGODB_URI.includes("mongodb://") || MONGODB_URI.includes("mongodb+srv://")) {
    const url = new URL(MONGODB_URI);
    // If pathname is empty or just "/", add database name
    if (!url.pathname || url.pathname === "/") {
      url.pathname = "/research_portal";
      // Add retryWrites and w if not present
      if (!url.searchParams.has("retryWrites")) {
        url.searchParams.set("retryWrites", "true");
      }
      if (!url.searchParams.has("w")) {
        url.searchParams.set("w", "majority");
      }
      MONGODB_URI = url.toString();
      console.log("MongoDB URI updated with database name:", MONGODB_URI.replace(/:[^:@]+@/, ":****@"));
    }
  }
} catch (error) {
  console.warn("Could not parse MongoDB URI, using as-is:", error);
  // Continue with original URI if parsing fails
}

// Cache connection for serverless (Vercel)
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

// Connect to MongoDB (optimized for serverless)
export const connectToMongoDB = async () => {
  // Return cached connection if available
  if (cached.conn) {
    return cached.conn;
  }

  // Return existing promise if connection is in progress
  if (cached.promise) {
    return cached.promise;
  }

  // Create new connection promise
  const opts = {
    bufferCommands: false,
    maxPoolSize: process.env.VERCEL ? 1 : 10, // Serverless: use 1 connection
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  };

  cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
    return mongoose;
  });

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
};

// Disconnect from MongoDB
export async function disconnectFromMongoDB(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    cached.conn = null;
    cached.promise = null;
  }
}

// Check MongoDB connection health
export async function checkMongoDBHealth(): Promise<boolean> {
  try {
    await connectToMongoDB();
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.db.admin().ping();
      return true;
    }
    return false;
  } catch (error) {
    console.error("MongoDB health check failed:", error);
    return false;
  }
}

// Get MongoDB connection info
export async function getMongoDBInfo() {
  try {
    await connectToMongoDB();
    
    const db = mongoose.connection.db;
    const admin = db.admin();
    
    const serverStatus = await admin.serverStatus();

    return {
      database_name: db.databaseName,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      readyState: mongoose.connection.readyState,
      version: serverStatus.version,
      collections: Object.keys(mongoose.models).length,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error("Failed to get MongoDB info:", error);
    throw error;
  }
}

// Export mongoose for schema definitions
export { mongoose, mongoose as default };
