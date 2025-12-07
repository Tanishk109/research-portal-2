import { connectToMongoDB, checkMongoDBHealth, getMongoDBInfo } from "./mongodb";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";
import mongoose from "mongoose";

// Initialize MongoDB connection on import
if (typeof window === "undefined") {
  connectToMongoDB().catch(console.error);
}

// Password utilities (unchanged)
export async function hashPassword(password: string): Promise<string> {
  try {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  } catch (error) {
    console.error("Password hashing failed:", error);
    throw new Error("Failed to hash password");
  }
}

export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    console.error("Password comparison failed:", error);
    return false;
  }
}

// Database health check
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    return await checkMongoDBHealth();
  } catch (error) {
    console.error("Database health check failed:", error);
    return false;
  }
}

// Get database info
export async function getDatabaseInfo() {
  try {
    return await getMongoDBInfo();
  } catch (error) {
    console.error("Failed to get database info:", error);
    throw error;
  }
}

// Test database connection
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    return await checkMongoDBHealth();
  } catch (error) {
    console.error("Database connection test failed:", error);
    return false;
  }
}

// Close database connection
export async function closeDatabaseConnection(): Promise<void> {
  const { disconnectFromMongoDB } = await import("./mongodb");
  await disconnectFromMongoDB();
}

// SQL-like interface for compatibility
// This provides a compatibility layer for existing code
export function sql(strings: TemplateStringsArray, ...values: any[]): Promise<any[]> {
  throw new Error(
    "SQL queries are not supported with MongoDB. Please use Mongoose models directly. " +
    "Import models from '@/lib/models' and use them instead of sql template literals."
  );
}

// Add unsafe method for dynamic queries (not supported)
sql.unsafe = (query: string, params: any[] = []) => {
  throw new Error(
    "SQL queries are not supported with MongoDB. Please use Mongoose models directly."
  );
};

// Helper function to convert MongoDB ObjectId to string or number
export function toId(value: string | ObjectId | number | undefined): string | number | undefined {
  if (!value) return undefined;
  if (value instanceof ObjectId) return value.toString();
  if (typeof value === "string" && ObjectId.isValid(value)) return value;
  if (typeof value === "number") return value;
  return String(value);
}

// Helper function to convert to MongoDB ObjectId
export function toObjectId(value: string | ObjectId | number | undefined): ObjectId | undefined {
  if (!value) return undefined;
  if (value instanceof ObjectId) return value;
  if (typeof value === "string" && ObjectId.isValid(value)) return new ObjectId(value);
  if (typeof value === "number") return new ObjectId(value.toString());
  return undefined;
}

// Helper to convert MongoDB document to plain object with id
export function toPlainObject(doc: any): any {
  if (!doc) return null;
  if (Array.isArray(doc)) {
    return doc.map(toPlainObject);
  }
  
  // Handle Mongoose documents
  if (doc.toObject) {
    const obj = doc.toObject();
    return convertObjectIds(obj);
  }
  
  // Handle plain objects (from .lean())
  if (typeof doc === 'object') {
    return convertObjectIds({ ...doc });
  }
  
  return doc;
}

// Helper to recursively convert ObjectId fields to strings
function convertObjectIds(obj: any): any {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(convertObjectIds);
  }
  
  // Check if it's an ObjectId instance (MongoDB or Mongoose)
  if (obj instanceof ObjectId || (obj.constructor && (obj.constructor.name === 'ObjectId' || obj.constructor.name === 'ObjectID'))) {
    return obj.toString();
  }
  
  // Check if it's a Mongoose ObjectId (has toHexString method)
  if (mongoose.Types.ObjectId.isValid(obj) && typeof obj.toHexString === 'function') {
    return obj.toString();
  }
  
  // Check if it has ObjectId-like properties (buffer property indicates ObjectId)
  if (obj.buffer && typeof obj.toString === 'function' && !(obj instanceof Date)) {
    return obj.toString();
  }
  
  const result: any = {};
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      
      // Skip __v (Mongoose version key)
      if (key === '__v') {
        continue;
      }
      
      // Convert _id to id
      if (key === '_id') {
        if (value) {
          if (value instanceof ObjectId || mongoose.Types.ObjectId.isValid(value)) {
            result.id = value.toString();
          } else {
            result.id = String(value);
          }
        }
        continue;
      }
      
      // Convert other ObjectId fields
      if (value && typeof value === 'object') {
        if (value instanceof ObjectId || mongoose.Types.ObjectId.isValid(value)) {
          result[key] = value.toString();
        } else if (Array.isArray(value)) {
          result[key] = value.map(convertObjectIds);
        } else if (value instanceof Date) {
          result[key] = value.toISOString();
        } else {
          result[key] = convertObjectIds(value);
        }
      } else if (value instanceof Date) {
        result[key] = value.toISOString();
      } else {
        result[key] = value;
      }
    }
  }
  
  return result;
}

// Export getPool for compatibility (returns MongoDB connection)
export function getPool() {
  return {
    execute: async (query: string, params: any[]) => {
      throw new Error("SQL queries not supported. Use Mongoose models instead.");
    },
    getConnection: async () => {
      await connectToMongoDB();
      return {
        execute: async (query: string, params: any[]) => {
          throw new Error("SQL queries not supported. Use Mongoose models instead.");
        },
        release: () => {},
      };
    },
  };
}
