# Deployment: Vercel, Render, MongoDB, and Google Auth

## Recommended setup

This project is a full-stack Next.js app: pages, API routes, middleware, auth cookies, and server actions all live in the same app.

Recommended:

- Deploy the full Next.js app on one primary host, either Vercel or Render.
- Use MongoDB Atlas for persistent data.
- Keep `NEXT_PUBLIC_API_URL` empty unless you intentionally split the API from the frontend.
- Keep Google OAuth start, callback, and dashboard on the same public domain.

The current authentication model uses an HTTP-only `session` cookie. For the least trouble, keep the dashboard, API routes, and auth routes on the same public domain.

## Environment variables

Set these in your hosting platform:

```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=<long-random-secret-at-least-32-chars>
JWT_EXPIRATION=7d
NEXT_PUBLIC_APP_URL=https://your-production-domain.com
NEXT_PUBLIC_API_URL=
GOOGLE_CLIENT_ID=<google-client-id>
GOOGLE_CLIENT_SECRET=<google-client-secret>
GOOGLE_REDIRECT_URI=https://your-production-domain.com/api/auth/google/callback
```

For local development:

```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=<long-random-secret-at-least-32-chars>
JWT_EXPIRATION=7d
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=
GOOGLE_CLIENT_ID=<google-client-id>
GOOGLE_CLIENT_SECRET=<google-client-secret>
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

## Google Cloud Console

In Google Cloud Console -> APIs & Services -> Credentials -> OAuth 2.0 Client:

- Application type: `Web application`
- Authorized JavaScript origins:
  - `https://your-production-domain.com`
- Authorized redirect URIs:
  - `https://your-production-domain.com/api/auth/google/callback`

For local development, also add:

- `http://localhost:3000`
- `http://localhost:3000/api/auth/google/callback`

The redirect URI must match `GOOGLE_REDIRECT_URI` exactly.

## Render

Render detects the app port automatically. If needed, use:

```text
PORT=10000
```

Set `NEXT_PUBLIC_APP_URL` and `GOOGLE_REDIRECT_URI` to your Render URL:

```env
NEXT_PUBLIC_APP_URL=https://your-render-service.onrender.com
GOOGLE_REDIRECT_URI=https://your-render-service.onrender.com/api/auth/google/callback
```

## Vercel

Set `NEXT_PUBLIC_APP_URL` and `GOOGLE_REDIRECT_URI` to your Vercel production URL or custom domain:

```env
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
GOOGLE_REDIRECT_URI=https://your-project.vercel.app/api/auth/google/callback
```

## Verification

After deployment:

1. Open `/api/env-check` while authenticated and confirm MongoDB, JWT, app URL, and Google values are configured.
2. Open `/login`.
3. Click Google sign-in for student or faculty.
4. Google should return to `/api/auth/google/callback`, create or find the MongoDB user, set the `session` cookie, and redirect to the correct dashboard.
5. Complete the required profile fields.
6. Test project creation as faculty and project application as student.
