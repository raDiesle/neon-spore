import { bearingToward, NO_BEARING } from "./bearing.js";
import { bossStrikesHull } from "./boss-strike.js";
import { midCol } from "./config.js";
import {
  GIMBAL_RINGS,
  type GimbalMark,
  type GimbalState,
  gimbalAligned,
  gimbalLeaking,
  gimbalTeeth,
  NO_SEAM,
} from "./gimbal.js";
import { openSlow } from "./slow.js";
import type { World } from "./world.js";

/**
 * THE GIMBAL's clock: the marks lighting, the hold being counted, the shear,
 * the seam, and the hatch.
 *
 * The beat owns more here than it does on THE FILAMENT, and for the opposite
 * reason: what the hands do is *turn*, which is a position rather than an
 * event, so there is nothing for a tick to decide. A ring is somewhere; the
 * question of whether it is somewhere **right**, and for how long, is a
 * question about beats. So the hands only ever move rings (`gimbal-hand.ts`)
 * and every judgement is here.
 *
 * **Nothing closes a window.** There is no strike for a slow alignment: an
 * alignment nobody finds stays up, the marks go on creeping, and what the
 * pair lose is the ring they let go of — `gimbalDriftMilli` a beat, back to
 * rest. The one thing that reaches the hull is the seam of row 9, which is a
 * hazard and not a window.
 */

export function installGimbal(world: World, marks: readonly GimbalMark[]): GimbalState {
  const s: GimbalState = {
    kind: "gimbal",
    marks: marks.map((m) => ({ ...m })),
    cursor: 0,
    phase: "still",
    phaseBeat: world.beat,
    atMilli: [0, 0],
    handMilli: [NO_BEARING, NO_BEARING],
    heldBeats: 0,
    seamCol: NO_SEAM,
    seamBeat: 0,
  };
  world.events.push({ type: "gimbalEnter", col: midCol(world.cfg) });
  return s;
}

export function stepGimbal(world: World, s: GimbalState): void {
  const cfg = world.cfg;
  const mid = midCol(cfg);
  // The one hazard, judged before anything else this beat: a spark that has
  // been leaking too long reaches the ship whatever the rings are doing.
  spendSeam(world, s);
  if (s.phase === "open") {
    if (world.beat - s.phaseBeat >= cfg.gimbalOpenBeats) {
      world.events.push({ type: "gimbalOut", col: mid });
      world.boss = null;
    }
    return;
  }
  if (s.phase === "still") {
    if (world.beat - s.phaseBeat >= cfg.gimbalStillBeats) lightMarks(world, s);
    return;
  }
  if (s.phase === "shear") {
    if (world.beat - s.phaseBeat < cfg.gimbalShearBeats) return;
    if (gimbalTeeth(s) > 0) lightMarks(world, s);
    else {
      s.phase = "open";
      s.phaseBeat = world.beat;
      world.events.push({ type: "gimbalHatch", col: mid });
    }
    return;
  }
  drift(world, s);
  if (gimbalAligned(s, cfg, world.beat)) {
    s.heldBeats += 1;
    if (s.heldBeats === 1) world.events.push({ type: "gimbalTrue", col: mid });
    if (s.heldBeats >= cfg.gimbalHoldBeats) shear(world, s);
    return;
  }
  if (s.heldBeats === 0) return;
  s.heldBeats = 0;
  world.events.push({ type: "gimbalSlip", col: mid });
}

/** The next alignment's marks up, and the creep counted from this beat. */
function lightMarks(world: World, s: GimbalState): void {
  s.phase = "turn";
  s.phaseBeat = world.beat;
  s.heldBeats = 0;
  world.events.push({ type: "gimbalMarks", index: s.cursor, col: midCol(world.cfg) });
}

/**
 * A ring nobody is holding, falling back to rest — the design's *it drifts
 * back to rest*, and the whole cost of letting go.
 *
 * Rest is nought on both rings, and it is nought on the **true** wheel, so
 * both fall the same way and each seat sees their own ring come back toward
 * their own top. `bearingToward` homes the short way round and never past,
 * so a ring at rest stays there rather than jittering across it.
 */
function drift(world: World, s: GimbalState): void {
  for (const ring of GIMBAL_RINGS) {
    if (s.handMilli[ring] !== NO_BEARING) continue;
    s.atMilli[ring] = bearingToward(s.atMilli[ring], 0, world.cfg.gimbalDriftMilli);
  }
}

/** Both rings held true through the beat: a latch-tooth off each, under THE SLOW. */
function shear(world: World, s: GimbalState): void {
  const cfg = world.cfg;
  s.cursor += 1;
  s.phase = "shear";
  s.phaseBeat = world.beat;
  s.heldBeats = 0;
  openSlow(world, cfg.gimbalSlowBeats, "show");
  world.events.push({ type: "gimbalShear", teeth: gimbalTeeth(s), col: midCol(cfg) });
  // One tooth pair left and the drum swings loose in its cradle: the spark
  // from the seam, the fight's one ordinary hazard (§18, row 9).
  if (gimbalTeeth(s) === 1) {
    s.seamCol = midCol(cfg);
    s.seamBeat = world.beat;
    world.events.push({ type: "gimbalLeak", col: s.seamCol });
  }
}

/** The leaking spark, unanswered for `gimbalSeamBeats`: the hull, and the wave. */
function spendSeam(world: World, s: GimbalState): void {
  if (!gimbalLeaking(s)) return;
  if (world.beat - s.seamBeat < world.cfg.gimbalSeamBeats) return;
  const col = s.seamCol;
  s.seamCol = NO_SEAM;
  world.events.push({ type: "gimbalSeamHit", col });
  bossStrikesHull(world, "gimbal", col);
}
