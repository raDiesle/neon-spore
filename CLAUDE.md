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
a table of rules that must be **called, not re-derived**. Add a row when review
catches one. `packages/sim/test/hash-coverage.test.ts` walks a
populated world field by field and fails on one the fingerprint does not notice.

Style and formatting are Biome's job: `bun run lint`, `bun run format`.

## Git

- **History on `main` is linear.** No pull requests, no merge commits, no
  long-lived branches. One person works on this repo.
- **Worktrees are a working tool**, and the branch that comes with one is
  temporary. A fresh worktree needs its own `bun install` — `node_modules` must
  **not** be linked or copied from the main tree, and on Windows it is run **from
  a native shell** (`docs/working-with-claude.md`).
- **Landing is one command: `bun run land`, from inside the lane's worktree.**
  It rebases onto `main`, checks the result, fast-forwards, writes the release
  note, deletes the branch and sweeps spent worktrees. Do not do any of it by
  hand, and do not skip a step because it looks done.
- **A landing does not push `origin/main`; a cleanup does.** In between the
  trunk moves locally and `bun run push` sends it. A clone with no worktrees
  pushes every time — the push is the hand-off.
- **A finished lane lands on the local `main` before the turn ends, and the
  rest is asked.** When a turn ends in a worktree clean and ahead of `main`,
  `tools/hooks/lane-finished.ts` blocks the stop. Run `bun run land --keep` —
  the local `main` moves and nothing else does, no sweep and no push — then put
  one question to the owner, these three answers, no fourth.
  **a) More to come** — nothing else happens; work carries on here.
  **b) Send** — `bun run push`: `origin` gets `main`, the lane stays open.
  **c) Finished** — `bun run sweep`: the branch and spent worktrees go, and
  `origin` gets `main`. `NO_LANE_PROMPT=1` turns the hook off.
- **Bring the trunk up before you start, not only before you land.**
  `git fetch origin main && git merge --ff-only origin/main`. `bun run land`
  refuses while `main` is behind `origin/main`. A rebase deferred grows, so
  **land each green piece** rather than holding a branch open for a second.
- **Resolving a conflict is not finished until `bunx tsc --noEmit` passes**,
  before `git rebase --continue`. Never concatenate both sides in a file with
  syntax; resolve a generated file by running its command; and for
  `docs/queue.md` and `docs/release-notes.md`, which every lane appends to, take
  `origin`'s copy whole and re-append only your own entry.
- **A defect found after landing is new work, and gets a new branch from
  `main`.** Never revive the landed branch.
- **Commit when the work is done, without being asked.** Four conditions, all of
  them: `bun run check:fast` passes (the full check is `bun run land`'s, and the
  one result that counts); the work is actually finished; you stage **only the
  files this task touched, by path** — never `git add -A`; one commit per
  coherent change. Then say what was committed.
- Write the commit message well: `bun run land` turns its subject and first
  paragraph into the release note. Do not write a `Check:` trailer and do not
  ask the owner to confirm that something was tested.
- **Every lane writes where its time went**, in `docs/time-log.md`, in the
  commit that lands it: the five rows that file names, minutes rounded to
  five and read off timestamps rather than measured, and the one bottleneck
  in a sentence. Say the bottleneck in the report too. The owner asked for
  this on 10 September 2026 so the slow parts of ordinary work become visible.

Why any of that: `docs/git-and-landing.md`.

## Working in a cloud session

A session started from a phone clones `origin` and never sees this checkout.

- **It reads the remote, not the tree.** The hand-off is a push, not a save.
- **It pushes its own branch when done**, without being asked. Never a pull
  request.
- **It lands `main` itself, every turn**, when the branch is rebased onto the
  current `origin/main` and `bun run check` is green there. If either fails, it
  pushes the branch and says so.
- **It says which parts it could not verify, in the report, in that word — and
  queues them** with `bun run land --unverified "<what>"`, repeatable. `bun test`
  and the typecheck hold unaided; a wave watched at tempo, a shape sheet seen by
  an eye, `bun run perf` or `bun run relay:check` is *unverified*.
- **Its servers need a host**: `PREVIEW_HOST=127.0.0.1`, `DIRECTOR_HOST=127.0.0.1`.
- **Two at once is the ceiling**, on different packages, each naming its branch
  in the prompt.

The reasoning, and what a cloud session needs once it is running:
`docs/cloud-session.md`.

## A technical finding is queued; an idea is not

Three destinations, and a session decides between them without asking. Why
each is where it is: `docs/queue.md`'s own preamble.

**A technical finding is always written down, in the same turn it is found.**
A refactor stepped around, a rule re-derived instead of called, a file grown
past ~250 lines, dead code, a slow path, a missing test, a document that no
longer describes the code, a tool that would have helped, **a command that
failed and was worked around**. It goes in `docs/queue.md` as one `##` item —
the date, the branch, the files, and what to do — committed with the work that
found it. Do not ask first, do not weigh whether it is worth the owner's
attention, do not settle for saying it in the report, and do **not** also offer
it as a suggested background task. The test for an entry is one question:
**could a fresh session finish this alone and prove it with `bun run check`?**

**A queue item is worked by a session that has nothing else in it, and it is
claimed before any of the work starts.** `bun run queue next` hands out the
first free item: it makes that item's branch and writes a `Taken:` line into
the entry **on `main`**, and both halves together are the claim. Never start an
item without going through `next` or `take`, and never work one the list
already shows as taken. The session checks the branch out in its own worktree,
does the item, removes the entry (`bun run queue done <n|title>`) and lands,
which releases it. A session draining several in one sitting claims each with
`bun run queue take <n|title>` instead: the same claim, no prompt and no
worktree.

**A topic that needs the owner's answer is queued too, on an `Asks:` line.**
The test is **whether there is work waiting on it**: work that is decided,
sized and sitting in named files, held up by one sentence from him, goes in
`docs/queue.md` like anything else, with
`- **Asks:** <question ending in a question mark>` under `Files:`. The listing
marks it `ASKS THE OWNER`, and `bun run queue next` hands the session a prompt
that puts the question first and says to build nothing until it is answered.
The body must still **name the options the answer picks between**: a bare
"what should this look like" is not an entry.

**An idea for the game is still not collected.** What the game could have and
does not — a creature, a mechanic, a control, a weapon, a boss, a round — has no
lane waiting on it, so it goes in `docs/spec/`, which is what the director's
`◇ NOT BUILT YET` sheet reads. A *look* with something already shipped in its
place is offered in `tools/versus/` instead, because the only way to choose
between two is to see both. Neither is filed into the queue by the session that
thought of it.

**Either may still be put to the owner, at the end of the turn that found it.**
A session working on something else that sees a feature the game wants — a
control, a screen, a way in, anything a player would notice — says so in the
report: one line each, and the question of where it should go. The owner
answers, item by item: onto `docs/queue.md`, into `docs/spec/`, or nowhere. Ask
once, at the end, in a batch — never mid-task, and never as a background-task
chip.

**Half-done work goes in `docs/parked.md`** — a refactor abandoned when it
grew, a test skipped with a reason, a migration done in three files out of
five. Write it in the same commit, in the format the queue uses;
`bun run queue` lists parked work first. `tools/queue/test/queue.test.ts` holds
both formats.

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
  spinning rock, a shape clipping its frame, a control under the status bar:
  these are defects, repaired rather than offered.

**A new shape is never one the game already draws.** Check it against
`packages/content/src/silhouettes*.ts`, then take one from the unused
collection — `tools/shape-sheet/src/drafts/` — or combine two, naming it.

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
                       # all three restart themselves after a git operation, so
                       # a half-written bundle is never served (tools/dev/)
bun run preview        # build, then serve dist/ on 4173 — how an agent verifies
bun run preview:once   # same, on a free port that nobody else can be holding
bun run port           # which port this tree's servers answer on, before one is started
bun run probe          # run a scratch script against a live world — tools/probe/
bun run crop           # a rectangle of a PNG already taken, magnified — tools/frames/picture.ts
bun test               # everything, in one process — for one file, or one package
bun run test           # the same, dealt across eight — what `check` runs (tools/check/shard.ts)
bun run test:determinism
bun run test:profile   # which test files carry the minutes — docs/performance.md
bun run relay:check    # two headless devices against a running relay
bun run perf           # what a frame costs, wave by wave, at phone speed
bun run perf --save    # keep this run as the baseline the next one is read against
bun run delegate       # hand a spec to the worker: <spec> <files it may edit>
bun run queue          # technical work waiting, and who is already on what
bun run queue status   # DONE, IDLE or BUSY — is anything still being worked on
bun run queue next     # hand out the first free item: branch + Taken: on main
bun run queue take <n> # the same claim, without opening a lane for it
bun run queue release <n>  # give back an item that was handed out, not started
bun run queue done <n> # take an entry out once it has landed
bun run check:fast     # typecheck + lint + the tests a lane's diff can reach — before a commit
bun run check          # the same with every test; what `land` runs, minutes long
bun run land           # rebase, check, fast-forward, note it, sweep
bun run sweep          # the cleanup a --keep landing deferred, on its own
bun run push           # send main to origin, on purpose rather than on landing
bun run index          # regenerate the file map in docs/INDEX.md
bun run maze           # the sheets THE MAZE is played on, drawn
bun run shapes:parts   # every secondary form on one sheet — docs/parts.md
bun run shapes:cues    # the motion half of shapes:report, as numbers not a picture
bun run style-guide    # the specimen sheet for docs/style-guide.md, drawn from the palette
bun run breaks         # every tuning of the fracture engine, across time, on one sheet
                       # — the bench for a damage look (.claude/skills/destruction)
bun run shapes:swim    # one pulse cycle of every body that swims, as a strip
bun run icons          # regenerate the home-screen PNGs from apps/game/icon.svg
bun run raster         # regenerate the baked assets under assets/raster/
bun run raster:verify  # open them in a real browser and check every frame decodes
bun run deploy         # build the director, then push it to Cloudflare
bun run deploy:game    # build the game, then push the worker to Cloudflare
```

## Delegating implementation

**Write it here, in as few turns as the work allows.** Delegation to the worker
model is a deliberate choice, not the default: it was measured at 6.8 times the
cost. Reach for `bun run delegate` only when the spec is genuinely much smaller
than the code — a uniform change across many files, a long mechanical file whose
shape is decided, a change you expect to need several failing rounds of `bun run
check` — never for a small edit, a test, a document, or anything whose spec would
run as long as its code. Say in the report whether it was delegated.

**Deciding never goes over, and neither does reviewing.** The interface, the
constraint, the shape, which of two variants reads better, what is worth
building at all — that is the work, and no spec can carry it.

`.claude/skills/delegate` has the procedure and `docs/delegation-cost.md` the
figures. Friction in this arrangement is a bug in the task at hand, not a note
for later — fix it in the same turn.

## Verifying in a browser

**`bun run preview`, never `bun run dev:game`.** It builds first and serves the
bundle that ships, on 4173; `dev:game` is the human's hot server on 3000.
**Ask who answered before trusting anything you measure** — only the preview
answers `curl -s http://localhost:4173/__preview`, and it names the checkout it
serves in `tree`. In a worktree launch by absolute path: `.claude/launch.json`
carries no `cwd`, so it starts the *main* checkout and nothing errors.

`?play=1` opens on the field rather than the menu, which is what `tools/frames`
drives. Never start a server with a backgrounded shell command, and never
install a service worker on a local address (`?pwa=1` tests the install
itself). Each of those cost a turn once: `docs/working-with-claude.md`.

## Measuring what a frame costs

**A new shape or a new animation gets a performance run; an ordinary change
does not, and neither does a cloud session — it never finishes there.**
**Measure the waves the new thing appears in and nothing else** —
`bun run perf --wave "THE GRATE"`. The whole game is swept only when a baseline
is being taken: bare `bun run perf`, kept with `--save`.

**If one of the five reference waves a narrow run carries is flagged, the
machine was busy and the run says nothing** — no lane touches one. **Never `--save` to make a regression stop being
reported.** It does not replace `frame-budget.test.ts`: an op is not a
millisecond. `docs/performance.md`.

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

What the three flags reach, and why: `.claude/skills/net-change`. The relay is
the one server whose port *is* always derived in a worktree — wrangler answers no marker, so `relayPort` hands it a
number of its tree's own; `curl -s http://127.0.0.1:<port>/net/health` says who
answered. Kill the wrangler when the check is done.

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
- A wave's **tutorial** is the game's own screen, not a card over it. Read
  `.claude/skills/new-tutorial` before writing or changing a guide's pages.
- Silhouettes are judged through `tools/shape-sheet`, not by screenshotting the
  running game. `bun run shapes:report` prints the geometry as numbers — reach
  for that first; `bun run shapes` regenerates the sheets an eye needs.
- Anything drawn is drawn again in `packages/render/test/frame.test.ts`, through
  a canvas that refuses what a real one refuses — a `string` that is not a
  colour.
- **`world.beat`, `world.tick` and `world.nextId` are not monotonic.** A restart
  starts all three at 0. Anything in render/ that outlives a frame belongs in
  `Effects` and is cleared in `Effects.reset()`;
  `packages/render/test/restart.test.ts` fails if a new field is not.
- Files stay under ~250 lines. Split rather than grow.
- **Everything in the repository is in English** — code, identifiers, commits,
  comments, documentation, and every word on a screen. A session may be held in
  another language; nothing it writes down is. The design vocabulary (hull,
  lobe, beat, guard, cannon, shield, scar, tick, column) is fixed — do not
  invent synonyms.
