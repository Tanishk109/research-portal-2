import mysql from "mysql2/promise"
import bcrypt from "bcryptjs"

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: Number.parseInt(process.env.DB_PORT || "3306"),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "research_portal",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
  timezone: 'local',
}

// Create connection pool
let pool: mysql.Pool | null = null

function getPool() {
  if (!pool) {
    pool = mysql.createPool(dbConfig)
  }
  return pool
}

// Export getPool function
export { getPool }

// SQL template function to mimic Neon's interface
export function sql(strings: TemplateStringsArray, ...values: any[]) {
  const query = strings.reduce((result, string, i) => {
    return result + string + (values[i] !== undefined ? "?" : "")
  }, "")

  const params = values.filter((v) => v !== undefined)

  return executeQuery(query, params)
}

// Add unsafe method for dynamic queries
sql.unsafe = (query: string, params: any[] = []) => {
  return executeQuery(query, params)
}

// Execute query function
async function executeQuery(query: string, params: any[] = []) {
  try {
    const connection = getPool()
    const [rows] = await connection.execute(query, params)
    return rows as any[]
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}

// Password utilities
export async function hashPassword(password: string): Promise<string> {
  try {
    const saltRounds = 10
    return await bcrypt.hash(password, saltRounds)
  } catch (error) {
    console.error("Password hashing failed:", error)
    throw new Error("Failed to hash password")
  }
}

export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hashedPassword)
  } catch (error) {
    console.error("Password comparison failed:", error)
    return false
  }
}

// Database health check
export async function checkDatabaseHealth() {
  try {
    const result = await sql`SELECT 1 as health_check`
    return result[0].health_check === 1
  } catch (error) {
    console.error("Database health check failed:", error)
    return false
  }
}

// Get database info
export async function getDatabaseInfo() {
  try {
    const result = await sql`
      SELECT 
        DATABASE() as database_name,
        USER() as user,
        VERSION() as version,
        NOW() as timestamp
    `
    return result[0]
  } catch (error) {
    console.error("Failed to get database info:", error)
    throw error
  }
}

// Test database connection
export async function testDatabaseConnection() {
  try {
    const connection = getPool()
    await connection.execute("SELECT 1")
    return true
  } catch (error) {
    console.error("Database connection test failed:", error)
    return false
  }
}

// Close database connection
export async function closeDatabaseConnection() {
  if (pool) {
    await pool.end()
    pool = null
  }
}
