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

## `bun run frames` cannot photograph a wave's opening

- **Found:** 2026-09-04, claude/wave-guide-scene-specimen
- **Taken:** 2026-09-04, claude/queue-bun-run-frames-cannot-photograph-a-waves-opening
- **Files:** `tools/frames/opening.ts`, `tools/frames/spec.ts`, `tools/frames/run.ts`, `tools/frames/capture.ts`

`clearOpening` is unconditional: every capture advances past the introduction
and the guide before it takes a picture, so the one tool the repository has for
turning a sha into a PNG cannot photograph either of them. That was fine while
an opening was two blocks of text; a guide now carries a **rehearsal** that
loops for a second and a half (`docs/spec/briefings.md` §3.2), and the lane that
built it had to write a throwaway Playwright script to see it at all — and will
have to write it again for wave 2's scene, and for the step sequencer after
that.

Add an `--opening intro|guide` flag: a `FrameSpec` field that stops
`clearOpening` at the named phase instead of running through it, and — for the
guide — makes `--frames`/`--stride` count *painted frames* rather than ticks,
because a rehearsal runs on the frame clock and not on the world's. The handle
already has everything needed (`advanceOpening`, `advance`, `paint` in
`apps/game/src/handle.ts`); what is missing is the spec field, the branch in
`clearOpening`, and the paint-driven strip loop. `tools/frames/test` is where
the parsing goes.

## The director's stage draws no ring for a hand on the ship

- **Found:** 2026-09-04, claude/direct-touch-game-controls-6862c0
- **Taken:** 2026-09-04, claude/queue-the-directors-stage-draws-no-ring-for-a-hand-on
- **Files:** `tools/director/src/stage-touch.ts`, `tools/director/src/stage.ts`,
  `apps/game/src/ship-hand.ts`, `packages/render/src/ship-hand.ts`

The cannon and the shield are now answered where they are drawn on the hull
(`packages/render/src/touch-ship.ts`), and the game draws a cup round whichever
swelling a finger has hold of. The director's stage goes through the same
`touchDown`, so every one of those gestures works there — but it never fills
`ViewState.hand`, so a person judging the control on the editor's own stage sees
the ship answer and nothing saying which swelling answered.

What to do: `ShipHandWatch` in `apps/game/src/ship-hand.ts` is a plain class over
`render`'s `shipHand` with no DOM in it. Give `bindStageTouch` one (or take one
in `StageTouch`), write to it from the same three places `bindControls` does —
press, move, lift — and pass `hand: watch.current` into the `renderer.draw` call
in `stage.ts`. `tools/director/test/stage-touch.test.ts` is where a test for it
goes; the game's own `packages/render/test/ship-hand-frame.test.ts` already
covers the drawing itself.

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

## Split menu.ts and menu-view.ts before the next menu page arrives

- **Found:** 2026-09-04, claude/testing-menu-reorganization-60f985
- **Taken:** 2026-09-04, claude/queue-split-menu-ts-and-menu-view-ts-before-the-next-m
- **Files:** `apps/game/src/menu.ts`, `apps/game/src/menu-view.ts`

Both are at the ~250 line limit — `menu.ts` at 249 and `menu-view.ts` at 242
after TESTING and CONTROLS moved — and the menu is the part of `apps/game` that
has grown every time the game learned to be a front door. The next page added
pushes one of them over, and the split is then made under pressure.

Two seams are already visible. In `menu-view.ts`, `buildSeats` is a whole
control with its own three cards and its own lock, and nothing outside the
returned `MenuDom` touches it — it lifts into `menu-seats.ts` with no change to
`buildMenu`'s shape. In `menu.ts`, `paintLink` is the only thing that knows
which entries a link changes; it takes `MenuDom`, the link and the pair's room
and returns nothing, so it moves into `menu-link.ts` as a pure function of
those three. Do one or both; `bun run check` proves it, and `apps/game/test`
already drives the menu's front door and its copy.
