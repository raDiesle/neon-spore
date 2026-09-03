# Neon Spore

Two-player co-op game. Two people, two devices, two different views. Talking is
not a help, it is the control scheme. Portrait mobile web.

Set in space; the nearest comparable game is Spaceteam. **On the field,
nothing the players control travels** — no flight, thrust, dodge or jump.
There is a fixed hull, a cannon that slides along it, and a shield. The forms
are blobs and slimes: closed contours with lobes (`blobPath`, `hullRadiusMul`).

That rule is about the *field*, not about the game: it exists to keep the field
a place where two players talk about columns instead of dodging. An interlude
is a round with its own rules and its own picture, and one that moves a claw
along a rail violates nothing. See `docs/decisions.md` #21.

**This file is rules and commands.** The reasoning behind each one lives in
`docs/`, one hop away, named at the end of every section. Nothing here is
history; nothing here is an argument you have already accepted.

## The rules that are not negotiable

1. **`packages/sim` never imports `packages/render`.** State flows one way.
2. **Nothing in `sim` or `content` may use `Math.random`, `Date.now`,
   `performance.now`, `window` or `document`.** Randomness comes from the seeded
   `Rng`, time comes from the tick counter. This is what makes lockstep possible.
3. **The simulation stores integers.** Sub-tile values live in thousandths, in a
   field named with a `Milli` suffix. Two devices must never disagree about a
   rounding step.
4. **Every field of `World` is in `hashWorld`** unless it is one of the named
   exceptions in `hash.ts`. A field outside the fingerprint is a field that can
   desync two devices silently (`docs/decisions.md` #23).
5. **The game never reads a microphone and never evaluates speech.** Any
   mechanic that would need to know whether something was said is out of scope.

Rules 1–4 are enforced by tests, not by good intentions.
`packages/sim/test/purity.test.ts` scans every file in `sim` and `content` for a
wall clock, a random number, a DOM global or an import of `render`, and carries
a table of rules that must be **called, not re-derived** — `mapCol` spelled out
by hand is a second copy of where a creature lands, and it will drift. Add a row
when review catches one. `packages/sim/test/hash-coverage.test.ts` walks a
populated world field by field and fails on one the fingerprint does not notice.

Style and formatting are Biome's job: `bun run lint`, `bun run format`.

## Git

- **History on `main` is linear.** No pull requests, no merge commits, no
  long-lived branches. One person works on this repo.
- **Worktrees are a working tool**, and the branch that comes with one is
  temporary. A fresh worktree needs its own `bun install` — `node_modules` must
  **not** be linked or copied from the main tree.
- **Landing is one command: `bun run land`, from inside the lane's worktree.**
  It rebases onto `main`, runs `bun run check` on the result, fast-forwards,
  writes the release note, deletes the branch, sweeps spent worktrees and pushes
  `main`. Do not do any of that by hand, and do not skip a step because it looks
  done.
- **A finished lane lands itself.** The `Stop` hook `.claude/hooks/auto-land.sh`
  runs `bun run land` when a turn ends in a worktree that is clean and ahead of
  `main`, and prints a **LANDED!** badge in the chat. Uncommitted work is
  unfinished work and never lands; `NO_AUTO_LAND=1` turns it off for a session
  that wants to land by hand.
- **The rebase happens before the check, not after.** `bun run land` already
  orders it that way; a green check taken before the rebase is a result about a
  tree that no longer exists.
- **A defect found after landing is new work, and gets a new branch from
  `main`.** Never revive the landed branch.
- **Commit when the work is done, without being asked.** Four conditions, all of
  them: `bun run check` passes; the work is actually finished; you stage **only
  the files this task touched, by path** — never `git add -A`, because another
  session may have work in the tree; one commit per coherent change. Then say
  what was committed.
- Write the commit message well: `bun run land` turns its subject and first
  paragraph into the release note, and that is the only part of this anybody
  sees twice. Do not write a `Check:` trailer and do not ask the owner to
  confirm that something was tested.

Why any of that: `docs/git-and-landing.md`.

## Working in a cloud session

A session started from a phone clones `origin` and never sees this checkout.

- **It reads the remote, not the tree.** The hand-off is a push, not a save.
- **It pushes its own branch when done**, without being asked. Never a pull
  request.
- **It lands `main` itself, every turn**, when two conditions hold: the branch
  is already rebased onto the current `origin/main`, and `bun run check` is
  green on that rebased branch. If either fails, it pushes the branch and says
  so. Mid-task work is not committed and therefore cannot land.
- **It says which parts it could not verify, in the report, in that word.**
  `bun test` and the typecheck hold unaided; anything needing a wave watched at
  tempo, a shape sheet seen by an eye, or `bun run relay:check` is *unverified*
  and the report names it as a list of what to open.
- **Its servers need a host**: `PREVIEW_HOST=127.0.0.1`, `DIRECTOR_HOST=127.0.0.1`.
  Without it Bun reports `EADDRINUSE`, which is the wrong cause.
- **Two at once is the ceiling**, on different packages, each naming its branch
  in the prompt. Landings are serialised by a linear trunk whatever else runs.

The reasoning, and what a cloud session needs once it is running:
`docs/cloud-session.md`.

## A technical finding is queued; an idea is not

Three destinations, and a session decides between them without asking.

**A technical finding is always written down, in the same turn it is found.**
A refactor stepped around, a rule re-derived instead of called, a file grown
past ~250 lines, dead code, a slow path, a missing test, a document that no
longer describes the code, a tool that would have helped. It goes in
`docs/queue.md` as one `##` item — with the date, the branch, the files, and
what to do — and it is committed with the work that found it. Do not ask
first, do not weigh whether it is worth the owner's attention, and do not
settle for saying it in the report: the report scrolls away, and the next
session clones `origin` and sees only files. Then, in the same turn, offer it
as a background task, so one click gives it a session of its own.

The test for an entry is one question: **could a fresh session finish this
alone and prove it with `bun run check`?** That is what makes a queue safe to
keep — every item in it drains without the owner deciding anything.

**A queue item is worked by a session that has nothing else in it.**
`bun run queue` lists what is waiting, `bun run queue next` prints the first
item as a prompt to paste into a fresh session. That session does the item,
lands it, and removes the entry in the same commit
(`bun run queue done <n|title>`).

**An idea for the game is still not collected.** What the game could have and
does not — a creature, a mechanic, a control, a weapon, a boss, a round — is a
decision, and a decision drains only through the owner. It goes in `docs/spec/`,
which is what the director's `◇ NOT BUILT YET` sheet reads, next to the built
things it would sit beside. A *look* is offered in `tools/versus/` instead,
because the only way to choose one is to see it. Neither ever goes in the
queue: mixing decisions into a list is what buried the last one under
sixty-two entries only the owner could drain.

**Half-done work goes in `docs/parked.md`** — work already started and not
finished: a refactor abandoned when it grew, a test skipped with a reason, a
migration done in three files out of five. The next session is told only what
the commit messages say, and none of them say "the other half of this is still
undone". Write it in the same commit, in the same format the queue uses;
`bun run queue` lists parked work first, because it is the only kind that gets
harder while it waits. `tools/queue/test/queue.test.ts` holds both formats.

## A look is offered, never replaced

**Nothing run unattended changes what the game already draws.** A new colour, a
new animation, a rounder rock, a different fire opening: each is an
*alternative*, offered beside the shipped look, and the owner decides by
looking — the one thing no session can do.

**The test is what a player would see.** If a change would show up in a frame of
the running game, it is a look, and it goes to VERSUS
(`tools/versus/candidates/`) or to a NOT BUILT YET card, never straight onto the
field. A refactor, a speed fix, a test, a tool or the director is not a look and
lands as usual.

Three exemptions, and say in the commit which one you used:

- **A look the owner asked for by name.** That decision is already made.
- **A look with no shipped alternative.** Nothing is being replaced.
- **A fix to something wrong rather than unlovely.** A highlight glued to a
  spinning rock, a fringe off its body, a shape clipping its frame, a control
  under the status bar: these are defects, repaired rather than offered.

**A lane about to improve a look mid-task stops** and puts it in the report.
Why, in the owner's own words: `docs/looks.md`; the mechanism: `docs/versus.md`.

## Showing the owner something

**Send the picture. Do not describe it and do not ask them to open anything.**
When work changes something visible, attach the frame and say in one sentence
what to look at. It is never a question they have to answer.

**PNG, always. Never SVG** — they read on an Android phone, where an SVG
attachment is a file to open rather than a picture to glance at. `bun run frames
<sha>` writes PNG from a sha alone; rasterise a shape sheet with
`bun run png tools/shape-sheet/shape-sheet.svg out.png`.

**One picture at a time, and none when nothing visible moved.** Always the real
frame — never a diagram, a mock or a reconstruction.

## Commands

```
bun install            # once
bun run dev            # the wave editor at 4174, hot reload — for a human
bun run dev:once       # the same on a free port, beside one that is running
bun run dev:game       # the game at localhost:3000, hot reload — for a human
                       # all three restart themselves after a merge, rebase or
                       # checkout — an incremental bundle built while git is
                       # still writing is half of each revision and stays that
                       # way (tools/dev/supervise.ts)
bun run preview        # build, then serve dist/ on 4173 — how an agent verifies
bun run preview:once   # same, on a free port that nobody else can be holding
bun test               # everything
bun run test:determinism
bun run relay:check    # two headless devices against a running relay
bun run delegate       # hand a spec to the worker: <spec> <files it may edit>
bun run queue          # technical work waiting for a session of its own
bun run queue next     # the first item, as a prompt to paste into a fresh one
bun run queue done <n> # take an entry out once it has landed
bun run check          # typecheck + lint + test, run this before saying "done"
bun run land           # rebase, check, fast-forward, note it, sweep, push
bun run index          # regenerate the file map in docs/INDEX.md
bun run shapes:parts   # every secondary form on one sheet — docs/parts.md
bun run shapes:swim    # one pulse cycle of every body that swims, as a strip
bun run icons          # regenerate the home-screen PNGs from apps/game/icon.svg
bun run raster         # regenerate the baked assets under assets/raster/
bun run raster:verify  # open them in a real browser and check every frame decodes
bun run deploy         # build the director, then push it to Cloudflare
bun run deploy:game    # build the game, then push the worker to Cloudflare
```

## Delegating implementation

**Write it here, in as few turns as the work allows.** Delegation to the worker
model is a deliberate choice for a particular shape of task, not the default: it
was measured at 6.8 times the cost on 25 August 2026, and 91.5% of that was the
session rather than the worker.

Reach for `bun run delegate` when the spec is genuinely much smaller than the
code — a uniform change across many files, a long mechanical file whose shape is
decided, or a change you expect to need several failing rounds of `bun run
check`. Not for a small edit, a test, a document, or anything whose spec would
run as long as its code. Say in the report whether the work was delegated and
why. `.claude/skills/delegate` has the procedure;
`docs/delegation-cost.md` has the figures.

**Deciding never goes over, and neither does reviewing.** The interface, the
constraint, the shape, which of two variants reads better, what is worth
building at all — that is the work, and no spec can carry it.

Friction in this arrangement is a bug in the task at hand, not a note for later.
Fix it in the same turn.

## Verifying in a browser

**`bun run preview`, never `bun run dev:game`.** It builds first (about ten
milliseconds) and serves the bundle that ships. The two ports are separate on
purpose: `dev:game` is the human's on 3000, `preview` is the agent's on 4173.

**Ask who answered before trusting a measurement.** A dev server returns
`index.html` for any path, so a 200 proves nothing:

```
curl -s http://localhost:4173/__preview
```

Only the preview answers `{"app":"neon-spore-preview",...}`, and it names the
checkout it serves in `tree`. If that tree is not the one under test, the number
came off the wrong server.

**In a worktree the port is not 4173.** A server steps aside onto a port derived
from its tree's path (`tools/ports.ts`) and prints the port and the tree on
startup, so read the port out of the server's own log rather than assuming it.
The director does the same from 4174.

**In a worktree, `.claude/launch.json` is the wrong tool** — its entries carry no
`cwd`, so they start the *main* checkout's server, which then serves main's
code with nothing erroring. Launch the server by absolute path inside your own
tree and confirm who answered.

The game opens straight onto the field; the main menu is behind `?menu=1`.
`bun run preview:once` takes a free port for a throwaway check. Never start a
server with a backgrounded shell command. The history behind all of this is in
`docs/working-with-claude.md`.

## Verifying the relay

`packages/net` is unit-tested against a wire the test controls, which proves the
scheduler and proves nothing about the Durable Object, the seat handout or the
order a socket delivers in. For that:

```
bun run --cwd apps/server dev     # wrangler; it prints the port
bun run relay:check               # two headless devices, same code the phone runs
bun run relay:check ws://127.0.0.1:8800 8 --split
bun run relay:check ws://127.0.0.1:8800 8 --full
bun run relay:check ws://127.0.0.1:8800 14 --rejoin
```

`--split` reaches into one of the two worlds on purpose, to prove the desync
detector is watching. `--full` sends a third device at a room that has two, and
`--rejoin` drops one mid-run and brings it back — the two things the Durable
Object does that no unit test reaches, and both of them were broken. The relay's port belongs to its tree the same way the
preview's does; `curl -s http://127.0.0.1:<port>/net/health` says who answered.
Kill the wrangler process when the check is done.

## Where things live

| Path | Contains |
|---|---|
| `packages/sim` | deterministic rules, headless, no DOM |
| `packages/render` | draws a world, changes nothing |
| `packages/content` | creatures, waves, acts — data, not code |
| `packages/audio` | the sound catalogue and the mixer |
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
- Silhouettes are judged through `tools/shape-sheet`, not by screenshotting the
  running game. `bun run shapes:report` prints the geometry as numbers — reach
  for that first; `bun run shapes` regenerates the sheets an eye needs.
- Anything drawn is drawn again in `packages/render/test/frame.test.ts`, through
  a canvas that refuses what a real one refuses. It catches the class of mistake
  a type check cannot: a value that is a perfectly good `string` and not a
  colour.
- **`world.beat`, `world.tick` and `world.nextId` are not monotonic.** A restart
  builds a fresh `World` and all three start at 0, so render state cached
  against them is read by the next run as its own. Anything in render/ that
  outlives a frame belongs in `Effects` and is cleared in `Effects.reset()`;
  `packages/render/test/restart.test.ts` fails if a new field is not.
- Files stay under ~250 lines. Split rather than grow.
- **Everything in the repository is in English** — code, identifiers, commits,
  comments, documentation, and every word on a screen. A session may be held in
  another language; nothing it writes down is. The design vocabulary (hull,
  lobe, beat, guard, cannon, shield, scar, tick, column) is fixed — do not
  invent synonyms.
