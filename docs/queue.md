# Queue

Work a session found and did not do. Every entry here is waiting for a session
of its own, and most of them drain without the owner deciding anything — the
ones that do not say so on their own line.

**What belongs here.** A refactor stepped around, a rule re-derived instead of
called, a file grown past ~250 lines, dead code, a slow path, a missing test, a
document that no longer describes the code, a tool that would have helped, and
**a command that failed and was worked around** — retried, slept past, run
twice. Working around one is what keeps it, and every later session pays the
same tax in minutes and in tokens. The test is one question: **could a fresh session finish this alone and prove it
with `bun run check`?** Yes — it goes here, in the same commit as the work that
found it, without asking first.

**And a landing that could not check itself writes one, without being asked.**
`bun run land --unverified "<what>"` puts an `## Unverified at <sha>:` entry
here at the moment the trunk moves, and a cloud session uses it every time it
lands something it could not look at — a wave never watched at tempo, a shape
never seen to move, a frame cost the sandbox is too slow to take. It is an
ordinary entry: claimed, opened on a machine that can look, and removed with
`queue done`. `docs/cloud-session.md` has why the alternative — leaving it in a
report that ends with the session — was the half of that arrangement that never
worked.

**And a topic that asks the owner something belongs here too**, on an
`- **Asks:** <question>` line. That is a change the owner made on 6 September
2026, and it reverses the paragraph this file used to carry. What it fixes is
where such a thing was going instead: a question filed in `docs/spec/` is on a
page nobody opens on the way to work, so it was read the day it was written and
never again. Here it is in front of whoever runs `bun run queue`, the listing
marks it `ASKS THE OWNER`, and `next` hands the session a prompt that puts the
question first and says to build nothing until it is answered.

Such an entry is otherwise an ordinary one and is held to the same test — it is
claimed, worked in its own lane and removed by `queue done` — so the body still
has to say what to change and still has to **name the options the answer picks
between**. "What should this look like?" is not an entry. "Three places it
could be drawn, and here is what each costs" is.

**And nowhere else.** Not the report, which scrolls away — the next session
clones `origin` and sees only files. Not a suggested background task either:
this file *is* the mechanism, and a chip is a popup the owner has to dismiss
that says nothing `bun run queue` does not already say to whoever asks it. A
finding written here is read by every session that comes after; a finding
offered as a chip is read once, by the one person the queue exists to spare.

**What still does not.** A thing the game could be — a creature, a mechanic, a
control, a weapon, a boss, a round — goes in `docs/spec/`, where the director's
`◇ NOT BUILT YET` sheet reads it next to the built things it would sit beside.
A *look* with a shipped alternative is offered in `tools/versus/`, because the
only way to choose between two is to see both.

The line between those and an `Asks:` entry is **whether there is work waiting
on the answer**. A creature nobody has built is a page in the spec: there is no
lane held up by it, and the owner picks from that sheet when he opens a session
to. A control that is drawn but says the wrong word is an entry here: the work
is decided, sized and sitting in named files, and the only thing missing is one
sentence from him. Filing the first kind here is what buried the queue last
time under sixty-two entries nobody could face, and that has not stopped being
true — the new rule widens the door by one hinge, not off them.

**Draining it.** `bun run queue` lists what is waiting, half-done work from
`docs/parked.md` first, and says which items somebody is already on. **It also
says when an entry has gone stale** — a file its `Files:` line names was
changed on `main` by a commit dated after the entry, or is not on `main` any
more — with the commit's sha and subject, so the session that claims it
re-reads before it works; the entry itself is left as it was.
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

A clone with nothing on `main` — every cloud session, where the one checkout
stands on the lane and the trunk is a ref beside it — gets the same line by a
different route: the commit is written onto the ref directly, without a
checkout, and the lane's own working tree is not touched. The one thing a
claim still cannot do is said out loud rather than guessed at: if the trunk's
copy of this file has uncommitted changes in it, the branch is made and a `⚑`
line says the entry went unmarked.

An entry that is not on `main` yet — the owner asked for it to be queued and
worked in the same sitting, so it is in the lane's working tree and nowhere
else — is marked where it is: the branch is made, the line goes into the
working copy, and the lane commits it with the work that queued it. And a
claim that fails between the branch and the line takes the branch back down
with it, so the next `take` starts from nothing rather than from a ghost
that says the item is already taken.

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

`- **Taken:** 2026-09-04, claude/queue-one-line-saying-what` sits between the
two while somebody is on it. Nobody writes or deletes it by hand:
`bun run queue next` puts it there and `release` or `done` takes it away, and an
entry that already has one is refused rather than overwritten.

`- **Asks:** <question>` is the fourth line, and it is the only one a finder
writes on purpose. It goes under `Files:`, it has to end in a question mark —
the parser refuses one that does not, because an `Asks:` reading like a task is
a line the owner agrees with and still cannot answer — and it makes the listing
say `ASKS THE OWNER`. Write the question so it can be answered in a sentence,
and let the body carry the options it picks between:

```
## A button says two words where a sentence was asked for

- **Found:** 2026-09-06, claude/some-lane
- **Files:** `packages/content/src/controls.ts`
- **Asks:** Leave the two words, hang a caption over the band, or widen the lobe?

Why the short label is what fits today, and what each of the three costs.
```

`- **Where:** cloud` or `- **Where:** local` reserves an entry for one kind of
session, and it is the owner's line rather than the finder's. He asked for it
on 13 September 2026, the day a local session re-watched four waves a cloud
session had built: some work can only be done on a machine with a screen and a
real frame budget — a wave watched at tempo, a `bun run perf` — and some he
wants handed to a cloud session on purpose, from his phone, so the session on
his own machine stays free. The listing marks such an entry `CLOUD ONLY` or
`LOCAL ONLY`, `bun run queue next` passes over one kept for the other kind,
and `next <n>` or `take <n>` naming it is refused with the reason. A session
knows which kind it is by `CLAUDE_CODE_REMOTE`, the signal the web image sets
(`tools/queue/where.ts`). Without the line an entry is anybody's, which is
still what nearly every entry is.

`tools/queue/test/queue.test.ts` holds that format and fails on an entry a cold
session could not act on; `tools/queue/test/taken.test.ts` holds the claim;
`tools/queue/test/where.test.ts` holds the reservation.

## `skins/light.ts` is at the limit: the axis is one subject, the passes another

- **Found:** 2026-09-14, claude/queue-items-8b11f4
- **Taken:** 2026-09-14, claude/queue-skins-light-ts-is-at-the-limit-the-axis-is-one-s
- **Files:** `tools/director/src/skins/light.ts`

The file is 249 lines. Eleven skins import the passes — `terminatorPass`,
`contactPass`, `specularPass`, `rimLightPass` — from it, so the passes stay
put. What moves is what they are built on: the `U_*` stops along the key axis
(`BODY`, `FOCUS`, `SPAN` and the four derived from them), the six colour
names, `Stop`, `addStops`, `keyAxis`, `bodyFill`, `bodyStroke` and
`insideBody`, lines 34 to 142, into `light-axis.ts`, exported; `light.ts`
imports what the passes and `LIGHT` use. `KEY` stays exported from
`light.ts`, where the skins find it. Proof: `bun run check:fast`.

## `veer-clown-shape.ts` is at the limit: the figure is not the shape

- **Found:** 2026-09-14, claude/queue-items-8b11f4
- **Files:** `packages/content/src/veer-clown-shape.ts`, `packages/content/src/index-shapes.ts`

The file is 250 lines: the four `Clown*` interfaces and the `VEER_CLOWN`
record are the shape; `clownFigure` and `clownLoops` (lines 167 to 250) are
the geometry that places it at a centre and a size. Move the two functions
into `veer-clown-figure.ts`, importing the interfaces back, and add the new
file's exports to the barrel in `index-shapes.ts` beside the existing
`veer-clown-shape.js` block — `render/veer-clown.ts`, `render/veer-look.ts`
and `shape-sheet/veer-subject.ts` import through `@neon-spore/content` and
do not move. Proof: `bun run check:fast`; the shape sheet's veer subject is
drawn in `tools/shape-sheet/test`.

## `ready-page.ts` is at the limit: the words on the page are a second subject

- **Found:** 2026-09-14, claude/queue-items-8b11f4
- **Files:** `packages/render/src/ready-page.ts`

The file is 249 lines: the page's measure (`readyCircles`, the `*Y` helpers)
and `drawReadyPage` are one subject; `label`, `ask`, `WaitingState` and
`waiting` (lines 186 to 249) — the sentence over the circles and the loud
one-line WAITING — are the other. Move the four into `ready-words.ts` with
the `ASK_SUB` and `LABEL_GAP` constants they read, exported;
`drawReadyPage` imports `ask`, `label` and `waiting` back. Proof:
`bun run check:fast` — `frame.test.ts` and `guide-nav.test.ts` draw the page.

## `sound-page.ts` is at the limit: a row is not the page

- **Found:** 2026-09-14, claude/queue-items-8b11f4
- **Files:** `tools/director/src/sound-page.ts`

The file is 249 lines. `line`, `round`, `recipe` and `row` (lines 35 to 114)
build one sound's row — the recipe as its numbers, the PLAY button, the
status — and `renderPage`, `renderAll`, `bindSoundPage` and `buildTabs` are
the page around them. Move the four into `sound-row.ts`, `row` exported and
taking the `Engine` it plays through as an argument rather than reading the
module-level one; `sound-page.ts` imports `row`. Proof: `bun run check:fast`;
`tools/director/test` holds the page's tests.

## `scene-art.ts` is at the limit: the overlay is drawn beside the placing

- **Found:** 2026-09-14, claude/queue-items-8b11f4
- **Files:** `tools/director/src/scene-art.ts`, `tools/director/src/scene-panel.ts`

The file is 249 lines: `Placed`, `bodyScale`, `drawnHalfHeight` and
`placeBodies` decide where a scene's bodies stand; `drawOverlay` and `label`
(lines 180 to 248) draw one frame of them with the own-motion applied as
`render/creatures.ts` applies it. Move the two into `scene-overlay.ts`,
importing `Placed` and `TINT` (export it) back; `scene-panel.ts` imports
`drawOverlay` from there, and the `drawMarks` re-export on the last line goes
with it or stays — either way `scene-panel.ts` is the one importer. Proof:
`bun run check:fast`, `scene-label.test.ts` among it.

## `gyre.ts` is at the limit: the wheel's drawing is a second subject

- **Found:** 2026-09-14, claude/queue-items-8b11f4
- **Files:** `packages/render/src/gyre.ts`

The file is 249 lines: `gyres`, `gyreRadiusPx` and `drawGyres` find the
wheels and loop over them; `drawWheel`, `membrane` and `band` (lines 116 to
249) with the `RIM_SPLIT`, `MEMBRANE`, `RIPPLE`, `MEMBRANE_POINTS`,
`SPOKE_BOW` and `CORE` constants above them draw one. Move the drawing into
`gyre-wheel.ts`, `drawWheel` exported; `drawGyres` imports it. Proof:
`bun run check:fast` — `frame.test.ts` draws THE GYRE — and the op-log hash
of `runFrames(peakWorld("theGyre"), role, 480)` per seat, unchanged before
and after (`tools/probe`).

## `perf/compare.ts` is at the limit: the run's shape is not the comparison

- **Found:** 2026-09-14, claude/queue-items-8b11f4
- **Files:** `tools/perf/compare.ts`

The file is 249 lines and `WaveCost`, `Run` and `WaveDelta` (lines 32 to 168)
are two thirds of it — the record a run writes and the row a comparison hands
back — while `compareRuns` and `noVerdict` are the comparison. Move the three
interfaces into `run-types.ts` and re-export them from `compare.ts`
(`export type { Run, WaveCost, WaveDelta } from "./run-types.js";`) so the ten
files that import them from `compare.js` do not move. Proof:
`bun run check:fast`, `tools/perf/test` among it.

## `skins/vein-pulse.ts` is at the limit: growing the tree is not lighting it

- **Found:** 2026-09-14, claude/queue-items-8b11f4
- **Files:** `tools/director/src/skins/vein-pulse.ts`

The file is 250 lines: `Segment`, `SURFACES`, `grown`, `strand` and
`proudGroup` (lines 57 to 172, less `Lit`) grow the filaments and stroke them;
`Layer`, `UNDER`, `PROUD`, `layer`, `pulse` and the `VEIN_PULSE` skin light
them beat by beat. Move the growing into `vein-pulse-tree.ts`, exported;
`vein-pulse.ts` imports `grown`, `strand` and `proudGroup` and keeps `Lit`,
which only `layer` and `pulse` read. Proof: `bun run check:fast`;
`tools/director/test/skin-still.test.ts` mounts every skin.
