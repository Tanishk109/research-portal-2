# MongoDB Migration Status

## ✅ Completed

1. **MongoDB Connection Setup**
   - ✅ Created `lib/mongodb.ts` with connection management
   - ✅ Supports both connection string and individual env vars
   - ✅ Serverless-friendly (Vercel compatible)
   - ✅ Connection pooling and health checks

2. **Mongoose Schemas**
   - ✅ Created `lib/models/index.ts` with all schemas:
     - User
     - FacultyProfile
     - StudentProfile
     - StudentCV
     - StudentCertificate
     - StudentSkill
     - Project
     - Application
     - LoginActivity
   - ✅ All indexes defined
   - ✅ Relationships properly configured

3. **Database Utilities**
   - ✅ Updated `lib/db.ts` for MongoDB compatibility
   - ✅ Helper functions: `toPlainObject()`, `toObjectId()`, `toId()`
   - ✅ Password utilities (unchanged)
   - ✅ Health check functions

4. **Authentication Actions**
   - ✅ Updated `app/actions/auth.ts` to use MongoDB
   - ✅ Login, Register, Logout functions working
   - ✅ getCurrentUser() updated

5. **Setup Scripts**
   - ✅ Created `scripts/setup-mongodb.ts`
   - ✅ Index creation script

6. **Documentation**
   - ✅ Created `MONGODB_MIGRATION.md` guide
   - ✅ Environment variable documentation

## ⏳ In Progress / Next Steps

### High Priority

1. **Profile Actions** (`app/actions/profiles.ts`)
   - [x] Update student profile functions
   - [x] Update faculty profile functions
   - [ ] CV, certificates, skills management (if needed)

2. **Project Actions** (`app/actions/projects.ts`)
   - [x] Create project
   - [x] Get projects
   - [x] Update/delete projects
   - [x] Project search/filtering

3. **Application Actions** (`app/actions/applications.ts`)
   - [x] Apply to project
   - [x] Get applications (student/faculty)
   - [x] Update application status
   - [x] Application filtering

### Medium Priority

4. **Analytics Actions** (`app/actions/analytics.ts`)
   - [ ] Dashboard statistics
   - [ ] Charts data
   - [ ] Aggregation queries

5. **Activity Actions** (`app/actions/activity.ts`)
   - [ ] Login activity tracking
   - [ ] Activity queries

### Low Priority

6. **API Routes**
   - [ ] Update health check routes
   - [ ] Update diagnostic routes
   - [ ] Update all API endpoints

7. **Test Scripts**
   - [ ] Update test scripts
   - [ ] Create MongoDB test utilities

## 🔧 How to Complete Migration

### Step 1: Set Up MongoDB

**Local MongoDB:**
```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or install MongoDB locally
# macOS: brew install mongodb-community
# Ubuntu: sudo apt-get install mongodb
```

**MongoDB Atlas (Cloud):**
1. Sign up at https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get connection string

### Step 2: Configure Environment

Create `.env.local`:
```
MONGODB_URI=mongodb://localhost:27017/research_portal
# OR for Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/research_portal
```

### Step 3: Run Setup

```bash
npm run setup:mongodb
```

### Step 4: Update Remaining Actions

For each action file, convert SQL queries to MongoDB:

**Pattern:**
```typescript
// OLD (SQL)
const users = await sql`SELECT * FROM users WHERE email = ${email}`

// NEW (MongoDB)
import { User } from "@/lib/models"
import { connectToMongoDB } from "@/lib/mongodb"
await connectToMongoDB()
const user = await User.findOne({ email })
```

### Step 5: Test

1. Test authentication (login/register)
2. Test profile management
3. Test project creation
4. Test applications
5. Test all API endpoints

### Step 6: Deploy

1. Set `MONGODB_URI` in Vercel environment variables
2. Redeploy application
3. Verify connection

## 📝 Notes

- All IDs are now MongoDB ObjectIds (strings)
- Use `toPlainObject()` to convert `_id` to `id` for API responses
- Use `toObjectId()` when querying by ID
- Always call `connectToMongoDB()` at the start of server actions
- Models are automatically created on first use (no migration needed)

## 🐛 Common Issues

1. **Connection Errors**
   - Check MongoDB is running
   - Verify connection string format
   - Check firewall/network settings

2. **Schema Errors**
   - Ensure models are imported
   - Check field names match schema
   - Verify data types

3. **ID Conversion Errors**
   - Always use `toPlainObject()` for responses
   - Use `toObjectId()` for queries
   - MongoDB uses `_id`, API uses `id`

## 📚 Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

