import { markMoment } from "./balance.js";
import { balloonSplitsLeft } from "./balloon.js";
import { balloonHoldDone } from "./balloon-clock.js";
import { balloonIsRubbed } from "./balloon-pull.js";
import { hullRow } from "./config.js";
import { wornKind } from "./creature-rules.js";
import { type CrossDir, crossAwayFromWall } from "./cross.js";
import { removeCreature } from "./field.js";
import { clampSpanCol } from "./span.js";
import type { Creature } from "./types.js";
import type { World } from "./world.js";

/**
 * **What a balloon does once both hands have reached it**: the hold at full
 * stretch, and then the split or the pop.
 *
 * Cut off `balloon-pull.ts` when the hold took that file past its length, at
 * the seam it already had a heading over. Next door is what the *hands* do —
 * which seat has which side, how far each has carried it, whether both are
 * taut. This is what the *body* does about that, and it is the half where
 * one thing becomes two.
 */

/**
 * Every balloon both hands are taut on, held and then given — read on the
 * tick, from `step`.
 *
 * On the tick rather than on the beat, and for `lidHeard`'s reason with more
 * riding on it: the pair counted themselves into this instant out loud, and a
 * moment answered on the next beat would land up to a whole beat after the one
 * they said.
 *
 * **Taut is not yet given.** The tick both sides reach taut is written down
 * (`balloonTautTick`) and the body sits at full stretch for `balloonHoldBeats`
 * before it comes apart — the hold the owner asked for, so the pair sees that
 * they did the thing together and the split reads as a consequence rather than
 * as a disappearance. A hand that slackens inside the hold clears the moment,
 * and the two start again from nothing: a hold is earned whole or not at all.
 * Both hands lift with the body when it goes, because whatever they were
 * holding has either become two things or stopped existing.
 */
export function rubBalloons(world: World): void {
  const cfg = world.cfg;
  for (const c of world.creatures) {
    if (c.kind !== "balloon") continue;
    if (!balloonIsRubbed(cfg, c)) {
      c.balloonTautTick = undefined;
      continue;
    }
    if (c.balloonTautTick === undefined) c.balloonTautTick = world.tick;
  }
  const given = world.creatures.filter((c) => balloonHoldDone(cfg, world.tick, c));
  for (const c of given) rubBalloon(world, c);
}

/**
 * One balloon, given.
 *
 * **The first rub splits and the last one pops**, which is the owner's own
 * shape for this creature: a pair who reach one are not finished with it, they
 * have made two smaller problems that have to be agreed all over again. The
 * halves hold still for `balloonSwellBeats` before they move — the short
 * delay he asked for, and it is the same swell a fresh arrival has, because it
 * is the same picture.
 *
 * **The two halves part.** One goes a lane left and climbs on; the other goes
 * a lane right and **sinks**, so a split is two bodies going visibly different
 * ways rather than two doing the same thing a column apart — and a sinking
 * half bursts on the ship's row for the same price a climbing one pays at the
 * top (`stepBalloon`), so the pair still has to answer both. Against a wall,
 * where one half has no lane to go outward into, the vertical split stays and
 * both halves head the same way sideways, inward: the one on the wall keeps
 * its column and turns in, the other is already a lane in.
 *
 * A pop costs the hull nothing at all. That is the whole of the bargain: the
 * only way this body leaves the field without taking a piece of the ship with
 * it is two people doing one thing at one moment.
 */
function rubBalloon(world: World, c: Creature): void {
  const left = balloonSplitsLeft(c);
  markMoment(world, true);
  if (left <= 0) {
    world.score += world.cfg.scoreBalloonPop;
    world.events.push({ type: "balloonPop", col: c.col, row: c.row });
    // Beside it on the same tick, so the burst of particles a body going off
    // the field gets is the ordinary one and this file invents no picture of
    // its own (`chuteCut`'s arrangement). A balloon carries no colour, and
    // `destroy` wants one: cyan is what `lensPalette` and `ghostPalette`
    // already answer for a body that has none, so the two agree. The kind is
    // the balloon's own and resolves to nothing to cut: a skin two hands
    // stretched has no contour a fracture could follow, so it leaves no pieces
    // (`render/effects-break.ts`).
    world.events.push({
      type: "destroy",
      col: c.col,
      row: c.row,
      color: "cyan",
      kind: wornKind(c),
    });
    removeCreature(world, c.id);
    return;
  }
  world.score += world.cfg.scoreBalloonRub;
  world.events.push({ type: "balloonSplit", col: c.col, row: c.row });
  removeCreature(world, c.id);
  // Nothing above the top row and nothing on the ship's: a split must not put
  // a body through either end of the field. `splitEchoes`' clamp, and its
  // reason word for word.
  const cols = world.cfg.cols;
  const lowest = hullRow(world.cfg) - 1;
  const row = Math.max(0, Math.min(lowest, c.row));
  // Which way a half on the wall turns: inward, which `crossAwayFromWall`
  // already answers for an arrival standing there. A body clear of both walls
  // sends its halves apart, one each way.
  const inward = crossAwayFromWall(cols, c.col, 1);
  const onWall =
    clampSpanCol(c.col - 1, cols, 1) === c.col || clampSpanCol(c.col + 1, cols, 1) === c.col;
  for (const dir of [-1, 1] as const) {
    world.creatures.push({
      ...c,
      id: world.nextId++,
      col: clampSpanCol(c.col + dir, cols, 1),
      row,
      fromCol: c.col,
      fromRow: c.row,
      balloonSplits: left - 1,
      // The swell starts again from this beat, which is the delay: two bodies
      // filling where one was, and neither of them going anywhere until the
      // pair has had time to see that there are two.
      balloonBeat: world.beat,
      // Each half sets off the way it stepped, so the two come apart rather
      // than crossing each other a beat later — unless one of them stepped
      // into a wall, and then both go inward together.
      balloonDir: onWall ? inward : (dir as CrossDir),
      // The right-hand half goes down and the left-hand half goes on up —
      // said for both, so a climber never inherits a sinking parent's way.
      // Absent rather than `false` on the climber (`creature-state-balloon.ts`).
      balloonSinks: dir === 1 ? (true as const) : undefined,
      // Neither half is held. The hands were on the body that has just stopped
      // existing, and a pull inherited by a spread would be two seats silently
      // taut on a thing they never took hold of.
      balloonPullP1: undefined,
      balloonPullP2: undefined,
      balloonTautTick: undefined,
    });
  }
}
