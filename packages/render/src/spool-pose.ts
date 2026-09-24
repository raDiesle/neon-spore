import {
  type SimConfig,
  SPOOL_RIBS,
  type SpoolState,
  spoolPaying,
  spoolPayRateMilli,
} from "@neon-spore/sim";
import { smoothstep } from "./ease.js";
import type { Layout } from "./layout.js";
import { type SpoolPose, spoolHome, spoolSide } from "./spool-shape.js";

/**
 * **How far through a pose THE SPOOL is** — the clock the whole scene is
 * posed off (§21, *Animation*).
 *
 * Its own page off `spool-draw.ts`, because the two are different questions:
 * there is
 * *where the spool is*, which a thumb is answered against, and here is *what
 * it is doing*, which nothing is. Every number is read off the boss and the
 * beat, so nothing is kept between frames and a restart poses the spool from
 * the state alone (`restart.test.ts`).
 *
 * **The five poses are the five phases**, and the morph between two is always
 * one of three numbers eased over the phase's own beats: how far a rib has
 * lifted, how slack the line hangs, and how far the body has turned and
 * drifted. The two paying poses — brake shallow and line running fast, brake
 * deep and line crawling — differ only in **how fast the line visibly moves**,
 * which is the one thing §21 lets the picture say about the rate.
 */

/** How far through a phase the scene is, 0..1, counted from the beat it began. */
function through(s: SpoolState, beats: number, beat: number, beatPhase: number): number {
  const done = (beat - s.phaseBeat + beatPhase) / Math.max(1, beats);
  return Math.min(1, Math.max(0, done));
}

/**
 * How far the spool has swung in across the top, 0..1: rising only in the
 * opening taut beats, while every rib is still on — the only `taut` the fight
 * has — and 1 from then on.
 */
export function spoolEnter(s: SpoolState, cfg: SimConfig, beat: number, beatPhase: number): number {
  if (s.phase !== "taut" || s.ribs < SPOOL_RIBS) return 1;
  return smoothstep(through(s, cfg.spoolTautBeats, beat, beatPhase));
}

/**
 * How far the rib now going has lifted off the casing, 0..1; 0 when none is.
 * The fourth eases in the slack's first half, which is the same release the
 * other three had and the moment THE SLOW is holding open.
 */
export function spoolRibLift(
  s: SpoolState,
  cfg: SimConfig,
  beat: number,
  beatPhase: number,
): number {
  if (s.phase === "ease") return smoothstep(through(s, cfg.spoolEaseBeats, beat, beatPhase));
  if (s.phase === "slack")
    return smoothstep(Math.min(1, 2 * through(s, cfg.spoolSlackBeats, beat, beatPhase)));
  return 0;
}

/**
 * **How full the winding is drawn**, 0..1 — the health read a second way, off
 * the barrel rather than the ribs: fat with four ribs on, thinning as each
 * eases, down to the bare core once the spool is slack. The rib going counts
 * until it has gone, so the barrel thins with it and never cuts.
 */
export function spoolWound(s: SpoolState, cfg: SimConfig, beat: number, beatPhase: number): number {
  const going =
    s.phase === "ease" || s.phase === "slack" ? 1 - spoolRibLift(s, cfg, beat, beatPhase) : 0;
  return 0.2 + (0.8 * (s.ribs + going)) / SPOOL_RIBS;
}

/**
 * **How far the slack spool has turned** to face the ship, 0..1 — the
 * perspective change (`.claude/skills/new-boss` §5's third standard). The
 * winding and its ribs, which the pair has read all fight, go round out of
 * sight and the flange's face comes round in their place.
 */
export function spoolTurn(s: SpoolState, cfg: SimConfig, beat: number, beatPhase: number): number {
  if (s.phase !== "slack") return 0;
  return smoothstep(Math.min(1, 1.5 * through(s, cfg.spoolSlackBeats, beat, beatPhase)));
}

/** How far it has drifted off the top, 0..1 — slow to start, the way a thing let go is. */
export function spoolDrift(s: SpoolState, cfg: SimConfig, beat: number, beatPhase: number): number {
  if (s.phase !== "slack") return 0;
  const t = through(s, cfg.spoolSlackBeats, beat, beatPhase);
  return t * t;
}

/**
 * How slack the line hangs, 0..1. A slip throws a loop into it that pulls
 * back taut over the slip's own beats; the slack spool lets it go altogether.
 */
export function spoolSag(s: SpoolState, cfg: SimConfig, beat: number, beatPhase: number): number {
  if (s.phase === "slip") return 1 - smoothstep(through(s, cfg.spoolSlipBeats, beat, beatPhase));
  if (s.phase === "slack") return smoothstep(through(s, cfg.spoolSlackBeats, beat, beatPhase));
  return 0;
}

/** How fast the line is running right now, in thousandths a beat; nought unless a movement is paying. */
export function spoolRunRate(s: SpoolState, cfg: SimConfig): number {
  return spoolPaying(s) ? spoolPayRateMilli(s, cfg) : 0;
}

/**
 * **How much line has run this movement, between beats**, in thousandths —
 * what the winding's turn and the line's dashes are both placed off, so the
 * barrel and the line cannot disagree about how fast it is going. The
 * simulation adds a beat's worth at a time; this carries it on across the
 * beat at the rate the brake is holding now.
 */
export function spoolRunMilli(s: SpoolState, cfg: SimConfig, beatPhase: number): number {
  return s.paidMilli + spoolRunRate(s, cfg) * beatPhase;
}

/**
 * Where the paid-out length is against the middle of the zone, between beats,
 * in thousandths: positive is more line out than wanted. The navigator's
 * gauge is placed off this and nothing else.
 */
export function spoolAheadMilli(s: SpoolState, cfg: SimConfig, beatPhase: number): number {
  const want = s.wantMilli + (spoolPaying(s) ? s.wantRateMilli * beatPhase : 0);
  return spoolRunMilli(s, cfg, beatPhase) - want;
}

/**
 * **Where the whole body stands this frame**: the axle swung in from beyond
 * the brake's far end on the way in, and lifting off the top with a lazy
 * sideways swing on the way out — a thing released rather than a thing
 * thrown. One function because two pages read it: the drawing hangs every
 * part off it, and the brake's hit test answers a thumb where the knob is
 * drawn rather than where it would be with the spool at rest (`spool-grip.ts`).
 */
export function spoolPlaced(
  l: Layout,
  cfg: SimConfig,
  s: SpoolState,
  beat: number,
  beatPhase: number,
): SpoolPose {
  const side = spoolSide(l, cfg);
  const enter = spoolEnter(s, cfg, beat, beatPhase);
  const drift = spoolDrift(s, cfg, beat, beatPhase);
  const home = spoolHome(l, cfg);
  const at = {
    x: home.x - side * (1 - enter) * l.tile * 3 + side * Math.sin(drift * Math.PI) * l.tile * 0.6,
    y: home.y - drift * l.tile * 5,
  };
  return {
    at,
    turn: spoolTurn(s, cfg, beat, beatPhase),
    wound: spoolWound(s, cfg, beat, beatPhase),
  };
}
