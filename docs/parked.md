# Parked

Work a session set aside. Not ideas — **work**, in a state somebody would have
to pick back up.

This file is for one thing: a session that was in the middle of something and
stopped. A refactor started and abandoned when it grew, a test left skipped with
a reason, a migration done in three files out of five, a failure diagnosed and
not fixed. The next session opens the clone knowing only what `origin` and the
commit messages tell it, and none of those say "the other half of this is still
undone" — that is the sentence this file exists to carry.

**It is the front of the queue, not a shelf.** `bun run queue` lists what is
here before anything in `docs/queue.md`, because half-done work is the only
kind that gets harder while it waits; `bun run queue next` hands it to a fresh
session as a prompt, and that session removes the entry in the commit that
finishes it. Nothing here waits for the owner to decide anything — if it does,
it is not parked work, and `docs/queue.md`'s `Asks:` line is where it goes.

**It is not the backlog, and it must never grow into one.** What the game could
have and does not — a creature, a mechanic, a control, a weapon, a boss, a round
— belongs in `docs/spec/`, which is what the director's `◇ NOT BUILT YET` sheet
reads. That page is the owner's own working surface: he picks from it by hand,
in a session he opens. An idea filed here instead is filed away from the built
things it would sit beside, on a page nobody opens — which is what happened last
time and why sixty-two entries had to be deleted by hand.

The test, if an entry is borderline: **would a session need this to finish
something already started?** Yes, it belongs here. No — it is a thing the game
could be rather than a thing half-done — it belongs in the spec. A technical
improvement nobody has started belongs in `docs/queue.md`, which drains the
same way.

**Work waiting on an answer is not parked work.** This file used to say nothing
here waits for the owner to decide anything, and that is still true of *this*
file — but it is no longer a thing with nowhere to go. `docs/queue.md` takes an
entry whose first step is a question, on an `Asks:` line; park something here
only when a session actually started it and stopped.

**One `##` per parked item**, in the same shape a queue item takes, because the
same tool reads both and the same session picks either one up cold:

```
## One line saying what is half-done

- **Found:** 2026-09-03, claude/some-lane
- **Files:** `packages/sim/src/step.ts`, `packages/sim/test/step.test.ts`

What was started, how far it got, and what the next session has to know that
the code does not already say.
```

Delete the entry when the work lands or is abandoned for good; the history
keeps it either way. Nothing here is ticked, and nothing here is counted — a
count is a way of saying something is owed, and nothing here is.
`tools/queue/test/queue.test.ts` fails on an entry a cold session could not act
on.

## Living bosses — THE INSTAR's one head, modelled once, as a VERSUS candidate

- **Found:** 2026-09-27, claude/queue-living-bosses-the-instars-one-head-modelled-once
- **Where:** local
- **Files:** `packages/render/src/instar-head.ts`, `packages/render/src/solid-rig.ts`, `packages/content/src/surface.ts`, `tools/raster/solid.ts`, `tools/versus/candidates/registry.ts`, `packages/render/test/instar-budget.test.ts`, `docs/spec/living-bosses.md`

Moved here from the queue when the owner stopped the session. The one piece
landed is the seam: `instar-head.ts` now exports `frontLipsAt` beside
`frontEyeAt`, both taking only the jaw fields, so a rig head can be fitted to
the shipped face-on marks by calling them, not by copying their numbers.
The task itself, unchanged: model the face-on head on the rig (spec §2 names
the parts), as a VERSUS candidate beside the shipped two heads, never on the
field, with a sheet at five yaws from face-on to side, jaw shut and open.
Done when the candidate is in VERSUS; face-on its eyes and lip marks are
within 2 px of the shipped head's at 390 wide; side-on it shows one full eye,
a blunt muzzle and horns sweeping back; the sheet PNG is sent to the owner;
its op count is within 10% of the shipped head's in `instar-budget.test.ts`.

Cut in two, to land separately: **(A)** the model, a `bun run solid` page for
it (a flag choosing the page) and the geometry tests; **(B)** a patchable
record the draw path reads the head through (VERSUS patches records, and
today `drawFrontHead`/`drawSideHead` are called directly), the candidate, and
the op budget.

What was decided for (A), in head radii, authored side-on with the snout to
`-x` and the origin at the mouth's middle face-on:
- **The upper head only translates**, to `frontLipsAt(...).up`, exactly as
  the shipped head does. A skull that pitched would change the eye-to-lip
  distance face-on, which the shipped head holds at 0.44 whatever the jaw.
  Its frame's origin is the upper lip's front middle.
- **The skull** is a ball near `(0.55, -0.46)` in that frame, radius about
  0.78; **the eyes** are `pin`s on it whose latitude and longitude are solved
  from `frontEyeAt`'s offset (about 38° either side of the snout), drawn with
  `facet(pin, yaw - FRONT)` through the shipped `drawEye`, scaled across by
  `sx`, and left out when not `near`. That draw is orthographic with no view
  pitch, so the facet and `see` agree exactly.
- **The muzzle** is one tube with its underside on the lip line (rings from
  0.3 to -0.75, radius 0.36 to 0.25), narrower than the eyes' spacing so an
  eye is never on the muzzle's flank.
- **The jaw** is a tube on its own anchor, pitched open (negative pitch drops
  a `-x` jaw), and the hinge's height is solved so its front top lands on
  `frontLipsAt(...).down`. Face-on the wide-open gape is 1.66 r, more than
  the jaw's length can swing, so the hinge translates too, and a dark cheek
  sheet between the skull's back and the jaw's back hides the gap at the side.
- **The horns** are tubes rooted on the skull's top sides sweeping back and
  up; **the brows** are sheets of points pinned on the skull just above each
  eye.
