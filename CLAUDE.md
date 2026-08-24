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

The history on `main` is linear. No pull requests, no merge commits, no
long-lived branches — one person works on this repo, so a review branch is a
detour with no reviewer at the end of it.

Worktrees are allowed, and are purely a working tool: a session running
alongside another one, or preparing a rebuild it might throw away, may create
one. The branch that comes with it is temporary. Before the task counts as
finished it is fast-forwarded or rebased onto `main`, then deleted along with
the worktree. A temporary branch is never pushed.

A fresh worktree needs `bun install`. `node_modules` must **not** be linked or
copied from the main tree: the workspace links inside it point at the main
tree's `packages/*` by absolute path, so a test there would run against
someone else's code.

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
bun run dev            # game at localhost:3000, hot reload — for a human
bun run preview        # build, then serve dist/ on 4173 — how an agent verifies
bun run preview:once   # same, on a free port that nobody else can be holding
bun test               # everything
bun run test:determinism
bun run check          # typecheck + lint + test, run this before saying "done"
```

## Delegating implementation

Mechanical work with a known file list is handed to the cheap worker instead of
being typed in the session: `.claude/skills/delegate` carries the procedure,
`docs/delegating.md` the reasoning. The test is whether `bun run check` can
decide the result. Judgement stays here — the sim/render boundary, couplings,
and anything whose criterion is whether it feels right.

## Verifying in a browser

`bun run preview`, never `bun run dev`. It builds first — `bun build` takes
about ten milliseconds, so there is nothing to save by skipping it — and serves
`apps/game/dist` on port 4173.

**The two ports are separate on purpose.** `bun run dev` is the human's, pinned
to 3000; `bun run preview` is the agent's, on 4173. They used to share 3000, and
a session that found a human's dev server sitting there got a preview that
refused to start and a browser check that quietly read the dev server instead —
a verified result taken off the wrong bundle, which is the one failure this
whole arrangement exists to prevent.

A dev server answers *any* path with `index.html`, so a 200 proves nothing about
which server replied. Before trusting a measurement, ask who it was:

```
curl -s http://localhost:4173/__preview
```

Only the preview answers `{"app":"neon-spore-preview",...}`. Anything else means
the number came off the wrong server and does not count.

`bun run preview:once` takes an OS-assigned free port instead of 4173 — for a
throwaway check, or a second worktree previewing beside this one. Several can
run at the same time without arranging anything.

Either way the server refuses to start next to a stranger, retires an older copy
of itself, and exits after fifteen minutes of silence, so a leaked one dies
without help.

Never start a server with a backgrounded shell command. Use the `game` entry in
`.claude/launch.json`, which runs exactly this.

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
- Anything drawn is drawn again in `packages/render/test/frame.test.ts`, which
  runs whole frames through a canvas that refuses what a real one refuses — an
  unparseable colour, a NaN coordinate, a negative radius. It is the only test
  that covers render/, and it catches the class of mistake a type check cannot:
  a value that is a perfectly good `string` and not a colour.
- Files stay under ~250 lines. Split rather than grow.
- Code, identifiers and commits in English. The design vocabulary
  (hull, lobe, beat, guard) is fixed — do not invent synonyms.
