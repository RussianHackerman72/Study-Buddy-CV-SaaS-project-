# Study Buddy / Task Manager — Phase 2 Build Spec

**How to use this doc:** Same as Phase 1 — paste into Claude Code as the brief, work milestones in order, keep each one committable before moving on. Phase 1 (auth, task/subtask/tag CRUD, list view, search, archive) is done and deployed; this phase builds on top of it.

## 1. Goal

Turn the working task manager into something that actually feels like a product: a Kanban board, a calendar view, recurring tasks, notes, reminders, a simple dashboard, and a couple of starter templates.

## 2. Scope

**Build:**

- Kanban board view (drag-and-drop between TODO / IN_PROGRESS / DONE)
- Calendar view (month grid showing tasks by due date)
- Recurring tasks (daily / weekly / monthly)
- Notes: both a note field on tasks, and standalone notes unrelated to any task
- Reminders: in-app notification for tasks due soon/overdue, plus optional email reminder
- Simple dashboard: tasks completed this week, overdue count, upcoming due dates
- 2 starter templates: "Exam Prep" and "Weekly Planner" (pre-built task + subtask sets)

**Still out of scope** (Phase 3+): AI features, focus mode/Pomodoro, heatmaps and advanced analytics, habit tracking, collaboration, offline mode, native mobile app, real device-calendar sync (two-way sync with Google/Apple Calendar is a Phase 3+ problem — if you want a taste of it now, an ICS export button is the cheap version, see Milestone 4).

## 3. New Tech

| Need                 | Choice                                                   | Why                                                                                                                        |
| -------------------- | -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Kanban drag-and-drop | `@dnd-kit/core` + `@dnd-kit/sortable`                    | react-beautiful-dnd is dead, dnd-kit is the current standard                                                               |
| Recurring task math  | `rrule`                                                  | Don't hand-roll recurrence logic                                                                                           |
| Calendar grid        | Build it yourself with `date-fns`                        | You already have date-fns; a full calendar library (FullCalendar etc.) is overkill for "show tasks on the day they're due" |
| Email reminders      | Vercel Cron + Resend                                     | Cron hits a route once a day/hour, Resend sends the email. Free tiers cover this easily                                    |
| In-app notifications | Just a query against due dates, rendered as a bell/badge | No need for a push service yet                                                                                             |

## 4. Data Model Additions

```prisma
// Add to Task model:
model Task {
  // ...existing fields...
  notes             String?   // freeform notes on the task itself
  recurrenceRule    String?   // RRULE string, e.g. "FREQ=WEEKLY;BYDAY=MO"
  recurrenceEndDate DateTime?
  seriesId          String?   // groups instances generated from the same recurrence
}

// New standalone model:
model Note {
  id        String   @id @default(cuid())
  title     String
  content   String   // markdown
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  userId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

Add `notes Note[]` to the `User` model. Templates do **not** need a DB model — define them as a small JSON/TS array of `{ title, subtasks: string[] }` blueprints; a "Use template" button just creates a task + subtasks from the blueprint. No point over-engineering that.

## 5. Build Checklist

### Milestone 1 — Kanban Board

- [ ] Install `@dnd-kit/core`, `@dnd-kit/sortable`
- [ ] `/dashboard/board` view: three columns (TODO / IN_PROGRESS / DONE) reading existing `status` field
- [ ] Drag task between columns updates `status`; drag within a column updates `order`
- [ ] List view and board view both reflect the same underlying data (no separate state)
- [ ] **Done when:** dragging a card between columns persists after a refresh

### Milestone 2 — Recurring Tasks

- [ ] Install `rrule`
- [ ] Add recurrence picker to the task form (none / daily / weekly / monthly)
- [ ] On completing a recurring task, generate the next instance (same `seriesId`, new due date via `rrule`)
- [ ] Recurring tasks show a repeat icon in list/board/calendar views
- [ ] **Done when:** completing a daily task creates tomorrow's instance automatically

### Milestone 3 — Notes

- [ ] Add a notes field/tab to the task edit dialog (uses new `Task.notes`)
- [ ] New `/dashboard/notes` section: standalone notes, CRUD, markdown rendering
- [ ] Notes list is searchable (reuse the debounced search pattern from Phase 1)
- [ ] **Done when:** a note can be created, edited, and found via search, independent of any task

### Milestone 4 — Calendar View

- [ ] `/dashboard/calendar`: month grid (build with `date-fns`), tasks rendered on their due date
- [ ] Click a day to see/add tasks due that day
- [ ] Month navigation (prev/next)
- [ ] "Export to calendar" button generating a `.ics` file for a task or the full list (cheap alternative to real sync)
- [ ] **Done when:** a task created with a due date shows up on the correct day in the grid

### Milestone 5 — Reminders

- [ ] In-app: badge/list of tasks due today or overdue, visible from the dashboard header
- [ ] Vercel Cron route (daily) that queries tasks due within 24h and sends a summary email via Resend
- [ ] Per-user setting to opt in/out of email reminders (simple boolean on `User`)
- [ ] **Done when:** a task due tomorrow triggers an email the next time the cron runs, and shows up in the in-app badge today

### Milestone 6 — Simple Dashboard

- [ ] `/dashboard/overview` (or make it the default `/dashboard` landing): tasks completed this week, overdue count, upcoming 7 days
- [ ] Basic counts only — no charts/heatmaps yet, that's Phase 4
- [ ] **Done when:** numbers update correctly after completing/creating tasks

### Milestone 7 — Templates

- [ ] Define 2 templates in code: "Exam Prep" (e.g. subtasks: review notes, practice problems, past papers, sleep) and "Weekly Planner" (one task per weekday)
- [ ] "New from template" button on the dashboard, prompts for a due date/title override, creates the task(s)
- [ ] **Done when:** using a template produces the right task + subtasks in one click

### Milestone 8 — Regression + Deploy

- [ ] Confirm Phase 1 flows (CRUD, tags, search, archive) still work with schema changes
- [ ] Update Vitest coverage for recurrence date math (this is the part most likely to have bugs)
- [ ] Extend the Playwright smoke test or add one for the Kanban drag flow
- [ ] Migrate prod DB, redeploy, smoke-test on the live URL
- [ ] **Done when:** CI is green and the live app has all Phase 2 features working

## 6. Definition of Done for Phase 2

A user can view their tasks as a board or a calendar, set a task to repeat and have the next instance appear automatically, attach notes to a task or keep a standalone note, get an in-app and email nudge before something's due, see a basic weekly summary, and spin up a pre-built task set from a template — all on the live deployed app, with CI still green.
