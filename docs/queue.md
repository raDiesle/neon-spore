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

## The director's import-cycle test reads a type-only import as a runtime one

- **Found:** 2026-09-04, claude/recoil-enemy-bouncing-ba8863
- **Files:** `tools/director/test/import-cycles.test.ts`

`runtimeEdges` matches every import in a file with one regex whose body is
`[\s\S]*?`, which runs across newlines, so a value import that names a package
rather than a relative path — `import { CREATURES } from "@neon-spore/content";`
— starts a match that only ends at the *next* relative `from "…"` in the file.
When that next one is `import type { … } from "./x.js"` the type import is
recorded as a runtime edge, and the negative lookahead never sees it because it
was checked against the earlier line's `import`.

It cost a real workaround. `tools/director/src/brush-cards.ts` was split out of
`brushes.ts` and needed `Brush` for one type annotation; the type-only import
was reported as `brushes.ts -> brush-cards.ts -> brushes.ts` and the annotation
had to be narrowed to `CreatureKind` to get past it. The narrowing turned out to
be an improvement, which is luck rather than a defence of the regex.

Anchor each match to a single line — split the source on newlines and test each
line (and each continued import block) on its own, or parse with the same
`stripNonCode` helper `packages/sim/test/source-scan.ts` already exports. Then
add a fixture proving that a file whose first import is a package import and
whose last is `import type … from "./sibling.js"` reports no edge, which is the
exact shape that fooled it.

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

## The frame budget's first row silently carries whichever run baked the panel

- **Found:** 2026-09-04, claude/control-panel-ui-redesign-81216f
- **Files:** `packages/render/test/frame-budget.test.ts`, `packages/render/test/frame-harness.ts`, `packages/render/src/band-ground.ts`

`band-ground.ts` paints the panel's sheet into an offscreen canvas the first
time a size is asked for and blits it after that, and the cache is module
state that outlives a test. So `p1`'s frame-0 row pays for every cell and vein
in the sheet — fourteen extra `new Path2D` — and `p2`, which runs second at the
same size, pays none of it. The rows are right for the order the loop happens
to run in, and reordering the two seats would fail the test for a reason that
has nothing to do with the frame.

Give the harness a way to empty render's size-keyed caches (`band-ground.ts`'s
sheets, `lobe-shell.ts`'s sockets and glosses, `glow.ts`'s halos) and call it in
`installCanvasGlobals`, so every run starts cold and both seats' frame-0 rows
mean the same thing. Then remeasure both rows and the two eye rows the same
way `frame-budget.test.ts`'s own header describes.

## A touch in the game assumes the canvas starts at the top left of the window

- **Found:** 2026-09-04, claude/control-panel-ui-redesign-81216f
- **Files:** `apps/game/src/input.ts`, `apps/game/src/viewport.ts`, `tools/director/src/stage-point.ts`

`inStage` turns a `PointerEvent` into stage coordinates with
`e.clientX - stage.left`, which is only right because `game.css` pins the canvas
to the whole viewport and `bindViewport` measures `window.innerWidth`. Nothing
says so and nothing fails if it stops being true. The director had the same
assumption written four times and it was wrong there — every control was
answered where it was not drawn, which is what `stage-point.ts` now exists to
stop.

Route the game through the same conversion: measure the canvas rather than the
window, scale by the ratio between the canvas's CSS box and the viewport the
renderer was told about, then subtract the stage offset. `stage-point.ts` is a
tool and `apps/game` may not import one, so the shared piece belongs in
`packages/render` beside `computeStage`, with both hosts calling it. Prove it
with a test that presses where a control is drawn on a canvas laid out at a
different size from the one the renderer was given.
