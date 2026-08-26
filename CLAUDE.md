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
The same file carries a table of rules that must be **called, not re-derived** —
`mapCol` spelled out by hand is a second copy of where a creature lands, and it
will drift. Add a row when review catches one; that is how something that got
past review once stops getting past it twice.
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
bun run dev            # the wave editor at 4174, hot reload — for a human
bun run dev:once       # the same on a free port, beside one that is running
bun run dev:game       # the game at localhost:3000, hot reload — for a human
bun run preview        # build, then serve dist/ on 4173 — how an agent verifies
bun run preview:once   # same, on a free port that nobody else can be holding
bun test               # everything
bun run test:determinism
bun run relay:check    # two headless devices against a running relay
bun run delegate       # hand a spec to the worker: <spec> <files it may edit>
bun run check          # typecheck + lint + test, run this before saying "done"
```

## Delegating implementation

**Write it here, in as few turns as the work allows.** Delegation to the worker
model is a deliberate choice for a particular shape of task, not the default.

It used to be the default. That was measured on 25 August 2026 by building one
boss twice, and the arithmetic did not survive: delegating the same module cost
6.8 times as much, and 91.5% of that was the session, not the worker. Cost per
request is the same either way — what delegation multiplies is the *number* of
requests, because a delegated task is at least three round trips where writing
the code is one. `docs/delegation-cost.md` has the figures and the mechanism;
`docs/delegating.md` still holds the reasoning behind the machinery itself.

Reach for `bun run delegate` when the spec is genuinely much smaller than the
code — a uniform change across many files, a long mechanical file whose shape is
already decided, or a change you expect to need several failing rounds of
`bun run check`, where the retry loop is the point. Not for a small edit, a
test, a document, or anything whose spec would run as long as its code.
`.claude/skills/delegate` carries the criteria and the procedure. Say in the
report whether the work was delegated, and why.

**Deciding never goes over, and neither does reviewing.** The interface, the
constraint, the shape, which of two variants reads better, what is worth
building at all — that is the work, and no spec can carry it.

Friction in this arrangement is a bug in the task at hand, not a note for
later — a loop that burns tokens, an error that names the wrong cause, work
still being typed here that a command could have judged. Fix it in the same
turn. Every rough edge left standing is paid again on everything that follows.

## Verifying in a browser

`bun run preview`, never `bun run dev:game`. It builds first — `bun build` takes
about ten milliseconds, so there is nothing to save by skipping it — and serves
`apps/game/dist` on port 4173.

**The two ports are separate on purpose.** `bun run dev:game` is the human's, pinned
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

Only the preview answers `{"app":"neon-spore-preview",...}`, and it names the
checkout it is serving in `tree`. Anything else — a different app, or the right
app serving somebody else's tree — means the number came off the wrong server
and does not count.

**In a worktree the port may not be 4173.** A preview takes 4173 when it can,
retires a stale copy of *its own* tree, and steps aside onto a port derived
from the worktree's path when 4173 is held by a preview of another checkout —
`tools/ports.ts` decides, and the server prints the port and the tree it serves
on startup. So a session in a worktree reads the port out of the server's own
log rather than assuming it, and points the browser there. The director does
the same, from 4174.

The game opens straight onto the field. The **main menu** is behind `?menu` —
`http://localhost:<port>/?menu=1` — so that a hundred openings a day to look at
one wave are not a hundred taps through a title screen. The director links to
it; see `tools/director/README.md`.

`bun run preview:once` takes an OS-assigned free port instead of 4173 — for a
throwaway check, or a second worktree previewing beside this one. Several can
run at the same time without arranging anything.

Either way the server refuses to start next to a stranger, retires an older copy
of itself, and exits after 30 seconds of silence, so a leaked one dies
without help.

Never start a server with a backgrounded shell command. Use the `game` entry in
`.claude/launch.json`, which runs exactly this.

## Verifying the relay

`packages/net` is unit-tested against a wire the test controls, which proves the
scheduler and proves nothing about the Durable Object, the seat handout or the
order a socket actually delivers in. For that:

```
bun run --cwd apps/server dev     # wrangler; it prints the port
bun run relay:check               # two headless devices, same code the phone runs
bun run relay:check ws://127.0.0.1:8800 8 --split
```

`--split` reaches into one of the two worlds on purpose, to prove the desync
detector is watching and not merely present.

The relay's port belongs to its tree for the same reason the preview's does —
8787 in the main checkout, derived from the path in a worktree. Both the server
and the check work it out the same way, so neither needs to be told. `curl -s
http://127.0.0.1:<port>/net/health` says who answered.

Kill the wrangler process when the check is done.

## Where things live

| Path | Contains |
|---|---|
| `packages/sim` | deterministic rules, headless, no DOM |
| `packages/render` | draws a world, changes nothing |
| `packages/content` | creatures, waves, acts — data, not code |
| `apps/game` | the browser app: loop, input, HUD |
| `packages/net` | protocol, delayed lockstep, clock sync, desync ledger |
| `apps/server` | Cloudflare Worker, one Durable Object per room |
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
- **`world.beat`, `world.tick` and `world.nextId` are not monotonic.** A
  restart builds a fresh `World` and all three start again at 0, so render
  state cached against them is read by the next run as its own — that is how a
  crack came to show before the rock that made it. Anything in render/ that
  outlives a frame belongs in `Effects` and gets cleared in `Effects.reset()`,
  which `Canvas2DRenderer.waveRestarted` calls on every way a wave can start
  over. `packages/render/test/restart.test.ts` fails if a new field is added
  and not cleared; it is not optional bookkeeping.
- Files stay under ~250 lines. Split rather than grow.
- Code, identifiers and commits in English. The design vocabulary
  (hull, lobe, beat, guard) is fixed — do not invent synonyms.
