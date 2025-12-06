import mysql from "mysql2/promise"
import bcrypt from "bcryptjs"
import { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } from "./env"

// Database configuration with persistent connection settings
const dbConfig: mysql.PoolOptions = {
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
  timezone: 'local',
  // Keep connections alive to avoid drops
  enableKeepAlive: true,
  keepAliveInitialDelay: 0, // Start keep-alive immediately
  // Connection timeout settings
  connectTimeout: 60000, // 60 seconds to establish connection
  // SSL configuration (if needed)
  ssl: false,
} as mysql.PoolOptions

// Create connection pool as a global singleton to persist across hot reloads
let pool: mysql.Pool | null = null
let keepAliveInterval: NodeJS.Timeout | null = null

// Function to ping database connections to keep them alive
function startKeepAlive() {
  if (keepAliveInterval) return // Already running
  
  // Ping database every 30 seconds to keep connections alive
  keepAliveInterval = setInterval(async () => {
    if (pool) {
      try {
        await pool.execute('SELECT 1')
        // Only log in development mode to reduce noise
        if (process.env.NODE_ENV === 'development') {
          console.log('[DB] Keep-alive ping successful')
        }
      } catch (error) {
        console.error('[DB] Keep-alive ping failed:', error)
        // Connection might be dead, but pool will handle reconnection
      }
    }
  }, 30000) // Every 30 seconds
}

function getPool() {
  if (pool) {
    // Start keep-alive if not already running
    if (!keepAliveInterval) {
      startKeepAlive()
    }
    return pool
  }

  const globalAny = globalThis as unknown as { __mysql_pool?: mysql.Pool }
  if (globalAny.__mysql_pool) {
    pool = globalAny.__mysql_pool
    startKeepAlive()
    return pool
  }

  pool = mysql.createPool(dbConfig)
  
  // Set up connection event handlers for better monitoring
  pool.on('connection', (connection) => {
    console.log('[DB] New connection established:', connection.threadId)
    
    // Set connection to auto-reconnect
    connection.on('error', (err) => {
      console.error('[DB] Connection error:', err)
      if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ECONNRESET') {
        console.log('[DB] Connection lost, will reconnect automatically')
      }
    })
  })

  pool.on('acquire', (connection) => {
    // Connection acquired from pool
  })

  pool.on('release', (connection) => {
    // Connection released back to pool
  })

  pool.on('error', (err) => {
    console.error('[DB] Pool error:', err)
    // Pool will handle reconnection automatically
  })

  if (process.env.NODE_ENV !== 'production') {
    globalAny.__mysql_pool = pool
  }
  
  // Start keep-alive mechanism
  startKeepAlive()
  
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

// Execute query function with automatic reconnection
async function executeQuery(query: string, params: any[] = [], retries = 3): Promise<any[]> {
  const pool = getPool()
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const [rows] = await pool.execute(query, params)
      return rows as any[]
    } catch (error: any) {
      const isConnectionError = 
        error.code === 'PROTOCOL_CONNECTION_LOST' ||
        error.code === 'ECONNRESET' ||
        error.code === 'ETIMEDOUT' ||
        error.code === 'ENOTFOUND' ||
        error.fatal === true

      if (isConnectionError && attempt < retries) {
        console.warn(`[DB] Connection error (attempt ${attempt}/${retries}), retrying...`, error.code)
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
        continue
      }
      
      console.error("Database query error:", error)
      throw error
    }
  }
  
  throw new Error("Failed to execute query after retries")
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
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval)
    keepAliveInterval = null
  }
  
  if (pool) {
    await pool.end()
    pool = null
    
    // Clear global pool reference
    const globalAny = globalThis as unknown as { __mysql_pool?: mysql.Pool }
    if (globalAny.__mysql_pool) {
      delete globalAny.__mysql_pool
    }
  }
}

// Initialize connection pool on module load
if (typeof window === 'undefined') {
  // Only run on server-side
  getPool()
}
