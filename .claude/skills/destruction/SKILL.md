---
name: destruction
description: Build or improve a damage look in Neon Spore — an explosion, a body coming apart, a hole in the hull, armour shearing off — using the fracture engine and the break bench rather than inventing particles. Use when asked for better explosions, destruction, debris, shattering, cracking, denting, deformation, or component damage; when a hit reads as weak; or when touching shatter.ts, debris.ts, break-look.ts, craters.ts or scars.ts.
---

# Damage is a shape coming apart, not a shower of dots

The field's oldest answer to destruction is `sparks.ts`: N three-pixel squares
thrown from a point. It is cheap, it is on every event in the game, and it has
one thing it can never say — **what came apart**. A square has no shape, so a
slick, a bulb, a boss plate and a hull breach all read as the same event at
different sizes.

Everything below exists to answer that instead of adding a sixth particle
system.

## The engine, and the two ways to spend it

`packages/render/src/shatter.ts` cuts a closed contour into pieces that **tile
it exactly** — the pieces put back together are the body again with no gaps.
That property is the whole difference between a fracture and a particle system,
and `packages/render/test/shatter.test.ts` holds it.

There are exactly two things to do with a cut, and both already have a
candidate on the VERSUS page to read as a worked example:

- **Throw the pieces.** `shatter-fall.ts` puts one piece somewhere at time `t`
  — ballistic, closed form, landing on a floor and settling. `debris.ts` owns
  the live ones and `Effects` holds it. See `creature-break/shatter`.
- **Leave them where they are.** A cut contour with the pieces displaced a
  little and darkened is a *deformation*: skin pulled into a hole, a plate
  buckled, armour caved. Nothing moves and nothing has to. See
  `ship-crater/spall`.

Reach for the second more often than feels natural. Permanent damage is read by
two people for the rest of a run; a burst is read for half a second.

## The four layers of a hit

Received wisdom in the field, and true here: a good impact is three to five
simple layers stacked, not one clever effect. The director's HITS axis
(`tools/director/src/hits/`) already separates them — TELEGRAPH, DIM, FLASH,
SQUASH, SHAKE, RING, SHARDS — and a new damage look should say which layers it
is and which it is leaving to something else.

1. **The flash** — the instant, which a fracture is too slow to carry. Sparks
   do this well. Turn them *down* rather than off when adding pieces
   (`BreakLook.sparkScale`).
2. **The break** — the shape coming apart. This is what the engine is for.
3. **What is left** — debris that lands, a hole, a buckle, a scorch. The owner's
   standing answer, given 9 September 2026: debris **falls, lands and fades on
   the ground**. It does not hang in the lane.
4. **The record** — permanent damage the pair reads later. `scars.ts` and
   `craters.ts` are this, and it is the layer most worth improving.

## The loop: build it by looking

`bun run breaks` draws every tuning of the engine on one sheet — one row per
tuning, seven moments across, from the same geometry the field would draw. It
exists because a break is over in a second and no running preview can show its
*arc*.

    bun run breaks
    bun run png docs/reference/breaks.svg breaks.png     # then READ the png

Change a number in `tools/breaks/src/subjects.ts`, run both, look, change it
again. Two or three rounds. Do not tune a break by reasoning about the numbers:
every tuning in the shipped candidates was wrong on the first guess and the
sheet is what said so — the pull had to more than double before debris landed
inside its own life instead of fading in mid-air.

Add a row to `SUBJECTS` for anything new, including the *wrong* end of a range.
`SLICK · TOO MANY PIECES` is on the sheet on purpose: a sheet with only good
answers on it cannot tell you which way to move.

## Where a new damage look goes

**Never straight onto the field.** A change that would show up in a frame of the
running game is a look, and it is offered rather than adopted (`docs/looks.md`).
So:

1. **A seam first.** The shipped paint moves into a record of `magnet-look.ts`'s
   kind — `break-look.ts` and `crater-look.ts` are the two this work added —
   with **not one pixel moved**. A record is the only thing a candidate can
   patch.
2. **A candidate.** `tools/versus/candidates/<slot>/<name>/`, registered in
   `candidates/index.ts`. Its file says what the shipped side is, what this
   argues, and **how it can lose**; `tools/versus/README.md` has the mechanics.
3. **A pose.** Name it in `tools/director/src/versus-pose.ts` or the slot falls
   through to a red slick falling and the pair votes on two identical pictures.
   A break needs the world handed over *before* the kill — half a beat of the
   living body first, or the pair never sees what came apart — and a cadence so
   it replays. A permanent mark needs neither.

A record whose shipped value is *nothing* is legitimate and is what
`BREAK_LOOK.wedges: 0` is: the game's honest answer to "what pieces does a body
leave" has always been none.

## What the field will not forgive

- **A column must stay readable.** Two people call columns to each other. Debris
  in a lane that is already clear is the single most likely way one of these
  looks loses, and no amount of fading fixes it — the debris *is* the claim.
- **Damage is drawn where it landed, and lights the whole ship.** A hull crack
  is for something that struck the hull. But the owner has twice asked for
  damage to be visible on the *whole* hull rather than only at the point of
  impact, so a purely local mark is half a look.
- **An impact carries the colour of what hit**, never a generic damage red.
- **A body is resolved when it is seen to touch**, not on the beat the
  simulation says it arrived — `arrivals.ts`, and `scars.ts` already gates on it.
- **Determinism.** Nothing here may touch `Math.random`. Seed from `stream` or
  `sinHash` off numbers both devices agree on — a column and a beat. Two phones
  watching one body die must watch the same pieces leave it.
- **Cost.** Pieces are per-piece work where a body was one fill. No shadow, no
  gradient and no per-frame allocation inside a piece paint. The op-count
  budget tests (`packages/render/test/*-budget.test.ts`) are what a lane
  measures; `bun run perf` is weekly or on the owner's request, never a step a
  lane owes.

## The files

| Path | What it is |
|---|---|
| `packages/render/src/shatter.ts` | the cut: a contour into pieces that tile it |
| `packages/render/src/shatter-fall.ts` | the flight: where a piece is at time `t` |
| `packages/render/src/debris.ts` | the live pieces, owned by `Effects` |
| `packages/render/src/break-look.ts` | the record a candidate break patches |
| `packages/render/src/break-piece.ts` | how one piece is painted, and the depth rule |
| `packages/render/src/effects-break.ts` | turning a `destroy` into a body coming apart |
| `packages/render/src/crater-look.ts` | the record a candidate crater patches |
| `packages/render/src/craters.ts`, `scars.ts` | permanent hull damage — where it is |
| `tools/breaks/` | the bench: `bun run breaks` |
| `tools/director/src/hits/` | the four layers, as an axis on SHAPES |
