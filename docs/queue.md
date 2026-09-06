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
## The relief says HOLD FIRE, not the sentence asked for

- **Found:** 2026-09-06, claude/some-lane
- **Files:** `packages/content/src/controls.ts`
- **Asks:** Leave the two words, hang a caption over the band, or widen the lobe?

Why the short label is what fits today, and what each of the three costs.
```

`tools/queue/test/queue.test.ts` holds that format and fails on an entry a cold
session could not act on; `tools/queue/test/taken.test.ts` holds the claim.



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

## Nothing on the field says the dome is torn

- **Found:** 2026-09-06, claude/control-set-malfunction-mods-vv9icb
- **Files:** `packages/render/src/malfunction-look.ts`, `packages/render/src/band-channel.ts`, `packages/sim/src/barb.ts`
- **Asks:** Draw the scar on player 2's shield strip, on player 1's trigger, or on the dome itself?

THE BARB catches the dome and `domeScarred` then makes `guardArmed` answer false
for `barbScarBeats`. Nothing draws that. The trigger simply stops lighting, and
a control that quietly does nothing is indistinguishable from one that is
broken — which is the exact failure `drawLock` was written to avoid for THE
MIRROR. A pair will read it as a bug the first time, and on THE TWITCH they meet
it under a fault that arms the dome for them, so they never pressed anything at
all.

It is a **defect rather than an unlovely look** (`docs/looks.md`'s third
exemption), so it does not go to VERSUS and does not need a candidate beside it.
`domeScarred(world)` is the one question to ask and it is already exported.

**The owner's answer decides where it is drawn, and there are three places:**

- **a) On the shield strip.** A torn edge or a red break in player 2's channel
  for as long as the scar is open — the plate is theirs and this is what has
  been taken away from them. `band-channel.ts` draws the strip.
- **b) On the trigger.** A scar over player 1's GUARD lobe, the way a fault is
  drawn over a dead one — `drawFaultOver` in `malfunction-look.ts` is the shape
  to reuse. But under a shield fault that button is dead already, and two kinds
  of damage on one lobe would read as one.
- **c) On the dome itself, over the hull.** Truest to what happened and the most
  work: the shield is drawn from `ship-silhouettes.ts` and nothing there takes a
  damage term yet.

Take (a) if the answer has not arrived: it is the seat that lost something, it
is one file, and it does not collide with a fault already drawing on the lobes.
Count the beats down visibly either way — how *long* is the half the pair has to
say out loud.

## The relief says HOLD FIRE, not the sentence asked for

- **Found:** 2026-09-06, claude/control-set-malfunction-mods-vv9icb
- **Files:** `packages/content/src/controls.ts`, `packages/render/src/band-control.ts`, `packages/render/src/malfunction-look.ts`
- **Asks:** Leave the two words, hang a caption over the band, or widen that one lobe?

The owner asked for the relief to say what it pauses — *"Pause p2 cannon
malfunction"* — and it says `HOLD FIRE` and `HOLD DOME`. That is not a
compromise anybody argued for, it is what fits: a band lobe is drawn at
`l.lobeR` and the label is 9px Courier under the face, so about nine characters
before it runs into the lobe beside it. The long sentence is on the CONTROLS
page (`apps/game/src/menu-controls.ts`, which reads `ControlDef.does`) and in
each wave's guide, and nowhere the pair can see mid-wave.

This one **is** a look and the owner decides it. Do not pick one and land it.

- **a) Leave it.** Two words is what a thumb reads under a beat, and the guide
  has already said the rest twice before the wave starts.
- **b) A caption over the band**, the way a rehearsal points at a control
  (`caption-anchor.ts` already anchors to a lobe by id). Room for the whole
  sentence, on the first wave that carries a fault and never again.
- **c) A wider lobe for this one control.** `bandLobes` centres a seat's lobes
  in its share and would take a per-control width; the relief is the only
  button in the game that would want one, which is the argument against.

Whichever it is, `ControlDef.label` is the one copy of the word — the band, the
CONTROLS page and the director's panel roster all read it, so nothing needs a
second string.

## `bun run perf` restarts its own clock at zero for every wave

- **Found:** 2026-09-06, claude/hoof-magnet-enemy-70fd5a
- **Files:** `tools/perf/measure.ts`, `packages/render/src/effects.ts`

`timePaints` freezes `performance.now` and steps a `posed` counter that starts
at **0** for each wave it measures. The renderer reads that clock as the wall
clock, so the first paint of every wave after the first is handed a step of
minus however long the sweep has been running — and every transient in
`Effects` is a `+= dt` read back as a phase.

It crashed a run: a clasp coming apart on a negative age put a ring at a
negative radius and Chrome refused the frame with `IndexSizeError`, which
reads as a game bug and is not one. `Effects.update` now refuses a
non-positive step, so nothing crashes and the numbers are sound — but the
harness is still lying about time, and the frame it lies on is a real frame in
a real measurement.

The fix is in the harness rather than in the guard: carry `posed` on from
where the previous wave left it, or reset the page's own effects between
waves. Either way the comment in `timePaints` about a fake clock making the
sequence of pictures identical run to run has to stay true, which is the whole
reason the counter starts where it does — so the answer is probably a running
offset kept across waves rather than the real clock.

## Three private copies of one LCG, beside the shared hash render/ already has

- **Found:** 2026-09-06, claude/fence-enemy-visuals
- **Taken:** 2026-09-06, claude/queue-three-private-copies-of-one-lcg-beside-the-share
- **Files:** `packages/render/src/scars.ts`, `packages/render/src/snake-shot.ts`, `packages/render/src/lure-blast.ts`, `packages/render/src/hash.ts`

`packages/render/src/hash.ts` exists to be *the* repeatable 0..1 in render/, and
its own header says seven files carried a private copy before it was written.
Three still do, and all three are the same linear congruential generator with
the same two constants: `scars.ts` and `snake-shot.ts` each declare a local
`stream(seed)` around `Math.imul(n, 1664525) + 1013904223`, and `lure-blast.ts`
spells one step of it inline. `packages/sim/test/purity.test.ts` catches a
fourth copy — it stopped this lane writing one — but it matches on the *sine*
hash and says nothing about these.

Two halves, and the second is the point of the entry:

- **Give `hash.ts` a stream.** `sinHash` answers one number from its arguments
  and these three want a *sequence* from one seed, which is a real difference
  and why the copies exist. `export function stream(seed: number): () => number`
  next to `sinHash`, with the header's own reasons, and the three call sites
  reduced to importing it. Nothing drawn may change: `scars.ts` and
  `snake-shot.ts` must keep the exact constants and the exact `(n >>> 8) % 10000`
  reduction, so the same seed gives the same crack.
- **Add the row to `purity.test.ts`.** The table there is what stops the next
  copy, and a rule that is only half in it is a rule that gets re-derived. The
  new row matches the constant `1664525`.

## The desk rig cannot carry a body sideways

- **Found:** 2026-09-06, claude/meteor-pull-drag-mechanics-42170b
- **Files:** `apps/game/src/keys.ts`, `apps/game/src/key-hint.ts`, `apps/game/src/menu-controls.ts`, `apps/game/test/keys.test.ts`

THE PUSH is the grip carried sideways: a `drag` at `gripBody` whose
`fromMilli` is how far the finger has come from where it grabbed
(`packages/sim/src/grip-push.ts`). `G` at a desk takes hold of the nearest body
and there is no key that moves it, so the whole mechanic can only be reached
with a pointer — which means the director's stage and a mouse, and nothing at
all from a keyboard-driven check.

Two keys beside `G`, and they have to send a *cumulative* distance rather than
a step: keep a running number of thousandths for as long as `G` is held, add or
subtract `cfg.gripPushMilli` per press, and send `{ kind: "drag", target:
"gripBody", on: true, fromMilli, id }` with the same id `nearestHull` gave the
grip. Reset it to nought on the `G` keyup, which already sends `NO_GRIP`. The
sim heals a dropped one on its own, so nothing has to be sent per tick.

`,` and `.` are free and sit under the same hand as `G`. `key-hint.ts` and
`menu-controls.ts` both carry the list a reader sees and each needs the row.

## A body carried a column makes no sound

- **Found:** 2026-09-06, claude/meteor-pull-drag-mechanics-42170b
- **Files:** `packages/sim/src/grip-push.ts`, `packages/sim/src/events.ts`, `packages/audio/src/sounds/creature.ts`, `packages/render/src/effects-ingest-silent.ts`, `packages/render/src/effects-spark-silent.ts`

THE PUSH moves a held body one column on the beat and pushes no event, so the
mixer has nothing to play and the seat that is not holding it hears the lane
change only if they happen to be looking. `ship.gripSlip` already exists for a
hand coming off, which is the same class of thing said out loud.

`carryGrips` is where it lands. Push a `{ type: "carry"; player: 1 | 2; col:
number; row: number; dir: -1 | 1 }` from there — `player` is whichever hand
spent the column, and both when both did. `col` is `bodyCenterCol(c, c.col)`,
the way the `grip` event next door reads it, so the pan is right for a wide
rock. A new `SimEvent` has to be named in the two silent lists in render/ or
`effects-spark.ts`'s `assertNever` stops compiling; whether it also throws a
spark is a look and belongs to the owner, so name it silent and leave the
picture alone.

The cue itself is amber's family — the pod's colour is what the grip is drawn
in — and short: a beat is 625 ms at 96 BPM and a body can be carried every
other one, so anything with a tail on it will overlap itself.

## Nothing teaches THE PUSH, and THE HAND is where it belongs

- **Found:** 2026-09-06, claude/meteor-pull-drag-mechanics-42170b
- **Files:** `packages/content/src/waves/`, `packages/content/src/scenes/`, `docs/spec/assists.md`

THE PUSH ships with no guide page: a pair meets it only if somebody happens to
move a thumb that is already holding a rock. The owner's answer is that it goes
on **THE HAND (wave 6)** — three rocks on one beat in three columns against one
shield, the wave whose arithmetic already does not work without a hand, so a
second thing a hand can do belongs there and nowhere earlier.

Read `.claude/skills/new-tutorial` before writing it; every rule in there is a
correction the owner has already made once. Two things this page in particular
has to respect. THE HAND already introduces the grip, so this is a *second*
page on one wave rather than a second wave teaching the same thing — the
rehearsal has to show the hold first and the carry out of it, not two gestures
side by side. And `SceneAct.drag` can drive it: `gripBody` is a `DragTarget`
and `tautMilli` already answers `cfg.gripPushMilli` for it, so the film carries
the hand a tile across the way it carries a cord (`scene-script.ts`).

The sentence to beat: a hand on a rock does two things, and the second one is
the column.

## The relay's "run nobody came back to" test is timing-flaky under a full suite

- **Found:** 2026-09-06, claude/veer-brush-preview-tiles
- **Files:** `apps/server/test/room.test.ts`

`ends a run nobody came back to, so the next arrival starts a fresh one`
shortens the room's two real-time windows to `SEAT_SILENT_MS: 100` and
`RUN_OVER_MS: 200` and then waits `quiet(400)` for them to expire. Run on its
own the file is green; run inside `bun test` with three hundred other files on
one machine it failed once with `expected > 0, received 0` — the wait elapsed
before the room had processed the silence, so the next arrival was handed the
old stamp. Nothing about the relay is wrong; the test measures a deadline
against a wall clock that a loaded machine does not honour.

Make it wait for the *state* rather than for a duration — poll the next
arrival's `welcome` until the stamp clears, with a generous ceiling — or raise
the two windows and the wait together so the margin is not a tenth of a second.
Both are local to that one test; the second is a smaller change and the first
is the one that cannot come back.

## `bun run frames --press grip=<id>` puts no hand on any body

- **Found:** 2026-09-06, claude/hoof-magnet-enemy-70fd5a
- **Files:** `tools/frames/press.ts`, `tools/frames/capture.ts`, `tools/frames/hold.ts`

The flag parses, `SEAT_OF` calls a grip the one press either seat may send, and
`capture.ts` hands it to `window.neonSpore.send` on the tick asked for — and
nothing takes hold. No ring (`render/grip.ts`), no frame and no dotted link
(`render/lock-mark.ts`), on any wave, for either seat, and for every creature
id tried. A `cannonCol` press on the same command line lands, so the pipe
itself is sound: it is this one command.

Two things it could be, and the entry is worth a lane because they are not the
same repair. Either the id is not what a caller can guess — `world.nextId` may
be well past 1 by the time a jumped-to wave's first body arrives, in which case
the flag needs a way to name *the first body on the field* rather than a number
nobody can know from outside — or the command is dropped somewhere between
`send` and `applyCommand` and a grip has never worked here at all.

**It cost this lane a picture.** THE MAGNET can only be killed by a locked
shot, so the one frame that shows the whole creature — the bolt climbing, the
corner, the horizontal leg arriving at a pole — cannot be captured, and the
owner was sent a shot bouncing off the plate instead. Every later lane that
touches THE LOCK, THE GRIP or this creature pays the same price.

## The vote box says `tools/versus/prompt.ts` is not built yet, and it is

- **Found:** 2026-09-06, claude/versus-page-refactor
- **Files:** `tools/director/src/versus-vote.ts`, `tools/versus/prompt.ts`,
  `tools/versus/prompt-changes.ts`, `tools/versus/prompt-close.ts`,
  `tools/versus/prompt-steps.ts`, `tools/versus/prompt-text.ts`,
  `tools/versus/test/prompt.test.ts`

`emit` in `versus-vote.ts` builds a short clipboard record and says so twice —
once in its docstring, once in the first line of the text it copies:
"Not the adoption prompt: `tools/versus/prompt.ts` is not built yet". It is
built. `tools/versus/prompt.ts` and its four companions exist, are typechecked
and linted, and `tools/versus/test/prompt.test.ts` passes against them — but
nothing in the director imports any of them, so the full adoption prompt
`docs/versus.md` specifies has never once reached a clipboard, and roughly
four hundred lines of tool are dead code carrying a test that proves they work.

Two ways out and they are not equivalent. Either wire it: `emit` calls the
builder and copies what it returns, and the two "not built yet" sentences go.
Or delete the five files and the test, and say in the commit that the short
record is the whole of what a vote emits. The first is what `docs/versus.md`
argues for at length, including the `bun run shapes` step and the reader grep
it says the prompt must carry; the second is honest if nobody wants that text.
Read `docs/versus.md`'s "The prompt a vote emits" before choosing — it is a
decision that document already made, and this entry exists because the code
never caught up with it.

## Every file a new creature must touch is sitting on the 250-line ceiling

- **Found:** 2026-09-06, claude/shielded-meteor-enemy
- **Files:** `packages/sim/src/hash-creature.ts`, `packages/sim/src/events-creature.ts`, `packages/sim/src/creature-state.ts`, `packages/sim/src/bullet-hit.ts`, `packages/sim/src/creature-kinds.ts`, `packages/render/src/comms.ts`, `packages/audio/src/bind-creatures.ts`

Adding THE COIL cost five unplanned splits *before* the creature could land,
and none of them was a decision this lane wanted to make: `beat.ts` went out to
`own-step.ts`, THE GYRE's four fields out of `creature-state.ts` to
`creature-state-gyre.ts`, THE COIL's cues out of `bind-creatures.ts` to
`bind-coil.ts`, `Cue` out of `bind.ts` to `bind-cue.ts`, and four bodies out of
`packages/sim/src/index.ts` to `index-bodies.ts`. Three more files —
`bullet-hit.ts`, `events-creature.ts` and `ship-fields.ts` — only fitted
because comments were shortened to buy back two or three lines each, which is
the limit being paid off rather than obeyed.

That is not the limit misbehaving. It is that **the files a creature has to
touch are exactly the files that grow by a row per creature**, and nineteen
files in the repository are at 250 exactly today with another thirty within
five. The seven above are the ones on the path of every new body, so the next
creature will hit the same wall in the same places, and the split it is forced
into will again be chosen by whoever happened to be adding a creature that day.

Split them **now, on purpose**, before a lane has to. Each already has a seam
its own header describes — `creature-state.ts` names its five sub-files,
`events-creature.ts` names its six, `bind-creatures.ts` names its five — so the
work is to carry one more group out of each and leave real room. Nothing
outside `packages/sim` need change; `bun run check` is the proof.

## packages/sim/src/index.ts is at its 250-line ceiling and shaping other files

- **Found:** 2026-09-06, claude/fence-enemy-visuals
- **Files:** `packages/sim/src/index.ts`

The barrel is 249 lines and the limit is 250, so a lane that adds two rules to
`packages/sim` cannot list them. This one wanted `fenceIsBurnt` and
`fenceSettleTicks` beside the four fence exports already there; the explicit
list wraps to nine lines and put the file over, so it went out as
`export * from "./fence.js"` instead — which is a real pattern in the file
(`boss-surface.js`, `fault-surface.js` do it) but was chosen for the line count
rather than for the boundary. That is the file deciding an API question by
running out of room, and the next lane will hit it again.

Split it the way `packages/render` never had to: one barrel that re-exports a
handful of grouped ones. The grouping is already visible in the file's own
order — the field and its bodies, the controls and commands, the bosses and
their rounds, the openings and guides. Nothing outside `packages/sim` may need
to change: `index.ts` stays the one import path, and
`bunx tsc --noEmit` across the workspace is the proof.

## A narrow perf --save overwrote a neighbouring wave's row

- **Found:** 2026-09-06, claude/fence-enemy-visuals
- **Files:** `tools/perf/run.ts`, `tools/perf/compare.ts`, `tools/perf/baseline.json`, `tools/perf/test/compare.test.ts`

Inserting THE CUT at wave 48 pushed THE MAGNET, THE JAM and THE TWITCH up by
one, and `baseline.test.ts` correctly asked for the four moved waves to be
re-measured. Running `bun run perf --wave "THE JAM" --save` afterwards wrote
THE JAM into row 50 **and left a second copy of it in row 49**, which is where
THE JAM sat before the insertion — so THE MAGNET's row was gone, the baseline
held 51 rows with one name twice, and the next check failed on `wave 49's name`
with nothing to say about why. Re-running `--save` for THE MAGNET repaired it,
which is the workaround this lane used and the reason the entry is here.

The merge is matching a row by the wave *number* it is being written to and by
the name it has, and doing something different when the two disagree. It should
match on one thing only — the wave's `id` is the handle everything else points
at (`Wave.id`, added exactly so a rename could not break a reference) and the
baseline stores a name instead. Two halves:

- **Key the baseline's rows by `id`**, keeping `wave` and `name` as the
  human-readable columns they are. A merge then replaces exactly the row it
  measured and can never leave a duplicate.
- **Fail loudly on a duplicate.** `baseline.test.ts` catches a missing wave and
  a changed arrival fingerprint; it did not notice that one name appeared
  twice. A row-uniqueness assertion is two lines and would have named the
  problem instead of leaving a mismatched name at an index.
## THE GAUGE and SNAKE are still written up as ideas in `docs/spec/ideas.md`

- **Found:** 2026-09-06, claude/rounds-claw-boss-level-272aef
- **Files:** `docs/spec/ideas.md`, `docs/spec/bosses.md`, `tools/director/test/backlog.test.ts`

Both rounds are built — `packages/sim/src/gauge.ts` and `snake.ts`, and
`BOSS_KINDS` carries both — and both still have an entry under the **Rounds**
heading of the idea store describing them as things the game could have. The
director's backlog hides them by name off `BOSS_KINDS` (`dropBuilt` in
`tools/director/src/backlog-ideas.ts`), so nobody is offered them twice; what
is left is a spec page that describes two shipped rounds in the future tense,
including "unworked out" questions the code answered months ago.

THE CLAW's entry was cut when the round landed and the section that replaced it
is `docs/spec/bosses.md` 11.8, so there is a worked example of what to do:
delete the entry, make sure the built round has a section in `bosses.md` saying
what it actually is, and drop `backlog.rounds[0].builtHidden` in
`tools/director/test/backlog.test.ts` by one for each entry removed — the count
is what proves nothing was left behind.

Neither has a `##` section in `bosses.md` yet — THE GAUGE is described at
length in `docs/spec/interludes.md`, which is the round *category's* page
rather than the round's, and SNAKE has nothing but its wave and its code. So
this is not a pure deletion: the part of each idea-store entry that is still
true has to land in a section of its own first, the way THE CLAW's did, and
only then does the entry go. PINBALL is the model to copy — it has 11.7 and no
entry in the idea store.
