# Retwho Admin v2

Retwho Admin v2 is the administrative dashboard for Retwho.com. It is built with Next.js App Router, TypeScript, and Tailwind CSS v4 to manage authentication flows, admin UI components, and shared platform utilities.

## Project Highlights

- Admin-first architecture with route groups and shared layout/providers.
- Auth module screens for login, forgot password, and reset password.
- Reusable UI system (button, input, select, modal, table, pagination, tooltip, and more).
- Theme-aware UI with light and dark design tokens.
- Quality gates with ESLint, Prettier, TypeScript checks, Husky, and lint-staged.

## Tech Stack

- Next.js 16
- React 19
- TypeScript 5
- Tailwind CSS 4
- Redux Toolkit
- React Hook Form + Zod
- Axios

## Folder Overview

```text
app/                        # App Router pages, layouts, and route groups
app/(auth)/                 # Auth pages (login, forgot-password, reset-password)
components/forms/           # Form-level reusable inputs/selects/textarea
components/ui/              # Design system components
components/providers/       # App-level providers (theme, auth, confirm)
lib/                        # API client, utilities, auth helpers
hooks/                      # Shared hooks
featured/                   # Redux store/hook setup
public/                     # Static assets
```

## Getting Started

1. Install dependencies

```bash
npm install
```

2. Start development server

```bash
npm run dev
```

3. Build for production

```bash
npm run build
```

4. Start production server

```bash
npm run start
```

## Available Scripts

- npm run dev: Run Next.js in development mode.
- npm run build: Create production build.
- npm run start: Run production server.
- npm run lint: Run ESLint with zero warnings allowed.
- npm run lint:fix: Auto-fix lint issues.
- npm run type-check: Run TypeScript checks without emit.
- npm run format: Format files with Prettier.
- npm run format:check: Verify formatting.

## Git Hooks (Husky)

This project uses Husky + lint-staged:

- pre-commit: runs lint-staged and TypeScript checks.
- commit-msg: validates commit message length.

If hooks are not running, execute:

```bash
npm run prepare
git config core.hooksPath .husky/_
```

Then verify:

```bash
git config --get core.hooksPath
```

Expected output:

```text
.husky/_
```

## Notes

- Theme tokens and global styles are in app/globals.css.
- Keep new UI components variant-safe for both light and dark modes.
- Prefer updating shared components in components/ui for consistency.
