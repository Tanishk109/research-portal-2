# Vercel Deployment Guide

## Database Configuration

For Vercel deployment, you need to set up your database connection using environment variables.

### Option 1: Using DATABASE_URL (Recommended)

Set a single `DATABASE_URL` environment variable in Vercel:

```
DATABASE_URL=mysql://username:password@host:port/database_name
```

Example:
```
DATABASE_URL=mysql://root:mypassword@db.example.com:3306/research_portal
```

### Option 2: Using Individual Variables

Set these environment variables in Vercel:

- `DB_HOST` - Your MySQL host (e.g., `db.example.com`)
- `DB_PORT` - MySQL port (usually `3306`)
- `DB_USER` - Database username
- `DB_PASSWORD` - Database password
- `DB_NAME` - Database name (e.g., `research_portal`)

### Additional Required Environment Variables

- `JWT_SECRET` - A secure random string for JWT token signing
- `NODE_ENV` - Set to `production` (automatically set by Vercel)

## Setting Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add all required variables
4. Redeploy your application

## Database Connection Issues

### Common Issues:

1. **Connection Timeout**: Make sure your database allows connections from Vercel's IP addresses
2. **SSL Required**: Some databases require SSL. The code automatically enables SSL in production
3. **Firewall**: Ensure your database firewall allows connections from anywhere (0.0.0.0/0) or Vercel's IP ranges
4. **Connection Limit**: The code uses 1 connection per serverless function to avoid connection pool issues

### Testing Database Connection

After deployment, test the connection:
- Visit: `https://your-app.vercel.app/api/health`
- Visit: `https://your-app.vercel.app/api/db-status`

Both should return successful responses if the database is connected.

## Troubleshooting

If the database is not working:

1. **Check Environment Variables**: Ensure all variables are set correctly in Vercel
2. **Check Database Access**: Verify your database allows external connections
3. **Check SSL**: Some databases require SSL - the code handles this automatically
4. **Check Logs**: View Vercel function logs for detailed error messages
5. **Test Locally**: Use the same environment variables locally to test
6. **Use Diagnostic Endpoint**: Visit `https://your-app.vercel.app/api/db-diagnostic` to see detailed connection information

### Diagnostic Endpoint

The `/api/db-diagnostic` endpoint provides detailed information about:
- Environment variable configuration (masked for security)
- Connection test results
- Database information (if connected)
- Error details (if connection fails)

This is helpful for debugging connection issues on Vercel.

## Database Provider Recommendations

For Vercel, consider using:
- **PlanetScale** - MySQL-compatible, serverless-friendly
- **Railway** - Easy MySQL setup
- **AWS RDS** - Production-grade MySQL
- **DigitalOcean Managed Database** - Simple MySQL hosting
- **Aiven** - Managed MySQL with free tier

All of these work with the current database configuration.

