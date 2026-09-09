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
## A button says two words where a sentence was asked for

- **Found:** 2026-09-06, claude/some-lane
- **Files:** `packages/content/src/controls.ts`
- **Asks:** Leave the two words, hang a caption over the band, or widen the lobe?

Why the short label is what fits today, and what each of the three costs.
```

`tools/queue/test/queue.test.ts` holds that format and fails on an entry a cold
session could not act on; `tools/queue/test/taken.test.ts` holds the claim.

## THE WISP and BULB QUEEN carry a measured cost from the adopted looks

- **Found:** 2026-09-09, claude/game-visual-assets-21ed8c
- **Files:** `packages/render/src/wisp-tentacles.ts`,
  `packages/render/src/torch-ball.ts`, `packages/render/src/torch-fire.ts`,
  `tools/perf/baseline.json`

Ten looks came out of VERSUS on 9 September 2026 and two waves report dearer
against the 2026-09-09 baseline afterwards. `bun run perf` puts BULB QUEEN
between +25% and +56% of the share it had depending on how busy the machine is,
and THE WISP at about +21%. Neither is a defect: the worst frame in the game is
between 5.7 and 7.1 ms against a 16.7 ms budget, and both costs are things the
owner chose to look at.

The queen's is six fireballs at once — a torch stands in each of her sockets —
and it has already been through one pass: the shells are contours held per
radius and per thirty-second of a turn, a tongue is a baked sprite under a
`globalAlpha`, and that took the wave from +71% to where it is. What is left is
eighteen tongue blits and eleven halo blits per rock, and the obvious next move
is to bake the *whole ball* — halo, shells and plumes — as one sprite per radius
and per phase, so a burning rock is one `drawImage` and the tongues alone stay
live. Weigh that against the memory: a ball sprite is about 4.3 radii square,
which is a quarter of a megabyte at a two-tile torch, so the phase count is the
whole design and 16 may be enough where 32 is not affordable.

THE WISP's is eight bezier strands where there were five, each stroked once
(`wisp-tentacles.ts`). There is a cheaper shape available: the shipped fringe
draws every strand into one `Path2D` and strokes it twice, and this one strokes
per strand because each carries its own width and alpha. Grouping them into two
or three buckets by weight would get most of it back.

Prove it with `bun run perf --wave "BULB QUEEN" --wave "THE WISP"`, and read the
five reference waves the narrow run carries before believing either number.
Take a fresh full-sweep baseline with `--save` **only** once neither is flagged
— a baseline saved on a busy machine is worse than a stale one, which this lane
did once and reverted.

## THE CLASP's hand-painted shield has never been drawn

- **Found:** 2026-09-09, claude/queue-the-clasps-bubble-has-no-place-a-candidate-look
- **Files:** `packages/render/src/clasp.ts`, `packages/render/src/creatures.ts`,
  `packages/render/src/frame-field.ts`, `apps/game/src/raster.ts`,
  `assets/raster/green-shield-strip.webp`

`drawClaspShield` has two halves: the hand-painted frames when `image !== null`
and a procedural shell with `clasp-lattice.ts`'s honeycomb when it is null.
**Nothing has ever passed an image.** `drawCreatures` takes `claspImage` with a
default of `null`, and its one caller — `frame-field.ts` — hands it six
arguments, on every commit since THE CLASP landed on 31 August 2026. So the
shell is what the field draws, always, and the raster branch, `ClaspSheet`,
`CLASP_SHEET` and the committed 42 KB `green-shield-strip.webp` are paint
nobody has ever seen.

The doc comments claiming otherwise are corrected. What is left is the code.
**Wire it up rather than delete it**, the way `apps/game/src/raster.ts` wires
the baked burst: behind `?raster=1`, fetched only when the flag is set,
`loadAtlas` resolving to `null` on a bad network, and the shell as it is today
when it is off. That is CLAUDE.md's *a look is offered, never replaced* using
the mechanism the repository already has for exactly this — and it is what lets
the owner see the shield he commissioned beside the one that ships and say
which he wants. The plumbing is a holder beside `RenderState.sprites` with an
`install`, the image reaching `drawCreatures` through `frame-field.ts`, and a
`bindRasterClasp` next to `bindRasterBurst` with the test that file already has.
If the answer comes back that the frames are not wanted, the deletion is the
branch, the two constants, the parameter and the asset — but delete nothing
before he has looked at it.

Two things that are **not** owed here. `clasp-lattice.ts` is not dead code and
was never at risk: it is the shipping picture. And THE CLASP's bubble does have
a place a candidate look can live after all — a `clasp-look.ts` seam over the
shell and the lattice patches what a phone actually draws — so that slot is
worth opening once this is settled, because a candidate written today and a
raster branch switched on tomorrow would be two answers to one question.

## Three slots opened on 9 September 2026 have one candidate each

- **Found:** 2026-09-09, claude/bun-pin-1-4-2
- **Taken:** 2026-09-09, claude/queue-three-slots-opened-on-9-september-2026-have-one
- **Files:** `tools/versus/candidates/shell-plate/`,
  `tools/versus/candidates/eye-iris/`, `tools/versus/candidates/ghost-tears/`,
  `packages/render/src/shell-look.ts`, `packages/render/src/eye-look.ts`,
  `packages/render/src/ghost-look.ts`

`shell:plate` / `slab`, `eye:iris` / `turn` and `ghost:tears` / `latitude` were
each opened with a single candidate, because each queue entry asked for one.
The owner then gave a standing instruction, on the same day: **when he asks for
new graphics, give him several variants at once wherever the extra cost is
small.** `maze:walls` was opened with two under that rule and the two are the
better page — WELL and RAIL are opposite bets on one defect and each names how
it loses, which is a thing one candidate cannot do.

The extra cost here really is small, and that is the point of the entry. The
seam, the pose and the registration all exist for these three; a second
candidate is close to the paint alone. Add one to each, and make it an
*argument* rather than a setting — the second answer has to be able to win for
a reason the first cannot.

Three that are worth writing, one per slot:

- **`shell:plate`.** SLAB says the armour is a solid under a light. The other
  answer is that it is *worn*: plating a size too big, so what reads is the gap
  between the plate and the body — a dark line of shadow under the rim rather
  than a lit face on top of it. It is the cheaper picture and it may survive
  26 px better, which is the whole risk SLAB names about itself.
- **`eye:iris`.** TURN moves the iris across a ball under a fixed catchlight.
  The other answer leaves the iris where it is and moves the **light**: a wet
  film whose highlight tracks the socket's own curve as the body sways, which
  keeps the pupil dead centre — and a centred pupil is what player 2 reads a
  column off on THE LID.
- **`ghost:tears`.** LATITUDE turns the body under its bands. The other answer
  turns the bands under the body: each tear a strip of surface *sliding* round
  a stationary contour, so the silhouette never moves at all. It is the
  conservative half of the same idea and it protects the one thing LATITUDE
  risks, which is a lane called off the bright part of the body.

`tools/versus/DECIDED.md` says how a slot has left this page before; read it
first, because two of the questions on it were asked twice before they were
asked well.
