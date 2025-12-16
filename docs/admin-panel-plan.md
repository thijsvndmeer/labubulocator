# Local-Only Admin Panel Plan (File-Based Edits)

## Goals & Constraints
- Provide a localhost-only admin interface for updating all site content (theme colors, copy, layout options, card field visibility, variant metadata) without any remote hosting surface.
- Persist changes by **writing to source-controlled files** (TypeScript/JSON config modules) so the site updates after a rebuild; no database or runtime dynamic storage.
- Keep usage simple: run locally once, edit settings, and commit or leave the modified files as the new defaults.

## Configuration Targets (code-written outputs)
- `src/config/theme.config.ts`: palette tokens, gradients, typography scale, spacing, radii, and any Tailwind design tokens consumed by components.
- `src/config/content.config.ts`: structured text blocks (hero headings, footers, call-to-actions, FAQ entries, card labels, tooltips) keyed by route/section.
- `src/config/layout.config.ts`: layout switches (card variants, grid density, carousel/slider settings, header/footer toggles, conditional badges, sorting presets).
- `src/config/catalog.config.ts`: local CSV file path(s), variant field mappings, and feature toggles for which variant attributes appear on cards/pages.
- `src/config/navigation.config.ts`: menu links, footer nav, external resources, and locale switches.
- `src/config/feature-flags.ts`: boolean toggles for optional modules (e.g., affiliate buttons, stock status, price change chips).

## Admin UI Behavior
- Single-page route under `/admin` within the existing React app (only served while running locally via `npm run dev` / `npm run build && npm run preview`).
- Sections mirror the config targets: Theme, Copy, Layout, Catalog, Navigation, Feature Flags.
- Each section loads current values by importing the config modules at build-time and pre-filling the form state (no runtime DB calls).
- Provide “Generate preview” button that writes updated config files, triggers a Vite hot-reload (during `dev`), and shows the live site in an adjacent preview pane.
- Include reset-to-default controls using a checked-in `docs/admin-defaults/*.json` snapshot.

## File-Writing Mechanism (no database)
- Add a small local-only API (Node/Express or Vite dev server middleware) that receives form payloads and writes to the config files using `fs/promises` + Prettier for formatting.
- Guardrails: validate payloads with zod, keep type-safe shapes in shared `src/types/admin-config.ts`, and reject unknown keys to avoid arbitrary file writes.
- Apply updates by re-serializing config modules (TypeScript) from the validated JSON; prefer deterministic key ordering to keep diffs minimal.
- Store default seeds in `docs/admin-defaults/*.json` for one-click restore; these are read-only and never mutated by the API.

## Local-Only Access & Safety
- Bind the admin API only to `localhost` and reject non-loopback hosts; omit it entirely from production builds/exports.
- Require a per-session token set via `ADMIN_TOKEN` env var (checked server-side) to prevent drive-by edits on shared machines.
- Log every write (timestamp + file list) to `docs/admin-change-log.md` for traceability; optionally include a "git status" hint after updates.

## Implementation Steps
1) Create shared config shapes in `src/types/admin-config.ts` and seed config modules in `src/config/*.ts` with current defaults.
2) Add `docs/admin-defaults/*.json` snapshots and a helper script to regenerate them from the config modules.
3) Implement local-only write API that transforms validated payloads into formatted TypeScript modules (using Prettier and consistent exports).
4) Build `/admin` React UI with forms per section, preview pane, and reset/apply buttons that call the local API.
5) Wire the main site to read from the generated config modules (theme tokens into Tailwind/theme provider, content/layout toggles into cards/pages/routes).
6) Add documentation to `docs/admin-panel-plan.md` (this file) describing usage, safety, and how to commit resulting changes.
