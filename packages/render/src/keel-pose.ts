import { type KeelState, keelDone, keelThrown, type SimConfig } from "@neon-spore/sim";
import { smoothstep } from "./ease.js";
import { keelSegCentre, keelSegSlope, RISE, type Seg, type SegPose } from "./keel-shape.js";
import type { Layout } from "./layout.js";

/**
 * **The clock THE KEEL is posed off** (§24, *Animation*): a loose, faintly
 * swaying rest pose that stiffens a segment at a time; the midpoint hinged
 * apart round its socket; every joint dimmed and re-lit in turn at tempo; the
 * tail's whip; and the spine snapped straight — each read off the world and
 * the beat and eased over its phase's own beats.
 *
 * **The segments are independent joints, never one body morphing whole.** A
 * loose one sways on its own count and sags on its own; a locked one is
 * rigid. The only thing the whole spine shares is the arch, which tightens as
 * more of it locks — and that is the progress drawn as a shape.
 */

/** How far a loose segment sways either way, in radians, and how far it sags below the arch, in tiles. */
const SWAY = 0.16;
const SAG = 0.22;
/** How far the middle two turn apart on their hinge at full split, in radians, and slide outward, in tiles. */
const HINGE = 0.55;
const PART = 0.32;
/** How far the tail flicks as it throws, in radians. */
const WHIP = 0.9;
/** Beats the tail's flick takes, out and back, and the spine to snap straight. */
const WHIP_BEATS = 0.6;
const STRAIGHT_BEATS = 0.75;
/** How dim a joint waiting to be re-lit is in the tempo run, against 1 for a locked one. */
const DIM = 0.3;
/** How bright a loose segment is before the tempo run: iron, but not the lit iron of a locked one. */
const LOOSE = 0.55;

/** How far into its phase the spine is, in beats, the fraction of this one included. */
export function into(s: KeelState, beat: number, beatPhase: number): number {
  return Math.max(0, beat - s.phaseBeat + beatPhase);
}

/** The drop into frame: 0 still above the field, 1 hung. Row 1 of the beat list. */
export function keelArrived(s: KeelState, cfg: SimConfig, beat: number, beatPhase: number): number {
  if (s.phase !== "still") return 1;
  return smoothstep(into(s, beat, beatPhase) / Math.max(1, cfg.keelStillBeats));
}

/**
 * How high the arch's middle stands over its ends, in tiles. Slack while it is
 * loose, taut in proportion to what has locked, tautest in the rigid hold —
 * and flattened to nothing as the spine snaps straight.
 */
export function keelRise(s: KeelState, beat: number, beatPhase: number): number {
  const locked = s.locked.filter(Boolean).length / Math.max(1, s.locked.length);
  const taut = RISE * (0.62 + 0.38 * locked);
  if (s.phase === "rigid") return RISE * 1.06;
  if (keelDone(s)) return taut * (1 - smoothstep(into(s, beat, beatPhase) / STRAIGHT_BEATS));
  return taut;
}

/**
 * How far the midpoint is hinged apart: 0 shut, 1 wide round the socket. It
 * opens over the split's beats and holds while the socket waits; the shot
 * that answers it snaps it shut, which is the lock.
 */
export function keelOpen(s: KeelState, cfg: SimConfig, beat: number, beatPhase: number): number {
  if (s.phase === "split")
    return smoothstep(into(s, beat, beatPhase) / Math.max(1, cfg.keelSplitBeats));
  return s.phase === "socket" ? 1 : 0;
}

/** Whether segment `k` is one of the two the midpoint splits between: -1 the left of them, 1 the right, 0 neither. */
export function keelMiddle(s: KeelState, k: number): -1 | 0 | 1 {
  const half = s.locked.length / 2;
  if (k === half - 1) return -1;
  if (k === half) return 1;
  return 0;
}

/** One segment's pose: its sway if loose, its hinge if it is one of the middle two, its whip if it is the tail. */
export function keelSegPose(
  s: KeelState,
  cfg: SimConfig,
  k: number,
  beat: number,
  beatPhase: number,
): SegPose {
  const loose = !s.locked[k] && !keelDone(s) && s.phase !== "rigid";
  const swing = loose ? Math.sin((beat + beatPhase) * Math.PI * 0.5 + k * 1.7) : 0;
  const side = keelMiddle(s, k);
  const open = side === 0 ? 0 : keelOpen(s, cfg, beat, beatPhase);
  return {
    turn:
      SWAY * swing +
      side * -HINGE * open +
      (k === s.locked.length - 1 ? keelWhip(s, beat, beatPhase) : 0),
    sag: loose ? SAG * (0.8 + 0.2 * swing) : 0,
    shift: side * PART * open,
  };
}

/** The tail's flick as it throws: out and back once over `WHIP_BEATS`, nothing either side of it. */
function keelWhip(s: KeelState, beat: number, beatPhase: number): number {
  if (s.phase !== "rock") return 0;
  const t = into(s, beat, beatPhase) / WHIP_BEATS;
  return t >= 1 ? 0 : -WHIP * Math.sin(Math.PI * t);
}

/**
 * How lit segment `k` is, 0 to 1. Before the tempo run a locked one is lit
 * iron and a loose one duller; in it every joint is dimmed and a joint the
 * wave's order has answered comes back up, pulsing on the beat. The rigid
 * hold and after are lit whole.
 */
export function keelBright(s: KeelState, k: number, beat: number, beatPhase: number): number {
  if (s.phase === "rigid" || s.phase === "rock" || keelDone(s)) return 1;
  if (s.movement !== 3) return s.locked[k] ? 1 : LOOSE;
  if (keelAnswered(s, k)) return 1;
  // The dim comes down over half a beat at the start of the run, not at once.
  const fresh = s.phase === "rest" && s.repriseCursor === 0;
  const down = fresh ? smoothstep(into(s, beat, beatPhase) / 0.5) : 1;
  return 1 - (1 - DIM) * down;
}

/** Whether the tempo run has answered segment `k`: locked, and not still ahead in the wave's order. */
function keelAnswered(s: KeelState, k: number): boolean {
  return s.locked[k] === true && !s.reprise.slice(s.repriseCursor).includes(k);
}

/** The pulse on an answered joint in the tempo run, 1 on the beat and 0 half way: brighter, never a colour. */
export function keelPulse(s: KeelState, k: number, beatPhase: number): number {
  if (s.movement !== 3 || s.phase === "rigid" || s.phase === "rock" || keelDone(s)) return 0;
  if (!keelAnswered(s, k)) return 0;
  return 0.5 + 0.5 * Math.cos(beatPhase * Math.PI * 2);
}

/** How far the rock has fallen, 0 at the tail and 1 on the hull, or -1 when none is in the air. */
export function keelRockAlong(
  s: KeelState,
  cfg: SimConfig,
  beat: number,
  beatPhase: number,
): number {
  if (!keelThrown(s)) return -1;
  return Math.min(1, Math.max(0, (beat - s.rockBeat + beatPhase) / Math.max(1, cfg.keelRockBeats)));
}

/**
 * Every segment as it stands this frame: its place on the arch, lifted while
 * the spine drops in, and its pose. The one copy the drawing and the thumb
 * both read (`keel-draw.ts`, `keel-grip.ts`).
 */
export function keelSegs(
  l: Layout,
  cfg: SimConfig,
  s: KeelState,
  beat: number,
  beatPhase: number,
): Seg[] {
  const n = s.locked.length;
  const rise = keelRise(s, beat, beatPhase);
  const lift = (1 - keelArrived(s, cfg, beat, beatPhase)) * 3 * l.tile;
  return s.locked.map((_, k) => ({
    centre: keelSegCentre(l, cfg, k, n, rise, lift),
    slope: keelSegSlope(l, cfg, k, n, rise),
    pose: keelSegPose(s, cfg, k, beat, beatPhase),
  }));
}
