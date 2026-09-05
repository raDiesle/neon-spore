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

**And nowhere else.** Not the report, which scrolls away — the next session
clones `origin` and sees only files. Not a suggested background task either:
this file *is* the mechanism, and a chip is a popup the owner has to dismiss
that says nothing `bun run queue` does not already say to whoever asks it. A
finding written here is read by every session that comes after; a finding
offered as a chip is read once, by the one person the queue exists to spare.

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

## `bun run push` hides why the push was refused

- **Found:** 2026-09-05, claude/eye-eyelid-shape-194988
- **Files:** `tools/land/push.ts`, `tools/land/test/`

The catch prints `error.message.split("
")[0]`, and git's first line on a
refused push is the remote URL — so a session that has just landed is told
`✗ origin was not updated: To https://github.com/…` and nothing else. The
reason lives on the following lines (`! [rejected] main -> main
(non-fast-forward)`, plus the hint), and a session with no reason in hand has
to re-run the push by hand to find out, which the repository's own guard hook
refuses. This happened on the eyelid landing: local `main` was 19 ahead and 36
behind `origin/main`, and the output said none of that.

Print the whole of git's stderr, or at minimum the first line that is not the
`To <url>` banner, and say how the trunk stands — `origin/main` is ahead by N,
so the trunk has to be reconciled before it can be sent. `push.ts` already
fetches and counts `ahead`; counting `behind` beside it is one more
`rev-list --count` and turns a dead end into an instruction.

## `bun run frames` cannot magnify the thing it photographed

- **Found:** 2026-09-05, claude/eye-eyelid-shape-194988
- **Files:** `tools/frames/run.ts`, `tools/frames/capture.ts`, `tools/frames/test/`

A creature is drawn at `l.tile * 0.4`, which on a 390 px phone is about forty
pixels, and a before-and-after of a change to its *shape* is two pictures in
which the change is a handful of pixels. The eyelid lane could not judge its own
work from the frames the tool produced and could not show the owner what had
changed: `CLAUDE.md` says send the picture, and a picture nobody can see the
change in is the same as sending none. It hand-rolled a throwaway that loaded
both PNGs into a page, cropped to a rectangle and scaled it, then deleted it —
which is the friction `shot.ts` was written to stop being paid again.

Add a crop to the capture: `--zoom <n>` and `--at <x,y,w,h>` in the frame's own
CSS pixels, applied to the screenshot of `#stage` rather than to the field, so
the output is the same real frame at a size an eye can judge. Centring it on
the subject the way `brush-trim.ts` measures a body would be better still and is
optional — a declared rectangle is enough to close this. The pair of pictures
must stay comparable, so the crop is the same rectangle on both, and the
`identical:` guard in `run.ts` compares before the crop is applied.
## Split `frame-passes.ts`: it sits exactly on the 250-line limit

- **Found:** 2026-09-05, claude/lock-wave-and-guide
- **Files:** `packages/render/src/frame-passes.ts`

THE LOCK's dotted line needed one parameter and four lines of comment on
`drawBodies`, and paying for them cost two rounds of shaving sentences out of
that comment — which is the warning `packages/sim/test/limits.test.ts` exists
to give, and the same one `act-3b.ts` records having ignored once. The file is
now at exactly 250, so the next pass added to a frame breaks the build before
it draws anything.

Cut it where it already reads as separate: `drawFieldBack`, `drawBodies`,
`drawShip` and `drawOverlays` are four passes with nothing shared but their
arguments, and the seam `effects-*.ts` uses is the obvious one — take the two
that are about the field away from the two that are about the ship. Keep
`frame-passes.ts` as the barrel the way `waves.ts` and `types.ts` are, so
nothing reaching for a pass through it has to move.

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

## `bun run frames` cannot stand a multi-round boss at any round but its first

- **Found:** 2026-09-05, claude/maze-boss-entrance-fix-76efbf
- **Files:** `apps/game/src/handle.ts`, `tools/frames/run.ts`, `tools/frames/capture.ts`

`jumpToWave` puts a boss on the field at its opening round, and there is no
handle that moves it on. For THE MAZE that means only the first of five sheets
can ever be photographed, and the first sheet is the one with a single way in —
so the two things the boss now does that are worth a picture, a rim with five
gaps and the drum coming apart when a shot is lost in one of the four dead
ends, cannot be captured at all. The collapse is held by a unit test
(`packages/render/test/maze-draw.test.ts`) and by nothing an eye has seen.
SNAKE, PINBALL and THE MIRROR all have rounds and all have the same hole.

Add a testing handle that sets the round on whichever boss is installed —
`window.neonSpore.bossRound(n)`, beside `jumpToWave` and `dismissBriefing` —
and a `--boss-round N` flag on `tools/frames/run.ts` that calls it after the
jump and before the ticks. It has to go through the boss's own phase entry
(`enterMazePhase` and its siblings) rather than writing the field, or the drum
comes up at the wrong angle with the last round's lock still on it. `handle.ts`
is where `window.neonSpore` is assembled and is already at the seam this
belongs on: everything in it is about being driven from outside.

## `hull.breachHeavy` has never played: the threshold is in the wrong unit

- **Found:** 2026-09-05, claude/lure-shot-explosion-damage-e398f9
- **Files:** `packages/audio/src/bind.ts`, `packages/audio/test/bind.test.ts`

`bind.ts` splits a hull breach by what it cost — `e.damage >= 8000 ?
"hull.breachHeavy" : "hull.breachLight"` — and its own test proves the split
with `damage: 20_000` and `damage: 3_000`, which are thousandths. The
simulation emits whole hull points: `breachHull` is called with
`damageMeteor` (20), `damageCarom` (20), `damageGhostDive` (18),
`damageCreature` (12), and now a lure's blast share (5). Every one of them is
under 8000, so the comparison is always false and the heavy cue — "the plate
going. A long low tear with the room shaking after it." — has never been heard
in the running game. A rock reaching the hull sounds exactly like a slick
brushing it.

Decide the unit and hold it in one place. The event's `damage` is in whole
points (`events.ts` should say so), so the threshold belongs there in points
too — somewhere between `damageCreature` and `damageMeteor`, so a rock is heavy
and an ordinary arrival is not. Fix the test fixtures along with it: they are
the reason this survived, since both of them pass whichever unit the code
means.
