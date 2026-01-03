# Vercel MongoDB Setup Guide

## ✅ Correct MongoDB Connection String

Your MongoDB Atlas connection string should include the database name:

**Current (Missing database name):**
```
mongodb+srv://research_portal:8585Ritz2015@cluster0.w6jhd5h.mongodb.net/?appName=Cluster0
```

**Correct (With database name):**
```
mongodb+srv://research_portal:8585Ritz2015@cluster0.w6jhd5h.mongodb.net/research_portal?retryWrites=true&w=majority
```

## 🔧 Steps to Fix Vercel Deployment

### Step 1: Update MongoDB Connection String

1. Go to your **Vercel Dashboard**
2. Navigate to your project → **Settings** → **Environment Variables**
3. Find or add `MONGODB_URI`
4. Update it to:
   ```
   mongodb+srv://research_portal:8585Ritz2015@cluster0.w6jhd5h.mongodb.net/research_portal?retryWrites=true&w=majority
   ```
   
   **Important:** Make sure to include:
   - Database name: `/research_portal` (after `.net/`)
   - Connection options: `?retryWrites=true&w=majority`

### Step 2: Verify MongoDB Atlas Settings

1. **Network Access:**
   - Go to MongoDB Atlas → **Network Access**
   - Add `0.0.0.0/0` to allow connections from anywhere (or Vercel's IP ranges)
   - This is required for Vercel serverless functions

2. **Database User:**
   - Verify user `research_portal` exists
   - Check password is correct: `8585Ritz2015`
   - Ensure user has read/write permissions

3. **Database:**
   - Database `research_portal` should exist (or will be created automatically)

### Step 3: Redeploy on Vercel

1. After updating environment variables, **redeploy** your application
2. Go to **Deployments** → Click **Redeploy** on latest deployment
3. Or push a new commit to trigger automatic deployment

### Step 4: Test Connection

After deployment, test these endpoints:

1. **Health Check:**
   ```
   https://your-app.vercel.app/api/health
   ```

2. **Database Diagnostic:**
   ```
   https://your-app.vercel.app/api/db-diagnostic
   ```

3. **Database Status:**
   ```
   https://your-app.vercel.app/api/db-status
   ```

## 🔍 Troubleshooting

### Issue: "MONGODB_URI is not defined"

**Solution:**
- Make sure `MONGODB_URI` is set in Vercel environment variables
- Check that it's set for **Production**, **Preview**, and **Development** environments
- Redeploy after adding the variable

### Issue: "Connection timeout"

**Solutions:**
1. Check MongoDB Atlas Network Access allows `0.0.0.0/0`
2. Verify connection string format is correct
3. Check MongoDB Atlas cluster is running (not paused)

### Issue: "Authentication failed"

**Solutions:**
1. Verify username and password in connection string
2. Check database user exists in MongoDB Atlas
3. Ensure user has proper permissions

### Issue: "Database not found"

**Solution:**
- The database will be created automatically on first connection
- Or create it manually in MongoDB Atlas
- Make sure database name in connection string matches: `/research_portal`

## 📝 Environment Variables Checklist

Make sure these are set in Vercel:

- ✅ `MONGODB_URI` - Your MongoDB Atlas connection string
- ✅ `JWT_SECRET` - A secure random string
- ✅ `NODE_ENV` - Automatically set to `production` by Vercel

## 🚀 Connection String Format

**For MongoDB Atlas:**
```
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
```

**Your specific connection string:**
```
mongodb+srv://research_portal:8585Ritz2015@cluster0.w6jhd5h.mongodb.net/research_portal?retryWrites=true&w=majority
```

## ✅ Code Changes Made

The MongoDB connection has been optimized for Vercel serverless:

1. **Connection Caching** - Reuses connections across serverless invocations
2. **Connection Pooling** - Uses 1 connection per serverless function (optimal for Vercel)
3. **Error Handling** - Proper error handling for serverless environments
4. **Timeout Settings** - Optimized timeouts for serverless functions

## 🎯 Quick Fix Summary

1. Update `MONGODB_URI` in Vercel to include database name
2. Add `/research_portal` after `.net/` in connection string
3. Add `?retryWrites=true&w=majority` for better reliability
4. Ensure MongoDB Atlas Network Access allows `0.0.0.0/0`
5. Redeploy on Vercel

After these steps, your MongoDB connection should work on Vercel! 🎉

