# 🚀 Next.js Boilerplate 2026

A modern, high-performance frontend template built with **Next.js**, **TypeScript**, and **Tailwind CSS**. Designed for speed, scalability, and a premium developer experience.

## ✨ Key Features

- **App Router** - Latest Next.js features and patterns.
- **Dark Mode** - Built-in theme support with zero-flash implementation.
- **Strict Linting** - Pre-configured ESLint, Prettier, and Husky.
- **Optimized UI** - Minimal, black & white focused design system.

---

## 📂 Project Structure

```text
├── 📁 app/             # Application routes & layouts
├── 📁 components/      # UI & shared components
│   ├── 📁 ui/          # Atomic components (buttons, inputs)
│   └── 📁 providers/   # Context & high-level providers
├── 📁 hooks/           # Custom React hooks
├── 📁 lib/             # Utilities (cn, formatting, API)
├── 📁 public/          # Static assets (images, fonts)
└── 📁 types/           # Global TypeScript definitions
```

---

## 🛠️ Getting Started

1. **Install Dependencies:**

   ```bash
   npm install
   ```

2. **Run Development Server:**

   ```bash
   npm run dev
   ```

3. **Production Build:**
   ```bash
   npm run build
   ```

---

## 🎨 Theme Configuration

Colors are centralized in `app/globals.css` using CSS variables for both light and dark modes. Use Tailwind classes like `bg-primary`, `border-border`, or `text-foreground` to maintain consistency.

---

_Built with ❤️ for rapid development._
