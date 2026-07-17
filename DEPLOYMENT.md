# Deployment: Render, Vercel, MongoDB, and Email Verification

## Recommended Setup

This is a full-stack Next.js app. Pages, API routes, server actions, auth cookies, uploads, and MongoDB access all live in the same service.

For the least friction, deploy the full app on one primary domain, either Vercel or Render. The authentication cookie is HTTP-only and same-site, so keeping the dashboard and API on the same host avoids cross-domain session problems.

## Required Environment Variables

Set these in Render or Vercel:

```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=<long-random-secret-at-least-32-chars>
JWT_EXPIRATION=7d
NEXT_PUBLIC_APP_URL=https://your-production-domain.com
NEXT_PUBLIC_API_URL=
```

## Gmail API Email Provider

For a project/demo, Gmail API is the easiest HTTPS sender because it does not require a custom domain and it avoids Render's blocked SMTP ports.

```env
EMAIL_PROVIDER=gmail
EMAIL_FROM=MUJ Research Portal <your-sender@gmail.com>
GMAIL_SENDER_EMAIL=your-sender@gmail.com
GMAIL_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=your-google-oauth-client-secret
GMAIL_REFRESH_TOKEN=your-google-oauth-refresh-token
```

The app still creates the verification token and account flow. Gmail API only sends the email.

### Getting the Gmail Refresh Token

1. Open Google Cloud Console.
2. Enable **Gmail API** for your project.
3. Configure OAuth consent screen.
4. Add your Gmail account as a test user.
5. Create an OAuth Client ID.
6. Generate a refresh token with this scope:

```text
https://www.googleapis.com/auth/gmail.send
```

For a demo project, Google OAuth Playground is often the quickest way to create the token. Use your own OAuth client credentials, authorize the `gmail.send` scope, exchange the code, then copy the refresh token.

If the Google app remains in testing mode, refresh tokens may expire. That is acceptable for a temporary project demo but should be watched.

## Optional Resend Provider

Resend is better for production after you verify a domain:

```env
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=MUJ Research Portal <verify@mail.yourdomain.com>
```

For quick Resend testing, `onboarding@resend.dev` can send only to the email address attached to your Resend account. It cannot verify arbitrary student or faculty emails.

## Email Verification Flow

Registration does not create a user immediately. It creates a pending registration in MongoDB, sends a verification email, and creates the real user, profile shell, login activity, and session cookie only after the verification link is confirmed.

Before verification:

- `pendingregistrations` has the temporary account request.
- `users` has no account for that email.
- No student/faculty profile exists.
- No session cookie is created.

After verification:

- `pendingregistrations` entry is deleted.
- `users` entry is created with `email_verified_at`.
- The role-specific profile shell is created.
- A login activity entry is created.
- The `session` cookie is created.

## Render

Use your Render service URL as the public app URL:

```env
NEXT_PUBLIC_APP_URL=https://your-render-service.onrender.com
NEXT_PUBLIC_API_URL=
```

After changing environment variables, use **Manual Deploy -> Clear build cache & deploy**.

## Vercel

Use your Vercel production URL or custom domain as the public app URL:

```env
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
NEXT_PUBLIC_API_URL=
```

## Verification Checklist

1. Deploy with MongoDB, JWT, app URL, and Gmail API variables configured.
2. Register a new account with any email address you can access.
3. Confirm Render logs show `Verification email accepted by Gmail: <message-id>`.
4. Confirm no user exists in MongoDB before clicking the verification link.
5. Click the verification link and complete verification.
6. Confirm the user, profile shell, login activity, and session are created.
