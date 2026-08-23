# Neon Spore

A co-op game for **exactly two people on two separate devices**. Portrait,
mobile web.

You steer one fragile shell through a swarm of glowing creatures. Neither of
you sees everything, neither of you can operate everything. Almost every threat
needs both of you to act together or in a fixed order.

**The core sentence: talking is not a help, it is the control scheme.**

The game never reads a microphone and never evaluates speech. It only ever
processes inputs — which, from whom, at what local moment, in what order, in
which beat. Communication stays human, control stays digital.

## Status

Concept phase with one playable prototype, now being ported. Milestone 1: port
`legacy/raster-prototype.html` to TypeScript, split into simulation, rendering
and content. Milestone 2: two-device play.

## Running it

```bash
bun install
bun run dev      # http://localhost:3000
bun run check    # typecheck + lint + tests
```

Solo at a desk: `Q`/`E` move the cannon, `←`/`→` move the shield, `Space`
triggers the shield, `1`/`2` fire red and cyan.

## How it is built

| Path | |
|---|---|
| `packages/sim` | deterministic rules, headless, integers only |
| `packages/render` | draws a world, changes nothing |
| `packages/content` | creatures, waves, acts — data, not code |
| `apps/game` | the browser app |
| `apps/server` | Cloudflare Worker, lockstep relay (phase 2) |
| `docs/` | design and decisions — start at `docs/INDEX.md` |
| `legacy/` | the original prototypes and the German spec |

Two rules make the rest work: `sim` never imports `render`, and nothing in
`sim` uses `Math.random`, `Date.now` or the DOM. Both are enforced by a test
that scans the source, because determinism is what lets two devices play the
same game — and what lets the project be tested at all.

## Licence

See `LICENSE`. Public to read, not yet licensed for use.
