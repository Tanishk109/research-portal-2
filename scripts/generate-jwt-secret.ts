import crypto from "crypto"

// Generate a secure random string for JWT_SECRET
const jwtSecret = crypto.randomBytes(32).toString("base64")

console.log("Generated JWT_SECRET:")
console.log(jwtSecret)
console.log("\nAdd this to your .env file:")
console.log(`JWT_SECRET=${jwtSecret}`)
