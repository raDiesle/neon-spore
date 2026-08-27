# Neon Spore

A co-op game for **exactly two people on two separate devices**. Portrait,
mobile web.

You steer one fragile shell through a swarm of glowing creatures. Neither of
you sees everything, neither of you can operate everything. Almost every threat
needs both of you to act together or in a fixed order.

**The core sentence: talking is not a help, it is the control scheme.**

The nearest comparisons are Spaceteam and Lovers in a Dangerous Spacetime for
what the pair does minute to minute, and **It Takes Two and its successor Split
Fiction** for the shape of a run: co-op built out of short rounds that each
hand the two of you a different thing to hold. `docs/spec/interludes.md` is
what that would mean here.

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
bun run dev:game # http://localhost:3000
bun run check    # typecheck + lint + tests
```

Solo at a desk, one hand per role: `A`/`D` move the cannon and `I` triggers the
shield; `J`/`L` move the shield and `W`/`E` fire red and cyan. `→`/`←` step
between waves, `P` pauses.

The switch at the top of the screen decides what the screen *shows*: `P1` is
player 1's device, `P2` player 2's, `TEST` both halves plus the tuning panel.
The finished game is one role per device, so `P1` and `P2` are the honest
answer to how much room the field really gets.

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
