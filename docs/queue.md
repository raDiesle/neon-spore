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

## `canvas2d.ts` is on the 250-line ceiling, so render state cannot be asked for

- **Found:** 2026-09-04, claude/task-queue-work-nybjkq
- **Taken:** 2026-09-04, claude/queue-canvas2d-ts-is-on-the-250-line-ceiling-so-render
- **Files:** `packages/render/src/canvas2d.ts`, `packages/render/src/frame-passes.ts`

The queue item about `bun run frames` wanted the page asked whether the wave
was still arriving — `get launching()` returning `this.effects.opening
.launching`, three lines and a sentence saying why. The file is at 248 lines
and the limit is 250, so it would not fit, and the fix went the other way: the
tool paints for `LAUNCH_LIFE` seconds (`tools/frames/launch.ts`) instead of
asking. That is honest but open-loop, and the next thing that wants to know
what the renderer is in the middle of will hit the same wall.

Split it. `draw` is most of the file and it is already a sequence of named
passes (`frame-passes.ts` holds three of them), so the seam is between *what a
frame is made of* and *what this renderer owns between frames* — the effects,
the pose, the guide stage, the restart check and the accessors on them. Which
side moves is the choice the split has to make, and either one leaves room.
Then add the getter back and let `settleLaunch` paint until it is false, capped
and throwing the way `clearOpening` does.

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

## A rehearsal cannot show a held cord, so THE LID has no film

- **Found:** 2026-09-04, claude/tutorials-wisp-gyre-lid-recoil
- **Files:** `packages/content/src/scene-types.ts`, `packages/content/src/scene-script.ts`, `packages/render/src/guide-thumb.ts`

Three things in this game are taken hold of and carried rather than pressed:
THE LID's cord, THE MAZE's string and THE WARDEN's rope. All three are the
`drag` command, all three name a `DragTarget`, and the lid's also names the
creature the cord hangs off — an id, which no author can know, exactly as a
grip's target is an id no author can know.

The grip solved that already: `SceneAct.grip` names a column and a span of
ticks, and `SceneRun` finds the body standing in that column at the moment the
hand goes down (`aimed` in `sim/scene.ts`). Do the same for a drag — a target,
a column where the target is a lid, a from-position and an until — and draw the
hand on the handle the way `gripThumb` draws it on the body. THE LID is the one
ordinary wave left in act five with no rehearsal, and the two bosses become
reachable with it.

## THE LID has no rehearsal, and it is the last ordinary wave without one

- **Found:** 2026-09-04, claude/tutorials-the-mirror
- **Files:** `packages/content/src/scenes/the-lid.ts`, `packages/content/src/scenes.ts`, `packages/content/src/waves/act-5.ts`, `packages/content/src/scene-types.ts`

Twenty-four waves open on a film of themselves. THE LID (act five) is the last
one whose panel is the ordinary panel and which still opens on three lines of
prose, and it is blocked on one thing: a cord that is **held**. Do the entry
"a rehearsal cannot show a held cord" first — it is the same file and the same
shape as `SceneAct.grip`, which already solves the identical problem of naming
a creature an author cannot know.

Then write the film. Read `.claude/skills/new-tutorial` before authoring, and
`packages/content/src/scenes/the-clasp.ts` for the closest existing shape — a
coupling where one seat holds and the other fires. The wave's own sentence is
*doing your half first is the same as not doing it*, so the film has to show
the cannon being placed BEFORE the cord is taken: both of player 1's thumbs are
spoken for once he has hold of it, and the plates shut the instant he lets go.

Measure it, never guess it: build the scene, run it through `SceneRun` and read
the events back before settling the ticks. The film-watching test in
`test/scenes.test.ts` will fail if the shot stops landing.

## PINBALL has no rehearsal, and it is the last round without one

- **Found:** 2026-09-04, claude/queue-the-fleet-snake-and-pinball-have-no-rehearsal-a
- **Files:** `packages/content/src/scenes/pinball.ts`, `packages/content/src/scenes.ts`, `packages/content/src/waves/act-4.ts`

THE FLEET and SNAKE now open on films of themselves and PINBALL does not, for
one reason: two of its four slabs are the bucket's, and the bucket is *held*.
Do "a rehearsal cannot show a held cord" first — the same shape serves both,
and `controlPress` already knows what a held slab sends going down and coming
up (`content/src/control-command.ts`).

Everything else is in place. A round draws its own picture inside a rehearsal
now (`render/src/guide-seat.ts` consults `ROUND_DRAWS`), a caption can be
pointed at a slab, and the ghost hand lands in the middle of one. Read
`packages/content/src/scenes/snake.ts` first: it is the closest shape — a round
with a panel of its own, timed against a clock that never stops — and its
comments say which ticks were measured and why.

The wave's own sentence is *the thing you fire from is the thing you have to
catch it with*, so the film has to end with the bucket going back under the
ball rather than with the shot. Measure it, never guess it.

## THE GAUGE, THE MAZE and THE WARDEN have no rehearsal — a held control

- **Found:** 2026-09-04, claude/tutorials-the-mirror
- **Files:** `packages/content/src/scene-types.ts`, `packages/content/src/scene-script.ts`, `packages/content/src/scenes/`, `packages/content/src/waves/act-2.ts`

The three bosses of act two whose whole picture is a thumb that is *down*: THE
GAUGE's valve, THE MAZE's string and THE WARDEN's rope. All three are blocked
on the held-act shape — the valve on a `{kind:"valve"}` held press, the other
two on a `drag` whose target a scene has to be able to name. Do "a rehearsal
cannot show a held cord" first; THE GAUGE additionally needs a round's own
controls.

THE GAUGE is the smallest of the three and the one to write first: two buttons
and a call, and its round has no field to time anything against. THE WARDEN is
the closest to THE LID's shape. THE MAZE is the one where the two halves are
furthest apart — he turns the wheel and cannot fire, she fires and cannot turn
anything — so it is the richest film and the one to leave until the shape is
settled.
