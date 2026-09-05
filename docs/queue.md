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

## THE CAROM's guide has no rehearsal, so its wave is read rather than watched

- **Found:** 2026-09-04, worktree-bridge-cse
- **Taken:** 2026-09-05, claude/queue-the-caroms-guide-has-no-rehearsal-so-its-wave-is
- **Files:** `packages/content/src/scenes.ts`, `packages/content/src/scenes/`,
  `packages/content/src/waves/act-5.ts`

THE CAROM shipped with a three-line prose guide and no `scene`, so its pages are
words on the game's own screen and nothing moves. Every wave landed in the two
days before it carries a film — THE GYRE and THE RECOIL both do, and THE LID's
was queued and built for exactly this reason — and this creature is the worst of
the three to describe in a sentence: what the pair has to learn is a *shape*
(a diagonal that turns at the wall) and an *order* (crack it, then ward what
falls out), and neither reads off a line of text.

Write one under `packages/content/src/scenes/the-carom.ts` on the pattern
`the-recoil.ts` already sets, register it in `scenes.ts`, and put `scene:
"theCarom"` on the `theCarom` wave's guide. Three steps is the shape the others
use: the diagonal turning at a wall with nothing else on the field, the shot
landing and the crust coming off, and the shield taking the rock. The rehearsal
walk in `packages/content/test/` will pick it up on its own once it is named.

## THE VOLLEY breaches the hull as a living body rather than as a rock

- **Found:** 2026-09-04, claude/meteor-enemy-shield-reflect-0d82f2
- **Taken:** 2026-09-05, claude/queue-the-volley-breaches-the-hull-as-a-living-body-ra
- **Files:** `packages/render/src/effects-breach.ts`,
  `packages/render/src/craters.ts`, `packages/render/src/scars.ts`

A volley the pair never warded arrives as the rock it looks like: `hull.ts`
charges it `damageMeteor` through the same `damageSpan` every warded body goes
through, and the scar it leaves names `kind: "volley"`. Render still asks
`isMeteorKind` at three places downstream of that — the breach picture, the
crater on the hull and the delay that holds a scar back until the rock has
visibly landed — so the one thing on the field that is unmistakably a rock is
drawn hitting the ship as a red burst with no crater and no arrival.

`isWardable` in `packages/sim/src/kinds.ts` is the rule those three want and it
is already exported; it is the one `hull.ts` and `bullet-hit.ts` were both moved
onto when this creature landed. Swap the three call sites, and check
`packages/render/test/rock-impact.test.ts` and `craters`' own frame tests still
pass — a volley's span is one, so nothing about the two-wide torch path changes.

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

## THE MIRROR's glyphs draw player one's tissue on player two's screen

- **Found:** 2026-09-04, claude/ship-graphics-p2-colors-616a16
- **Taken:** 2026-09-05, claude/queue-the-mirrors-glyphs-draw-player-ones-tissue-on-pl
- **Files:** `packages/render/src/simon-glyph.ts`, `packages/render/src/simon-row.ts`, `packages/render/src/simon-verdict.ts`, `packages/render/src/controls.ts`

Every body a control is made of is the seat's colour now — violet on player
one's screen and gold on player two's — and `drawFireButton`, `drawActionButton`
and `drawStripMark` all take that colour as an argument with `P1_SKIN`'s as the
default. `band-control.ts` passes the seat's; THE MIRROR's sequence does not, so
the glyphs the boss plays back are drawn in player one's flesh on both devices
while the panel underneath them is gold. The pair is supposed to recognise a
glyph as the button it is about, and on player two's seat it no longer looks
like one.

Thread the seat down to them. `drawStepGlyph` needs a `SeatSkin`; `simon-row.ts`
already carries a `Layout` at every call site above `known`, and
`SimonVerdict.drawFlights` does not — give it one, the same way `drawWord` next
to it already takes one. Then `seatSkin(l.role)` at the top of each and pass it
through. Nothing about which glyph is drawn moves; `packages/render/test/mirror-frame.test.ts`
covers the sequence and should stay green.

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
