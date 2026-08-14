# AGENTS.md

Guidance for AI agents working in this repository.

## What this is

`opencode-session-elapsed` is an OpenCode **TUI plugin**. It renders live timers
(session elapsed, cumulative work, response time) into a TUI slot. The plugin
module is loaded by OpenCode at runtime from the `./tui` export; there is no
server-side code and no build step for consumers.

## Project layout

- `src/index.tsx` — the plugin entrypoint. Default export is `{ id, tui }`.
  `src/index.tsx` also holds the Solid components and slot registration.
- `src/options.ts` — the `Options` type, defaults, and `normalizeOptions()`.
- `src/format.ts` — pure, unit-tested duration formatting (`compact`/`full`).
- `test/format.test.ts` — `bun:test` tests for `formatElapsed`.
- `tsconfig.build.json` — declaration-only config for `bun run build` (rooted at
  `src`, emits `.d.ts` into `dist/` next to the bundle).
- `scripts/transform.tsx` — runs `src/index.tsx` through Solid's own
  `transformSolidSource` (via `@opentui/solid`) so the emitted JSX is reactive.
- `dist/` — build output (gitignored, produced on publish).
- `package.json` — exports `./tui` → `./dist/index.js` (+ types); the four
  runtime dependencies are declared as peer dependencies so OpenCode reuses its
  own bundled instances (do not move them to `dependencies`).

## Commands

```bash
bun install        # install dev dependencies
bun run typecheck  # tsc --noEmit
bun test           # bun:test unit tests
bun run build      # bundle src/index.tsx to dist/index.js + emit .d.ts
```

Always run `bun run typecheck` and `bun test` after changes; both must pass.
Run `bun run build` before publishing or before manually testing the
`./tui` export from `node_modules`.

## Conventions

- TypeScript strict mode. Do not relax `strict`.
- JSX is Solid (`jsxImportSource: "@opentui/solid"`); keep the `tsconfig.json`
  preset.
- All user-facing options must keep the documented defaults (see README table)
  and round-trip through `normalizeOptions` so unknown/partial configs are safe.
- Default behavior must stay byte-for-byte compatible with the original
  `session-elapsed` plugin behavior unless a default is explicitly changed.
- Keep `src/format.ts` free of Solid/TUI imports so it stays unit-testable.
- Do not add comments unless they explain a non-obvious decision.

## Gotchas

- `src/index.tsx` must start with the `/** @jsxImportSource @opentui/solid */`
  pragma. The published plugin ships TSX that loads from `node_modules`, where
  opencode's Solid transform plugin does not run; without the pragma, Bun falls
  back to a default JSX runtime and the module fails to import, so opencode
  silently drops the plugin. Do not move it into tsconfig-only config.
- The published `./tui` entry must be the **precompiled** `dist/index.js`, never
  the raw `src/index.tsx`. opencode skips its Solid transform for files under
  `node_modules`, so Bun natively resolves the JSX-generated
  `@opentui/solid/jsx-dev-runtime` import as a real package and fails to find
  it. Never point `exports["./tui"]` at `./src/index.tsx`.
- The build must run the JSX through `transformSolidSource`, not Bun's own JSX
  transform. Bun compiles `{sessionElapsed()}` to a static child evaluated once,
  so timers render but never tick; Solid's transform emits `_$insert`/`_$memo`
  reactive bindings. `scripts/transform.tsx` + `bun build` in the `build`
  script is the only correct pipeline.
- `RGBA.fromHex` throws on invalid input — always guard color overrides with the
  `resolveColor` helper in `src/index.tsx`.
- `slot` options without a `session_id` prop (`home_prompt_right`, `app_bottom`)
  derive the session from `api.route.current`; timers render nothing when no
  session is active.
- `refreshMs` is clamped to a minimum of 250 ms in `normalizeOptions`.
