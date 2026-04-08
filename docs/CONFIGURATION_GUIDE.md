# 🛠️ Configuration & Developer Guide - Taskflow

Welcome to the Taskflow configuration guide. This document contains everything you need to know to set up, configure, and understand the internal architecture of the project.

## 1. Environment Variables (`.env`)

Create a `.env` file in the root directory. You can use the following template:

```env
# Database (PostgreSQL)
DATABASE_URL="postgresql://user:password@localhost:5400/taskflow?schema=public"

# Redis (BullMQ & Socket.io)
REDIS_URL="redis://localhost:6379"

# Authentication
JWT_SECRET="your-super-secret-key-change-this-in-production"

# AI Integration (Google Gemini)
GEMINI_API_KEY="your-gemini-api-key"

# GitHub Integration (Optional for local dev)
GITHUB_CLIENT_ID="your-app-client-id"
GITHUB_CLIENT_SECRET="your-app-client-secret"
GITHUB_WEBHOOK_SECRET="your-webhook-secret"

# App Info
PUBLIC_URL="http://localhost:3000"
API_URL="http://localhost:4000"
```

---

## 2. Database & Prisma Setup

Taskflow uses **Prisma ORM** with **PostgreSQL**.

### Commands:
- **Generate Client:** Run this whenever you pull new code or change the schema.
  ```bash
  pnpm prisma generate
  ```
- **Sync Database:** Run this to push schema changes to your local DB.
  ```bash
  pnpm prisma migrate dev --name init
  ```
- **Studio:** View your data in a GUI.
  ```bash
  pnpm prisma studio
  ```

> [!IMPORTANT]
> Ensure your PostgreSQL instance is running before starting the API.

---

## 3. Authentication System

Taskflow implements a robust **JWT-based authentication** system with **Refresh Tokens**.

- **Access Token:** Short-lived (15-60 min), sent via `Authorization: Bearer <token>` header.
- **Refresh Token:** Long-lived, stored in an **HttpOnly Cookie** for high security against XSS.
- **Middleware:** The `fastify.authenticate` decorator is used to protect routes in `apps/api/src/index.ts`.

### Logic Flow:
1. User logs in -> Server sends Access Token (JSON) and sets Refresh Token (Cookie).
2. Client includes Access Token in headers via `apps/web/lib/api.ts` interceptor.
3. If Access Token expires, the interceptor automatically calls `/auth/refresh` to get a new one using the Cookie.

---

## 4. API Architecture

The backend is built with **Fastify**, organized into modular folders under `apps/api/src/modules/`.

### Module Structure:
- `*.routes.ts`: Defines endpoints, validation schemas, and handlers.
- `*.service.ts`: Contains business logic and database interactions (Prisma).
- `*.schema.ts`: Zod schemas for request/response validation.

### Key Modules:
- **Task:** Kanban logic, real-time sync, and AI suggestions.
- **Sprint:** Cycle management and Burndown data calculation.
- **Notification:** Real-time alerts via Socket.io.
- **Time:** Real-time timer logic and history tracking.
- **GitHub:** Webhook handlers and background sync workers (BullMQ).

---

## 5. Frontend & Real-time Sync

- **Framework:** Next.js 14 (App Router) + Tailwind CSS.
- **State Management:** `Zustand` for auth and global UI state.
- **Real-time:** `Socket.io-client`. 
  - Rooms are scoped to `project:${projectId}` to ensure users only receive updates for projects they are viewing.
  - Events: `task:created`, `task:moved`, `notification:received`.

---

## 6. How to Run Locally

1. **Install dependencies:**
   ```bash
   pnpm install
   ```
2. **Setup environment:** (See section 1).
3. **Setup Database:**
   ```bash
   cd apps/api
   pnpm prisma generate
   pnpm prisma migrate dev
   ```
4. **Start Development Servers:**
   ```bash
   # From root
   pnpm dev
   ```
   - Web: `http://localhost:3000`
   - API: `http://localhost:4000`

---

## 7. Useful Tips
- **AI Suggestions:** If the AI Magic button doesn't work, ensure your `GEMINI_API_KEY` is valid.
- **GitHub Webhooks:** Use `ngrok` or `localtunnel` to expose your API to GitHub webhooks during local development.
- **Reset DB:** To reset everything, run `pnpm prisma migrate reset`.
