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
- `package.json` — exports only `./tui` → `./src/index.tsx`; the four runtime
  dependencies are declared as peer dependencies so OpenCode reuses its own
  bundled instances (do not move them to `dependencies`).

## Commands

```bash
bun install        # install dev dependencies
bun run typecheck  # tsc --noEmit
bun test           # bun:test unit tests
bun run prepublishOnly
```

Always run `bun run typecheck` and `bun test` after changes; both must pass.

## Conventions

- TypeScript strict mode. Do not relax `strict`.
- JSX is Solid (`jsxImportSource: "solid-js"`); keep the `tsconfig.json` preset.
- All user-facing options must keep the documented defaults (see README table)
  and round-trip through `normalizeOptions` so unknown/partial configs are safe.
- Default behavior must stay byte-for-byte compatible with the original
  `session-elapsed` plugin behavior unless a default is explicitly changed.
- Keep `src/format.ts` free of Solid/TUI imports so it stays unit-testable.
- Do not add comments unless they explain a non-obvious decision.

## Gotchas

- `RGBA.fromHex` throws on invalid input — always guard color overrides with the
  `resolveColor` helper in `src/index.tsx`.
- `slot` options without a `session_id` prop (`home_prompt_right`, `app_bottom`)
  derive the session from `api.route.current`; timers render nothing when no
  session is active.
- `refreshMs` is clamped to a minimum of 250 ms in `normalizeOptions`.

## Publishing

- This repo's npm package name is `opencode-session-elapsed` (owner `siriscmv`).
- `npm publish` runs typecheck + tests automatically via `prepublishOnly`.
- Bump `package.json` `version` and tag the release before publishing; keep the
  version in sync with the GitHub release.
