# Research Portal

A full-stack research collaboration portal for universities, built with Next.js, MongoDB, and role-based dashboards for students and faculty.

This project is meant to make academic research opportunities easier to discover and manage. Students can browse projects, apply with a profile and resume, and track their applications. Faculty members can maintain their profile, create projects, and review student applications in one place.

The project has gone through several rounds of debugging and hardening around MongoDB persistence, profile completion, file uploads, OAuth, and deployment. It is not presented as a perfect product; it is an actively developed academic portal with a practical feature set and clear deployment requirements.

## Features

- Student and faculty account creation
- Credential-based login with JWT sessions
- Optional Google OAuth login/sign-up
- MongoDB-backed users, profiles, projects, applications, skills, certificates, and resumes
- Student profile completion checks before applying to projects
- Faculty profile completion checks before managing faculty workflows
- Faculty project creation and editing
- Student project application flow with duplicate-application protection
- Resume PDF upload for students
- Profile picture upload for students and faculty
- Faculty application review, approval, and rejection workflows
- Responsive dashboards for student and faculty modules

## Tech Stack

- Next.js 16 App Router
- React 18
- TypeScript
- Tailwind CSS
- MongoDB with Mongoose
- JWT authentication with `jose`
- Google OAuth 2.0
- Vercel or Render for deployment

## Project Structure

```text
research-portal-2/
├── app/                 # App Router pages, API routes, and server actions
├── components/          # Shared UI components
├── docs/                # Additional notes and documentation
├── hooks/               # React hooks
├── lib/                 # MongoDB, models, auth, env, and utility logic
├── public/              # Static assets
├── scripts/             # Setup and maintenance scripts
├── styles/              # Global styles
├── DEPLOYMENT.md        # Deployment-specific notes
├── package.json
└── README.md
```

## Getting Started

Install dependencies:

```bash
npm install
```

Create your local environment file:

```bash
cp .env.example .env.local
```

Fill in the required values:

```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=use-a-long-random-secret
JWT_EXPIRATION=7d
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

Run the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Environment Variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `MONGODB_URI` | Yes | MongoDB connection string. The app stores all project data in MongoDB. |
| `JWT_SECRET` | Yes | Secret used to sign user session tokens. Use a long random value. |
| `JWT_EXPIRATION` | No | JWT lifetime. Defaults to `7d`. |
| `NEXT_PUBLIC_APP_URL` | Yes in production | Public URL of the deployment. Required for correct OAuth redirects. |
| `NEXT_PUBLIC_API_URL` | Usually no | Leave blank when the frontend and API are deployed together. |
| `GOOGLE_CLIENT_ID` | Optional | Required only if Google OAuth is enabled. |
| `GOOGLE_CLIENT_SECRET` | Optional | Required only if Google OAuth is enabled. |
| `GOOGLE_REDIRECT_URI` | Optional | Must exactly match the Google Cloud OAuth redirect URI. |

## Google OAuth Notes

Google authentication is supported, but it must be configured carefully.

The OAuth flow should start, callback, and set the session cookie on the same public domain. Do not start Google login from Vercel while the callback points to Render, or the cookies will not line up reliably.

For a Render deployment:

```env
NEXT_PUBLIC_APP_URL=https://your-service.onrender.com
GOOGLE_REDIRECT_URI=https://your-service.onrender.com/api/auth/google/callback
```

For a Vercel deployment:

```env
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
GOOGLE_REDIRECT_URI=https://your-project.vercel.app/api/auth/google/callback
```

Add the same callback URL in Google Cloud Console under Authorized redirect URIs. The match must be exact, including protocol, domain, and path.

If Google OAuth is not configured, normal email/password registration and login still work.

## MongoDB

The application is MongoDB-first. User accounts, role-specific profiles, project listings, applications, skills, certificates, resumes, and login activity are all stored in MongoDB.

After setting `MONGODB_URI`, you can run:

```bash
npm run setup:mongodb
```

This script is intended to prepare MongoDB indexes and setup-related database state where needed.

## Useful Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run setup:mongodb
```

`npm run lint` currently runs TypeScript checks with unused-parameter tolerance. It is still useful as a quick validation step before deployment.

## Deployment

The app can be deployed as a full-stack Next.js application on Render or Vercel.

Important deployment rules:

- Set `MONGODB_URI` and `JWT_SECRET` in the hosting platform.
- Set `NEXT_PUBLIC_APP_URL` to the exact public deployment URL.
- Leave `NEXT_PUBLIC_API_URL` blank unless the API is intentionally hosted elsewhere.
- If using Google OAuth, keep the app URL and Google callback URL on the same domain.
- Redeploy after changing environment variables.

More deployment detail is available in [DEPLOYMENT.md](./DEPLOYMENT.md).

## Current Limitations

- Uploaded files and profile images are currently handled in-app. For heavy production usage, moving uploads to object storage such as S3, Cloudinary, or a similar service would be better.
- Google OAuth depends on exact environment and Google Cloud Console configuration. Email/password auth is simpler and more forgiving.
- Admin/debug routes exist in the codebase and should be reviewed before exposing the app broadly.
- The UI has been improved across student and faculty dashboards, but there is still room for a dedicated design pass.

## Security Notes

- Never commit `.env.local` or production secrets.
- Rotate any secret that has been shared publicly or pasted into chat.
- Use a strong `JWT_SECRET`.
- Restrict MongoDB network access where possible.
- Review debug/admin routes before production use.

## Author

Built by Tanishk Mittal as a practical academic research portal project.

The goal is straightforward: reduce the gap between students looking for meaningful research work and faculty members who need a structured way to publish, manage, and review research opportunities.
