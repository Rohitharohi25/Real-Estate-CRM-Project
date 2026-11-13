# ProCRM — Full-Stack Customer Relationship Management System

A production-ready CRM built with **React.js**, **Node.js/Express.js**, and **MongoDB**. Features a Kanban deals board, RBAC with three roles, JWT authentication with refresh tokens, real-time notifications via Socket.io, and full reporting with PDF/CSV export.

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Folder Structure](#folder-structure)
4. [MongoDB Models](#mongodb-models)
5. [REST API Reference](#rest-api-reference)
6. [Frontend Pages](#frontend-pages)
7. [Security Implementation](#security-implementation)
8. [Installation & Local Development](#installation--local-development)
9. [Seeding Demo Data](#seeding-demo-data)
10. [Deployment Guide](#deployment-guide)
11. [RBAC Roles & Permissions](#rbac-roles--permissions)

---

## Features

- **Authentication** — Register, login, JWT access + refresh tokens, forgot/reset password via email
- **Customers** — CRUD, search, status filter, notes, activity log, pagination
- **Leads** — CRUD, source + status tracking, one-click convert-to-customer-and-deal
- **Deals Kanban** — Drag-and-drop pipeline (New Lead → Won/Lost) powered by `@hello-pangea/dnd`
- **Tasks** — Priority, status, due dates, overdue highlighting, mark-complete shortcut
- **Calendar** — Monthly grid view of task due dates and deal close dates
- **Notes** — Attach notes to customers, leads, or deals; global notes view
- **Reports** — Sales report (deals by stage, top performers), leads report (by source + status); PDF and CSV export
- **Team Management** — Admin can create/edit/delete team members; manager can view
- **Notifications** — In-app notification bell with unread badge; full notifications page
- **Dark Mode** — System, light, or dark theme with localStorage persistence
- **Role-based Access** — Admin / Manager / Sales Executive with server-enforced scoping

---

## Tech Stack

| Layer      | Technology                                        |
|------------|---------------------------------------------------|
| Frontend   | React 18, React Router v6, Tailwind CSS, Vite     |
| Charts     | Recharts                                          |
| DnD        | @hello-pangea/dnd                                 |
| PDF Export | jsPDF + jspdf-autotable                           |
| Real-time  | Socket.io (client + server)                       |
| Backend    | Node.js, Express.js                               |
| Database   | MongoDB with Mongoose ODM                         |
| Auth       | JWT (access 7d + refresh 30d), bcryptjs           |
| Security   | Helmet, CORS, express-mongo-sanitize, xss-clean, express-rate-limit |
| Email      | Nodemailer (SMTP)                                 |

---

## Folder Structure

```
procrm/
├── backend/
│   ├── config/
│   │   ├── db.js               # MongoDB connection
│   │   └── roles.js            # Role constants
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── customerController.js
│   │   ├── dealController.js
│   │   ├── leadController.js
│   │   ├── noteController.js
│   │   ├── notificationController.js
│   │   ├── reportController.js
│   │   ├── taskController.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── auth.js             # JWT protect middleware
│   │   ├── errorHandler.js     # Global error handler + notFound
│   │   ├── rateLimiter.js      # API + auth rate limiters
│   │   ├── role.js             # Role authorization middleware
│   │   ├── upload.js           # Multer file upload config
│   │   └── validate.js         # express-validator result handler
│   ├── models/
│   │   ├── ActivityLog.js
│   │   ├── Customer.js
│   │   ├── Deal.js
│   │   ├── Lead.js
│   │   ├── Note.js
│   │   ├── Notification.js
│   │   ├── Task.js
│   │   └── User.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── customerRoutes.js
│   │   ├── dealRoutes.js
│   │   ├── leadRoutes.js
│   │   ├── noteRoutes.js
│   │   ├── notificationRoutes.js
│   │   ├── reportRoutes.js
│   │   ├── taskRoutes.js
│   │   └── userRoutes.js
│   ├── utils/
│   │   ├── activityLogger.js   # Fire-and-forget activity logging
│   │   ├── asyncHandler.js     # Async route wrapper
│   │   ├── generateToken.js    # JWT token generators
│   │   ├── seed.js             # Demo data seeder
│   │   └── sendEmail.js        # Nodemailer wrapper
│   ├── validators/
│   │   ├── authValidator.js
│   │   ├── customerValidator.js
│   │   ├── dealValidator.js
│   │   ├── leadValidator.js
│   │   └── taskValidator.js
│   ├── .env.example
│   ├── package.json
│   └── server.js               # Express app + Socket.io entry point
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── Alert.jsx
    │   │   ├── Card.jsx
    │   │   ├── ChartCard.jsx
    │   │   ├── ConfirmDialog.jsx
    │   │   ├── DataTable.jsx
    │   │   ├── Footer.jsx
    │   │   ├── Loader.jsx
    │   │   ├── Modal.jsx
    │   │   ├── Navbar.jsx
    │   │   ├── ProtectedRoute.jsx
    │   │   ├── SearchFilterBar.jsx
    │   │   ├── Sidebar.jsx
    │   │   └── StatusBadge.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── hooks/
    │   │   └── useAuth.js
    │   ├── layouts/
    │   │   ├── AuthLayout.jsx  # Split-screen for login/register
    │   │   └── DashboardLayout.jsx
    │   ├── pages/
    │   │   ├── Calendar.jsx
    │   │   ├── CustomerDetails.jsx
    │   │   ├── Customers.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Deals.jsx
    │   │   ├── ForgotPassword.jsx
    │   │   ├── Home.jsx
    │   │   ├── LeadDetails.jsx
    │   │   ├── Leads.jsx
    │   │   ├── Login.jsx
    │   │   ├── NotFound.jsx
    │   │   ├── Notes.jsx
    │   │   ├── Notifications.jsx
    │   │   ├── Profile.jsx
    │   │   ├── Register.jsx
    │   │   ├── Reports.jsx
    │   │   ├── ResetPassword.jsx
    │   │   ├── Settings.jsx
    │   │   ├── Tasks.jsx
    │   │   └── Users.jsx
    │   ├── services/
    │   │   ├── api.js           # Axios instance + refresh interceptor
    │   │   ├── authService.js
    │   │   ├── customerService.js
    │   │   ├── dealService.js
    │   │   ├── leadService.js
    │   │   ├── noteService.js
    │   │   ├── notificationService.js
    │   │   ├── reportService.js
    │   │   ├── taskService.js
    │   │   └── userService.js
    │   ├── App.jsx
    │   ├── index.css
    │   └── main.jsx
    ├── index.html
    ├── package.json
    ├── postcss.config.js
    ├── tailwind.config.js
    └── vite.config.js
```

---

## MongoDB Models

### User
Fields: `name`, `email` (unique), `password` (bcrypt, not returned in queries), `role` (admin/manager/sales_executive), `avatar`, `phone`, `status` (active/inactive), `lastLogin`, `resetPasswordToken`, `refreshToken`.

### Customer
Fields: `name`, `email`, `phone`, `company`, `jobTitle`, `address` (street/city/state/zip/country), `source` enum, `tags[]`, `status`, `assignedTo` (User ref), `createdBy`. Text index on name/email/company.

### Lead
Fields: `name`, `email`, `phone`, `company`, `source` enum, `status` (new→contacted→proposal_sent→negotiation→won→lost), `estimatedValue`, `assignedTo`, `createdBy`, `convertedToCustomer`, `convertedToDeal`.

### Deal
Fields: `title`, `customer` (ref), `lead` (ref), `value`, `stage` (new_lead→contacted→proposal_sent→negotiation→won→lost), `probability` (0-100), `expectedCloseDate`, `assignedTo`, `createdBy`, `lostReason`.

### Task
Fields: `title`, `description`, `relatedCustomer/Lead/Deal` refs, `priority` (low/medium/high), `status` (pending/in_progress/completed), `dueDate`, `assignedTo`, `createdBy`, `reminderSent`.

### Note
Fields: `content`, `customer` ref, `lead` ref, `deal` ref, `createdBy`.

### Notification
Fields: `user` (ref), `title`, `message`, `type` (task_due/lead_assigned/deal_won/deal_lost/customer_assigned/system), `link`, `isRead`.

### ActivityLog
Fields: `user`, `action` (e.g. `CREATE_CUSTOMER`), `entityType`, `entityId`, `description`, `meta`.

---

## REST API Reference

All protected routes require `Authorization: Bearer <accessToken>`.

### Auth  `POST /api/auth/`
| Method | Endpoint           | Description                         |
|--------|--------------------|-------------------------------------|
| POST   | /register          | Register new user                   |
| POST   | /login             | Login, returns access + refresh JWT |
| POST   | /refresh           | Rotate access token                 |
| POST   | /logout            | Invalidate refresh token            |
| POST   | /forgot-password   | Send reset email                    |
| POST   | /reset-password    | Reset password via token            |
| GET    | /me                | Get current user                    |

### Customers  `GET|POST /api/customers/`
| Method | Endpoint       | Access             | Description                          |
|--------|----------------|--------------------|--------------------------------------|
| GET    | /              | All (scoped)       | List with search/status/page filters |
| POST   | /              | All                | Create customer                      |
| GET    | /:id           | All (scoped)       | Get customer + notes + activity      |
| PUT    | /:id           | All (scoped)       | Update customer                      |
| DELETE | /:id           | Admin, Manager     | Delete customer                      |

### Leads  `GET|POST /api/leads/`
| Method | Endpoint       | Access         | Description              |
|--------|----------------|----------------|--------------------------|
| GET    | /              | All (scoped)   | List with filters        |
| POST   | /              | All            | Create lead              |
| GET    | /:id           | All            | Get single lead          |
| PUT    | /:id           | All            | Update lead              |
| DELETE | /:id           | Admin, Manager | Delete lead              |
| POST   | /:id/convert   | All            | Convert lead → customer + deal |

### Deals  `GET|POST /api/deals/`
| Method | Endpoint | Access         | Description                 |
|--------|----------|----------------|-----------------------------|
| GET    | /        | All (scoped)   | List / Kanban data          |
| POST   | /        | All            | Create deal                 |
| GET    | /:id     | All            | Get single deal             |
| PUT    | /:id     | All            | Update deal / move stage    |
| DELETE | /:id     | Admin, Manager | Delete deal                 |

### Tasks  `GET|POST /api/tasks/`
Standard CRUD (`/`, `/:id`). All roles.

### Notes  `GET|POST /api/notes/`
| Method | Endpoint | Description                               |
|--------|----------|-------------------------------------------|
| GET    | /        | Get notes by `?customer=`, `?lead=`, `?deal=` |
| POST   | /        | Create note                               |
| DELETE | /:id     | Delete note                               |

### Notifications  `GET|PUT /api/notifications/`
| Method | Endpoint       | Description              |
|--------|----------------|--------------------------|
| GET    | /              | Get notifications + count|
| PUT    | /read-all      | Mark all as read         |
| PUT    | /:id/read      | Mark one as read         |

### Users  `GET|POST /api/users/`
| Method | Endpoint         | Access             |
|--------|------------------|--------------------|
| GET    | /                | Admin, Manager     |
| POST   | /                | Admin              |
| GET    | /:id             | Admin, Manager     |
| PUT    | /:id             | Admin or self      |
| PUT    | /change-password | Any (self)         |
| DELETE | /:id             | Admin              |

### Reports  `GET /api/reports/`
| Endpoint   | Description                                                  |
|------------|--------------------------------------------------------------|
| /dashboard | Stats cards + monthlySales + leadsByStatus aggregations      |
| /sales     | Deals by stage + top performers                              |
| /leads     | Leads by source + by status                                  |

---

## Frontend Pages

| Route                 | Page                  | Description                                           |
|-----------------------|-----------------------|-------------------------------------------------------|
| `/`                   | Home                  | Public landing page                                   |
| `/login`              | Login                 | Email/password sign in                                |
| `/register`           | Register              | Create account (first = admin)                        |
| `/forgot-password`    | ForgotPassword        | Request reset email                                   |
| `/reset-password`     | ResetPassword         | Set new password via token                            |
| `/dashboard`          | Dashboard             | KPI cards + monthly sales line chart + pie + bar      |
| `/customers`          | Customers             | List with search/filter, add/edit modal, delete       |
| `/customers/:id`      | CustomerDetails       | Profile, notes panel, activity timeline               |
| `/leads`              | Leads                 | List, add/edit, convert-to-deal button                |
| `/leads/:id`          | LeadDetails           | Lead info, notes, convert action                      |
| `/deals`              | Deals                 | Kanban board, drag-and-drop stages, add/edit modal    |
| `/tasks`              | Tasks                 | List, priority/status filter, quick complete button   |
| `/calendar`           | Calendar              | Monthly grid with task due dates and deal close dates |
| `/notes`              | Notes                 | All notes across entities, add modal                  |
| `/reports`            | Reports               | Sales + Leads tabs, PDF & CSV export                  |
| `/users`              | Users                 | Team management (admin/manager)                       |
| `/profile`            | Profile               | Edit name/phone, change password                      |
| `/settings`           | Settings              | Theme picker (light/dark/system)                      |
| `/notifications`      | Notifications         | Full notification list with mark-read                 |

---

## Security Implementation

- **Helmet** — Sets secure HTTP headers (X-Frame-Options, CSP, HSTS, etc.)
- **CORS** — Origin restricted to `CLIENT_URL` env variable
- **express-mongo-sanitize** — Strips `$` and `.` from user input to prevent NoSQL injection
- **xss-clean** — Sanitizes req.body/query/params to strip XSS payloads
- **express-rate-limit** — 300 req/15 min on all API routes; 20 req/15 min on auth routes
- **JWT** — Short-lived access tokens (7d) + long-lived refresh tokens (30d) stored server-side; refresh rotates on use
- **bcryptjs** — Passwords hashed with salt rounds = 12
- **Password reset** — HMAC-SHA256 hashed token stored in DB, 30-minute expiry, generic email response regardless of account existence
- **Role guards** — `authorize()` middleware enforces per-route role restrictions; sales_executive data is auto-scoped to `assignedTo: req.user._id`
- **Body size limit** — `express.json({ limit: '10kb' })`
- **Error handler** — Masks stack traces in production; maps CastError/11000/ValidationError to clean messages

---

## Installation & Local Development

### Prerequisites
- Node.js >= 18
- MongoDB running locally (or a MongoDB Atlas URI)

### 1. Clone and set up backend

```bash
cd procrm/backend
npm install

cp .env.example .env
# Edit .env — set MONGO_URI, JWT_SECRET, JWT_REFRESH_SECRET, SMTP_* values
```

### 2. Set up frontend

```bash
cd procrm/frontend
npm install
```

### 3. Run both servers

Open two terminals:

```bash
# Terminal 1 — Backend (port 5000)
cd procrm/backend
npm run dev

# Terminal 2 — Frontend (port 5173)
cd procrm/frontend
npm run dev
```

Visit **http://localhost:5173**

---

## Seeding Demo Data

After the backend is running with a valid `MONGO_URI`:

```bash
cd procrm/backend
npm run seed
```

This creates three demo users:

| Email                   | Password       | Role            |
|-------------------------|----------------|-----------------|
| admin@procrm.com        | Admin@12345    | Admin           |
| manager@procrm.com      | Manager@12345  | Manager         |
| sales@procrm.com        | Sales@12345    | Sales Executive |

It also creates one demo customer and one demo lead so the dashboard isn't empty.

---

## Deployment Guide

### Backend → Render

1. Push the `backend/` folder (or monorepo) to GitHub
2. Create a new **Web Service** on [render.com](https://render.com)
3. Set **Root Directory** to `backend`
4. Set **Build Command**: `npm install`
5. Set **Start Command**: `node server.js`
6. Add all environment variables from `.env.example` under the Environment tab:
   - `NODE_ENV=production`
   - `MONGO_URI=<your Atlas URI>`
   - `JWT_SECRET=<strong random string>`
   - `JWT_REFRESH_SECRET=<another strong random string>`
   - `CLIENT_URL=<your Vercel/Netlify frontend URL>`
   - SMTP variables if you want real email
7. Deploy — Render provides a public URL like `https://procrm-api.onrender.com`

### Frontend → Vercel

1. Push the `frontend/` folder to GitHub
2. Import the repo in [vercel.com](https://vercel.com) → **New Project**
3. Set **Root Directory** to `frontend`
4. Framework preset: **Vite**
5. Add environment variable: `VITE_API_URL=https://procrm-api.onrender.com` (if you switch from the Vite proxy to a direct URL)
6. Deploy — Vercel provides a URL like `https://procrm.vercel.app`

> **Note:** The Vite proxy in `vite.config.js` is for local development only. For production, update `frontend/src/services/api.js` to set `baseURL` to your Render backend URL, or use `import.meta.env.VITE_API_URL`.

### Frontend → Netlify (alternative)

1. `cd procrm/frontend && npm run build` — output goes to `dist/`
2. Drag the `dist/` folder into [netlify.com](https://netlify.com), or connect via GitHub
3. Set **Publish directory** to `frontend/dist`
4. Add a `_redirects` file in `frontend/public/`:
   ```
   /* /index.html 200
   ```
   This ensures React Router works correctly on page refresh.

---

## RBAC Roles & Permissions

| Feature                     | Admin | Manager | Sales Executive |
|-----------------------------|-------|---------|-----------------|
| View all records            | ✅    | ✅      | Own only        |
| Create customers/leads/deals| ✅    | ✅      | ✅              |
| Delete customers/leads/deals| ✅    | ✅      | ❌              |
| View team members           | ✅    | ✅      | ❌              |
| Create team members         | ✅    | ❌      | ❌              |
| Edit roles/status           | ✅    | ❌      | ❌              |
| View reports                | ✅    | ✅      | Own scoped      |
| Access all dashboard stats  | ✅    | ✅      | Own scoped      |

---

## Environment Variables Reference

```env
# Server
NODE_ENV=development
PORT=5000

# Client (for CORS)
CLIENT_URL=http://localhost:5173

# MongoDB
MONGO_URI=mongodb://127.0.0.1:27017/procrm

# JWT
JWT_SECRET=your_super_secret_key_change_in_production
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=another_super_secret_key_for_refresh
JWT_REFRESH_EXPIRE=30d

# Email (optional in dev — falls back to console.log)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your_app_password
FROM_EMAIL=no-reply@procrm.com

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000   # 15 minutes
RATE_LIMIT_MAX=300
```
