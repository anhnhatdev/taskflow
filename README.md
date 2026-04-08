# Taskflow 🚀

### A "Monster" Level Full-Stack Task Management Platform

Taskflow is a high-performance, real-time project management tool built for modern teams. It combines the power of **Fastify**, **Next.js**, **Prisma**, and **Google Gemini AI** to deliver a premium, seamless experience.

![Taskflow Preview](https://via.placeholder.com/1200x600?text=Taskflow+Premium+Kanban+Interface)

## ✨ Features

- 💎 **Premium UI:** Sleek dark-themed design with "Glassmorphism" aesthetics using Tailwind CSS and Framer Motion.
- ⚡ **Real-time Sync:** Instant Kanban board updates via Socket.io.
- 🤖 **AI Magic:** Task auto-categorization and priority suggestions powered by Google Gemini 1.5 Flash.
- 📅 **Sprint Management:** Full cycle sprint planning with interactive Burndown Charts.
- ⏱️ **Time Tracking:** Integrated real-time timers on every task card with history logs.
- 🐙 **GitHub Sync:** Deep integration with GitHub Issues and PRs via BullMQ background workers.
- 🔔 **Real-time Alerts:** Interactive notification system for assignments and status changes.
- 📎 **Attachments:** Robust file upload system with local/S3 support.

## 🏗️ Architecture

- **Monorepo:** Managed with `pnpm` and `Turborepo`.
- **Backend:** Fastify (Node.js) + Prisma ORM + BullMQ/Redis.
- **Frontend:** Next.js 14 (App Router) + Zustand + Recharts.
- **Authentication:** JWT with HttpOnly Refresh Token cookies.

## 🚀 Quick Start

1. **Clone & Install:**
   ```bash
   git clone https://github.com/anhnhatdev/taskflow.git
   cd taskflow
   pnpm install
   ```
2. **Configuration:**
   See the detailed [Configuration Guide](./docs/CONFIGURATION_GUIDE.md) for environment variables and setup instructions.
3. **Database Setup:**
   ```bash
   cd apps/api
   pnpm prisma generate
   pnpm prisma migrate dev
   ```
4. **Run:**
   ```bash
   pnpm dev
   ```

## 📖 Documentation

- [Product Requirements Document (PRD)](./taskflow_PRD.md)
- [Configuration & API Guide](./docs/CONFIGURATION_GUIDE.md)
- [Implementation Log](./docs/implementation_log.md)

---
Built with ❤️ by [anhnhatdev](https://github.com/anhnhatdev)
