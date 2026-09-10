# Neon Spore

Two-player co-op game. Two people, two devices, two different views. Talking is
not a help, it is the control scheme. Portrait mobile web.

Set in space; the nearest comparable game is Spaceteam. **On the field,
nothing the players control travels** — no flight, thrust, dodge or jump.
There is a fixed hull, a cannon that slides along it, and a shield. The forms
are blobs and slimes: closed contours with lobes (`blobPath`, `hullRadiusMul`).
An interlude is a round with its own rules and its own picture, and the
no-travel rule does not reach it (`docs/decisions.md` #21).

**This file is rules and commands, and it changes rarely.** It is loaded into
every request of every session, and an edit empties the prompt cache for all
of them. The reasoning behind each rule lives in `docs/`, named at the end of
its section. A rule that applies to one kind of work goes in that work's skill
under `.claude/skills/`; a fact that changes goes in `docs/`; only a rule every
session needs goes here.

## The rules that are not negotiable

1. **`packages/sim` never imports `packages/render`.** State flows one way.
2. **Nothing in `sim` or `content` may use `Math.random`, `Date.now`,
   `performance.now`, `window` or `document`.** Randomness comes from the seeded
   `Rng`, time comes from the tick counter.
3. **The simulation stores integers.** Sub-tile values live in thousandths, in a
   field named with a `Milli` suffix.
4. **Every field of `World` is in `hashWorld`** unless it is one of the named
   exceptions in `hash.ts` (`docs/decisions.md` #23).
5. **The game never reads a microphone and never evaluates speech.**

Rules 1–4 are tests: `packages/sim/test/purity.test.ts`, which also carries a
table of rules that must be **called, not re-derived** — add a row when review
catches one — and `packages/sim/test/hash-coverage.test.ts`.

Style and formatting are Biome's job: `bun run lint`, `bun run format`.

## Git

- **History on `main` is linear.** No pull requests, no merge commits, no
  long-lived branches.
- **Worktrees are a working tool** and their branches are temporary. A fresh
  worktree needs its own `bun install` — never link or copy `node_modules` from
  the main tree — and on Windows that runs from a native shell.
- **Bring the trunk up before you start:**
  `git fetch origin main && git merge --ff-only origin/main`. `bun run land`
  refuses while `main` is behind `origin/main`. **Land each green piece** rather
  than holding a branch open for a second.
- **Landing is one command: `bun run land`, from inside the lane's worktree.**
  It rebases, checks, fast-forwards, writes the release note, deletes the branch
  and sweeps spent worktrees. Do none of it by hand and skip no step.
- **A landing does not push `origin/main`; `bun run push` does.**
- **A finished lane lands on the local `main` before the turn ends, and the
  rest is asked.** `tools/hooks/lane-finished.ts` blocks a stop in a worktree
  that is clean and ahead of `main`. Run `bun run land --keep`, then put one
  question to the owner with these three answers, no fourth:
  **a) More to come** — nothing else happens.
  **b) Send** — `bun run push`; the lane stays open.
  **c) Finished** — `bun run sweep`; branch and spent worktrees go, `origin`
  gets `main`. `NO_LANE_PROMPT=1` turns the hook off.
- **Resolving a conflict is not finished until `bunx tsc --noEmit` passes**,
  before `git rebase --continue`. Never concatenate both sides of a file with
  syntax; resolve a generated file by running its command; for `docs/queue.md`
  and `docs/release-notes.md` take `origin`'s copy whole and re-append only your
  own entry.
- **A defect found after landing is new work on a new branch from `main`.**
- **Commit when the work is done, without being asked**, when all four hold:
  `bun run check:fast` is green; the work is finished; only the files this task
  touched are staged, **by path** — never `git add -A`; one commit per coherent
  change. Then say what was committed.
- **The commit subject and first paragraph become the release note.** No
  `Check:` trailer; never ask the owner to confirm that something was tested.
- **Every lane writes where its time went** in `docs/time-log.md`, in the
  commit that lands it: that file's five rows, minutes rounded to five and read
  off timestamps, and the one bottleneck in a sentence — said in the report too.
- **A prompt may carry several independent tasks; they are worked in order,
  each landed before the next, with no question in between** — one that needs
  the owner's decision goes in `docs/parked.md` with the question, and the next
  task starts. **A message that arrives mid-turn is read by its prefix**:
  `NEXT:` is appended to the list for after the current task, `STOP` applies
  now, and anything without a prefix is asked about before it is acted on.

Why any of that: `docs/git-and-landing.md`; the prefixes:
`docs/working-with-claude.md`.

## Working in a cloud session

A session started from a phone clones `origin` and never sees this checkout.

- **It reads the remote, not the tree**, and **pushes its own branch when
  done**, without being asked. Never a pull request.
- **It lands `main` itself, every turn**, when the branch is rebased onto the
  current `origin/main` and `bun run check` is green there; otherwise it pushes
  the branch and says so.
- **It says which parts it could not verify, in that word, and queues them**
  with `bun run land --unverified "<what>"`, repeatable. `bun test` and the
  typecheck hold unaided; a wave watched at tempo, a sheet seen by an eye,
  `bun run perf` or `bun run relay:check` is *unverified*.
- **Its servers need a host**: `PREVIEW_HOST=127.0.0.1`, `DIRECTOR_HOST=127.0.0.1`.
- **Two at once is the ceiling**, on different packages.

The reasoning, and what a cloud session needs once running: `docs/cloud-session.md`.

## A technical finding is queued; an idea is not

**A technical finding goes in `docs/queue.md` in the turn it is found**, as one
`##` item — date, branch, files, what to do — committed with the work that
found it. A refactor stepped around, a rule re-derived, a file past ~250 lines,
dead code, a slow path, a missing test, a stale document, a missing tool,
**a command that failed and was worked around**. Do not ask first, do not say
it only in the report, and never offer it as a background-task chip. The test:
**could a fresh session finish this alone and prove it with `bun run check`?**

**A queue item is claimed before any work starts** — `bun run queue next` for
one in its own lane, `bun run queue take <n|title>` when draining several in one
sitting — and never one the list shows as taken. Finish it, `bun run queue done
<n|title>`, land.

**A topic that needs the owner's answer is queued too**, with
`- **Asks:** <question?>` under `Files:`, when there is decided, sized work in
named files waiting on it. The body must **name the options the answer picks
between**.

**An idea for the game is not collected.** A creature, mechanic, control,
weapon, boss or round the game does not have goes in `docs/spec/` (the
director's `◇ NOT BUILT YET` sheet); a *look* with something already shipped in
its place goes to `tools/versus/`. **Either may be put to the owner at the end
of the turn that found it** — one line each and the question of where it should
go — in a batch, never mid-task.

**Half-done work goes in `docs/parked.md`**, in the same commit, in the queue's
format; `bun run queue` lists it first.

Why each is where it is: `docs/queue.md`'s own preamble.

## A look is offered, never replaced

**Nothing run unattended changes what the game already draws.** If a change
would show up in a frame of the running game, it is a look, and it goes to
VERSUS (`tools/versus/candidates/`) or to a NOT BUILT YET card — never straight
onto the field. A refactor, a speed fix, a test, a tool or the director is not a
look and lands as usual.

Three exemptions, and say in the commit which one you used: **a look the owner
asked for by name**; **a look with no shipped alternative**; **a fix to
something wrong rather than unlovely** — a highlight glued to a spinning rock, a
shape clipping its frame, a control under the status bar.

**A new shape is never one the game already draws.** Check
`packages/content/src/silhouettes*.ts`, then take one from
`tools/shape-sheet/src/drafts/`, or combine two, naming it.

**A lane about to improve a look mid-task stops** and puts it in the report.
Why: `docs/looks.md`; the mechanism: `docs/versus.md`.

## Showing the owner something

**Send the picture; never describe it and never ask them to open anything.**
**PNG, always, never SVG** — they read on a phone. `bun run frames <sha>` writes
PNG from a sha; `bun run png <sheet.svg> out.png` rasterises a sheet. **One
picture at a time, and none when nothing visible moved.** Always the real frame,
never a diagram, a mock or a reconstruction.

## Commands

```
bun install            # once, in every worktree
bun run dev            # the wave editor at 4174, hot reload — for a human
bun run dev:game       # the game at localhost:3000, hot reload — for a human
bun run preview        # build, then serve dist/ on 4173 — how an agent verifies
bun run preview:once   # the same on a free port nobody else can be holding
bun run port           # which port this tree's servers answer on
bun run probe          # a scratch script against a live world — tools/probe/
bun run crop           # a rectangle of a PNG already taken, magnified
bun test               # everything, in one process — or one file, one package
bun run test           # the same, dealt across eight — what `check` runs
bun run perf --wave X  # what a frame costs — weekly, or when the owner asks; never per lane
bun run queue          # technical work waiting, and who is already on what
bun run queue status   # DONE, IDLE or BUSY
bun run check:fast     # typecheck + lint + the tests a lane's diff reaches — before a commit
bun run check          # the same with every test; what `land` runs, minutes long
bun run land           # rebase, check, fast-forward, note it, sweep
bun run push           # send main to origin
bun run index          # regenerate the file map in docs/INDEX.md
```

Every other script — sheets, rasters, icons, the relay check, the deploys —
with a line each: `docs/commands.md`.

## Delegating implementation

**Write it here, in as few turns as the work allows.** `bun run delegate` is
for a spec genuinely much smaller than its code — a uniform change across many
files, a long mechanical file whose shape is decided — never a small edit, a
test or a document. **Deciding and reviewing never go over.** Say in the report
whether it was delegated. Procedure: `.claude/skills/delegate`; the figures:
`docs/delegation-cost.md`.

## Verifying in a browser

**`bun run preview`, never `bun run dev:game`.** Only the preview answers
`curl -s http://localhost:4173/__preview`, and it names the checkout it serves
in `tree` — **ask who answered before trusting anything you measure.** In a
worktree launch by absolute path: `.claude/launch.json` carries no `cwd` and
would start the *main* checkout. `?play=1` opens on the field. Never start a
server with a backgrounded shell command, and never install a service worker on
a local address (`?pwa=1` is for testing the install itself).
`docs/working-with-claude.md`.

## Measuring what a frame costs

**A performance run happens once a week, or when the owner asks for one — a
lane never owes one**, not for a new shape, not for a new animation, and a
cloud session never runs one. Do not list it as a step before landing, an
unverified item or a queue entry. The per-lane measurement is the op-count
budget tests (`packages/render/test/*-budget.test.ts`): a legitimate change
that raises a row is remeasured and moved, with a sentence saying why. When a
run is asked for, measure the waves the new things appear in:
`bun run perf --wave "THE GRATE"`. A flagged reference wave means the machine
was busy and the run says nothing. **Never `--save` to make a regression stop
being reported.** `docs/performance.md`.

## Verifying the relay

`packages/net`'s unit tests prove the scheduler and nothing about the Durable
Object. For that, `bun run relay:check` against a running wrangler:
`.claude/skills/net-change` has the flags and why.

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
- A new creature is one entry in `packages/content/src/creatures.ts`; a wave
  shows the union of its creatures' control groups. `.claude/skills/new-creature`.
- A new wave must pass the one-sentence test. `.claude/skills/new-wave`.
- A wave's **tutorial** is the game's own screen, not a card over it.
  `.claude/skills/new-tutorial`.
- Silhouettes are judged through `tools/shape-sheet`, never by screenshotting
  the running game: `bun run shapes:report` first, `bun run shapes` for an eye.
- Anything drawn is drawn again in `packages/render/test/frame.test.ts`.
- **`world.beat`, `world.tick` and `world.nextId` are not monotonic.** Anything
  in render/ that outlives a frame belongs in `Effects` and is cleared in
  `Effects.reset()`; `packages/render/test/restart.test.ts` checks.
- Files stay under ~250 lines. Split rather than grow.
- **Everything in the repository is in English.** The design vocabulary (hull,
  lobe, beat, guard, cannon, shield, scar, tick, column) is fixed — do not
  invent synonyms.

# Compact instructions

When compacting, keep: the task list from the prompt with what is done and
what is left, in order; the current branch and whether it is landed; what was
parked and its question; any `NEXT:` tasks received. Drop tool output, test
results, screenshots and file contents — the tree holds them, and
`tools/hooks/after-compact.ts` restates the tree's state afterwards.
