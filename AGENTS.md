# AGENTS.md

## Repo structure

```
frontend/   — Next.js 16 App Router (React 19, TypeScript, Tailwind CSS v4)
backend/    — empty placeholder
packages/   — empty placeholder
```

## Frontend commands (run from `frontend/`)

| Command | Action |
|---------|--------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint 9 (eslint-config-next core-web-vitals + typescript) |
| `npm start` | Start production server |

## Key config & quirks

- **Path alias**: `@/*` maps to `frontend/` (e.g., `@/components/Button`)
- **Tailwind**: v4, configured via `postcss.config.mjs` + `@import "tailwindcss"` in `globals.css`
- **TypeScript**: strict mode, `noEmit`, `moduleResolution: bundler`
- **ESLint**: `eslint.config.mjs` — flat config, ignores `.next/`, `out/`, `build/`, `next-env.d.ts`
- **No test framework configured** — add one before writing tests
- **No env files tracked** — `.env*` is in `.gitignore`
- **Next.js 16 docs**: bundled at `frontend/node_modules/next/dist/docs/`

## Per-package instruction files

- `frontend/AGENTS.md` — frontend-specific guidance
