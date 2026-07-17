<div align="center">
  <img src="./public/manipal-logo.svg" alt="Manipal University Jaipur" width="105" />

  # MUJ Research Collaboration Portal

  **A full-stack platform that connects faculty-led research opportunities with students seeking meaningful academic projects.**

  [![Live Demo](https://img.shields.io/badge/Live%20Demo-Open%20Portal-2ea44f?style=for-the-badge)](https://research-portal-2-tvgq.onrender.com)
  [![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
  [![Render](https://img.shields.io/badge/Deployed%20on-Render-46E3B7?style=for-the-badge&logo=render&logoColor=black)](https://render.com/)

  [Live Application](https://research-portal-2-tvgq.onrender.com) · [Explore Projects](https://research-portal-2-tvgq.onrender.com/projects) · [Faculty Directory](https://research-portal-2-tvgq.onrender.com/faculty)
</div>

---

## Overview

The **MUJ Research Collaboration Portal** is an academic opportunity-management system designed to reduce the gap between faculty members looking for research contributors and students looking for practical research experience.

Faculty can publish structured project opportunities, define eligibility requirements, review applicants, and track project-level activity. Students can build an academic profile, discover relevant projects, submit applications, upload supporting documents, and follow application decisions through a dedicated dashboard.

The application is built as a single full-stack Next.js service and is deployed on Render with MongoDB Atlas as its persistent data layer.

## Why This Project

Research opportunities are often circulated through disconnected channels such as email, messaging groups, spreadsheets, and informal referrals. This creates several problems:

- students may not discover relevant opportunities on time;
- faculty receive applications in inconsistent formats;
- academic credentials and supporting documents are difficult to compare;
- application decisions are hard to track;
- there is no single searchable record of active research work.

This portal brings those workflows into one role-aware platform.

## Core Capabilities

### For Students

- Create a role-specific account and academic profile.
- Maintain registration number, department, year, CGPA, biography, and contact details.
- Add technical and research skills.
- Upload a PDF résumé and achievement certificates.
- Browse active projects by title, research area, faculty member, and requirements.
- Review project eligibility, prerequisites, duration, stipend, positions, and deadlines.
- Apply with a project-specific cover letter.
- Prevent duplicate applications to the same project.
- Track pending, approved, and rejected applications.
- Review faculty feedback and recent login activity.

### For Faculty

- Create and maintain a faculty profile with department and specialization details.
- Publish research projects with structured requirements and eligibility criteria.
- Manage project lifecycle states such as draft, active, closed, inactive, and completed.
- Edit project details, deadlines, positions, minimum CGPA, and tags.
- Review student profiles, academic information, skills, résumé, and certificates.
- Approve or reject applications with feedback.
- View project and application analytics through a dedicated dashboard.
- Review account security and login activity.

### Public Experience

- Browse active research opportunities without signing in.
- Explore research areas and featured projects.
- View the faculty directory and public faculty profiles.
- Read student and faculty onboarding guides.
- Access About, Contact, Privacy, and Terms pages.

## Application Workflow

```mermaid
flowchart LR
    A[Faculty creates project] --> B[Project becomes active]
    B --> C[Student discovers opportunity]
    C --> D[Student completes profile]
    D --> E[Student submits application]
    E --> F[Faculty reviews profile and documents]
    F --> G{Decision}
    G -->|Approve| H[Application accepted]
    G -->|Reject| I[Application rejected with feedback]
    H --> J[Student tracks result in dashboard]
    I --> J
```

## System Architecture

```mermaid
flowchart TB
    Browser[Browser / Responsive UI]

    subgraph NextApp[Next.js Full-Stack Application]
      Pages[App Router Pages]
      Components[React UI Components]
      Actions[Server Actions]
      APIs[Route Handlers / REST APIs]
      Auth[JWT Session Authentication]
      Guard[Role-Based Route Guard]
      Cache[Application-Level Cache]
    end

    Database[(MongoDB Atlas)]
    Render[Render Web Service]

    Browser --> Pages
    Pages --> Components
    Components --> Actions
    Components --> APIs
    Actions --> Auth
    APIs --> Auth
    Auth --> Guard
    Actions --> Cache
    APIs --> Cache
    Actions --> Database
    APIs --> Database
    Render --> NextApp
```

## Data Model

The application uses MongoDB collections managed through Mongoose schemas.

| Collection | Purpose |
|---|---|
| `users` | Shared identity, role, credentials, and profile image metadata |
| `pendingregistrations` | Unverified account requests and expiring email-verification tokens |
| `facultyprofiles` | Faculty ID, department, specialization, biography, and institutional details |
| `studentprofiles` | Registration number, department, academic year, CGPA, and student details |
| `projects` | Research opportunity description, requirements, dates, status, capacity, and tags |
| `applications` | Student-to-project applications, cover letters, decisions, and feedback |
| `studentcvs` | Student résumé metadata and PDF data |
| `studentcertificates` | Achievement and certificate records |
| `studentskills` | Student skill entries |
| `loginactivities` | Sign-in history, device information, IP address, and success status |

A compound unique index on `project_id` and `student_id` prevents a student from applying to the same project more than once.

## Technology Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 App Router |
| Language | TypeScript |
| UI | React 18, Tailwind CSS, shadcn/ui, Radix UI |
| Forms | React Hook Form |
| Charts | Recharts and Tremor |
| Database | MongoDB Atlas |
| ODM | Mongoose |
| Authentication | Email/password authentication with signed JWT sessions |
| Password Security | bcryptjs |
| Session Signing | jose |
| Data Fetching | Server Actions, Route Handlers, SWR |
| Icons | Lucide React |
| Deployment | Render Web Service |

## Project Structure

```text
research-portal-2/
├── app/
│   ├── actions/                 # Server-side business operations
│   ├── api/                     # API route handlers
│   ├── admin/                   # Administration and diagnostic modules
│   ├── dashboard/
│   │   ├── faculty/             # Faculty dashboard and workflows
│   │   └── student/             # Student dashboard and workflows
│   ├── faculty/                 # Public faculty directory and profiles
│   ├── projects/                # Project discovery, details, and application flow
│   ├── login/                   # Authentication interface
│   ├── register/                # Role-specific registration
│   └── ...                      # Guides and informational pages
├── components/                  # Shared layout and UI components
├── hooks/                       # Reusable React hooks
├── lib/
│   ├── models/                  # Mongoose schemas and models
│   ├── mongodb.ts               # Database connection handling
│   ├── env.ts                   # Environment configuration
│   ├── cache.ts                 # In-memory cache utilities
│   └── ...                      # API, auth, and utility helpers
├── public/                      # Branding and static assets
├── scripts/                     # MongoDB setup and validation scripts
├── proxy.ts                     # Authentication and route-access guard
├── DEPLOYMENT.md                # Additional deployment guidance
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 20 or later
- npm
- MongoDB Atlas cluster or another MongoDB deployment

### Installation

```bash
git clone https://github.com/Tanishk109/research-portal-2.git
cd research-portal-2
npm install
```

### Environment Configuration

Create a local environment file:

```bash
cp .env.example .env.local
```

Add the following values:

```env
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/research_portal
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRATION=7d
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=
```

Generate a secure JWT secret:

```bash
openssl rand -base64 64
```

Do not commit `.env.local` or paste production secrets into issues, screenshots, documentation, or source files.

### Database Setup

```bash
npm run setup:mongodb
```

This initializes database-related setup and indexes required by the application.

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available Commands

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Generate an optimized production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run TypeScript validation checks |
| `npm run setup:mongodb` | Prepare MongoDB indexes and setup state |

## Environment Variables

| Variable | Required | Description |
|---|---:|---|
| `MONGODB_URI` | Yes | MongoDB connection URI used by the server |
| `JWT_SECRET` | Yes | Secret used to sign and verify session tokens |
| `JWT_EXPIRATION` | No | Token lifetime; defaults to `7d` |
| `NEXT_PUBLIC_APP_URL` | Production | Canonical public URL of the application |
| `NEXT_PUBLIC_API_URL` | Usually no | Only needed when the API is hosted separately |
| `EMAIL_FROM` | Yes | Sender address shown on verification emails |
| `EMAIL_PROVIDER` | Yes | Use `gmail` for project/demo sending or `resend` for verified-domain sending |
| `GMAIL_CLIENT_ID` | Gmail provider | Google OAuth client ID |
| `GMAIL_CLIENT_SECRET` | Gmail provider | Google OAuth client secret |
| `GMAIL_REFRESH_TOKEN` | Gmail provider | Refresh token with `gmail.send` scope |
| `GMAIL_SENDER_EMAIL` | Gmail provider | Gmail account used to send verification emails |
| `RESEND_API_KEY` | Resend provider | Resend API key used for HTTPS email delivery |

## Authentication and Access Control

The portal uses credential-based authentication backed by MongoDB and email verification.

1. Registration stores a pending registration and sends a verification email.
2. The real user and role-specific profile shell are created only after email verification.
3. Passwords are hashed with bcrypt before storage.
4. Successful verification or login creates a signed JWT containing the user ID, role, email, and display information.
5. The token is stored in an HTTP-only session cookie.
6. Route guards use the session to protect student, faculty, admin, and authenticated API paths.
7. Server-side operations perform additional role and ownership checks before modifying data.
8. Login attempts are recorded for account-security visibility.

## API Overview

Representative API groups include:

```text
/api/auth/*                         Authentication and current session
/api/projects/*                     Project discovery and management
/api/applications/*                 Student and faculty application workflows
/api/dashboard/student/*            Student profile, résumé, skills, and certificates
/api/dashboard/faculty/*            Faculty projects, applicants, and analytics
/api/profile/completion             Role-specific profile completion status
/api/login-activity                 Account access history
/api/health                         Service and database health
```

The application also uses Next.js Server Actions for authenticated mutations and dashboard data operations.

## Deployment on Render

The production application is available at:

**https://research-portal-2-tvgq.onrender.com**

Create a Render **Web Service** and use:

```text
Build Command: npm ci && npm run build
Start Command: npm start
```

Set these environment variables in the Render dashboard:

```env
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_production_jwt_secret
JWT_EXPIRATION=7d
NEXT_PUBLIC_APP_URL=https://research-portal-2-tvgq.onrender.com
NEXT_PUBLIC_API_URL=
EMAIL_PROVIDER=gmail
EMAIL_FROM=MUJ Research Portal <your-sender@gmail.com>
GMAIL_SENDER_EMAIL=your-sender@gmail.com
GMAIL_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=your-google-oauth-client-secret
GMAIL_REFRESH_TOKEN=your-google-oauth-refresh-token
```

Render free services block outbound SMTP ports, so the application sends verification email through HTTPS providers. For this project, Gmail API is supported without needing a custom domain. For production-style sending, use Resend with a verified sending domain.

Redeploy the service after modifying environment variables.

## Security Considerations

- Never commit secrets or production database credentials.
- Use a unique, high-entropy JWT secret in every environment.
- Keep session cookies HTTP-only, secure in production, and scoped to the application.
- Validate user role and resource ownership on the server, not only in the interface.
- Restrict MongoDB network access and use a least-privilege database account.
- Validate PDF uploads and enforce practical file-size limits.
- Remove or protect diagnostic and test routes before broad production use.
- Add rate limiting and account lockout controls before handling institution-wide traffic.

## Production Readiness Roadmap

- Move résumé, certificate, and profile-image storage to Cloudinary, Amazon S3, or another object-storage service.
- Add password-reset workflows.
- Introduce rate limiting, audit logging, and stronger abuse protection.
- Add automated unit, integration, and end-to-end tests.
- Add faculty identity verification or institution-managed onboarding.
- Add notifications for new applications and status changes.
- Add advanced project search, filtering, pagination, and recommendations.
- Add administrator moderation and reporting workflows.
- Add accessibility testing and performance monitoring.

## Known Limitations

- Uploaded documents are currently stored through application-managed data rather than dedicated object storage.
- Some administration and diagnostic modules are intended for development and should be reviewed before public institutional rollout.
- The application currently uses a single-service architecture; high-volume deployment may require external caching, file storage, and background job infrastructure.
- The live database may contain demonstration records used during development and validation.

## Screenshots

Add production screenshots to `public/screenshots/` and include them here using repository-relative paths:

```md
![Landing Page](./public/screenshots/landing-page.png)
![Student Dashboard](./public/screenshots/student-dashboard.png)
![Faculty Dashboard](./public/screenshots/faculty-dashboard.png)
```

## Contributing

Contributions, bug reports, and improvement proposals are welcome.

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature`.
3. Commit your changes with a clear message.
4. Push the branch to your fork.
5. Open a pull request describing the change and how it was tested.

## Author

**Tanishk Mittal**  
B.Tech CSE — IoT and Intelligent Systems  
Manipal University Jaipur

Built to make academic research opportunities more discoverable, structured, and accessible for both students and faculty.

---

<div align="center">
  <strong>Connect. Collaborate. Advance Research.</strong>
</div>
