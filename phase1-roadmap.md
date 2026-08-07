# Study Buddy / Task Manager — Phase 1 Build Spec

**How to use this doc:** Paste this whole file into Claude Code as the starting brief (or point it at this file in the repo). Work through the milestones in order — each one should be a working, committable state before moving to the next. Don't jump ahead to anything in "Out of Scope."

## 1. Project Summary

A full-stack task manager SaaS app (personal use + CV project). Phase 1 goal: a deployed, usable app with auth, task CRUD, subtasks, tags, search, and archiving. No AI, no Kanban, no calendar — those come in later phases.

## 2. Tech Stack

| Layer                        | Choice                                           | Notes                                                                                                                                                               |
| ---------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework                    | Next.js 15 (App Router), TypeScript              |                                                                                                                                                                     |
| Styling                      | Tailwind CSS + shadcn/ui                         |                                                                                                                                                                     |
| Backend                      | Next.js Server Actions / Route Handlers          | No separate backend yet                                                                                                                                             |
| Database                     | PostgreSQL (Neon or Supabase)                    |                                                                                                                                                                     |
| ORM                          | Prisma                                           |                                                                                                                                                                     |
| Auth                         | Clerk                                            | Free tier (50k MAU) covers this project. If you'd rather self-host, use Better Auth instead — do not use NextAuth/Auth.js, it's in maintenance-only mode as of 2026 |
| Server state / data fetching | TanStack Query                                   |                                                                                                                                                                     |
| Client-only UI state         | React state / Zustand (only if needed)           | Don't reach for global state unless something is actually shared across distant components                                                                          |
| Dates                        | date-fns                                         |                                                                                                                                                                     |
| Deployment                   | Vercel                                           | Deploy from day one, not at the end                                                                                                                                 |
| Testing                      | Vitest (unit/API) + Playwright (1–2 smoke tests) | Minimal is fine — the point is to have _some_                                                                                                                       |

Do **not** use react-beautiful-dnd anywhere (deprecated/archived). It's not needed in Phase 1 anyway since Kanban is out of scope.

## 3. Phase 1 Scope

**Build:**

- Email/password + Google auth (via Clerk)
- Task CRUD: title, description, due date, priority, status
- Subtasks (simple checklist under a task)
- Tags: create, assign to tasks, filter by tag
- List view of tasks (sortable by due date / priority)
- Search across task titles/descriptions
- Archive completed tasks (and an archive view)
- Responsive layout (mobile + desktop browser)

**Explicitly out of scope for Phase 1** (do not build yet, but don't design against — see schema notes):
Kanban board, calendar view, recurring tasks, notes, notifications/reminders, templates, any AI feature, focus mode/Pomodoro, progress dashboard, habit tracking, collaboration/sharing, offline mode, native mobile app.

## 4. Data Model

```prisma
model User {
  id        String   @id @default(cuid())
  clerkId   String   @unique
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())

  tasks Task[]
  tags  Tag[]
}

model Task {
  id          String     @id @default(cuid())
  title       String
  description String?
  dueDate     DateTime?
  priority    Priority   @default(MEDIUM)
  status      TaskStatus @default(TODO)
  archived    Boolean    @default(false)
  order       Int        @default(0)
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  userId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  subtasks Subtask[]
  tags     TaskTag[]
}

model Subtask {
  id        String  @id @default(cuid())
  title     String
  completed Boolean @default(false)
  order     Int     @default(0)

  taskId String
  task   Task   @relation(fields: [taskId], references: [id], onDelete: Cascade)
}

model Tag {
  id    String @id @default(cuid())
  name  String
  color String @default("#6366f1")

  userId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  tasks TaskTag[]

  @@unique([userId, name])
}

model TaskTag {
  taskId String
  tagId  String
  task   Task @relation(fields: [taskId], references: [id], onDelete: Cascade)
  tag    Tag  @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([taskId, tagId])
}

enum Priority {
  LOW
  MEDIUM
  HIGH
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  DONE
}
```

Note: fields like `order` are included now so Kanban (Phase 2) doesn't require a migration. Recurring tasks, notes, and file attachments are deliberately **not** in this schema — they need their own tables/design in Phase 2 and shouldn't be guessed at now.

## 5. Build Checklist

### Milestone 0 — Project Setup

- [ ] `create-next-app` with TypeScript, Tailwind, App Router
- [ ] Install and configure shadcn/ui
- [ ] Set up ESLint + Prettier
- [ ] Init git repo, push to GitHub
- [ ] Connect repo to Vercel, confirm a blank deploy works
- [ ] **Done when:** empty app is live on a Vercel URL

### Milestone 1 — Database

- [ ] Create Neon or Supabase Postgres instance
- [ ] Install Prisma, add schema from Section 4
- [ ] Run first migration
- [ ] Add `lib/prisma.ts` singleton client
- [ ] **Done when:** `prisma studio` shows the tables against the live DB

### Milestone 2 — Auth

- [ ] Install and configure Clerk
- [ ] Add sign-up / sign-in / sign-out flows
- [ ] Protect app routes (redirect unauthenticated users)
- [ ] On first login, upsert a `User` row keyed by `clerkId`
- [ ] **Done when:** you can sign up, land on an empty dashboard, sign out, sign back in

### Milestone 3 — Task CRUD (backend)

- [ ] Server actions or route handlers: create, read (list), update, delete task
- [ ] Scope all queries to the logged-in user
- [ ] Zod validation on inputs
- [ ] **Done when:** you can hit these from a REST client / test script and see rows change in Prisma Studio

### Milestone 4 — Task UI (list view)

- [ ] Task list page wired to TanStack Query
- [ ] Create/edit task form (title, description, due date, priority, status) using shadcn form components
- [ ] Delete task with confirmation
- [ ] Sort by due date and by priority
- [ ] **Done when:** full create → view → edit → delete loop works in the browser, no page refresh needed

### Milestone 5 — Subtasks

- [ ] Add/remove subtasks within a task's detail view
- [ ] Toggle subtask completion
- [ ] Show subtask progress (e.g. "2/5") on the task card
- [ ] **Done when:** subtasks persist and reflect on the parent task card

### Milestone 6 — Tags

- [ ] Create tag (name + color)
- [ ] Assign/remove tags on a task
- [ ] Filter task list by tag
- [ ] **Done when:** filtering by a tag returns only matching tasks

### Milestone 7 — Search

- [ ] Search input filtering tasks by title/description (server-side query is fine, debounce the input)
- [ ] **Done when:** typing narrows the list within ~300ms, clears cleanly

### Milestone 8 — Archive

- [ ] "Archive" action on completed tasks (sets `archived: true`, excluded from main list)
- [ ] Separate `/archive` view listing archived tasks
- [ ] Unarchive action
- [ ] **Done when:** archiving a task removes it from the main list and it appears in `/archive`

### Milestone 9 — Polish + Deploy

- [ ] Responsive check on mobile viewport widths
- [ ] Empty states (no tasks yet, no search results)
- [ ] Loading and error states on all data fetches
- [ ] Final deploy to Vercel with production env vars set
- [ ] **Done when:** a stranger could sign up and use the app without you explaining anything

### Milestone 10 — Minimal Tests

- [ ] Vitest: unit test on at least the task validation logic
- [ ] Playwright: one smoke test — sign in, create a task, see it in the list
- [ ] **Done when:** `npm test` and `npx playwright test` both pass in CI (GitHub Actions)

## 6. Definition of Done for Phase 1

A logged-in user can create, edit, tag, subtask, search, archive, and delete tasks, on a live deployed URL, on both desktop and mobile browser widths, with no console errors, and at least one automated test protecting the core flow.
