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

EMAIL_PROVIDER=resend
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=MUJ Research Portal <verified-sender@yourdomain.com>
```

Render free services block outbound SMTP ports `25`, `465`, and `587`, so the app uses Resend over HTTPS. Do not use Gmail SMTP on Render free.

## Resend Testing

For quick testing, `onboarding@resend.dev` can send only to the email address attached to your Resend account. It cannot verify arbitrary student or faculty emails.

For production, verify a domain or subdomain you own in Resend, such as:

```text
mail.mujresearchportal.in
```

After SPF/DKIM verification succeeds, use a sender from that verified domain:

```env
EMAIL_FROM=MUJ Research Portal <verify@mail.mujresearchportal.in>
```

You cannot verify `onrender.com` because it is a shared domain.

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

1. Deploy with MongoDB, JWT, app URL, and Resend variables configured.
2. Register a new account using your Resend account email while testing with `onboarding@resend.dev`.
3. Confirm Render logs show `Verification email accepted by Resend: <email-id>`.
4. Confirm the Resend dashboard shows the email as sent or delivered.
5. Confirm no user exists in MongoDB before clicking the verification link.
6. Click the verification link and complete verification.
7. Confirm the user, profile shell, login activity, and session are created.
