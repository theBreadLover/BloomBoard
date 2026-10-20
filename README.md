# BloomBoard

A personal web app to track your side projects: status, todos, notes, a work timer, and (soon) a
GitHub source code viewer and daily work-habit notifications.

## Running it on your machine

BloomBoard uses **pnpm**, **Node.js 22.12 or newer**, and **Next.js 16**.

Install the dependencies and start the development server:

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`. You'll be redirected to `/login` until you sign in. Once signed in,
select a project card to open its detail page.

## Testing and verification

BloomBoard uses **Vitest** for unit tests and **React Testing Library** for component tests.

Run the complete test suite once:

```bash
pnpm test
```

Run tests in watch mode while developing:

```bash
pnpm test:watch
```

Run type checking followed by a production build:

```bash
pnpm verify
```

Tests are colocated with their source modules:

```text
src/
  lib/
    dateUtils.ts
    dateUtils.test.ts
  components/
    StatusBadge.tsx
    StatusBadge.test.tsx
```

Pure **TypeScript tests** use the Node environment by default. **React component tests** that
require browser APIs opt into **jsdom** at the top of the test file:

```ts
// @vitest-environment jsdom
```

## What's included right now

- **Real persistence via Supabase** — projects, todos, and notes are stored in Postgres and
  protected by Row Level Security.
- **Email-and-password authentication** through Supabase, including email verification and protected
  routes that redirect signed-out visitors to `/login`.
- The **project list screen** at `/`: status filters (including a hidden-by-default "Abandoned"
  filter), a progress bar per project, "last touched" timestamps, and a working **+ New** form to
  create real projects.
- The **project detail screen** at `/project/[id]`: a clickable status switcher, a real todo list
  (add/check off tasks), a day-grouped notes timeline (notes optionally tagged to a todo), a
  Source Code tab placeholder, and a work timer button.
- The work timer counts up live but doesn't persist anywhere yet — that's the next step below.

## What's next (in build order)

1. **Work timer persistence** — start/stop timer per project, actually logging sessions to your account
   instead of just counting up in memory
2. **GitHub file browser** — read-only code viewing for a linked repo
3. **Push notifications** — a daily check for "did I work an hour today?", using the logged work
   sessions
4. **PWA packaging** — installable on your phone's home screen and your laptop

## Project structure

```text
src/
  middleware.ts               - refreshes the Supabase session and redirects signed-out visitors
  app/
    layout.tsx                - root layout (shared page shell + brand header)
    page.tsx                  - home page: loads real projects/tasks from Supabase
    project/[id]/page.tsx     - project detail page: loads one project's real tasks/notes
    actions.ts                - Server Actions: every write (create/update) goes through here
    login/
      page.tsx                - the email-and-password sign-in form
      actions.ts              - handles authentication actions
    auth/callback/route.ts    - exchanges an email-verification code for a session
  types/project.ts            - shared TypeScript types and status display metadata
  lib/
    auth/
      redirectPath.ts         - validates callback redirect destinations
      redirectPath.test.ts    - redirect-path security regression tests
    supabase/
      client.ts               - Supabase client for the browser
      server.ts               - Supabase client for Server Components/Actions
      queries.ts              - read functions (getProjects, getProjectById, etc.)
    projectStats.ts           - computeProjectProgress helper
    projectStats.test.ts      - project-progress unit tests
    dateUtils.ts              - note day-grouping and timer duration formatting
    dateUtils.test.ts         - date and duration regression tests
  components/
    StatusBadge.tsx           - the color-coded status pill
    StatusBadge.test.tsx      - status badge component tests
    ProjectCard.tsx           - a single project row in the list, links to its detail page
    ProjectList.tsx           - the filterable list screen (client component)
    NewProjectForm.tsx        - the "+ New" button that expands into a create-project form
    ProjectDetailView.tsx     - the real detail screen (status, todos, notes, timer)
    AppHeader.tsx             - sticky brand bar + sign-out button
  test/
    setup.ts                  - shared Testing Library matchers
```
