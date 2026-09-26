import { type KeelState, keelCooling, keelFlipping, type SimConfig } from "@neon-spore/sim";
import { smoothstep } from "./ease.js";
import { RISE } from "./keel-shape.js";

/**
 * **The numbers THE KEEL's story between is posed off** (`keel-story.ts`
 * draws them): the flip's bow the wrong way, the chord's count, and the heat
 * the cooldown banks segment by segment. Its own page so `keel-pose.ts` can
 * read the bow without reading the marks.
 */

/** Beats the arch takes to swing through flat to the wrong way, and how deep it bows there against `RISE`. */
const SWING_BEATS = 1;
const BOW = 0.55;
const BOW_LATE = 0.35;
/** How far a full chord pulls the bow back toward flat, and how hard the arch shudders meanwhile. */
const ARREST = 0.7;
const SHUDDER = 0.06;

/** How far the chord has counted, 0 to 1. */
export function keelChord(s: KeelState, cfg: SimConfig): number {
  if (!keelFlipping(s)) return 0;
  return Math.min(1, s.chordBeats / Math.max(1, cfg.keelChordBeats));
}

/** The arch's rise through the flip, in tiles: negative is bowed the wrong way. */
export function keelFlipRise(
  s: KeelState,
  cfg: SimConfig,
  beat: number,
  beatPhase: number,
): number {
  const t = since(s, beat, beatPhase);
  const swing = smoothstep(t / SWING_BEATS);
  const late = smoothstep(t / Math.max(1, cfg.keelFlipBeats));
  const bow = -RISE * (BOW + BOW_LATE * late) * (1 - ARREST * keelChord(s, cfg));
  const shudder = SHUDDER * RISE * Math.sin(t * Math.PI * 6);
  return RISE * 1.06 * (1 - swing) + swing * (bow + shudder);
}

/** How hot segment `k` still is in the cooldown, 1 white to 0 iron; 0 in every other phase. */
export function keelHeat(
  s: KeelState,
  cfg: SimConfig,
  k: number,
  beat: number,
  beatPhase: number,
): number {
  if (!keelCooling(s)) return 0;
  const n = s.locked.length;
  const span = (cfg.keelCoolBeats + s.flares) / Math.max(1, n);
  return 1 - smoothstep((since(s, beat, beatPhase) - k * span) / span);
}

function since(s: KeelState, beat: number, beatPhase: number): number {
  return Math.max(0, beat - s.phaseBeat + beatPhase);
}
