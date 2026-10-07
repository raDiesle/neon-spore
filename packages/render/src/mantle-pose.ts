import { blobPoints } from "@neon-spore/content";
import {
  type MantleState,
  mantleDone,
  mantleFinale,
  mantleSparkMilli,
  type SimConfig,
  ticksPerBeat,
} from "@neon-spore/sim";
import { smoothstep } from "./ease.js";
import type { Layout } from "./layout.js";
import {
  mantleReach,
  mantleSparkPoint,
  type Point,
  type Side,
  type ValvePose,
} from "./mantle-shape.js";
import { MANTLE_TURN_TOP, mantleBulge, mantleTurnOpen } from "./mantle-story.js";
import { phaseInto } from "./phase-into.js";

/**
 * **The clock THE MANTLE is posed off** (§23, *Animation*): five poses — shut;
 * one pair short; two pairs short; split open with the core showing; the core
 * dark — and every morph between two of them eased over the phase's own beats,
 * never cut.
 *
 * Everything here is read off the world and the beat. The one exception to
 * easing is the bow: it reads the summed pull directly, on purpose, because a
 * shell that lagged behind the thumbs would be lying about the number both
 * screens exist to show.
 */

/** How far the flanks bow out at a full pull, in tiles. */
const BOW = 0.42;
/** How far the buckle bulges the flanks out, in tiles: past any pull's bow. */
const BULGE = 0.6;
/** How far past the threshold the bow keeps growing before it stops, as a share. */
const BOW_OVER = 1.15;
/** How far a handle's own pull drags its valve's tail down, per tile of pull. */
const DRAG = 0.3;
/** Beats a sheared plate takes to fall clear, and the split to swing wide. */
const SHED_BEATS = 1;
const SPLIT_BEATS = 1.5;

/**
 * The drop into frame: row 1 of the beat list, the shell arriving closed with
 * its handles dark. 0 is a shell still above the field, 1 hung in place.
 */
export function mantleArrived(
  s: MantleState,
  cfg: SimConfig,
  beat: number,
  beatPhase: number,
): number {
  if (s.phase !== "still" || s.cursor > 0) return 1;
  return smoothstep(phaseInto(s, beat, beatPhase) / Math.max(1, cfg.mantleStillBeats));
}

/** How lit the handles are: coming up over half a beat when a pull or the turn begins, dark otherwise. */
export function mantleHandlesLit(s: MantleState, beat: number, beatPhase: number): number {
  if (s.phase !== "pull" && s.phase !== "turn") return 0;
  return smoothstep(phaseInto(s, beat, beatPhase) / 0.5);
}

/**
 * The summed pull against this movement's threshold, as a share — 1 is the
 * shear. Floor-checked the way the simulation is: a handle below the floor
 * adds nothing, so a thumb parked alone never bows the shell past its own
 * half (`sim/mantle.ts` `mantleCharged`).
 */
export function mantleSumShare(s: MantleState, cfg: SimConfig): number {
  const need = s.thresholds[s.cursor];
  if (need === undefined || need <= 0) return 0;
  return (counted(s, cfg, 0) + counted(s, cfg, 1)) / need;
}

/** One handle's pull as the sum counts it: nought until it clears the floor. */
export function counted(s: MantleState, cfg: SimConfig, index: 0 | 1): number {
  const depth = s.depthMilli[index];
  return depth >= cfg.mantleFloorMilli ? depth : 0;
}

/** How far through the fall the newest sheared plate is: 1 once it has gone. */
export function mantleShed(s: MantleState, beat: number, beatPhase: number): number {
  if (s.cursor === 0 || s.phase === "dark") return 1;
  return smoothstep(phaseInto(s, beat, beatPhase) / SHED_BEATS);
}

/**
 * How far the shell has split down its seam: 0 shut, 1 swung wide — part-way
 * while the pair guide the turn (`mantle-story.ts`), and the rest of the way
 * from there once the core is bared.
 */
export function mantleOpen(
  s: MantleState,
  cfg: SimConfig,
  beat: number,
  beatPhase: number,
): number {
  if (mantleDone(s)) return 1;
  if (s.phase === "turn") return mantleTurnOpen(s, cfg, beat, beatPhase);
  if (!mantleFinale(s)) return 0;
  const swing = smoothstep(phaseInto(s, beat, beatPhase) / SPLIT_BEATS);
  return MANTLE_TURN_TOP + (1 - MANTLE_TURN_TOP) * swing;
}

/**
 * One valve's pose. The bow is shared — both valves swell on the one summed
 * number, which is the rule both screens are shown — and the drop is the
 * valve's own handle, so a thumb sees its own tail answer it.
 */
export function mantleValvePose(
  s: MantleState,
  cfg: SimConfig,
  side: Side,
  beat: number,
  beatPhase: number,
): ValvePose {
  const pulling = s.phase === "pull";
  const share = pulling ? Math.min(BOW_OVER, mantleSumShare(s, cfg)) : 0;
  const bulge = BULGE * mantleBulge(s, cfg, beat, beatPhase);
  const dragged = pulling || s.phase === "turn";
  const depth = dragged ? s.depthMilli[side < 0 ? 0 : 1] : 0;
  return {
    bow: BOW * share + bulge,
    drop: DRAG * Math.min(1.6, depth / 1000),
    open: mantleOpen(s, cfg, beat, beatPhase),
  };
}

/**
 * The bare core's heartbeat, twice a beat: 1 on the beat and on the half, 0
 * between. Row 8 of the beat list; the finish runs at tempo, so this does too.
 */
export function mantleCoreBeat(beatPhase: number): number {
  return 0.5 + 0.5 * Math.cos(beatPhase * Math.PI * 4);
}

/**
 * How much life the core has left: whole while shut, dimming a step with every
 * landed tap of the finish, and fading out over the dark beats. The health of
 * the last movement drawn as light rather than counted.
 */
export function mantleCoreLife(
  s: MantleState,
  cfg: SimConfig,
  beat: number,
  beatPhase: number,
): number {
  const taps = Math.max(1, cfg.mantleHeartbeatTaps);
  if (mantleFinale(s)) return 1 - (0.7 * s.heartbeatDone) / taps;
  if (mantleDone(s)) {
    return 0.3 * (1 - smoothstep(phaseInto(s, beat, beatPhase) / Math.max(1, cfg.mantleOpenBeats)));
  }
  return 1;
}

/** The spark's bead, its half-width and half-height in tiles: drawn that size and met at its lower end (`mantle-stop.ts`). */
export const MANTLE_SPARK = { rx: 0.18, ry: 0.26 } as const;

/**
 * Where the leaking spark's bead is now, and how far along its fuse (eased):
 * drawn there (`mantle-draw.ts`), aimed at there (`boss-cue-read-zc.ts`), and
 * met there by a bolt — so it is laid off the simulation's own reckoning of it
 * (`mantleSparkMilli`), at this frame's fraction of a tick.
 */
export function mantleSparkNow(
  l: Layout,
  cfg: SimConfig,
  s: MantleState,
  beat: number,
  beatPhase: number,
): { x: number; y: number; along: number } {
  const fuse = beat - s.sparkBeat + beatPhase;
  const along = smoothstep(fuse / Math.max(1, cfg.mantleSparkBeats));
  const milli = mantleSparkMilli(cfg, fuse * ticksPerBeat(cfg));
  return { ...mantleSparkPoint(l, s.sparkCol, milli), along };
}

/**
 * The soft core's outline about the shell's middle `at`, swelling on the
 * finish's beat once the shell is open: drawn there (`mantle-draw.ts`) and
 * met by a bolt there (`mantle-stop.ts`).
 */
export function mantleCorePoints(
  l: Layout,
  cfg: SimConfig,
  s: MantleState,
  at: Point,
  beat: number,
  beatPhase: number,
): Point[] {
  const { rx, ry } = mantleReach(l);
  const open = mantleOpen(s, cfg, beat, beatPhase);
  const pulse = mantleFinale(s) ? mantleCoreBeat(beatPhase) : 0;
  const grow = 1 + 0.08 * pulse * open;
  const t = beat + beatPhase;
  return blobPoints(
    at.x,
    at.y + ry * 0.12,
    rx * 0.66 * grow,
    ry * 0.74 * grow,
    5,
    0.08,
    0.04,
    t,
    23,
    30,
  );
}
