import { NEXT_PUBLIC_API_URL } from "./env"

// API Response interface
interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// API request options
interface ApiRequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE"
  headers?: Record<string, string>
  body?: any
  credentials?: RequestCredentials
}

// API request function
export async function apiRequest<T = any>(endpoint: string, options: ApiRequestOptions = {}): Promise<ApiResponse<T>> {
  const { method = "GET", headers = {}, body, credentials = "include" } = options

  const url = endpoint.startsWith("http") ? endpoint : `${NEXT_PUBLIC_API_URL}${endpoint}`

  try {
    const config: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      credentials,
    }

    if (body && method !== "GET") {
      config.body = JSON.stringify(body)
    }

    const response = await fetch(url, config)

    // Check if response is JSON
    const contentType = response.headers.get("content-type")
    const isJson = contentType?.includes("application/json")

    // Parse response
    let responseData: any = null
    if (isJson) {
      try {
        responseData = await response.json()
      } catch (e) {
        console.error("Failed to parse JSON response:", e)
        const textError = await response.text()
        return {
          success: false,
          error: `Failed to parse response: ${textError}`,
          message: "Invalid response from server",
        }
      }
    } else {
      responseData = await response.text()
    }

    if (!response.ok) {
      return {
        success: false,
        error: responseData?.error || responseData?.message || `HTTP ${response.status}`,
        message: responseData?.message || `Request failed with status ${response.status}`,
        data: responseData,
      }
    }

    // Success response
    if (isJson && responseData) {
      // If response already has success property, return as-is
      if (typeof responseData === 'object' && 'success' in responseData) {
        return responseData
      }
      // Otherwise wrap it
      return {
        success: true,
        data: responseData,
        message: responseData?.message || "Request successful",
      }
    } else {
      return {
        success: true,
        data: responseData as T,
        message: "Request completed successfully",
      }
    }
  } catch (error) {
    console.error("API request failed:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error occurred",
      message: "Failed to connect to server",
    }
  }
}

// API endpoints
export const endpoints = {
  auth: {
    login: "/api/auth/login",
    register: "/api/auth/register",
    logout: "/api/auth/logout",
    me: "/api/auth/me",
  },
  users: {
    list: "/api/users",
    byId: (id: string) => `/api/users/${id}`,
    loginActivity: (id: string) => `/api/users/${id}/login-activity`,
  },
  health: "/api/health",
  dbTest: "/api/db-test",
  loginActivity: "/api/login-activity",
  userLoginActivity: (id: string) => `/api/users/${id}/login-activity`,
  envCheck: "/api/env-check",
  appUrl: "/api/app-url",
}

// Main API object
export const api = {
  get: (endpoint: string, headers?: Record<string, string>) => apiRequest(endpoint, { method: "GET", headers }),
  post: (endpoint: string, body?: any, headers?: Record<string, string>) =>
    apiRequest(endpoint, {
      method: "POST",
      body,
      headers,
    }),
  put: (endpoint: string, body?: any, headers?: Record<string, string>) =>
    apiRequest(endpoint, {
      method: "PUT",
      body,
      headers,
    }),
  delete: (endpoint: string, headers?: Record<string, string>) => apiRequest(endpoint, { method: "DELETE", headers }),
  auth: {
    login: (email: string, password: string) =>
      apiRequest(endpoints.auth.login, {
        method: "POST",
        body: { email, password },
      }),

    register: (userData: any) =>
      apiRequest(endpoints.auth.register, {
        method: "POST",
        body: userData,
      }),

    logout: () => apiRequest(endpoints.auth.logout, { method: "POST" }),

    me: () => apiRequest(endpoints.auth.me),
  },
  health: () => apiRequest(endpoints.health),
  dbTest: () => apiRequest(endpoints.dbTest),
}

// IP address helper (for compatibility)
export function getClientIpAddress(): string {
  // This is a placeholder for client-side IP detection
  // In practice, IP detection should be done server-side
  return "client-side"
}

// Export default API client
export default api
