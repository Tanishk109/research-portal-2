# Deployment: Vercel, Render, MongoDB, and Google Auth

## Recommended setup

This project is a full-stack Next.js app: pages, API routes, middleware, auth cookies, and server actions all live in the same app. For Google authentication to work reliably, deploy the full app on one primary web domain.

Recommended:

- Vercel hosts the full Next.js app.
- MongoDB Atlas stores all data.
- Render is optional for a separate worker/service, but not required for this app's API routes.

Avoid splitting the current app as "static frontend on Vercel + API on Render" unless both hosts share a parent custom domain and cookie/CORS settings are deliberately configured. The current auth model uses an HTTP-only `session` cookie, so the dashboard and auth callback must be on the same effective site.

## Vercel environment variables

Set these in Vercel Project Settings -> Environment Variables:

```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=<long-random-secret-at-least-32-chars>
JWT_EXPIRATION=7d
NEXT_PUBLIC_APP_URL=https://your-vercel-app.vercel.app
NEXT_PUBLIC_API_URL=
GOOGLE_CLIENT_ID=<google-client-id>
GOOGLE_CLIENT_SECRET=<google-client-secret>
GOOGLE_REDIRECT_URI=https://your-vercel-app.vercel.app/api/auth/google/callback
```

If you use a custom domain, replace every `your-vercel-app.vercel.app` value with the custom HTTPS domain.

## Google Cloud Console

In Google Cloud Console -> APIs & Services -> Credentials -> OAuth 2.0 Client:

- Application type: `Web application`
- Authorized JavaScript origins:
  - `https://your-vercel-app.vercel.app`
- Authorized redirect URIs:
  - `https://your-vercel-app.vercel.app/api/auth/google/callback`

For local development, you can also add:

- `http://localhost:3000`
- `http://localhost:3000/api/auth/google/callback`

The redirect URI must match `GOOGLE_REDIRECT_URI` exactly.

## Render option

If you also deploy the same full-stack app on Render, set the same environment variables there, but use the Render URL:

```env
NEXT_PUBLIC_APP_URL=https://your-render-service.onrender.com
GOOGLE_REDIRECT_URI=https://your-render-service.onrender.com/api/auth/google/callback
```

Then add the Render origin and callback URL to Google Cloud Console as well.

## Verification

After deployment:

1. Open `/api/env-check` and confirm MongoDB, JWT, and Google auth are configured.
2. Open `/login`.
3. Click Google sign-in for a role.
4. Google should return to `/api/auth/google/callback`, then redirect to the correct dashboard.
5. Refresh the dashboard to confirm the `session` cookie persists.
