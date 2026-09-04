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

## The ON THE FIELD list can miss a gesture, because it is checked per hold kind

- **Found:** 2026-09-04, claude/game-touch-controls-helpers-195bbf
- **Files:** `tools/director/src/field-controls-page.ts`, `tools/director/test/on-field-controls.test.ts`

`FIELD_CONTROLS` is kept honest by an exhaustive switch over `Hold["kind"]`, so
a *new* kind cannot be added without a row. That guard was exactly right while
one hold meant one gesture, and it stopped being right the moment the cannon
grew a second: a press that slides and a lift that opens the maw are both
`kind: "cannon"`, the entry for THE MAW TAP was written by hand, and nothing
would have failed if it had not been. The list is what the director's CONTROLS
tab shows a person reading the game's controls, so a silent hole in it is a
control nobody can find.

Make the check count gestures rather than kinds: give `FieldControlDef` the
`touch.ts` function that answers it — the pair (`holdKind`, the branch of
`touchDown`/`touchUp` it comes out of) is already written into `source` as
prose — or key the exhaustive switch on a `FieldGesture` union that
`touch-ship.ts` and `touch.ts` export beside the holds, so a second gesture on
an existing hold is a compile error until it has a row. Either way the test
must fail if a branch of `touchUp` sends a command no entry describes.

## An infinite `age` reaches drawing code that takes a sine of it

- **Found:** 2026-09-04, claude/tutorial-animations-readiness-420408
- **Files:** `packages/render/src/guide-nav.ts`, `packages/render/src/opening-fx.ts`,
  `packages/render/src/wave-intro.ts`, `packages/render/src/ready-page.ts`

Every screen of a wave's opening reads its clock as `fx?.age ?? POSITIVE_INFINITY`
— the sentinel that means "this has been up for ever, so draw it finished". That
is right for a fade, which clamps, and wrong for anything that breathes:
`Math.sin(Infinity)` is `NaN`, and a `NaN` coordinate is a call a real canvas
refuses. It cost a red `frame.test.ts` the day the guide's bar grew a slime
feeder whose width is a sine of the page's age, and `drawGuideNav` now guards
its own copy with `Number.isFinite`.

One guard in one function is not the fix. Either make the sentinel finite where
it is produced — a large number of seconds rather than `Infinity`, which every
fade clamps just the same — or give `OpeningFx` a `breath(rate)` that every
pulsing thing calls instead of reaching for `age` itself. Then delete the guard
in `guide-nav.ts`. A test that draws each opening screen with no `fx` at all,
through the strict canvas, is the proof; `packages/render/test/briefing.test.ts`
already does exactly that and is where the failure showed up.

## `bun run frames` photographs every wave through the frozen launch animation

- **Found:** 2026-09-04, claude/recoil-enemy-destruction-animation-39cb91
- **Files:** `tools/frames/capture.ts`, `tools/frames/opening.ts`, `packages/render/src/opening-fx.ts`

Every capture this tool takes now has two enormous rings — one violet, one
amber — laid over the top two thirds of the field, with the wave's specimen
hanging inside them. They are `OpeningFx.drawLaunch`, the wave arriving after
the pair crosses the ready gate (`canvas2d.ts`, behind `opening.launching`).

The cause is that the launch runs on the *frame* clock and this tool does not
turn one. `clearOpening` correctly waits until `world.brief.phase` is play, and
then `advance(n)` steps the simulation while `paint` is called only at the
moment each picture is taken — so `OpeningFx.update(view.dt, …)` receives a
sixtieth of a second per captured frame and the launch never gets far enough to
end. A strip of eight frames advances it by 0.13 s, so it is still there in the
last picture, and it was still there 2500 ticks into a wave.

What to do: after `clearOpening` and before the first advance, paint the
opening out — call `ns.paint()` in a loop until `effects.opening.launching` is
false, or expose the launch's remaining time on the handle and drive it the way
`advanceOpening` drives the introduction's clock. Cap the loop and throw the
way `clearOpening` does rather than spinning. Then a capture of any wave shows
the field alone, which is what every picture this tool has ever been asked for
was meant to be.

It is worth doing first, before the next look lands: a session that cannot take
an honest frame cannot show the owner anything, and this one could not.

## A rehearsal cannot press a round's own controls, so no boss can be filmed

- **Found:** 2026-09-04, claude/tutorials-wisp-gyre-lid-recoil
- **Files:** `packages/content/src/scene-script.ts`, `packages/content/src/scenes.ts`, `packages/content/test/scenes.test.ts`

`commandFor` in `scene-script.ts` is a switch over seven control ids — the
standard panel's — and it throws on anything else. Every round with a panel of
its own is therefore unfilmable: THE GAUGE's valve, THE FLEET's four arrows and
salvo, SNAKE's two turns, PINBALL's latch and launch. Eight waves carry a boss
and none of them can carry a rehearsal, which is the largest remaining hole in
the tutorial arc now that twenty-one ordinary waves have one.

Extend the switch to every id in `controls-round.ts`, taking the command each
one already sends in `apps/game/src/input-bindings.ts` rather than inventing
one — that file is the single copy of what a press means, and a second copy
here would be the exact drift `purity.test.ts` carries a table against. Then
write one boss film to prove it: THE GAUGE is the smallest, two buttons and a
call, and its round has no field to time against.

`test/scenes.test.ts` already refuses a scene that presses a control the wave's
own panel has not got, so a film authored against the wrong set fails loudly
rather than drawing a hand over nothing.

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

## `act-3.ts` is on the 250-line ceiling with nothing left to give

- **Found:** 2026-09-04, claude/tutorials-wisp-gyre-lid-recoil
- **Files:** `packages/content/src/waves/act-3.ts`, `packages/content/src/waves.ts`, `tools/director/src/serialize.ts`

Adding a single `scene:` line to a wave in act three has now cost two rounds of
shaving a sentence out of a comment to stay under the limit. That is the
warning sign the limits test exists to give: the file is full, and the next
change to it — a wave, a field, a line — will need the same shave again.

CLAUDE.md's answer is already written down: a full act file gets a fourth act
beside it rather than an entry in `KNOWN_LONG`. Cut act three after THE VEIL,
put the rest in `packages/content/src/waves/act-6.ts`, concatenate it in
`waves.ts`, and teach `tools/director/src/serialize.ts` which wave indices live
in which file — it regenerates one act file at a time and holds that mapping.
`test/waves.test.ts` checks ids are unique and the order is unchanged, so a
split that moved a wave would fail rather than reorder the game.

## A rehearsal's cannon can only reach seven of the field's eleven columns

- **Found:** 2026-09-04, claude/tutorials-boss-controls
- **Files:** `packages/content/src/scene-types.ts`, `packages/content/src/scene-script.ts`, `packages/content/test/scenes.test.ts`

A `SceneAct` names its column in the seven-column grid every wave is authored
in, and `mapCol` sends those to `{0, 2, 3, 5, 7, 8, 10}` on the eleven-column
field. Four real columns cannot be named by a film at all, and three separate
rehearsals have already had to be bent around it: THE THIRD SHOT's shell is
authored at column 4 because that is the only placement whose two adjacent
halves are both reachable, THE VANE's arrival is chosen for where its fold
lands, and THE RECOIL's seed is chosen for which lane its cage bounces to.

BULB QUEEN is the one it actually defeated. Her two marks stand one column
either side of her, she is clamped to the middle so her whole span stays on the
field, and both of her columns are unreachable — so her film has three pages
about looking and no shot at the end of it.

Give `SceneAct` a second, exclusive way to say where: a real column, used only
where the authored grid cannot reach. A rehearsal is not a wave — it is never
dragged around in the director and never replayed at a different field width —
so the argument for remapping does not apply to it the way it applies to
`entries`, and a test that refuses both fields on one act keeps the two from
being confused. Then add BULB QUEEN's fourth page, which is a shot up whichever
mark she was showing.
