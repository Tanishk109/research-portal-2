import { testAuthentication } from "./test-auth"

async function runTest() {
  const result = await testAuthentication()
  console.log("Test result:", result)
}

runTest()
