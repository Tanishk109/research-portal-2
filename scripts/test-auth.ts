import fetch from "node-fetch"

async function testAuth() {
  console.log("Testing authentication flow...")

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

  try {
    // Test login
    console.log("\nTesting login...")
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "faculty@example.com",
        password: "password123",
        role: "faculty",
        ipAddress: "127.0.0.1",
        userAgent: "Test Script",
      }),
    })

    const loginData = await loginResponse.json()
    console.log("Login response:", loginData)

    if (!loginData.success) {
      console.error("Login test failed:", loginData.message)
    } else {
      console.log("Login test passed!")
    }

    // Test registration
    console.log("\nTesting registration...")
    const registrationResponse = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        role: "faculty",
        firstName: "New",
        lastName: "Faculty",
        email: "new.faculty@example.com",
        password: "password123",
        facultyId: "F54321",
        department: "Physics",
        specialization: "Quantum Physics",
        dateOfJoining: "2022-01-01",
        dateOfBirth: "1985-01-01",
        userAgent: "Test Script",
        ipAddress: "127.0.0.1",
      }),
    })

    const registrationData = await registrationResponse.json()
    console.log("Registration response:", registrationData)

    if (!registrationData.success) {
      console.error("Registration test failed:", registrationData.message)
    } else {
      console.log("Registration test passed!")
    }

    return { success: true, message: "Auth tests completed" }
  } catch (error) {
    console.error("Auth test error:", error)
    return {
      success: false,
      message: `Auth tests failed: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

// Run the test
testAuth()
  .then((result) => {
    console.log("\nTest result:", result)
    process.exit(result.success ? 0 : 1)
  })
  .catch((error) => {
    console.error("Unhandled error:", error)
    process.exit(1)
  })
