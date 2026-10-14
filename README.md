# BloomBoard

A personal web app to track your side projects: status, todos, notes, a work timer, and (soon) a
GitHub source code viewer and daily work-habit notifications.

## Running it on your machine

This project uses **pnpm** as its package manager and **Next.js 16** (currently a canary release),
which needs **Node.js 20.9 or newer**. Then:

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000 — you'll be redirected to `/login` until you sign in (see the Supabase
setup section above if you haven't yet). Once signed in, click any project card to open its detail
page.

To type-check without running the dev server:

```bash
pnpm typecheck
```

## What's included right now

- The full Next.js (App Router) + TypeScript + Tailwind scaffold, styled with the BloomBoard dark
  pink theme.
- **Real persistence via Supabase** — projects, todos, and notes are stored in Postgres and
  protected by Row Level Security.
- **Passwordless sign-in** (`/login`) via Supabase magic-link email; every route redirects there
  until you're signed in.
- The **project list screen** at `/`: status filters (including a hidden-by-default "Abandoned"
  filter), a progress bar per project, "last touched" timestamps, and a working **+ New** form to
  create real projects.
- The **project detail screen** at `/project/[id]`: a clickable status switcher, a real todo list
  (add/check off tasks), a day-grouped notes timeline (notes optionally tagged to a todo), a
  Source Code tab placeholder, and a work timer button.
  - The work timer counts up live but doesn't persist anywhere yet — that's the next step below.

## What's next (in build order)

1. **Work timer persistence** — start/stop timer per project, actually logging sessions to the
   `work_sessions` table instead of just counting up in memory
2. **GitHub file browser** — read-only code viewing for a linked repo, via a Next.js API route
3. **Push notifications** — a daily check for "did I work an hour today?", using the logged work
   sessions
4. **PWA packaging** — installable on your phone's home screen and your laptop

## Project structure

```
src/
  middleware.ts               - refreshes the Supabase session and redirects signed-out visitors
  app/
    layout.tsx                - root layout (shared page shell + brand header)
    page.tsx                  - home page: loads real projects/tasks from Supabase
    project/[id]/page.tsx     - project detail page: loads one project's real tasks/notes
    actions.ts                - Server Actions: every write (create/update) goes through here
    login/
      page.tsx                 - the magic-link sign-in form
      actions.ts                - sends the magic-link email
    auth/callback/route.ts    - exchanges the magic-link code for a real session
  types/project.ts            - shared TypeScript types and status display metadata
  lib/
    supabase/
      client.ts                 - Supabase client for the browser
      server.ts                 - Supabase client for Server Components/Actions
      queries.ts                 - read functions (getProjects, getProjectById, etc.)
    projectStats.ts            - computeProjectProgress helper
    dateUtils.ts                - note day-grouping and timer duration formatting
  components/
    StatusBadge.tsx             - the color-coded status pill
    ProjectCard.tsx             - a single project row in the list, links to its detail page
    ProjectList.tsx             - the filterable list screen (client component)
    NewProjectForm.tsx          - the "+ New" button that expands into a create-project form
    ProjectDetailView.tsx       - the real detail screen (status, todos, notes, timer)
    AppHeader.tsx               - sticky brand bar + sign-out button
```