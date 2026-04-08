# TASKFLOW — Product Requirements Document (PRD)
**Version:** 1.0.0  
**Last updated:** 2026-04-08  
**Status:** Draft → In Review  
**Author:** [Tên bạn]

---

## MỤC LỤC

1. [Tổng quan sản phẩm](#1-tổng-quan-sản-phẩm)
2. [Vấn đề & Cơ hội](#2-vấn-đề--cơ-hội)
3. [Đối tượng người dùng](#3-đối-tượng-người-dùng)
4. [User Stories](#4-user-stories)
5. [Kiến trúc hệ thống](#5-kiến-trúc-hệ-thống)
6. [Database Schema](#6-database-schema)
7. [API Specification](#7-api-specification)
8. [Feature Specification chi tiết](#8-feature-specification-chi-tiết)
9. [Non-functional Requirements](#9-non-functional-requirements)
10. [Tech Stack & Lý do chọn](#10-tech-stack--lý-do-chọn)
11. [Roadmap & Milestones](#11-roadmap--milestones)
12. [Risk & Mitigation](#12-risk--mitigation)

---

## 1. TỔNG QUAN SẢN PHẨM

### Vision
> **Taskflow** là công cụ quản lý công việc được thiết kế riêng cho developer team — nơi task management và GitHub workflow hợp nhất thành một luồng làm việc liền mạch.

### Problem Statement
Các công cụ hiện tại (Jira, Trello, Linear) đều yêu cầu developer phải cập nhật task thủ công song song với công việc lập trình thực tế. Kết quả: task board luôn lệch với thực tế code, PM không có visibility thật, developer phải context-switch liên tục.

### Solution
Taskflow tự động đồng bộ trạng thái task với GitHub activity (branch, commit, PR, merge). Developer chỉ cần code — task board tự cập nhật.

### Tagline
*"Where code and tasks flow together"*

---

## 2. VẤN ĐỀ & CƠ HỘI

### Pain Points hiện tại

| # | Vấn đề | Tần suất | Độ nghiêm trọng |
|---|--------|----------|-----------------|
| P1 | Developer phải update task thủ công sau mỗi action trên GitHub | Hàng ngày | Cao |
| P2 | Không biết task nào đang block task nào cho đến khi quá muộn | Hàng tuần | Cao |
| P3 | Estimate giờ luôn sai nhưng không có dữ liệu để cải thiện | Hàng sprint | Trung bình |
| P4 | Setup Jira cho team nhỏ mất vài ngày, overkill cho 3–10 người | One-time | Cao |
| P5 | Notification spam khiến developer tắt hết, bỏ lỡ thông tin quan trọng | Hàng ngày | Trung bình |
| P6 | Không có "focus mode" — task tool làm phân tán thay vì giúp tập trung | Hàng ngày | Trung bình |

### Competitive Analysis

| Feature | Taskflow | Jira | Linear | Trello |
|---------|----------|------|--------|--------|
| GitHub auto-sync | ✅ Native | ⚠️ Plugin | ⚠️ Partial | ❌ |
| Dependency graph | ✅ Visual DAG | ✅ Basic | ✅ | ❌ |
| Time tracking built-in | ✅ + Pomodoro | ⚠️ Plugin | ❌ | ❌ |
| AI task breakdown | ✅ | ❌ | ⚠️ Beta | ❌ |
| Setup time | < 2 phút | 2–3 ngày | 30 phút | 5 phút |
| Giá cho team 5 người | Free/Cheap | $42/tháng | $40/tháng | $25/tháng |
| Target user | Dev team | Enterprise | Dev-first | General |

---

## 3. ĐỐI TƯỢNG NGƯỜI DÙNG

### Persona 1 — "The Developer" (Primary)
- **Tên:** Minh, 24 tuổi, Junior–Mid Developer
- **Context:** Làm trong team 4–8 người, dùng GitHub hàng ngày
- **Goal:** Code tập trung, không muốn bị làm phiền bởi việc update task
- **Frustration:** "Tôi vừa merge PR xong mà vẫn phải vào Jira kéo card sang Done bằng tay"
- **Key Jobs-to-be-done:**
  - Biết mình cần làm gì hôm nay ngay khi mở máy
  - Track giờ làm để estimate tốt hơn lần sau
  - Không bỏ sót dependency với task của teammate

### Persona 2 — "The Tech Lead" (Secondary)
- **Tên:** Huy, 28 tuổi, Tech Lead
- **Context:** Quản lý team 5–10 người, chịu trách nhiệm sprint delivery
- **Goal:** Có visibility thật về tiến độ mà không phải họp daily quá lâu
- **Frustration:** "Task board lúc nào cũng lệch thực tế vì dev không update"
- **Key Jobs-to-be-done:**
  - Nhìn thấy bottleneck trước khi nó xảy ra
  - Assign task hợp lý dựa theo workload thực tế
  - Có báo cáo sprint tự động, không phải tự compile

### Persona 3 — "The Solo Dev / Freelancer" (Tertiary)
- **Tên:** An, 22 tuổi, Freelancer hoặc Side Project Builder
- **Context:** Làm một mình hoặc với 1–2 người, cần tool nhẹ và nhanh
- **Goal:** Track công việc mà không overhead
- **Key Jobs-to-be-done:**
  - Tạo task nhanh (< 10 giây)
  - Focus mode để làm việc deep work
  - Xem lại mình đã làm gì trong tuần

---

## 4. USER STORIES

### Epic 1: Authentication & Workspace

```
US-001: Đăng ký / Đăng nhập
  Là một user mới,
  Tôi muốn đăng ký bằng email hoặc GitHub OAuth,
  Để truy cập Taskflow mà không cần nhớ thêm mật khẩu mới.

  Acceptance Criteria:
  - Đăng ký bằng email + password (bcrypt hash)
  - Đăng nhập bằng GitHub OAuth (tự động lấy GitHub username/avatar)
  - JWT access token (15 phút) + Refresh token (7 ngày, rotation)
  - Refresh token lưu HttpOnly cookie, không expose ra JS
  - Rate limit: max 5 lần login fail / 15 phút / IP

US-002: Tạo Workspace
  Là một user đã đăng nhập,
  Tôi muốn tạo workspace cho team của mình,
  Để có không gian làm việc riêng với branding của team.

  Acceptance Criteria:
  - Workspace có: tên, slug (unique, dùng cho URL), avatar, description
  - URL pattern: taskflow.app/{workspace-slug}
  - User tạo workspace tự động trở thành Owner
  - Có thể tạo tối đa 3 workspace (free plan)

US-003: Mời thành viên
  Là một Workspace Owner/Admin,
  Tôi muốn mời thành viên qua email,
  Để họ có thể tham gia workspace và làm việc cùng.

  Acceptance Criteria:
  - Gửi email invite với magic link (expire sau 48 giờ)
  - Invite link chỉ dùng được 1 lần
  - Assign role khi invite: Admin / Member / Viewer
  - Hiển thị danh sách pending invites
```

### Epic 2: Project & Sprint Management

```
US-010: Tạo Project
  Là một Admin,
  Tôi muốn tạo project trong workspace,
  Để phân chia công việc theo từng sản phẩm hoặc module.

  Acceptance Criteria:
  - Project có: tên, mô tả, icon, màu sắc, identifier (VD: "TF")
  - Task ID tự động theo format: TF-001, TF-002...
  - Project có thể public (ai trong workspace đều thấy) hoặc private
  - Lưu cấu hình GitHub repo liên kết với project

US-011: Quản lý Sprint
  Là một Admin/Tech Lead,
  Tôi muốn tạo và quản lý sprint,
  Để team làm việc theo chu kỳ có định hướng rõ ràng.

  Acceptance Criteria:
  - Sprint có: tên, start date, end date, goal
  - Chỉ có 1 sprint active tại một thời điểm
  - Backlog task có thể kéo vào sprint
  - Sprint completion: task chưa xong tự động về backlog
  - Burndown chart tự động cập nhật theo ngày
```

### Epic 3: Task Management

```
US-020: Tạo Task nhanh
  Là một Member,
  Tôi muốn tạo task trong vòng 10 giây,
  Để không mất focus khi nảy ra ý tưởng hoặc bug report.

  Acceptance Criteria:
  - Quick create: nhấn "C" bất kỳ đâu → modal tạo task
  - Tối thiểu chỉ cần nhập title là tạo được
  - Có thể expand để thêm chi tiết sau
  - Task được tạo vào Backlog hoặc Current Sprint

US-021: Task Detail đầy đủ
  Là một Member,
  Tôi muốn xem và chỉnh sửa đầy đủ thông tin của một task,
  Để có đủ context để hoàn thành công việc.

  Acceptance Criteria:
  Task có các field:
  - Title (required)
  - Description (Markdown editor với preview)
  - Status: Backlog / Todo / In Progress / In Review / Done / Cancelled
  - Priority: Urgent / High / Medium / Low / No Priority
  - Assignees (nhiều người)
  - Labels (tự tạo, có màu)
  - Due date + time estimate (giờ)
  - Parent task / Subtasks
  - Linked tasks (blocks / blocked by / relates to / duplicates)
  - GitHub branches, commits, PRs liên kết (tự động + thủ công)
  - Attachments (ảnh, file — lưu S3/Cloudflare R2)
  - Activity log (ai làm gì, lúc nào)
  - Comments với @mention

US-022: Kanban Board
  Là một Member,
  Tôi muốn xem task dạng Kanban board,
  Để có cái nhìn tổng quan và cập nhật status bằng drag & drop.

  Acceptance Criteria:
  - Drag & drop task giữa các column
  - Optimistic UI update (không chờ API response)
  - Conflict resolution khi 2 người drag cùng lúc (last-write-wins + toast notify)
  - Group by: Status / Priority / Assignee / Label
  - Filter: Priority, Assignee, Label, Due date
  - Collapse/expand column
  - WIP limit per column (optional, có thể set)

US-023: List View & Board View
  Là một Member,
  Tôi muốn chuyển đổi giữa List view và Board view,
  Để chọn cách xem phù hợp với từng tình huống.

  Acceptance Criteria:
  - List view: table dạng linear, sort theo mọi column
  - Board view: Kanban
  - My Tasks view: chỉ show task được assign cho tôi
  - Lưu preference per user per project
```

### Epic 4: GitHub Integration (Killer Feature)

```
US-030: Kết nối GitHub Repository
  Là một Admin,
  Tôi muốn kết nối GitHub repo với project,
  Để task tự động cập nhật theo GitHub activity.

  Acceptance Criteria:
  - Cài Taskflow GitHub App vào repo (OAuth flow)
  - Lưu GitHub repo info: owner, name, installation_id
  - Test connection: ping GitHub API confirm thành công
  - Có thể kết nối nhiều repo vào 1 project

US-031: Auto-sync Branch
  Là một Developer,
  Khi tôi tạo branch theo convention "feat/TF-042-ten-task",
  Task TF-042 tự động chuyển sang "In Progress" và hiển thị branch đó.

  Acceptance Criteria:
  - Convention: {type}/{task-id}-{optional-description}
    Types: feat, fix, chore, refactor, hotfix
  - Webhook event: create (branch)
  - Task status: Backlog/Todo → In Progress
  - Hiển thị branch name + link đến GitHub trong task detail
  - Nếu branch không match convention → bỏ qua, không báo lỗi

US-032: Auto-sync Pull Request
  Là một Developer,
  Khi tôi mở PR có title hoặc body chứa "TF-042",
  Task tự động chuyển sang "In Review" và hiển thị PR.

  Acceptance Criteria:
  - Webhook events: pull_request (opened, closed, merged, reopened)
  - Parse task ID từ: PR title, PR body, branch name (priority theo thứ tự)
  - PR opened → task status: In Progress → In Review
  - PR merged → task status: → Done, record merged_at timestamp
  - PR closed (not merged) → task status: → In Progress (revert)
  - Hiển thị: PR title, status (open/merged/closed), author, created_at

US-033: Commit Tracking
  Là một Developer,
  Tôi muốn xem tất cả commit liên quan đến một task,
  Để có history đầy đủ về những gì đã được thay đổi.

  Acceptance Criteria:
  - Webhook event: push
  - Parse task ID từ commit message: "feat(TF-042): add drag and drop"
  - Hiển thị: commit hash (7 ký tự), message, author, timestamp, link
  - Tối đa 20 commit gần nhất per task, xem thêm qua GitHub link

US-034: GitHub Webhook Processing
  (Technical requirement — không phải user story)

  Architecture:
  - GitHub gửi webhook → Taskflow /api/github/webhook endpoint
  - Verify signature: X-Hub-Signature-256 (HMAC-SHA256)
  - Enqueue vào BullMQ job queue (không xử lý synchronous)
  - Worker process job: parse event → update database → emit Socket.io event
  - Retry policy: 3 lần, exponential backoff (5s, 30s, 5m)
  - Dead letter queue cho job fail sau 3 lần
  - Idempotency: mỗi webhook delivery_id chỉ xử lý 1 lần (lưu vào Redis)
```

### Epic 5: Real-time Collaboration

```
US-040: Live Updates
  Là một Member,
  Khi teammate thay đổi task,
  Tôi thấy thay đổi ngay lập tức mà không cần reload.

  Acceptance Criteria:
  - Socket.io rooms theo workspace_id + project_id
  - Emit events: task:created, task:updated, task:deleted, task:moved
  - Reconnect tự động khi mất kết nối
  - Presence indicator: hiển thị ai đang online trong workspace

US-041: Comment & @mention
  Là một Member,
  Tôi muốn comment vào task và @mention teammate,
  Để thảo luận trong context của task, không phải trên Slack.

  Acceptance Criteria:
  - Rich text comment (Markdown)
  - @mention: gõ @ → dropdown danh sách member → chọn
  - @mention tạo notification cho người được mention
  - Edit comment (trong vòng 15 phút sau khi tạo)
  - Delete comment (chỉ author hoặc Admin)
  - Real-time: comment của người khác xuất hiện ngay
```

### Epic 6: Time Tracking & Focus Mode

```
US-050: Time Tracking
  Là một Developer,
  Tôi muốn track thời gian thực tế tôi làm việc trên từng task,
  Để cải thiện estimate cho các sprint sau.

  Acceptance Criteria:
  - Mỗi task có nút Start Timer / Stop Timer
  - Chỉ 1 timer active tại một thời điểm per user
  - Start timer task mới → tự động stop timer task cũ
  - Lưu time logs: start_at, end_at, duration, note
  - Hiển thị: tổng thời gian đã log, estimate còn lại
  - Cho phép log thủ công (add time entry)

US-051: Focus Mode
  Là một Developer,
  Tôi muốn vào chế độ tập trung khi làm task,
  Để không bị phân tán bởi các notification và task khác.

  Acceptance Criteria:
  - Focus Mode UI: fullscreen, tối giản, chỉ hiện task đang làm
  - Tích hợp Pomodoro: 25 phút work / 5 phút break / 15 phút long break
  - Timer đếm ngược hiển thị trên browser tab title
  - Notification bị snooze trong lúc focus (trừ @mention urgent)
  - Kết thúc pomodoro: sound notification + toast nhẹ nhàng
  - Tự động log time vào task đang focus
```

### Epic 7: Dependency Graph

```
US-060: Liên kết Task Dependencies
  Là một Tech Lead,
  Tôi muốn định nghĩa mối quan hệ giữa các task,
  Để team biết thứ tự thực hiện và tránh bị block.

  Acceptance Criteria:
  - Loại relationship: blocks / blocked by / relates to / duplicates
  - "Blocks" và "blocked by" là inverse của nhau (tạo 1 → 2 bản ghi)
  - Circular dependency detection: A blocks B blocks A → cảnh báo, không cho lưu
  - Task bị block hiển thị badge "Blocked" màu đỏ trên Kanban card

US-061: Dependency Graph Visualization
  Là một Tech Lead,
  Tôi muốn xem đồ thị phụ thuộc giữa các task trong sprint,
  Để identify bottleneck và critical path.

  Acceptance Criteria:
  - Visualize DAG (Directed Acyclic Graph) bằng React Flow
  - Node: task card (title, assignee avatar, status color)
  - Edge: arrow với label loại dependency
  - Critical path: highlight màu đỏ chain task dài nhất
  - Click node → mở task detail panel bên phải
  - Zoom in/out, pan, fit-to-screen
  - Export graph dạng PNG
```

### Epic 8: Analytics & Reporting

```
US-070: Sprint Dashboard
  Là một Tech Lead,
  Tôi muốn xem tổng quan tiến độ sprint hiện tại,
  Để có visibility mà không cần phải hỏi từng người.

  Acceptance Criteria:
  - Burndown chart: story points còn lại theo ngày
  - Velocity chart: story points completed per sprint (6 sprint gần nhất)
  - Task breakdown: pie chart theo status, priority, assignee
  - Overdue tasks: danh sách task quá deadline, sort theo mức độ trễ
  - Team workload: bar chart số task per assignee

US-071: Time Report
  Là một Developer,
  Tôi muốn xem báo cáo thời gian làm việc của mình,
  Để biết mình dành thời gian cho task loại nào nhiều nhất.

  Acceptance Criteria:
  - Time logged per task, per project, per label
  - So sánh estimate vs actual time (sprint level)
  - Export CSV để analyze bên ngoài
```

### Epic 9: AI Features

```
US-080: AI Task Breakdown
  Là một Developer,
  Khi tôi có một feature lớn cần chia nhỏ,
  Tôi muốn AI gợi ý subtask dựa theo description,
  Để không bỏ sót bước nào.

  Acceptance Criteria:
  - Button "Break down with AI" trong task detail
  - Gửi task title + description lên AI (Gemini API)
  - AI trả về list subtask (title + estimate giờ)
  - User review, bỏ tick những cái không cần, confirm
  - Subtask được tạo liên kết với parent task
  - Loading state rõ ràng, error state có retry

US-081: Smart Assign Suggestion
  Là một Tech Lead,
  Khi tôi assign task cho member,
  Tôi muốn gợi ý ai phù hợp nhất,
  Để phân công hợp lý mà không phải nhớ workload của từng người.

  Acceptance Criteria:
  - Khi mở assignee dropdown → hiển thị gợi ý + lý do
  - Logic gợi ý: workload hiện tại (task count + estimated hours) + skill tags
  - Hiển thị: avatar + tên + "X tasks, Y giờ remaining"
  - Chỉ là gợi ý — người dùng luôn có thể chọn bất kỳ ai

US-082: Sprint Summary AI
  Là một Tech Lead,
  Cuối sprint tôi muốn AI tóm tắt những gì đã xảy ra,
  Để viết sprint retrospective nhanh hơn.

  Acceptance Criteria:
  - Button "Generate Sprint Summary" khi close sprint
  - AI phân tích: tasks completed/incomplete, velocity, most delayed tasks
  - Output: paragraph tóm tắt + bullet points highlights + suggested improvements
  - User có thể edit trước khi save/share
  - Lưu summary vào sprint record
```

### Epic 10: Notifications

```
US-090: Notification System
  Là một Member,
  Tôi muốn nhận thông báo về những gì liên quan đến tôi,
  Mà không bị spam bởi mọi activity trong workspace.

  Acceptance Criteria:
  Trigger notifications:
  - Task được assign cho tôi
  - Tôi được @mention trong comment
  - Task của tôi bị block bởi task mới
  - Deadline của task tôi sắp đến (24h trước)
  - PR của tôi được review (nếu linked)
  - GitHub PR của task tôi được merge

  Channels:
  - In-app: notification bell, unread count, dropdown list
  - Email: digest (không phải real-time, gửi batch mỗi giờ)
  - Không có Slack/Discord integration trong v1

  Settings:
  - User tự chọn muốn nhận loại nào
  - Email notification: on/off per category
  - Quiet hours: không gửi email trong khoảng giờ nào
```

---

## 5. KIẾN TRÚC HỆ THỐNG

### High-level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                         │
│   Next.js 14 (App Router)  │  React Native (Expo)       │
│   Browser / Desktop         │  iOS / Android             │
└──────────────┬──────────────┴──────────┬─────────────────┘
               │ HTTPS / WSS             │ HTTPS
               ▼                         ▼
┌─────────────────────────────────────────────────────────┐
│                    GATEWAY LAYER                         │
│              Nginx (Reverse Proxy + SSL)                 │
│         Rate Limiting │ Request Routing │ Compression    │
└──────────────┬─────────────────────────┬─────────────────┘
               │                         │
        ┌──────▼──────┐          ┌───────▼───────┐
        │  REST API   │          │  WebSocket    │
        │  (Fastify)  │          │  (Socket.io)  │
        └──────┬──────┘          └───────┬───────┘
               │                         │
┌──────────────▼─────────────────────────▼─────────────────┐
│                    SERVICE LAYER                           │
│  Auth │ Workspace │ Project │ Task │ GitHub │ AI │ Notif  │
└──────┬──────────────────────────────────────┬─────────────┘
       │                                      │
┌──────▼──────┐  ┌──────────┐  ┌─────────────▼──────────┐
│ PostgreSQL  │  │  Redis   │  │        BullMQ           │
│ (Primary   │  │ (Cache + │  │  (Job Queue + Workers)  │
│  DB)        │  │  PubSub) │  │                         │
└─────────────┘  └──────────┘  └─────────────────────────┘
                                        │
                          ┌─────────────▼───────────────┐
                          │      External Services       │
                          │  GitHub API │ Gemini API     │
                          │  SMTP (Email) │ R2 (Storage) │
                          └─────────────────────────────┘
```

### Folder Structure (Monorepo)

```
taskflow/
├── apps/
│   ├── web/                    # Next.js 14 frontend
│   │   ├── app/               # App Router pages
│   │   ├── components/        # UI components
│   │   ├── hooks/             # Custom hooks
│   │   ├── lib/               # Utils, API client
│   │   └── stores/            # Zustand stores
│   ├── api/                    # Fastify backend
│   │   ├── src/
│   │   │   ├── modules/       # Feature modules
│   │   │   │   ├── auth/
│   │   │   │   ├── workspace/
│   │   │   │   ├── project/
│   │   │   │   ├── task/
│   │   │   │   ├── github/
│   │   │   │   ├── ai/
│   │   │   │   └── notification/
│   │   │   ├── shared/        # Shared utils, middleware
│   │   │   ├── jobs/          # BullMQ job definitions
│   │   │   ├── workers/       # BullMQ workers
│   │   │   └── websocket/     # Socket.io handlers
│   │   └── prisma/
│   │       ├── schema.prisma
│   │       └── migrations/
│   └── mobile/                 # React Native (Expo) — Phase 2
├── packages/
│   ├── types/                  # Shared TypeScript types
│   ├── utils/                  # Shared utilities
│   └── ui/                     # Shared UI components (nếu cần)
├── infrastructure/
│   ├── docker/
│   │   ├── docker-compose.yml
│   │   ├── docker-compose.prod.yml
│   │   └── nginx/
│   │       └── nginx.conf
│   └── github-actions/
│       ├── ci.yml
│       └── deploy.yml
├── docs/
│   ├── PRD.md                  # File này
│   ├── ADR/                    # Architecture Decision Records
│   └── api/                    # OpenAPI spec
├── package.json                # Root (pnpm workspace)
├── turbo.json                  # Turborepo config
└── .github/
    └── workflows/
```

### Authentication Flow

```
[User] → POST /auth/login → [API]
                              │
                    Verify email + password
                              │
                   Generate access_token (JWT, 15m)
                   Generate refresh_token (opaque, 7d)
                              │
                   Store refresh_token in DB (hashed)
                              │
             ← access_token (Response body)
             ← refresh_token (HttpOnly Cookie)

[User] → API request với Authorization: Bearer {access_token}
                              │
                    Verify JWT signature + expiry
                              │
                    Extract user_id, workspace_id, role
                              │
                    Continue request

[User] → POST /auth/refresh (cookie tự động gửi)
                              │
                    Verify refresh_token hash
                    Rotate: invalidate old, issue new pair
                              │
             ← new access_token
             ← new refresh_token cookie
```

### GitHub Webhook Flow

```
[GitHub Event] → POST /api/github/webhook
                              │
                 1. Verify X-Hub-Signature-256
                    (HMAC-SHA256 với webhook secret)
                              │
                 2. Check idempotency:
                    Redis GET webhook:{delivery_id}
                    → Nếu đã xử lý: return 200 OK (skip)
                    → Nếu chưa: SET webhook:{delivery_id} TTL 24h
                              │
                 3. Return 200 OK ngay (GitHub timeout = 10s)
                              │
                 4. Enqueue job vào BullMQ:
                    queue: github-events
                    data: { event_type, payload, project_id }
                              │
                 [Worker picks up job]
                              │
                 5. Parse event:
                    - branch created → extract task_id từ branch name
                    - PR opened/merged → extract task_id từ title/body
                    - Push → extract task_id từ commit messages
                              │
                 6. Update database:
                    - Update task status
                    - Create github_link record
                              │
                 7. Emit Socket.io event:
                    room: project:{project_id}
                    event: task:updated
                              │
                 8. Create notifications nếu cần

Retry policy: 3 attempts, backoff: 5s → 30s → 5m
Dead letter queue: github-events-failed
```

---

## 6. DATABASE SCHEMA

```sql
-- USERS & AUTH
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),                    -- NULL nếu chỉ dùng OAuth
  name          VARCHAR(255) NOT NULL,
  avatar_url    VARCHAR(500),
  github_id     VARCHAR(100) UNIQUE,
  github_username VARCHAR(100),
  timezone      VARCHAR(50) DEFAULT 'Asia/Ho_Chi_Minh',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE refresh_tokens (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash    VARCHAR(255) NOT NULL,           -- bcrypt hash
  expires_at    TIMESTAMPTZ NOT NULL,
  revoked_at    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  INDEX idx_refresh_tokens_user (user_id),
  INDEX idx_refresh_tokens_hash (token_hash)
);

-- WORKSPACES
CREATE TABLE workspaces (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(255) NOT NULL,
  slug          VARCHAR(100) UNIQUE NOT NULL,    -- URL-safe, unique
  avatar_url    VARCHAR(500),
  created_by    UUID NOT NULL REFERENCES users(id),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TYPE workspace_role AS ENUM ('owner', 'admin', 'member', 'viewer');

CREATE TABLE workspace_members (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id  UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role          workspace_role NOT NULL DEFAULT 'member',
  joined_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (workspace_id, user_id),
  INDEX idx_workspace_members_workspace (workspace_id),
  INDEX idx_workspace_members_user (user_id)
);

CREATE TABLE workspace_invites (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id  UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  email         VARCHAR(255) NOT NULL,
  role          workspace_role NOT NULL DEFAULT 'member',
  token_hash    VARCHAR(255) NOT NULL,
  invited_by    UUID NOT NULL REFERENCES users(id),
  expires_at    TIMESTAMPTZ NOT NULL,
  used_at       TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- PROJECTS & SPRINTS
CREATE TABLE projects (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id  UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name          VARCHAR(255) NOT NULL,
  description   TEXT,
  identifier    VARCHAR(10) NOT NULL,            -- "TF", "API", etc.
  icon          VARCHAR(50),
  color         VARCHAR(7),                      -- hex color
  is_private    BOOLEAN DEFAULT FALSE,
  github_repo_owner VARCHAR(100),
  github_repo_name  VARCHAR(100),
  github_installation_id VARCHAR(100),
  created_by    UUID NOT NULL REFERENCES users(id),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (workspace_id, identifier),
  INDEX idx_projects_workspace (workspace_id)
);

CREATE TABLE sprints (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name          VARCHAR(255) NOT NULL,
  goal          TEXT,
  start_date    DATE,
  end_date      DATE,
  status        VARCHAR(20) DEFAULT 'upcoming'  -- upcoming, active, completed
    CHECK (status IN ('upcoming', 'active', 'completed')),
  completed_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  INDEX idx_sprints_project (project_id)
);

-- TASKS (core table)
CREATE TYPE task_status AS ENUM (
  'backlog', 'todo', 'in_progress', 'in_review', 'done', 'cancelled'
);
CREATE TYPE task_priority AS ENUM (
  'urgent', 'high', 'medium', 'low', 'no_priority'
);

CREATE TABLE tasks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  sprint_id       UUID REFERENCES sprints(id) ON DELETE SET NULL,
  parent_task_id  UUID REFERENCES tasks(id) ON DELETE SET NULL,
  sequence_number INTEGER NOT NULL,              -- TF-001 → 1
  title           VARCHAR(500) NOT NULL,
  description     TEXT,                          -- Markdown
  status          task_status NOT NULL DEFAULT 'backlog',
  priority        task_priority NOT NULL DEFAULT 'no_priority',
  estimate_hours  DECIMAL(5,1),
  due_date        TIMESTAMPTZ,
  sort_order      DECIMAL(10,5) DEFAULT 0,       -- fractional indexing cho drag&drop
  created_by      UUID NOT NULL REFERENCES users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),

  -- Full-text search
  search_vector   TSVECTOR GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B')
  ) STORED,

  INDEX idx_tasks_project (project_id),
  INDEX idx_tasks_sprint (sprint_id),
  INDEX idx_tasks_status (project_id, status),
  INDEX idx_tasks_search (search_vector) USING GIN,
  UNIQUE (project_id, sequence_number)
);

CREATE TABLE task_assignees (
  task_id   UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (task_id, user_id)
);

CREATE TABLE labels (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name        VARCHAR(100) NOT NULL,
  color       VARCHAR(7) NOT NULL,
  UNIQUE (project_id, name)
);

CREATE TABLE task_labels (
  task_id   UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  label_id  UUID NOT NULL REFERENCES labels(id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, label_id)
);

-- TASK DEPENDENCIES
CREATE TYPE dependency_type AS ENUM ('blocks', 'blocked_by', 'relates_to', 'duplicates');

CREATE TABLE task_dependencies (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_task_id    UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  to_task_id      UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  type            dependency_type NOT NULL,
  created_by      UUID NOT NULL REFERENCES users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (from_task_id, to_task_id, type),
  CHECK (from_task_id != to_task_id)
);

-- GITHUB LINKS
CREATE TABLE github_branches (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id     UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  repo_full_name VARCHAR(200) NOT NULL,          -- "owner/repo"
  branch_name VARCHAR(255) NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (task_id, repo_full_name, branch_name)
);

CREATE TABLE github_pull_requests (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id       UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  repo_full_name VARCHAR(200) NOT NULL,
  pr_number     INTEGER NOT NULL,
  pr_title      VARCHAR(500),
  pr_status     VARCHAR(20),                     -- open, closed, merged
  pr_url        VARCHAR(500),
  author_github_username VARCHAR(100),
  merged_at     TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (task_id, repo_full_name, pr_number)
);

CREATE TABLE github_commits (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id       UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  repo_full_name VARCHAR(200) NOT NULL,
  sha           VARCHAR(40) NOT NULL,
  short_sha     VARCHAR(7) NOT NULL,
  message       VARCHAR(1000),
  author_github_username VARCHAR(100),
  committed_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (task_id, sha)
);

CREATE TABLE github_webhook_events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id   VARCHAR(100) UNIQUE NOT NULL,   -- GitHub delivery ID (idempotency)
  event_type    VARCHAR(100) NOT NULL,
  project_id    UUID REFERENCES projects(id),
  status        VARCHAR(20) DEFAULT 'pending',  -- pending, processed, failed
  error_message TEXT,
  processed_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- COMMENTS & ACTIVITY
CREATE TABLE comments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id     UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(id),
  content     TEXT NOT NULL,                    -- Markdown
  edited_at   TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  INDEX idx_comments_task (task_id)
);

CREATE TABLE activity_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id     UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES users(id),        -- NULL nếu là system action
  action      VARCHAR(50) NOT NULL,             -- 'status_changed', 'assigned', etc.
  from_value  JSONB,
  to_value    JSONB,
  metadata    JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  INDEX idx_activity_task (task_id),
  INDEX idx_activity_created (created_at)
);

-- TIME TRACKING
CREATE TABLE time_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id     UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(id),
  started_at  TIMESTAMPTZ NOT NULL,
  ended_at    TIMESTAMPTZ,
  duration_minutes INTEGER,                     -- computed khi stop
  note        VARCHAR(500),
  is_manual   BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  INDEX idx_time_logs_task (task_id),
  INDEX idx_time_logs_user (user_id)
);

-- NOTIFICATIONS
CREATE TYPE notif_type AS ENUM (
  'task_assigned', 'mentioned', 'task_blocked', 'deadline_approaching',
  'pr_merged', 'pr_review_requested', 'comment_added'
);

CREATE TABLE notifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type            notif_type NOT NULL,
  title           VARCHAR(255) NOT NULL,
  body            TEXT,
  entity_type     VARCHAR(50),                  -- 'task', 'comment', etc.
  entity_id       UUID,
  actor_id        UUID REFERENCES users(id),   -- người gây ra notification
  is_read         BOOLEAN DEFAULT FALSE,
  read_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  INDEX idx_notifications_user_unread (user_id, is_read, created_at)
);
```

---

## 7. API SPECIFICATION

### Base URL
```
Development:  http://localhost:3001/api/v1
Production:   https://api.taskflow.dev/v1
```

### Authentication Header
```
Authorization: Bearer {access_token}
```

### Response Format
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}

// Error format
{
  "success": false,
  "error": {
    "code": "TASK_NOT_FOUND",
    "message": "Task không tồn tại hoặc bạn không có quyền truy cập",
    "details": {}
  }
}
```

### Endpoints

#### Auth
```
POST   /auth/register              Đăng ký bằng email
POST   /auth/login                 Đăng nhập
POST   /auth/refresh               Refresh access token
POST   /auth/logout                Logout (revoke refresh token)
GET    /auth/github                Redirect đến GitHub OAuth
GET    /auth/github/callback       GitHub OAuth callback
GET    /auth/me                    Lấy thông tin user hiện tại
```

#### Workspaces
```
POST   /workspaces                 Tạo workspace
GET    /workspaces                 Danh sách workspace của user
GET    /workspaces/:slug           Lấy workspace theo slug
PATCH  /workspaces/:id             Cập nhật workspace
DELETE /workspaces/:id             Xóa workspace

GET    /workspaces/:id/members     Danh sách thành viên
PATCH  /workspaces/:id/members/:userId  Cập nhật role
DELETE /workspaces/:id/members/:userId  Xóa thành viên

POST   /workspaces/:id/invites     Tạo invite
GET    /workspaces/:id/invites     Danh sách pending invites
DELETE /workspaces/:id/invites/:inviteId  Hủy invite
POST   /invites/:token/accept      Chấp nhận invite
```

#### Projects
```
POST   /workspaces/:wId/projects   Tạo project
GET    /workspaces/:wId/projects   Danh sách project
GET    /projects/:id               Chi tiết project
PATCH  /projects/:id               Cập nhật project
DELETE /projects/:id               Xóa project
```

#### Tasks
```
POST   /projects/:pId/tasks        Tạo task
GET    /projects/:pId/tasks        Danh sách task (filter, sort, paginate)
GET    /tasks/:id                  Chi tiết task
PATCH  /tasks/:id                  Cập nhật task (partial)
DELETE /tasks/:id                  Xóa task
POST   /tasks/:id/move             Di chuyển status (với metadata)

GET    /tasks/:id/comments         Danh sách comment
POST   /tasks/:id/comments         Tạo comment
PATCH  /comments/:id               Sửa comment
DELETE /comments/:id               Xóa comment

GET    /tasks/:id/time-logs        Danh sách time log
POST   /tasks/:id/time-logs        Log time thủ công
POST   /tasks/:id/timer/start      Bắt đầu timer
POST   /tasks/:id/timer/stop       Dừng timer

POST   /tasks/:id/dependencies     Thêm dependency
DELETE /tasks/:id/dependencies/:depId  Xóa dependency
GET    /projects/:pId/dependency-graph  Lấy graph data

POST   /tasks/:id/github-links     Link GitHub item thủ công
```

#### GitHub
```
POST   /github/webhook             Nhận GitHub webhook
GET    /github/auth                Bắt đầu GitHub App installation
GET    /github/callback            GitHub App installation callback
```

#### Sprints
```
POST   /projects/:pId/sprints      Tạo sprint
GET    /projects/:pId/sprints      Danh sách sprint
PATCH  /sprints/:id                Cập nhật sprint
POST   /sprints/:id/start          Bắt đầu sprint
POST   /sprints/:id/complete       Kết thúc sprint
GET    /sprints/:id/burndown       Burndown chart data
```

#### AI
```
POST   /ai/tasks/:id/breakdown     AI breakdown subtask
GET    /ai/tasks/:id/assign-suggest  Gợi ý assignee
POST   /ai/sprints/:id/summary     Generate sprint summary
```

#### Notifications
```
GET    /notifications              Danh sách notification của user
PATCH  /notifications/:id/read     Đánh dấu đã đọc
POST   /notifications/read-all     Đánh dấu tất cả đã đọc
GET    /notifications/settings     Lấy notification settings
PATCH  /notifications/settings     Cập nhật settings
```

### Socket.io Events

#### Client → Server (emit)
```
join:workspace    { workspaceId }   Tham gia room workspace
join:project      { projectId }     Tham gia room project
leave:project     { projectId }     Rời room project
typing:comment    { taskId }        Đang gõ comment
```

#### Server → Client (on)
```
task:created      { task }
task:updated      { taskId, changes }
task:deleted      { taskId }
task:moved        { taskId, fromStatus, toStatus, movedBy }
comment:created   { comment }
comment:updated   { comment }
notification:new  { notification }
presence:update   { userId, status }  -- online/offline
github:synced     { taskId, type, data }  -- khi webhook processed
```

---

## 8. FEATURE SPECIFICATION CHI TIẾT

### 8.1 Drag & Drop Kanban — Conflict Resolution

**Vấn đề:** User A và User B cùng drag task X lúc 14:00:00.100

```
Giải pháp: Optimistic UI + Last-write-wins + Toast notification

Flow:
1. User A drag task X → column Done
   - Frontend: cập nhật UI ngay (optimistic)
   - API call: PATCH /tasks/X { status: 'done', sort_order: 1234.5 }

2. Đồng thời, User B drag task X → column In Review
   - Frontend: cập nhật UI ngay (optimistic)
   - API call: PATCH /tasks/X { status: 'in_review', sort_order: 890.2 }

3. API nhận request của A trước (timestamp 14:00:00.150)
   → DB update task X: status=done
   → Emit socket: task:updated { taskId: X, status: 'done', updatedBy: A }

4. API nhận request của B (timestamp 14:00:00.180)
   → DB update task X: status=in_review (last write wins)
   → Emit socket: task:updated { taskId: X, status: 'in_review', updatedBy: B }

5. Client của A nhận socket event task:updated (from B)
   → Revert optimistic update
   → Toast: "Minh vừa di chuyển task này sang In Review"

6. Client của B đã đúng rồi → không làm gì
```

### 8.2 Fractional Indexing cho Sort Order

```
Vấn đề: Khi drag task, cần sort order không conflict mà không phải
reindex toàn bộ danh sách.

Giải pháp: Fractional indexing
- Task đầu tiên: sort_order = 1000
- Task thứ hai: sort_order = 2000
- Chèn giữa 1000 và 2000: sort_order = 1500
- Chèn giữa 1000 và 1500: sort_order = 1250
- ...

Khi sort_order gap quá nhỏ (< 0.001):
- Background job reindex: cách nhau 1000 đơn vị
- Không block user operation
```

### 8.3 RBAC Matrix

| Action | Owner | Admin | Member | Viewer |
|--------|-------|-------|--------|--------|
| Xóa workspace | ✅ | ❌ | ❌ | ❌ |
| Quản lý thành viên | ✅ | ✅ | ❌ | ❌ |
| Tạo/xóa project | ✅ | ✅ | ❌ | ❌ |
| Cấu hình GitHub | ✅ | ✅ | ❌ | ❌ |
| Tạo/sửa task | ✅ | ✅ | ✅ | ❌ |
| Xóa task | ✅ | ✅ | Chỉ task của mình | ❌ |
| Comment | ✅ | ✅ | ✅ | ❌ |
| Xem task | ✅ | ✅ | ✅ | ✅ |
| Tạo sprint | ✅ | ✅ | ❌ | ❌ |

### 8.4 Full-text Search

```sql
-- PostgreSQL full-text search
GET /projects/:pId/tasks?q=authentication+bug

SELECT * FROM tasks
WHERE project_id = $1
  AND search_vector @@ plainto_tsquery('english', $2)
ORDER BY ts_rank(search_vector, plainto_tsquery('english', $2)) DESC
LIMIT 20;

-- search_vector được tạo tự động (generated column):
-- title có weight 'A' (quan trọng hơn)
-- description có weight 'B'
```

### 8.5 Caching Strategy

```
Cache-aside pattern với Redis:

1. GET /projects/:id/tasks
   → Check Redis: tasks:project:{projectId}:page:{page}
   → HIT: return cached (TTL còn lại)
   → MISS: query PostgreSQL → cache với TTL 60s → return

2. Invalidation khi task thay đổi:
   PATCH /tasks/:id
   → Update DB
   → Delete cache keys: tasks:project:{projectId}:*  (pattern delete)
   → Emit socket event

Cache keys convention:
  tasks:project:{projectId}:list           TTL: 60s
  tasks:sprint:{sprintId}:burndown         TTL: 5m
  user:session:{userId}                    TTL: 15m
  github:webhook:delivered:{deliveryId}    TTL: 24h (idempotency)
  timer:active:{userId}                    TTL: 12h
```

---

## 9. NON-FUNCTIONAL REQUIREMENTS

### Performance
| Metric | Target | Measurement |
|--------|--------|-------------|
| API response time (P95) | < 200ms | Fastify request hooks |
| API response time (P99) | < 500ms | |
| WebSocket latency | < 100ms | |
| Page load (LCP) | < 2.5s | Lighthouse |
| Kanban board (1000 tasks) | < 1s render | React Profiler |
| GitHub webhook processing | < 5s end-to-end | BullMQ metrics |

### Scalability
- Stateless API servers (scale horizontally)
- Redis pub/sub cho Socket.io scaling (nhiều instance)
- DB connection pooling: PgBouncer hoặc Prisma connection limit

### Security
- HTTPS everywhere (cert từ Let's Encrypt)
- Helmet.js headers (CSP, HSTS, X-Frame-Options)
- SQL injection: Prisma parameterized queries
- XSS: sanitize Markdown output (DOMPurify)
- CSRF: SameSite cookie + CORS whitelist
- Rate limiting:
  - Auth endpoints: 5 req/15min/IP
  - API endpoints: 100 req/min/user
  - GitHub webhook: không limit (verified bằng signature)
- Input validation: Zod schemas mọi endpoint
- File upload: type whitelist, size limit 10MB, scan virus (ClamAV nếu cần)

### Reliability
- Health check endpoint: GET /health (DB + Redis connectivity)
- Graceful shutdown: drain connections trước khi stop
- Error tracking: Sentry (frontend + backend)
- Uptime target: 99.5% (downtime < 3.6h/tháng cho solo project)

### Observability
- Structured logging: Pino (JSON format, log levels)
- Request ID: mỗi request có unique ID, trace qua logs
- BullMQ dashboard: Bull Board UI tại /admin/queues
- DB query monitoring: log slow queries > 100ms

---

## 10. TECH STACK & LÝ DO CHỌN

### Architecture Decision Records (ADR)

**ADR-001: Fastify thay vì Express**
- Lý do: Fastify nhanh hơn Express ~2x (benchmark chính thức), built-in TypeScript support, schema validation tích hợp, JSON serialization nhanh hơn
- Trade-off: Ecosystem nhỏ hơn Express, ít tutorial hơn

**ADR-002: Prisma thay vì TypeORM**
- Lý do: Type safety tốt hơn, Prisma Client được generate, migration workflow rõ ràng, query builder trực quan hơn
- Trade-off: Không hỗ trợ raw query phức tạp tốt bằng TypeORM (dùng prisma.$queryRaw khi cần)

**ADR-003: BullMQ thay vì xử lý webhook synchronous**
- Lý do: GitHub yêu cầu response trong 10s, webhook processing có thể tốn > 10s; queue đảm bảo reliability, retry, visibility
- Trade-off: Thêm complexity, cần Redis

**ADR-004: Fractional Indexing cho sort order**
- Lý do: Tránh reindex toàn bộ list khi drag&drop, O(1) insert thay vì O(n) reindex
- Trade-off: Cần background job reindex khi gap quá nhỏ

**ADR-005: PostgreSQL full-text search thay vì Elasticsearch**
- Lý do: Đủ dùng cho scale hiện tại, không cần maintain thêm service, tìm kiếm trong 1 workspace không cần distributed search
- Trade-off: Kém hơn Elasticsearch về fuzzy search, relevance ranking phức tạp

---

## 11. ROADMAP & MILESTONES

### Milestone 1 — Foundation (Tuần 1–4)
**Goal:** Auth + Workspace + Project CRUD hoạt động, deploy được

- [ ] Setup monorepo (pnpm + Turborepo)
- [ ] Setup Docker Compose (postgres, redis, api, web)
- [ ] Database schema + Prisma setup + seed data
- [ ] GitHub Actions CI pipeline (lint + test + build)
- [ ] Auth module: register, login, refresh, logout
- [ ] GitHub OAuth login
- [ ] Workspace CRUD + member management
- [ ] Project CRUD
- [ ] Deploy lần đầu lên VPS/Railway

**Definition of Done:** Có thể đăng ký, tạo workspace, tạo project, invite member

---

### Milestone 2 — Core Task Management (Tuần 5–8)
**Goal:** Kanban board đầy đủ, real-time sync

- [ ] Task CRUD với đầy đủ fields
- [ ] Kanban board với drag & drop (dnd-kit)
- [ ] Optimistic UI update + conflict resolution
- [ ] Socket.io real-time sync
- [ ] Comment system + @mention
- [ ] Label management
- [ ] Task search (full-text)
- [ ] RBAC middleware
- [ ] Unit test: auth + task module (>70% coverage)

**Definition of Done:** Team có thể dùng Taskflow thay Trello cho project thật

---

### Milestone 3 — GitHub Integration (Tuần 9–12)
**Goal:** Task tự cập nhật theo GitHub activity

- [ ] GitHub App setup + installation flow
- [ ] Webhook endpoint + signature verification
- [ ] BullMQ setup + webhook processing workers
- [ ] Branch → task status sync
- [ ] PR → task status sync
- [ ] Commit tracking
- [ ] Idempotency (Redis)
- [ ] Dead letter queue + retry UI
- [ ] Integration test: webhook flow end-to-end

**Definition of Done:** Tạo branch `feat/TF-001-...` → task tự chuyển In Progress

---

### Milestone 4 — Advanced Features (Tuần 13–16)
**Goal:** Differentiating features hoàn chỉnh

- [ ] Sprint management + burndown chart
- [ ] Time tracking + Pomodoro timer
- [ ] Focus mode UI
- [ ] Dependency graph (React Flow)
- [ ] Circular dependency detection
- [ ] Notification system (in-app + email)
- [ ] Redis caching (task lists, burndown)
- [ ] Performance: index optimization + query analysis

**Definition of Done:** Tất cả tính năng trong Epic 5–8 hoạt động

---

### Milestone 5 — AI Layer (Tuần 17–20)
**Goal:** AI features tăng giá trị thực tế

- [ ] AI task breakdown (Gemini API)
- [ ] Smart assign suggestion
- [ ] Sprint summary generation
- [ ] Prompt engineering + testing
- [ ] Rate limiting AI endpoints
- [ ] Fallback khi AI API unavailable

---

### Milestone 6 — Production-ready (Tuần 21–24)
**Goal:** Sẵn sàng để show trong interview

- [ ] E2E test với Playwright (5 critical flows)
- [ ] Load test với k6 (1000 concurrent users)
- [ ] Security audit (OWASP Top 10 checklist)
- [ ] Sentry integration (error tracking)
- [ ] Performance optimization (LCP < 2.5s)
- [ ] Nginx config: SSL, compression, caching static assets
- [ ] Architecture diagram (Excalidraw)
- [ ] README đầy đủ (setup local trong 1 command)
- [ ] Landing page (Next.js, giới thiệu sản phẩm)
- [ ] Demo video (2–3 phút, screen recording)

---

## 12. RISK & MITIGATION

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| GitHub API rate limit | Medium | High | Cache GitHub data, exponential backoff, webhook thay vì polling |
| Scope creep | High | High | Freeze scope per milestone, backlog mọi ý tưởng mới |
| Real-time sync phức tạp hơn dự kiến | Medium | Medium | Start simple (broadcast all), optimize sau |
| AI API cost vượt budget | Low | Medium | Cache AI responses, rate limit per user, dùng Gemini Flash (rẻ hơn) |
| Solo developer burnout | High | High | Time-box mỗi task, celebrate milestone nhỏ, đừng perfectionism |
| Dependency conflict trong monorepo | Low | Low | Pin version, dùng pnpm resolution |

---

## APPENDIX

### Conventional Commits Convention
```
feat(task): add drag and drop to kanban board
fix(auth): refresh token not rotating correctly
chore(deps): update prisma to 5.10.0
test(github): add webhook processing integration test
docs(api): update task endpoint documentation
perf(db): add index on tasks(project_id, status)
refactor(socket): extract room management to separate module
```

### Branch Naming Convention
```
feat/{task-id}-{short-description}     feat/TF-042-kanban-drag-drop
fix/{task-id}-{short-description}      fix/TF-055-refresh-token-bug
chore/{description}                    chore/update-dependencies
release/{version}                      release/v1.2.0
```

### Environment Variables
```bash
# API
DATABASE_URL=postgresql://user:pass@localhost:5432/taskflow
REDIS_URL=redis://localhost:6379
JWT_SECRET=...
JWT_REFRESH_SECRET=...
GITHUB_APP_ID=...
GITHUB_APP_PRIVATE_KEY=...
GITHUB_WEBHOOK_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
GEMINI_API_KEY=...
SMTP_HOST=...
SMTP_USER=...
SMTP_PASS=...
R2_ACCOUNT_ID=...
R2_ACCESS_KEY=...
R2_SECRET_KEY=...
R2_BUCKET=...
SENTRY_DSN=...

# Web
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
NEXT_PUBLIC_SENTRY_DSN=...
```
