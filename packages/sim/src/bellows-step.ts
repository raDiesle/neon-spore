import {
  BELLOWS_SEAMS,
  type BellowsState,
  bellowsLeaking,
  bellowsShared,
  bellowsWorking,
  NO_HAND,
  NO_LIFT,
  NO_SPARK,
} from "./bellows.js";
import { midCol } from "./config.js";
import { breachHull } from "./hull-damage.js";
import { NO_SHELL } from "./shell.js";
import { closeSlow, openSlow } from "./slow.js";
import type { World } from "./world.js";

/**
 * THE BELLOWS's clock: the marks lighting, the jam running out, the seam
 * parting, the two hazards, and the last seam glowing.
 *
 * **What is not here is the judgement**, which is the opposite of THE GIMBAL
 * next door and for the opposite reason. A ring is a position and so every
 * question about one is a question about beats; a handle is a *stroke*, and
 * whether a stroke came in the right seat's beat is decided the instant it
 * lands or not at all. So the hands do the judging (`bellows-hand.ts`) and
 * this page only ever moves the fight between its phases.
 *
 * **One window in the whole fight**, the third exchange's (row 9), and it is
 * enforced here because it is the one fault nobody's hand commits: the pair
 * simply did not finish. Every other exchange has no clock — a missed pull
 * costs nothing, the marks stay up and the lung waits, which is the design's
 * *nothing, clock runs on*.
 */

export function installBellows(world: World): BellowsState {
  const s: BellowsState = {
    kind: "bellows",
    phase: "still",
    phaseBeat: world.beat,
    exchangeBeat: world.beat,
    exchanged: 0,
    seams: BELLOWS_SEAMS,
    handMilli: [NO_HAND, NO_HAND],
    sparkCol: NO_SPARK,
    sparkBeat: 0,
    liftTick: NO_LIFT,
  };
  world.events.push({ type: "bellowsEnter", col: midCol(world.cfg) });
  return s;
}

export function stepBellows(world: World, s: BellowsState): void {
  const cfg = world.cfg;
  const mid = midCol(cfg);
  // The spark, judged before anything else this beat: one that has been
  // leaking too long reaches the ship whatever the handles are doing.
  spendSpark(world, s);
  if (s.phase === "vent") {
    if (world.beat - s.phaseBeat >= cfg.bellowsVentBeats) {
      world.events.push({ type: "bellowsOut", col: mid });
      world.boss = null;
    }
    return;
  }
  if (s.phase === "still") {
    if (world.beat - s.phaseBeat >= cfg.bellowsStillBeats) lightMarks(world, s);
    return;
  }
  if (s.phase === "jam") {
    if (world.beat - s.phaseBeat >= cfg.bellowsJamBeats) lightMarks(world, s);
    return;
  }
  if (s.phase === "seam") {
    if (world.beat - s.phaseBeat < cfg.bellowsSeamBeats) return;
    if (s.seams > 1) lightMarks(world, s);
    else glow(world, s);
    return;
  }
  // The last seam is the hands' alone: both of them let go together or the
  // seam holds, and there is no beat on which the lung decides that.
  if (!bellowsWorking(s)) return;
  if (bellowsShared(s) && world.beat - s.exchangeBeat >= cfg.bellowsWindowBeats) {
    jamHandles(world, s, { type: "bellowsLate", col: mid });
  }
}

/** The next exchange's marks up, his first, and the shared window counted from here. */
function lightMarks(world: World, s: BellowsState): void {
  s.exchangeBeat = world.beat;
  s.exchanged = 0;
  markAgain(world, s);
}

/**
 * The marks up again, his first. From `lightMarks` for a new exchange, and
 * from her push short of `bellowsExchanges` in the shared window — which keeps
 * the `exchangeBeat` it had, so the second round is inside the same window,
 * and says so with the marks' own event.
 */
export function markAgain(world: World, s: BellowsState): void {
  s.phase = "pull";
  s.phaseBeat = world.beat;
  world.events.push({ type: "bellowsMarks", seams: s.seams, col: midCol(world.cfg) });
  bellowsSlow(world, s);
}

/**
 * **THE SLOW spans the one window in the fight** (`docs/decisions.md` #33):
 * up from the tick the shared exchange's marks light, and shut the moment its
 * seam parts or the handles jam, in or out of turn. Every other exchange has
 * no clock and asks nothing slowly; the split keeps its own slow as the end.
 */
function bellowsSlow(world: World, s: BellowsState): void {
  if (bellowsShared(s) && bellowsWorking(s)) {
    openSlow(world, s.exchangeBeat + world.cfg.bellowsWindowBeats - world.beat);
  } else closeSlow(world);
}

/**
 * **Both handles jammed**, however it happened — a seat working one in the
 * other's beat, or the shared window running out half done.
 *
 * Both hands come off with them, which is the point: a jam the pair could sit
 * through with their thumbs where they were would cost them nothing but a
 * beat, and what it is meant to cost is the *stroke* — the exchange starts
 * again from two hands off two handles (`bellowsWorkMilli`).
 */
export function jamHandles(
  world: World,
  s: BellowsState,
  event: { type: "bellowsJam"; player: 1 | 2; col: number } | { type: "bellowsLate"; col: number },
): void {
  s.phase = "jam";
  s.phaseBeat = world.beat;
  s.handMilli = [NO_HAND, NO_HAND];
  world.events.push(event);
  bellowsSlow(world, s);
}

/**
 * A clean pull-then-push: one seam off the waist, and whichever of the two
 * hazards that split owes.
 *
 * The hazards are hung off the seam count rather than counted in a field of
 * their own, for `bellowsShared`'s reason: two left is the second split and
 * one left is the third, so the rows of the design are read off the health
 * and cannot drift from it.
 */
export function partSeam(world: World, s: BellowsState): void {
  const mid = midCol(world.cfg);
  s.seams -= 1;
  s.phase = "seam";
  s.phaseBeat = world.beat;
  world.events.push({ type: "bellowsSeam", seams: s.seams, col: mid });
  bellowsSlow(world, s);
  if (s.seams === BELLOWS_SEAMS - 2) {
    s.sparkCol = mid;
    s.sparkBeat = world.beat;
    world.events.push({ type: "bellowsSpark", col: mid });
  }
  if (s.seams === BELLOWS_SEAMS - 3) forceBreath(world);
}

/** The last seam, both handles glowing, and nothing on either of them yet. */
function glow(world: World, s: BellowsState): void {
  s.phase = "last";
  s.phaseBeat = world.beat;
  s.handMilli = [NO_HAND, NO_HAND];
  s.liftTick = NO_LIFT;
  world.events.push({ type: "bellowsGlow", col: midCol(world.cfg) });
}

/**
 * **The finale landed**: both hands off inside a beat of each other, the
 * fourth seam parts and the waist splits clean in two, under THE SLOW.
 *
 * THE SLOW opens here and nowhere else in the fight (§19): it is the one beat
 * the pair is asked to act *together*, after eleven of being told not to, and
 * it earns the weight every other boss gives its hardest moment.
 */
export function splitWaist(world: World, s: BellowsState): void {
  const mid = midCol(world.cfg);
  s.seams -= 1;
  s.phase = "vent";
  s.phaseBeat = world.beat;
  s.handMilli = [NO_HAND, NO_HAND];
  s.liftTick = NO_LIFT;
  openSlow(world, world.cfg.bellowsSlowBeats);
  world.events.push({ type: "bellowsSplit", col: mid });
  world.events.push({ type: "bellowsVent", col: mid });
}

/**
 * **The breath of row 10**, straight down the pilot's column.
 *
 * An ordinary body from the moment it leaves the lung, and deliberately so:
 * the answer the design asks for is the shield, the shield is what turns a
 * body, and a bespoke hazard with a bespoke ward would be a second rule the
 * pair cannot discover by trying it. It is thrown down `world.cannonCol`
 * because that is the pilot's column in the only sense this game has one —
 * where he is standing — so a breath is a thing aimed at him rather than a
 * column he has to be told.
 */
function forceBreath(world: World): void {
  const col = world.cannonCol;
  world.creatures.push({
    id: world.nextId++,
    kind: "meteor",
    span: 1,
    col,
    row: 0,
    fromRow: 0,
    color: null,
    holes: 0,
    petals: 0,
    dragMilli: 0,
    shell: NO_SHELL,
  });
  world.events.push({ type: "bellowsBreath", col });
}

/** The leaking spark, unanswered for `bellowsSparkBeats`: the hull, and the wave. */
function spendSpark(world: World, s: BellowsState): void {
  if (!bellowsLeaking(s)) return;
  if (world.beat - s.sparkBeat < world.cfg.bellowsSparkBeats) return;
  const col = s.sparkCol;
  s.sparkCol = NO_SPARK;
  world.events.push({ type: "bellowsSparkHit", col });
  breachHull(world, col, "meteorFastest", 0, "heavy");
}
