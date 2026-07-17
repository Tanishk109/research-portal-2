# Deployment: Vercel, Render, MongoDB, and Email Verification

## Recommended Setup

This is a full-stack Next.js app. Pages, API routes, server actions, auth cookies, uploads, and MongoDB access all live in the same service.

For the least friction, deploy the full app on one primary domain, either Vercel or Render. The authentication cookie is HTTP-only and same-site, so keeping the dashboard and API on the same host avoids cross-domain session problems.

## Required Environment Variables

Set these in your hosting platform:

```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=<long-random-secret-at-least-32-chars>
JWT_EXPIRATION=7d
NEXT_PUBLIC_APP_URL=https://your-production-domain.com
NEXT_PUBLIC_API_URL=

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_gmail_app_password
EMAIL_FROM=your_email@gmail.com
```

For local development:

```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=<long-random-secret-at-least-32-chars>
JWT_EXPIRATION=7d
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_gmail_app_password
EMAIL_FROM=your_email@gmail.com
```

## Email Verification

Registration does not create a user immediately. It creates a pending registration in MongoDB, sends a verification email, and creates the real user, profile shell, login activity, and session cookie only after the verification link is confirmed.

If you use Gmail SMTP, `SMTP_PASSWORD` must be a Gmail App Password. A normal Gmail password will not work and should never be committed or pasted into source files.

## Render

Render detects the app port automatically. If needed, set:

```text
PORT=10000
```

Use your Render service URL as the public app URL:

```env
NEXT_PUBLIC_APP_URL=https://your-render-service.onrender.com
NEXT_PUBLIC_API_URL=
```

## Vercel

Use your Vercel production URL or custom domain as the public app URL:

```env
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
NEXT_PUBLIC_API_URL=
```

## Verification Checklist

1. Deploy with MongoDB, JWT, app URL, and SMTP variables configured.
2. Register a new student account with name, email, and password.
3. Confirm no user appears in `users` until the email link is verified.
4. Open the verification link and confirm it redirects to the student dashboard.
5. Repeat for a faculty account.
6. Complete required profile fields before creating projects or applying.
7. Open `/api/env-check` while authenticated and confirm MongoDB, JWT, app URL, and SMTP status are configured.
