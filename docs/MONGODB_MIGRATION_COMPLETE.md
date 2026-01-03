# MongoDB Migration - Core Complete! 🎉

## ✅ Completed Migration

All core action files have been successfully migrated from MySQL to MongoDB!

### Files Migrated

1. **`lib/mongodb.ts`** - MongoDB connection management
2. **`lib/models/index.ts`** - All Mongoose schemas
3. **`lib/db.ts`** - Updated for MongoDB compatibility
4. **`app/actions/auth.ts`** - Authentication (login, register, getCurrentUser)
5. **`app/actions/profiles.ts`** - Student and faculty profile management
6. **`app/actions/projects.ts`** - Project CRUD operations with aggregations
7. **`app/actions/applications.ts`** - Application management with complex joins

## 🚀 Quick Start

### 1. Set Up MongoDB

**Option A: Local MongoDB (Docker)**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

**Option B: MongoDB Atlas (Cloud)**
- Sign up at https://www.mongodb.com/cloud/atlas
- Create a free cluster
- Get your connection string

### 2. Configure Environment

Create `.env.local`:
```env
MONGODB_URI=mongodb://localhost:27017/research_portal
# OR for Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/research_portal
```

### 3. Run Setup

```bash
npm run setup:mongodb
```

This will:
- Connect to MongoDB
- Create all collections
- Set up indexes

### 4. Start Development

```bash
npm run dev
```

## 📝 Key Changes

### ID Handling
- **Old**: Integer IDs (`id: 1`)
- **New**: MongoDB ObjectIds (strings: `"507f1f77bcf86cd799439011"`)
- Use `toPlainObject()` to convert `_id` to `id` for API responses
- Use `toObjectId()` when querying by ID

### Query Patterns

**Old (SQL):**
```typescript
const users = await sql`SELECT * FROM users WHERE email = ${email}`
```

**New (MongoDB):**
```typescript
import { User } from "@/lib/models"
import { connectToMongoDB } from "@/lib/mongodb"
await connectToMongoDB()
const user = await User.findOne({ email })
```

### Aggregations

Complex joins are now done with MongoDB aggregation pipelines:
```typescript
const projects = await Project.aggregate([
  { $match: { status: "active" } },
  {
    $lookup: {
      from: "facultyprofiles",
      localField: "faculty_id",
      foreignField: "_id",
      as: "facultyProfile",
    },
  },
  // ... more stages
])
```

## ⚠️ Important Notes

1. **Always call `connectToMongoDB()`** at the start of server actions
2. **Use `toPlainObject()`** for API responses to convert `_id` to `id`
3. **Use `toObjectId()`** when querying by ID from request parameters
4. **Tags are now arrays** - no separate `project_tags` table needed
5. **Models auto-create collections** - no migration script needed

## 🔄 Remaining Tasks (Optional)

These are lower priority and can be done as needed:

1. **Analytics Actions** (`app/actions/analytics.ts`)
   - Dashboard statistics
   - Charts data
   - Aggregation queries

2. **Activity Actions** (`app/actions/activity.ts`)
   - Login activity tracking
   - Activity queries

3. **API Routes**
   - Update health check routes
   - Update diagnostic routes
   - Test all endpoints

4. **CV/Certificates/Skills**
   - If these features are used, update the related API routes

## 🐛 Troubleshooting

### Connection Issues
- Check MongoDB is running: `mongosh` or check Docker container
- Verify `MONGODB_URI` format
- Check firewall/network settings

### Schema Errors
- Ensure models are imported: `import { User } from "@/lib/models"`
- Check field names match schema
- Verify data types

### ID Conversion Errors
- Always use `toPlainObject()` for responses
- Use `toObjectId()` for queries
- MongoDB uses `_id`, API uses `id`

## 📚 Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

## ✨ Next Steps

1. Test the application locally
2. Set up MongoDB Atlas for production
3. Update Vercel environment variables
4. Deploy and test

The core migration is complete! All main features should work with MongoDB now. 🚀

