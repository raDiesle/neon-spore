# Neon Spore

Two-player co-op game. Two people, two devices, two different views. Talking is
not a help, it is the control scheme. Portrait mobile web.

Set in space; the nearest comparable game is Spaceteam. **On the field,
nothing the players control travels** — no flight, thrust, dodge or jump.
There is a fixed hull, a cannon that slides along it, and a shield. The forms
are blobs and slimes: closed contours with lobes (`blobPath`, `hullRadiusMul`).

That sentence used to be about the game rather than about the field, and it
was wrong that way round. It exists to keep the *field* a place where the two
players talk about columns instead of dodging, and it earns nothing outside
it — an interlude is a round with its own rules and its own picture, and one
that moves a claw along a rail is not a violation of anything. See
`docs/decisions.md` #21.

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
the worktree. A temporary branch is never pushed — a cloud session's branch is
the one exception, and the section after this one says why.

**The rebase onto `main` happens before verification, not after.** A branch
that has been sitting in its own worktree can fall behind `main` while it
works, so landing it is two steps and they run in this order: first
`git fetch` / rebase the branch onto the current `main` — never a merge
commit, since history stays linear — which is also where a conflict with
whatever landed elsewhere surfaces, on the branch, where there is still time
to resolve it. Only then does `bun run check` run, on the rebased tree. A
green result after that point is a result about the code as it will actually
sit on `main`; a green result taken before the rebase is a result about a
tree that no longer exists once `main` moves. The landing itself — fast-
forwarding `main` to the branch tip — is the mechanical last step once that
check is green, not a separate verification of its own.

**Landing is one command, and it cleans up after itself.** `bun run land`,
from inside the lane's worktree: it replays the lane onto `main`, runs
`bun run check` on the result, fast-forwards, writes the release note, deletes
the branch and sweeps whatever worktrees are spent. None of that is a step
somebody remembers — a cleanup that has to be remembered is a cleanup that
leaves twenty-seven full checkouts on disk, which is what happened the first
day anybody worked at volume. Each one is a copy of the repository at an
earlier state of the trunk, down a path that looks exactly like a path into the
repository, and a session that follows one reads superseded code and reports a
result about it.

**The branch and the worktree do not go at the same moment, and that is
deliberate.** A branch whose tip is an ancestor of `main` is spent by
construction, so it goes immediately: `git branch -d` cannot lose anything, and
it is never argued with when it refuses. A worktree is a workspace rather than
a unit of history, and deleting the one a session is standing in destroys that
session's working directory — every tool call after it fails, and the session
burns whole context windows working out why. So the tree the landing ran in is
**kept**, moved onto `main`'s tip and detached, which also means it is not a
stale checkout anybody can wander into: its content is the trunk's. Carrying on
there is `git switch -c <name>`.

Every *other* merged worktree is swept once nothing has happened in it for five
days — idle, not old, so a tree somebody worked in yesterday is never taken.
`LAND_KEEP_DAYS` moves the window. What the delay buys is `node_modules`: the
code in a landed tree is worth nothing, since all of it is on `main`, but its
install is worth the minute a fresh worktree spends redoing it, and the review
that finds something to adjust usually happens a day or two after the landing.

**A defect found after landing is new work, and new work gets a new branch from
`main`.** The lane that built the thing is over: its branch is on the trunk and
the trunk has moved on. Do not reopen it, do not check it out again, and do not
push a fix onto it. The alternative is tempting and wrong twice over — a
revived branch is missing every landing since, so its `bun run check` is
answering a question nobody asked, and the fix arrives as a second commit on a
branch whose first commit is already on the trunk. The rebase that follows is
pure cost, incurred for the convenience of not typing a branch name.

**On Windows a worktree removal often fails and the failure is quiet.** `git
worktree remove` refuses while anything holds a handle inside the tree —
`node_modules` after a `bun install` is the usual culprit — and moves on. The
directory survives with no entry in `git worktree list`, which is the worst of
both: git thinks it is gone and the filesystem disagrees. So `tools/land`
verifies rather than trusts, retries a stuck handle rather than fighting it,
and reports by path anything still standing. It also removes the litter left by
removals that failed this way before it existed.

A fresh worktree needs `bun install`. `node_modules` must **not** be linked or
copied from the main tree: the workspace links inside it point at the main
tree's `packages/*` by absolute path, so a test there would run against
someone else's code.

That `bun install` does **not** put `@neon-spore/*` in a root `node_modules` —
the workspace links land under each package's own. So a scratch script written
at the repository root cannot `import "@neon-spore/shape-sheet"` and has to
use a relative path. `bun test` and the packages themselves are unaffected;
this only bites the throwaway measuring script, which is exactly the thing a
lane writes when it is about to prove something with a number.

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

Say what was committed, and **push `main` when it has landed something**. That
rule used to be the other way round on this machine, on the reasoning that not
pushing cost nothing because the work was already where the human was. It cost
something the first day anybody worked at volume: forty-seven commits sat on a
local `main` that `origin` had never seen, which is exactly the trap the cloud
section below describes — a session started from a phone clones `origin` and
is briefed on code that is not there. The saving was never real and the trap
always was.

## Working in a cloud session

A session started from the phone runs on a machine that clones `origin` and
never sees this checkout. Several things follow, and each one cuts against a
rule above.

**It reads the remote, not the tree.** Anything unpushed is invisible to it, so
the hand-off from here to there is a push, not a save. That is also how unpushed
work turns into a trap: a `main` sitting five commits ahead of `origin` gives
the cloud a task briefed on code that is not there.

**It must push its own branch.** "Do not push unless asked" is a
rule about this machine, where not pushing costs nothing because the work is
already where the human is. In the cloud the opposite holds — work that is not
pushed is work nobody can reach. So a cloud session pushes the branch it was
given, when it is done, without being asked. Never a pull request; `main` under
the next paragraph, which it does on its own.

**It lands `main` itself, every turn, without being asked.** The rule used to
be that it never could, and then that it could when asked; both were about
verification — a change the sandbox cannot fully check should not become the
trunk that the next cloud session clones. That worry survives, and the ordering
it implied does not. One person works on this repo, so a `main` that turns out
to need another pass costs that person one commit and nobody else anything —
while a branch parked until they get to a desk costs a day, and two parked
branches cost a rebase each. Asking first only moved the day-long wait to a
different question.

So: a cloud session finishes a turn by landing its branch on `main`. Two
conditions, and no third. The branch is **already rebased onto the current
`origin/main`**, so the landing is a fast-forward and the history stays linear —
never a merge commit, never a force-push to `main`. And `bun run check` is green
on that rebased branch. If either fails, the branch is pushed and the closing
block says so; the turn does not end quietly on unlanded work.

Mid-task is the one exception, and it is the same exception as everywhere else
in this file: work that is not finished is not committed, and what is not
committed cannot land. A turn that ends on a question ends with the question,
not with a landing.

What the sandbox could not check does not block the landing, but it does not
evaporate either: it moves *after* it, onto the machine that can look. The
report names it — the wave whose timing was never watched, the shape whose
motion was never seen, the relay never run — as a list of what to open, not as
a caveat. Landing without saying that is the one way this arrangement fails,
because it turns "not looked at" into "looked fine". If it turns out wrong,
`main` takes the fix as its own commit; the history is linear and stays that
way.

**It cannot verify everything, and has to say which parts — in the report.**
The sandbox has no wrangler, no `bun run delegate`, and no network access it
did not arrange. It does have a headless Chromium, so a page can be opened,
driven and screenshotted — what it cannot do is *look*, and those are
different things: a green screenshot check says the DOM is there, not that the
motion reads. `bun test` and the typecheck are the parts that hold unaided.
Anything that would have needed `bun run relay:check`, a human eye on a shape
sheet, or a wave watched at tempo is *unverified*, and the report says so in
that word rather than offering a green check that covered less than usual. A
wave whose timing was never watched is not finished, it is written — landed,
now, but still written.

**Say it once, in the report, and then let it go.** There used to be a second
half to this: a `Check:` trailer on the commit, an outstanding list derived
from those trailers, a ledger recording who had looked at what, and a sheet in
the director with a verdict button on every row. It was accurate and it asked
the owner for something on every visit, which is what finished it — a list you
owe answers to stops being read at about the length that one reached, and a
list nobody reads is worse than none, because it looks like coverage.

What replaced it asks for nothing. `bun run land` writes an entry into
`docs/release-notes.md` at the moment the trunk moves, derived from the commit's
own subject and first paragraph, and that file is read-only: nothing in it is
ticked, answered or deleted. The director shows the same thing under
`≡ RELEASE NOTES`, with no buttons and no count — a count is a way of saying
something is waiting, and nothing there is. Reading it is optional, which is the
only reason it will be read.

So do not write a `Check:` trailer, do not open a file under `docs/checks/`, and
do not ask the owner to confirm that something was tested. Write the commit
message well instead: it is the release note, and it is the only part of this
that anybody sees twice.

**Suggestions go in the report, and there is no file for them.** Anything the
session noticed and did not do — a refactor it stepped around, a tool that
would have helped, an idea for the game — is said once in the closing block,
and then it is the owner's to keep or drop.

`docs/parked.md` used to be that file, and it went the way the `Check:`
trailers and the queue board went in `decisions.md` #26: it asked the owner for
something on every visit. Sixty-two entries arrived in six days, most off the
parallel `burn` lanes, and draining it was a job only he could do. A cap was
tried first and was still the wrong shape — the file's problem was never the
rate, it was that nobody read it, and a list nobody reads is worse than none
because it looks like coverage.

An idea worth building survives being said once. If the owner wants one kept,
he will say so, and it goes where it belongs — a control with the boss it was
tried on, a creature in the bestiary, a design in its own document — beside the
thing a reader would already be looking at, rather than in a list of loose
ideas nobody opens.

**That is not a loss of the backlog, it is where the backlog already was.**
The spec is what the director's `◇ NOT BUILT YET` sheet reads: `ideas.md`'s
`###` sections become its CREATURE, MECHANIC, CONTROL, WEAPON, BOSS and ROUND
groups, the rosters in `bestiary.md` and `bosses.md` become the rest, and
anything the simulation already has drops out of the page by being built. So an
idea filed in the spec is *on* the page the owner decides from, next to the
built things it would sit beside — which a separate file could never be.

**And the owner picks from that page himself, by hand, in a session he opens.**
Not off a queue, not on a schedule, and not because something is counted as
outstanding. Nothing on that sheet is waiting for an answer; it is a catalogue
of what could be built, read when he wants to choose. A session's job is to
build the thing he chose and to say what it noticed on the way out.

**Its servers need a host, and the error if you forget says the wrong thing.**
`preview.ts` and the director both bind `::`, which is right on a machine with
IPv6 and impossible on this one — and what Bun reports is `EADDRINUSE`, so the
first guess is always a stale server holding the port. It is not; nothing is
listening at all. Both already take the way out, so this costs one variable:

```
PREVIEW_HOST=127.0.0.1 bun run preview
DIRECTOR_HOST=127.0.0.1 bun run dev
```

With one of those up, a headless Chromium reaches further than "the DOM is
there". It can drive the real loop — `window.neonSpore.advance` and `paint`
past a gesture that unlocks audio — and a frame that throws is a frame that
never draws, so a run of a few thousand ticks with no page error is a real
result about the wiring. Still not about how any of it *reads*.

**Several at once is allowed, and is not the shape to reach for first.** Each
cloud session is its own VM with its own clone, so none of this needs a
worktree — the isolation already sits a level above the filesystem, and two
branches in flight are no problem in themselves. What does not parallelise is
the landing. Every branch still has to arrive on a **linear** `main`, one after
another, so three branches are three rebases onto a `main` that moved under all
of them — and the conflict surfaces where the work is expensive rather than
where it was cheap. A session landing its own branch does not change that; it
only moves who does the rebase. Two at once, on
different packages, each naming its branch in the prompt so no two sessions
reach for the same one. Prefer the work the sandbox can actually finish:
`sim`, `content` and `net` are covered by `bun test`, while a wave's timing or
anything in `render` comes back needing an eye here regardless, and running
four of those in parallel only builds a queue in front of the one machine that
can look.

Coming back the other way, `claude --teleport` carries the branch and the
conversation with it. Going out again carries neither: a new cloud session
starts cold, knowing only what `origin` and the commit messages tell it. One
more reason the commit messages here are sentences.

## A look is offered, never replaced

**Nothing run unattended changes what the game already draws.** A new colour, a
new animation, a rounder rock, a different fire opening: every one of them is
an *alternative*, offered beside the shipped look on the NOT BUILT YET pages,
and the owner decides. Throw it away, improve it, or adopt it and retire the
old one — that is their call and it is made by looking, which is the one thing
no session can do.

The owner said why, and it is not caution about quality:

> whenever i asked for generic alternative graphics or animations, my idea was
> to document them in "not done yet" so i can evaluate them and then decide
> myself if we take it to override with current defaults. […] i dont want to
> make visuals worse. when i finegrain improve visuals myself after collecting
> ideas and variants, i will do this in non autonomous burn queued way and step
> by step.

So the run's job is to *collect* looks, not to pick between them. A batch that
lands four visual changes has spent the owner's four decisions for them, and
the only evidence it had was that each one seemed better to the session that
wrote it.

**The test is what a player would see.** If a change would show up in a frame
of the running game — the hull, a creature, a rock, a shot, the shield, a
colour, the timing of an animation — it is a look, and it goes to VERSUS or to
a NOT BUILT YET card, never straight onto the field. If it would not show up in
a frame — a refactor, a speed fix, a test, a tool, the director — the rule does
not apply and the work lands as usual.

**Three things this does not forbid**, because a rule that blocks them would be
read around within a day:

- **A look the owner asked for by name.** They asked for shadow and light in
  the game; that is a decision they have already made, and it lands. The rule
  is about looks a *session* decided to change.
- **A look with no shipped alternative.** Something being drawn for the first
  time is not replacing anything, and there is nothing to compare it against.
- **A fix to something that is wrong rather than to something that is
  unlovely.** A highlight glued to a spinning rock, a fringe that has come off
  its body, a shape that clips its own frame — these are defects, and a defect
  is repaired rather than offered as an option beside itself. Say in the commit
  which of the two you decided it was; that sentence is the whole guard against
  this exemption eating the rule.

**Where an alternative goes.** `tools/versus/candidates/` when the shipped
thing is a record the draw path reads — the pair draws both on two phones at
tempo and the vote emits a prompt that applies the winner. A NOT BUILT YET card
when it is not yet that concrete. `docs/versus.md` has the mechanism.

**And a lane that finds itself about to improve a look mid-task stops.** That
is a second lane and an owner decision, not a tidy-up on the way past. Put it
in the report.

## Showing the owner something

**Send the picture. Do not describe it and do not ask them to open anything.**
This holds for every session on this project, not only an unattended run: when
work changes something visible, attach the frame to the reply and say in one
sentence what to look at. It is never a question they have to answer — a
verdict costs them a sentence if they feel like giving one, and nothing if they
do not.

The reason it works is that it inverts the effort. A list, a path or a command
asks them to go and look; a picture has already been looked at by the time they
read the line under it.

**PNG, always. Never SVG.** They read on an Android phone, where an SVG
attachment is a file to open rather than a picture to glance at — and a picture
that has to be opened is not a glance, which was the whole point. `bun run
frames <sha>` writes PNG and works from a sha alone. The shape sheets write
SVG, which is right for the tool and wrong for the chat, so rasterise them
first:

```
bun run png tools/shape-sheet/shape-sheet.svg out.png
```

**One picture at a time, and none when nothing visible moved.** A screenshot of
an unchanged field teaches nothing and trains the eye to skip the next one. And
it is always the real frame — never a diagram, a mock or a reconstruction. The
whole value is that it is what the game actually drew.

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
bun run land           # rebase onto main, check, fast-forward, note it, sweep
bun run shapes:parts   # every secondary form on one sheet — docs/parts.md
bun run shapes:swim    # one pulse cycle of every body that swims, as a strip
bun run raster         # regenerate the baked assets under assets/raster/
bun run raster:verify  # open them in a real browser and check every frame decodes
bun run deploy         # build the director, then push it to Cloudflare (its own worker)
bun run deploy:game    # build the game, then push the worker to Cloudflare
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

**And in a worktree, the entries in `.claude/launch.json` are the wrong tool.**
They carry no `cwd`, so `bun run dev` under one of them resolves against the
*main* checkout's `package.json` and starts main's server — which then resolves
its own tree from `import.meta.url` and cheerfully serves main's code. Nothing
errors. The lane reads a green page and reports a verified result taken off
somebody else's bundle, which is the single failure the whole port arrangement
exists to prevent, arriving by a door it did not cover. A lane in a worktree
launches the server **by absolute path inside its own tree** and then confirms
who answered — `curl -s http://localhost:<port>/__preview` for the game, or the
tree named in the director's own startup line. If the tree in that answer is
not the worktree, the measurement is not about the code under test.

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
- **Everything in the repository is in English** — code, identifiers, commits,
  comments, documentation, and every word the director or the game puts on a
  screen. A session may be held in another language; nothing it writes down is.
  The design vocabulary (hull, lobe, beat, guard) is fixed — do not invent
  synonyms.
