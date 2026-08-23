# Neon Spore

Two-player co-op game. Two people, two devices, two different views. Talking is
not a help, it is the control scheme. Portrait mobile web.

Set in space; the nearest comparable game is Spaceteam. **Nothing the players
control travels the field** — no flight, thrust, dodge or jump. There is a
fixed hull, a cannon that slides along it, and a shield. The forms are blobs
and slimes: closed contours with lobes (`blobPath`, `hullRadiusMul`).

## The rules that are not negotiable

1. **`packages/sim` never imports `packages/render`.** State flows one way.
2. **Nothing in `sim` or `content` may use `Math.random`, `Date.now`,
   `performance.now`, `window` or `document`.** Randomness comes from the seeded
   `Rng`, time comes from the tick counter. This is what makes lockstep possible.
3. **The simulation stores integers.** Sub-tile values live in thousandths.
   Two devices must never disagree about a rounding step.
4. **The game never reads a microphone and never evaluates speech.** Any
   mechanic that would need to know whether something was said is out of scope.

Rules 1 and 2 are enforced by `packages/sim/test/purity.test.ts`, not by good
intentions: it scans every file in `sim` and `content` and fails on a wall
clock, a random number, a DOM global or an import of `render`. Run `bun test`.
Style and formatting are Biome's job: `bun run lint`, `bun run format`.

## Git

Work on `main`, directly. No feature branches, no pull requests — one person
works on this repo, so a branch is a detour with no reviewer at the end of it.
Do not branch before committing.

**Commit when the work is done, without being asked.** Finishing a task
includes committing it. Do not ask permission, and do not leave finished work
sitting in the working tree.

Four conditions, all of them:

1. `bun run check` passes. Never commit a red tree.
2. The work is actually finished. Mid-task, or blocked on a question, means no
   commit — say what is outstanding instead.
3. Stage **only the files this task touched**, by path. Never `git add -A`:
   another session or an editor may have unrelated work in the tree.
4. One commit per coherent change. Unrelated work that was already lying in the
   tree gets its own commit, or none.

Say what was committed. Do not push unless asked.

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
- Silhouettes are judged through `tools/shape-sheet`, not by screenshotting
  the running game. `bun run shapes:report` prints the geometry as numbers —
  reach for that first, since most shape work is nudging a parameter and asking
  whether the result is more or less than before. `bun run shapes` regenerates
  the still and the motion sheet for the questions that need an eye.
- Files stay under ~250 lines. Split rather than grow.
- Code, identifiers and commits in English. The design vocabulary
  (hull, lobe, beat, guard) is fixed — do not invent synonyms.
