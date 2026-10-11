# Project Tracker (Next.js)

A personal web app to track your side projects: status, todos, notes, a work timer, and (soon) a
GitHub source code viewer and daily work-habit notifications.

## This replaces the earlier Vite scaffold

We switched to Next.js for built-in file-based routing (`/project/[id]`) and so later steps —
GitHub API calls, the daily notification check — can live in Next.js API routes alongside the UI,
instead of a separate backend project.

## Running it on your machine

You'll need Node.js 18+ installed. Then:

```bash
npm install
npm run dev
```

Open http://localhost:3000. Click any project card to navigate to its (stub) detail page.

To type-check without running the dev server:

```bash
npm run typecheck
```

## What's included right now

- The full Next.js (App Router) + TypeScript + Tailwind scaffold
- The core data model (`src/types/project.ts`): `Project`, `ProjectTask`, `ProjectNote`, `WorkSession`
- The **project list screen** at `/`, with status filters, a progress indicator per project, and
  "last touched" timestamps — wired to sample data in `src/lib/mockData.ts`
- A **stub project detail page** at `/project/[id]`, reached by clicking a card

## What's next (in build order)

1. **Project detail screen** — real todo list + notes timeline for a selected project
2. **Supabase backend** — real data storage instead of `mockData.ts`, so your projects persist
   and sync across your phone and laptop
3. **Work timer** — start/stop timer per project, feeding a daily activity log
4. **GitHub file browser** — read-only code viewing for a linked repo, via a Next.js API route
5. **Push notifications** — a daily check for "did I work an hour today?"
6. **PWA packaging** — installable on your phone's home screen and your laptop

## Project structure

```
src/
  app/
    layout.tsx              - root layout (shared page shell)
    page.tsx                - home page: loads data, renders the list
    project/[id]/page.tsx   - project detail page (stub for now)
  types/project.ts          - shared TypeScript types and status display metadata
  lib/mockData.ts           - placeholder sample data (swapped for Supabase later)
  components/
    StatusBadge.tsx          - the color-coded status pill
    ProjectCard.tsx          - a single project row in the list, links to its detail page
    ProjectList.tsx          - the filterable list screen (client component)
```
