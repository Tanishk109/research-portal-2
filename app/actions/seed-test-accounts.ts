"use server"

export async function seedTestAccounts() {
  return {
    success: false,
    message: "Test account seeding is disabled. Use the normal registration flow so all account data comes from user input and is stored in MongoDB.",
    accounts: [],
  }
}
