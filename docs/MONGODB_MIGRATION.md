# MongoDB Migration Guide

## Overview

This application has been migrated from MySQL to MongoDB. All database operations now use Mongoose ODM.

## Environment Variables

### Option 1: MongoDB Connection String (Recommended)

Set `MONGODB_URI` or `DATABASE_URL` (if it starts with `mongodb://`):

```
MONGODB_URI=mongodb://username:password@host:port/database_name
```

Example:
```
MONGODB_URI=mongodb://localhost:27017/research_portal
```

For MongoDB Atlas (cloud):
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name?retryWrites=true&w=majority
```

### Option 2: Individual Variables

- `MONGODB_HOST` or `DB_HOST` - MongoDB host (default: `localhost`)
- `MONGODB_PORT` or `DB_PORT` - MongoDB port (default: `27017`)
- `MONGODB_DB` or `DB_NAME` - Database name (default: `research_portal`)
- `MONGODB_USER` or `DB_USER` - MongoDB username (optional)
- `MONGODB_PASSWORD` or `DB_PASSWORD` - MongoDB password (optional)

## Database Setup

### Local MongoDB

1. Install MongoDB locally or use Docker:
   ```bash
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

2. Set environment variable:
   ```
   MONGODB_URI=mongodb://localhost:27017/research_portal
   ```

3. Run the setup script:
   ```bash
   npm run setup:mongodb
   ```

### MongoDB Atlas (Cloud)

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Get your connection string
3. Set `MONGODB_URI` environment variable
4. The application will automatically create collections and indexes on first use

## Key Changes

### Database Connection

- **Old**: MySQL connection pool in `lib/db.ts`
- **New**: MongoDB connection in `lib/mongodb.ts`
- **Models**: All models defined in `lib/models/index.ts`

### Query Syntax

**Old (SQL)**:
```typescript
const users = await sql`SELECT * FROM users WHERE email = ${email}`
```

**New (MongoDB)**:
```typescript
import { User } from "@/lib/models"
const user = await User.findOne({ email })
```

### ID Handling

- **Old**: Integer IDs (`id: 1`)
- **New**: MongoDB ObjectIds (`_id: ObjectId("...")`)
- Use `toPlainObject()` helper to convert `_id` to `id` for API responses
- Use `toObjectId()` helper to convert string/number to ObjectId

## Migration Status

### ✅ Completed

- [x] MongoDB connection setup (`lib/mongodb.ts`)
- [x] Mongoose schemas (`lib/models/index.ts`)
- [x] Database connection utilities (`lib/db.ts`)
- [x] Authentication actions (`app/actions/auth.ts`)

### ⏳ In Progress

- [ ] Profile actions (`app/actions/profiles.ts`)
- [ ] Project actions (`app/actions/projects.ts`)
- [ ] Application actions (`app/actions/applications.ts`)
- [ ] Analytics actions (`app/actions/analytics.ts`)
- [ ] Activity actions (`app/actions/activity.ts`)

### 📝 Remaining

- [ ] API routes updates
- [ ] Database setup script
- [ ] Test scripts
- [ ] Migration script (if migrating existing data)

## Next Steps

1. **Set up MongoDB**: Install MongoDB locally or use MongoDB Atlas
2. **Configure environment**: Set `MONGODB_URI` environment variable
3. **Update remaining actions**: Convert SQL queries to MongoDB queries
4. **Test thoroughly**: Test all database operations
5. **Deploy**: Update Vercel environment variables

## Common Patterns

### Finding Documents

```typescript
// Find one
const user = await User.findOne({ email })

// Find by ID
const user = await User.findById(userId)

// Find many
const users = await User.find({ role: "student" })
```

### Creating Documents

```typescript
// Create one
const user = await User.create({
  email: "test@example.com",
  role: "student",
  // ...
})

// Create many
const users = await User.insertMany([...])
```

### Updating Documents

```typescript
// Update one
await User.findByIdAndUpdate(userId, { email: "new@example.com" })

// Update many
await User.updateMany({ role: "student" }, { status: "active" })
```

### Deleting Documents

```typescript
// Delete one
await User.findByIdAndDelete(userId)

// Delete many
await User.deleteMany({ role: "student" })
```

### Relationships

```typescript
// Populate related documents
const application = await Application.findById(appId)
  .populate("project_id")
  .populate("student_id")

// Or use aggregation
const applications = await Application.aggregate([
  { $match: { status: "pending" } },
  { $lookup: {
      from: "users",
      localField: "student_id",
      foreignField: "_id",
      as: "student"
    }
  }
])
```

## Troubleshooting

### Connection Issues

- Check MongoDB is running: `mongosh` or `mongo`
- Verify connection string format
- Check firewall/network settings
- For Atlas: Whitelist your IP address

### Schema Issues

- Models are defined in `lib/models/index.ts`
- Ensure models are imported before use
- Check for typos in field names

### ID Conversion Issues

- Always use `toPlainObject()` for API responses
- Use `toObjectId()` when querying by ID
- MongoDB uses `_id`, but API should return `id`

## Support

For issues or questions:
1. Check MongoDB connection: `/api/db-diagnostic`
2. Check application logs
3. Verify environment variables are set correctly

