# Queue

Technical work a session found and did not do. Every entry here is waiting for
a session of its own, and every entry here drains without the owner deciding
anything.

**What belongs here.** A refactor stepped around, a rule re-derived instead of
called, a file grown past ~250 lines, dead code, a slow path, a missing test, a
document that no longer describes the code, a tool that would have helped. The
test is one question: **could a fresh session finish this alone and prove it
with `bun run check`?** Yes — it goes here, in the same commit as the work that
found it, without asking first.

**What does not.** A thing the game could be — a creature, a mechanic, a
control, a weapon, a boss, a round — is a decision, and a decision drains only
through the owner. It goes in `docs/spec/`, where the director's
`◇ NOT BUILT YET` sheet reads it next to the built things it would sit beside.
A *look* is not queued either: it is offered in `tools/versus/`, because the
only way to choose one is to see it. Mixing decisions into this file is exactly
what buried the last one under sixty-two entries nobody could face.

**Draining it.** `bun run queue` lists what is waiting, half-done work from
`docs/parked.md` first, and says which items somebody is already on.
`bun run queue next` *hands out* the first free one: it creates that item's
branch, writes a `Taken:` line into the entry on `main` and pushes it, then
prints a prompt naming the branch. The session checks that branch out in its own
worktree, does the item, removes the entry with `bun run queue done <n|title>`,
and lands; the entry goes and the branch goes with it, which releases the item
at the moment the work reaches `main`. If a handed-out item is never started,
`bun run queue release <n|title>` gives it back — the line comes off `main` and
the branch is deleted.

**Marking one ongoing without opening a lane.** A session already in a worktree
that picks an item up itself — draining several in one sitting, rather than
being handed one — says `bun run queue take <n|title>`. That makes the same
claim `next` would have made, branch and `Taken:` line both, and stops there: no
prompt, no worktree. `bun run queue done` drops the claim along with the entry,
so an item stops reading as ongoing at the moment it stops being in the file.

**Is anything still being worked on.** `bun run queue status` answers in one
word — `DONE` when nothing is left at all, `IDLE` when items are waiting and
nobody is on one, `BUSY` when somebody is, naming the items and the branches
holding them. It exists to be asked of a machine that is about to be turned
off: "is the queue finished" is a question about claims, not about whether the
last command printed something.

**A claim is written twice, because neither half reaches everybody.** The branch
is the gate: worktrees of one repository share their refs, so `claude/queue-…`
is visible to the next `bun run queue` with no commit and no push, and two
sessions cannot be handed the same item because the second `git branch` fails.
The `Taken:` line is the half a local ref cannot do — a session working in its
own clone sees only what `origin` carries, and on 3 September 2026 two sessions
did the same six items in parallel for exactly that reason. So the line is
committed straight to `main` and pushed, where it is the first thing anybody
reads. `next` then moves the branch onto that commit, so a lane starts from a
trunk that already carries its own mark and its `queue done` removes the whole
entry without a conflict.

The two things a claim cannot always do are said out loud rather than guessed
at: if no worktree has `main` checked out, or the trunk's copy of this file has
uncommitted changes in it, the branch is still made and a `⚑` line says the
entry went unmarked.

A claim carries no commits, so it points at `main` and reads as fully merged.
`bun run land` sweeps merged branches, and for one day it swept other lanes'
claims along with its own — both sessions running on 3 September 2026 lost every
claim they held and then did the same item twice. `partitionMerged` in
`tools/land/claims.ts` now leaves a claim standing unless it is the branch being
landed, which is the one case where deleting it is the release.

**The format**, one `##` per item, and both fields are required because the
session that picks it up has read nothing else:

```
## One line saying what to change

- **Found:** 2026-09-03, claude/some-lane
- **Files:** `packages/sim/src/step.ts`, `packages/sim/test/step.test.ts`

What is wrong, what to do about it, and anything the code does not already
say. Written for somebody who was not there.
```

A third line, `- **Taken:** 2026-09-04, claude/queue-one-line-saying-what`, sits
between the two while somebody is on it. Nobody writes or deletes it by hand:
`bun run queue next` puts it there and `release` or `done` takes it away, and an
entry that already has one is refused rather than overwritten.

`tools/queue/test/queue.test.ts` holds that format and fails on an entry a cold
session could not act on; `tools/queue/test/taken.test.ts` holds the claim.

## A grip on a ghost draws its ring on the screen the column is hidden from

- **Found:** 2026-09-05, claude/enemy-lock-on-cannon-eab174
- **Files:** `packages/render/src/grip.ts`, `packages/render/test/grip-frame.test.ts`

`drawGrips` walks `world.creatures` and draws a beam, a ring and a label at
`creatureCenter` for every held body, with no idea which seat the screen
belongs to. A falling ghost is grippable, and player 1 is not drawn its body at
all — `showsGhostBody` in `ghost.ts` gives that seat a band across the row and
nothing whatever about the column (`ghost-row.ts` argues at length that
anything varying across the width of the field *is* the column, given away). So
a pilot who sweeps a thumb along the row and finds the body is shown a ring
sitting exactly in the lane the creature exists to keep from them, which is the
whole of THE GHOST undone by an assist.

Skip a body this screen is not shown: `showsGhostBody(l.role, cfg, c)` is
already the rule and already exported. The hand still works — the fall still
slows, and the other seat still sees who is holding what — it is only the
marking that has to go. A frame test that grips a ghost as `p1` and asserts the
canvas took fewer calls than the same run as `p2` holds it.

## Hold `docs/spec/briefings.md`'s wave numbers against `WAVES` with a test

- **Found:** 2026-09-05, claude/tutorial-reset-wave-fixes-ea7302
- **Files:** `docs/spec/briefings.md`, `packages/content/test/waves.test.ts`

The right-hand column of the table in §1 names each teaching block's wave as a
number and a name — `5 · THE ROCK`, `16 · BULB QUEEN`. Nothing checks it, and
every wave inserted before one of those rows moves all of them by one. It was
already wrong before this lane touched it: the bosses row read `16–19, 23` when
THE VANE had been at 27 for some time, and the bestiary row read `20–26` over
a range that had grown.

Parse the `N · NAME` cells out of the table and assert that `WAVES[N - 1].name`
is that name, with a message naming the row. The names in the table are the
handles a person reads, so the test should key on them and let the numbers be
what it checks. Rows that name a *range* rather than a wave (`17–21, 28`)
cannot be checked that way — either give those rows their waves by name too, or
skip anything that is not a single `N · NAME` and say so in the test.

## Move apps/server off the miniflare alpha when a stable 5 ships

- **Found:** 2026-09-03, claude/bun-queue-list-command-5a8695
- **Files:** `apps/server/package.json`, `apps/server/test/room.test.ts`, `bun.lock`

`apps/server/test/room.test.ts` pins `miniflare` at `5.20260831.0-alpha`, exactly
and on purpose. The last stable 4.x is `4.20260730.0`, whose workerd binary
refuses the `compatibility_date` in `wrangler.jsonc` ("newest date supported by
this server binary is 2026-08-06"), and the test reads that date from the
deploy's own config rather than carrying a second copy of it — so a stable 4
would mean testing on a date the deploy does not use.

When a non-alpha 5 is published, move to it and check the config shape the test
builds by hand (`workers[0].config` with `manifest.modules` and
`exports.Room.storage`) still holds — miniflare 5 changed it from 4's flat
`{ modules, script, durableObjects }`, and `convertV4MiniflareOptions` is the
shim that shows what the new shape wants if it changed again.

## THE VOLLEY's guide has no rehearsal, so its wave is read rather than watched

- **Found:** 2026-09-04, claude/meteor-enemy-shield-reflect-0d82f2
- **Files:** `packages/content/src/scenes.ts`, `packages/content/src/scenes/`,
  `packages/content/src/waves/act-5.ts`

THE VOLLEY shipped with a three-line prose guide and no `scene`, exactly as THE
CAROM did two entries up and for the same reason: what the pair has to learn is
a *shape* — a ward that sends the body back up the field rather than off it —
and a shape does not read off a line of text. It is the worse of the two to
describe, because the thing being taught is that a control they already know
does something it has never done before.

Write one under `packages/content/src/scenes/the-volley.ts` on the pattern
`the-recoil.ts` sets, register it in `scenes.ts`, and put `scene: "theVolley"`
on the `theVolley` wave's guide. Three steps: the diagonal coming down and the
shield answering it, the body climbing away with one plate fewer, and the shell
bursting in mid-air over a body the cannon then takes. The rehearsal walk in
`packages/content/test/` picks it up on its own once it is named.

## `tools/frames`' browser tests fail intermittently under a full `bun run check`

- **Found:** 2026-09-04, claude/air-above-the-ship-seat-tint
- **Files:** `tools/frames/test/opening.test.ts`, `tools/frames/capture.ts`, `tools/frames/serve.ts`

Twice in five runs of `bun run check` a single test in `tools/frames/test/`
failed, and once in isolation it passed immediately. The one run that named it
was "captureFrames past a wave's opening > stands on the guide, and a strip of
it counts painted frames", failing inside `captureFrames` at `capture.ts:193`.
Every other test in the repository is a pure function or a stub canvas; these
are the only ones that start a real preview server and drive a real browser,
and `bun test` runs files in parallel, so under the full suite they are
competing for a port and for CPU with two hundred other files.

A green check that is only green four times in five is not a gate. Find the
race — the likeliest candidates are the timeout `capture.ts` waits for a
painted frame under, and whether `serve.ts` can be handed a port another test
file's server has just taken — and make it deterministic. Running the file
alone repeatedly is the reproduction to beat: it has to fail there before a fix
means anything, so drive the load up rather than lowering the timeout and
calling it fixed.

**What has already been tried, on 5 September 2026, without reproducing it.**
Seven full runs of the suite: four on their own, and three with two more copies
of `bun test` running beside them, which is about as starved as this machine
gets. Every one of the four browser tests passed. Timed on an idle machine each
capture costs about two seconds against a thirty-second budget, so whatever
goes wrong is not the happy path being slow — it is fifteen times over. Two
things came out of the attempt and are worth having before the next one starts.
`bun run check` runs its three parts in sequence, so it is exactly `bun test`
for contention and there is nothing to be gained by driving the whole command.
And the file launches **four separate headless Chrome instances**, one per
`captureFrames`, inside a 272-file parallel run — that is the part of the cost
which is neither measured nor bounded, and sharing one browser across the file
is the change to reach for once the failure can be produced on demand.

## A scene cannot put the shield where a body actually is

- **Found:** 2026-09-05, claude/queued-items-d3ce8d
- **Files:** `packages/content/src/scene-types.ts`, `packages/content/src/scene-script.ts`,
  `packages/sim/src/scene.ts`, `packages/content/test/scenes.test.ts`

Every column in a film is an *authored* column: `actCol` puts a `SceneAct`'s
`col` through `mapCol`, which maps 0..6 onto the real field. On the eleven
columns the game ships, that reaches 0, 2, 3, 5, 7, 8 and 10 — and nothing
else. For a strip act that is a hole rather than a rounding: a shield authored
into column 4 lands in 3 or 5, and a body standing in 4 goes past it.

It is what blocks THE VOLLEY's rehearsal, which is the other half of this
entry's reason for existing. A volley's three wards land eight columns apart
with a reflection at each wall, and every one of the eleven possible start
columns was tried: none puts all three ward columns *and* the column the shell
bursts over inside the seven a film can name. So a three-ward film cannot be
written without letting one arrival through, and the one it lets through is the
lesson.

The vocabulary already has the answer twice and it is not a wider grid. A grip
is authored as a column and the *body standing there* is found at the moment
the hand goes down (`gripCol` in `sim/scene.ts`), and THE LID's cord is
authored the same way (`dragCol`) for the same reason: ids do not exist when a
film is written. A strip wants the third reading of that — an act that says
*the shield goes where this body is going to be*, resolved by `SceneRun` out of
the world rather than by an author out of a grid. Add it to `SceneAct`, resolve
it in `aimed`, and hold it in `scenes.test.ts` the way the other two are held.
Then write THE VOLLEY's film, which is a queue entry of its own and stays there.

## Split `effects-spark.ts`: it is on the 250-line limit and blocks every new event

- **Found:** 2026-09-05, claude/carom-enemy-deflection-d1bb2e
- **Files:** `packages/render/src/effects-spark.ts`, `packages/sim/test/limits.test.ts`

`burstFor` is one exhaustive switch over the whole of `SimEvent`, and the file
is at 250 lines to the line. Adding `chuteCut` — one `case` and one clause of
comment — pushed it over, and the only way to land it was to reword two
comments belonging to other creatures until five lines came back. That is a
cost every future event pays, and it is paid by editing prose nobody meant to
touch, which is exactly how an argument written down carefully gets shortened
by somebody with a different aim.

Split it the way `effects-ingest.ts` was split out of `effects.ts`: the table
is already in two halves that never mix — the cases that *return a burst* and
the long tail that returns `null` because the event is drawn some other way.
Move the tail into `effects-spark-silent.ts` as a `Set<SimEvent["type"]>` or a
second exhaustive switch that `burstFor` consults first, keeping the property
that matters — a new event that nobody accounts for is a compile error rather
than a silence. Both files then have room, and `limits.test.ts` goes green
without anybody rewriting a sentence about THE GHOST.

## CLAUDE.md is nine characters under its own ceiling

- **Found:** 2026-09-05, claude/queued-items-d3ce8d
- **Files:** `CLAUDE.md`, `tools/test/claude-md.test.ts`

`tools/test/claude-md.test.ts` caps the file at 22,000 characters because it is
loaded into every session and re-read whenever it changes. It stands at 21,991,
which is not headroom — it is a wall the next rule to be written down walks
into. `bun run sweep` landed with no line in the commands table for exactly
that reason, and it was not the last: `bun run maze`, which draws the sheets THE MAZE is
played on, is missing from the table for the same reason. Both lines go in
once there is room for them.

The test's own comment says what to do and the file has been through it once
before, at 537 lines: the argument for a rule moves to `docs/`, one hop from a
pointer, and the rule stays. Read the sections that are narrative rather than
imperative — "A look is offered, never replaced" and "A technical finding is
queued; an idea is not" both run to a page and both already have a document
behind them (`docs/looks.md`, `docs/queue.md`'s own preamble) — and move the
prose there, leaving what a session has to *do*. Then put the missing
`bun run sweep` line in the commands table with the room that buys.

## `bun run frames` cannot photograph a burst: sparks move only when it paints

- **Found:** 2026-09-05, claude/explosion-color-matching-464ec1
- **Files:** `tools/frames/run.ts`, `tools/frames/launch.ts`, `apps/game/src/handle.ts`

`handle.ts`'s `advance(ticks)` steps the simulation without painting, and
`paint()` advances every render effect by exactly one sixtieth of a second. So
the two clocks come apart: a strip that walks a wave at `--stride 3` moves the
world three ticks and the sparks one frame, and anything that lives in *painted*
seconds — a spark's 0.4 s, the last-step fall replay in `rock-impact.ts` — is
still on screen thousands of ticks later, or has not started yet.

The practical consequence is that a burst at the hull is uncapturable. Four
captures were spent on the colour change that found this — a bulb's cyan burst
and a rock's impact — and none of the frames contained a single spark: the rock
hung a few pixels above the skin for sixty painted frames because its replay had
only advanced one second's worth of sixtieths.

What to add is a paint-only mode: something like `--settle <n>`, which paints
`n` frames without stepping the world at all, so a caller can advance to the
tick the event fires on and then let the picture catch up. The tool's own tests
in `tools/frames/test/` are where it is proved; `opening.ts` already counts
painted frames rather than ticks for a rehearsal and is the shape to copy.
f91f97a5 (Queue: bun run frames cannot photograph a spark burst)
