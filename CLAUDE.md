# Neon Spore

Two-player co-op game. Two people, two devices, two different views. Talking is
not a help, it is the control scheme. Portrait mobile web.

## The rules that are not negotiable

1. **`packages/sim` never imports `packages/render`.** State flows one way.
2. **Nothing in `sim` or `content` may use `Math.random`, `Date.now`,
   `performance.now`, `window` or `document`.** Randomness comes from the seeded
   `Rng`, time comes from the tick counter. This is what makes lockstep possible.
3. **The simulation stores integers.** Sub-tile values live in thousandths.
   Two devices must never disagree about a rounding step.
4. **The game never reads a microphone and never evaluates speech.** Any
   mechanic that would need to know whether something was said is out of scope.

Rules 1 and 2 are enforced by ESLint, not by good intentions. Run `bun run lint`.

## Commands

```
bun install            # once
bun run dev            # game at localhost:3000, hot reload
bun test               # everything
bun run test:determinism
bun run check          # typecheck + lint + test, run this before saying "done"
```

## Where things live

| Path | Contains |
|---|---|
| `packages/sim` | deterministic rules, headless, no DOM |
| `packages/render` | draws a world, changes nothing |
| `packages/content` | creatures, waves, acts — data, not code |
| `apps/game` | the browser app: loop, input, HUD |
| `apps/server` | Cloudflare Worker, lockstep relay (phase 2) |
| `docs/` | the spec, split by topic — read `docs/INDEX.md` first |
| `legacy/` | the original prototypes. Reference only, never imported |

## Conventions

- Tunable numbers are named fields in `SimConfig`, never literals in the code.
- A new creature is one entry in `packages/content/src/creatures.ts`. Waves are
  not touched: a wave shows the union of its creatures' control groups.
- A new wave must pass the one-sentence test — if you cannot write
  `sentence`, the wave is padding. See `.claude/skills/new-wave`.
- Files stay under ~250 lines. Split rather than grow.
- Code, identifiers and commits in English. The design vocabulary
  (hull, lobe, beat, guard) is fixed — do not invent synonyms.
