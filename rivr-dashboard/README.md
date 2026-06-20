# CareerMap AI — Dashboard

> The React frontend for CareerMap AI — an AI-powered resume analysis, cover letters, interview prep, and career coaching platform, wrapped in a calm glassmorphism UI.

## Overview

A production landing page for the CareerMap AI platform — a tool that helps job-seekers analyze resumes against ATS systems, draft cover letters, prep for interviews, optimize LinkedIn profiles, and chat with an AI career coach.

Built with React 19 + TypeScript + Vite 8 + Tailwind CSS v4 + Motion (`motion/react`), styled around the same light glassmorphism design language used by the Streamlit app (frosted glass surfaces, navy accents, animated keyframes, Inter typography).

## Features

- **Five Tool Cards** — Resume Analyzer, Smart Letters, Interview Prep, Resume Builder, AI Copilot
- **Expandable Reference Menus** — accordion groups for Resources, Stack, Open Source
- **Glassmorphism UI** — frosted white surfaces, navy palette, soft shadows, animated micro-interactions
- **Accessible by default** — semantic HTML, ARIA labels, keyboard navigation, focus indicators, `prefers-reduced-motion` support
- **Production-grade setup** — TypeScript strict mode, Error Boundary, SEO metadata, Open Graph, manifest, robots.txt, sitemap
- **404 Page** — branded error view for unknown routes

## Tech Stack

- **Runtime**: React 19.2, React DOM 19.2
- **Build**: Vite 8 (rolldown) + Babel via `@vitejs/plugin-react` 6
- **Language**: TypeScript 6 (strict mode)
- **Styling**: Tailwind CSS v4 + custom CSS variables (`--bg`, `--primary`, `--glass-bg`, etc.)
- **Animation**: Motion (`motion/react`) + CSS keyframes
- **Icons**: lucide-react
- **Linting**: ESLint 10 + typescript-eslint 8

## Project Structure

```
rivr-dashboard/
├── public/
│   ├── favicon.svg          # branded favicon
│   ├── icons.svg            # legacy symbol library
│   ├── manifest.webmanifest # PWA manifest
│   ├── og-image.svg         # Open Graph preview image
│   ├── robots.txt           # crawler policy
│   └── sitemap.xml          # XML sitemap
└── src/
    ├── App.tsx              # root component w/ route guard
    ├── main.tsx             # entry point w/ Error Boundary
    ├── index.css            # theme + base utilities
    └── components/
        ├── Hero.tsx               # hero section
        ├── Navbar.tsx             # top navigation
        ├── HeroBadge.tsx          # animated badge
        ├── FeatureCards.tsx       # 5 tool cards
        ├── DropdownMenu.tsx       # accordion groups
        ├── Link.tsx               # typed <a> wrapper
        ├── ErrorBoundary.tsx      # render-error guard
        └── NotFound.tsx           # 404 page
```

## Getting Started

### Prerequisites

- Node.js 20+ with npm 10+

### Install

```bash
npm install
```

### Develop

```bash
npm run dev
```

Opens the Vite dev server at `http://localhost:5173` with hot module reload.

### Production Build

```bash
npm run build      # type-check + bundle to ./dist
npm run preview    # serve the built ./dist on http://localhost:4173
```

The build emits:
- Split chunks for `react`, `motion`, and `lucide-react` (smaller initial load)
- Source maps for debugging
- Minified CSS with code splitting
- A `<noscript>` fallback for users without JavaScript

## Scripts

| Command | What it does |
|---|---|
| `npm run dev`       | Start Vite dev server with HMR |
| `npm run build`     | Type-check and produce a production bundle in `dist/` |
| `npm run preview`   | Run the production build locally |
| `npm run lint`      | Run ESLint over the project |
| `npm run lint:fix`  | Run ESLint with `--fix` |
| `npm run type-check`| Pure TypeScript type-check, no emit |

## Design System

All theme tokens are defined in `src/index.css` under `:root`. They match the production Streamlit app's CSS exactly so the two experiences feel like one product:

| Token | Value |
|---|---|
| `--bg`              | `#f0f0f0` |
| `--primary`         | `#3b5dbf` |
| `--primary-dark`    | `#2a448a` |
| `--accent`          | `#2dd4bf` |
| `--text`            | `#1e2a3a` |
| `--text-muted`      | `#5a6478` |
| `--glass-bg`        | `rgba(255, 255, 255, 0.55)` |
| `--glass-blur`      | `blur(16px)` |
| `--radius-lg`       | `16px` |
| `--shadow-lg`       | `0 12px 32px rgba(30, 50, 90, 0.08)` |
| `--ease-out-expo`   | `cubic-bezier(0.16, 1, 0.3, 1)` |

Components use these CSS variables via inline `style` props or via Tailwind utility classes where applicable.

## Accessibility

- Semantic landmarks: `<main>`, `<nav>`, `<header>`, `<section>`, `<footer>` everywhere
- ARIA on interactive widgets: `aria-label`, `aria-expanded`, `aria-controls`, `aria-live`
- Keyboard navigation: focus returns to the trigger when an accordion is closed with `Escape`
- Focus indicators: 2px primary-color outline on `:focus-visible`
- Skip-screen-reader-only content: `.sr-only` utility class
- Reduced motion: every animation and transition neutralizes in `prefers-reduced-motion: reduce`
- Color contrast: navy-on-white and white-on-navy both meet WCAG AA

## SEO & Sharing

The `index.html` ships with:

- `<title>` and `<meta name="description">`
- Open Graph tags (`og:title`, `og:image`, `og:description`, `og:type`, `og:locale`)
- Twitter Card tags (`twitter:card`, `twitter:image`)
- Canonical `<meta name="robots" content="index, follow">`
- Theme color matching the page background
- `<link rel="manifest" href="/manifest.webmanifest">` for PWA installability
- `<link rel="preconnect">` hints for Google Fonts and Cloudinary
- `robots.txt` and `sitemap.xml` in `/public`
- Open Graph preview image (`/og-image.svg`) — 1200×630

Static assets served from `/public` are cached by GitHub Pages, Cloudflare Pages, Netlify, and most CDLs without changes.

## Errors & 404s

- `ErrorBoundary` (in `main.tsx`) catches all render errors and shows a clean recovery screen. It logs to the console in development only; in production it logs to whatever hook you pass via `onError`.
- 404s are detected via `window.location.pathname` in `App.tsx` — when the URL is anything other than `/`, the `NotFound` component renders.

## Future Work

- Hook up the actual AI providers (Groq, NVIDIA, OpenRouter, Gemini, Cerebras)
- React Router for multi-page navigation
- Server-side render for better SEO
- Storybook for component documentation
- Vitest + React Testing Library
- CI pipeline (GitHub Actions) for type-check, lint, and build

## License

See the root `app.py` Streamlit companion for license terms.
