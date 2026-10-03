import { type MimicState, midCol, mimicStep, type SimConfig } from "@neon-spore/sim";
import { smoothstep } from "./ease.js";
import { fieldX } from "./field-flip.js";
import type { Layout } from "./layout.js";
import { ARMS, MANTLE, type MimicPose } from "./mimic-shape.js";
import { phaseInto } from "./phase-into.js";

/**
 * **The clock THE MIMIC is posed off** (§42, *Animation*), six poses: flat
 * mottle pressed against the top of the field; the slap into a full round
 * mantle; rippling while a picture is up; the flinch as a picture peels, all
 * eight arms pulled in; split down the middle, two faces, the core between;
 * and shapeless, falling.
 *
 * **Everything is read off the simulation**: the phase and the beat it began,
 * the step and whether it is a split, how many arms have reached this
 * movement — so both phones draw it in one place. The ripple is the beat's,
 * never the wall clock's, so it stands still with the game paused.
 */

/** How far down the field the mantle hangs, its middle under the grid's top, in tiles. */
const HANG = 3.4;
/** How flat it is pressed before the slap, and how long the slap's wobble rings. */
const FLAT = 0.22;
const RING = 5;
/** How far a split step parts the skin, and how much further a peeled half falls back, as shares of wide open. */
const AJAR = 0.32;
export const PEELED_BACK = 0.25;
/** How far the halves part, wide open, in mantle radii. */
export const PART = 1;

const lerp = (a: number, b: number, k: number): number => a + (b - a) * k;
const clamp = (v: number): number => Math.max(0, Math.min(1, v));

/** Each arm's own slow breath at rest: eight of even length, each a little out of step. */
function breathing(wave: number, scale: number): number[] {
  return Array.from({ length: ARMS }, (_, k) => scale * (0.82 + 0.12 * Math.sin(wave + k * 1.7)));
}

/** How far down the field the reaching arm hangs: a share of the way to the hull per arm reached. */
function reachOf(l: Layout, cfg: SimConfig, y: number, r: number, reaches: number): number {
  const gap = Math.max(0, l.hullY - (y + r));
  return (gap * reaches) / Math.max(1, cfg.mimicReaches);
}

/** Whether the step before the cursor was a split — what a flinch or a clench opens onto. */
function afterSplit(s: MimicState): boolean {
  return s.steps[s.cursor - 1]?.ask === "split";
}

/** Where the mantle hangs at rest: its middle, over the middle column. */
export function mimicHang(l: Layout, cfg: SimConfig): { x: number; y: number } {
  return { x: fieldX(l, midCol(cfg)), y: l.gridTop + HANG * l.tile };
}

/** The mantle's pose this frame. */
export function mimicPose(
  l: Layout,
  cfg: SimConfig,
  s: MimicState,
  beat: number,
  beatPhase: number,
): MimicPose {
  const into = phaseInto(s, beat, beatPhase);
  const wave = (beat + beatPhase) * Math.PI * 0.7;
  const r = MANTLE * l.tile;
  const { x, y } = mimicHang(l, cfg);
  const step = mimicStep(s);
  const face: 1 | 2 = step?.reader ?? 1;
  const base: MimicPose = {
    x,
    y,
    r,
    squash: 1,
    turn: 1,
    arms: breathing(wave, 1),
    wave,
    split: step?.ask === "split" ? AJAR : 0,
    core: 0,
    reach: reachOf(l, cfg, y, r, s.reaches),
    spent: 0,
    face,
  };
  if (s.phase === "entering") {
    const k = into / Math.max(1, cfg.mimicEnterBeats);
    // Pressed flat until halfway in, then the slap: round, overshooting, ringing out.
    const t = clamp((k - 0.5) / 0.5);
    const squash =
      k < 0.5 ? FLAT : 1 + (FLAT - 1) * Math.exp(-RING * t) * Math.cos(t * Math.PI * 3);
    const top = y - r;
    return { ...base, squash, y: top + r * squash, arms: breathing(wave, k < 0.5 ? 0.2 : t) };
  }
  if (s.phase === "mimicking") {
    // The skin tenses, and the arm that will reach begins to stretch at the end.
    const k = smoothstep(clamp((into - (cfg.mimicMimicBeats - 0.5)) / 0.5));
    const next = reachOf(l, cfg, y, r, s.reaches + 1);
    return { ...base, arms: breathing(wave * 1.6, 1.1), reach: lerp(base.reach, next, k) };
  }
  if (s.phase === "peeled") {
    // The flinch: every arm pulled in, the mantle drawn small, easing back.
    const k = smoothstep(clamp(into / Math.max(1, cfg.mimicPeelBeats)));
    const wide = afterSplit(s);
    return {
      ...base,
      r: r * lerp(0.9, 1, k),
      squash: lerp(1.08, 1, k),
      arms: breathing(wave, lerp(0.05, 1, k)),
      split: wide ? lerp(AJAR, 1, k) : 0,
      core: wide ? 0.4 * k : 0,
    };
  }
  if (s.phase === "rolling") {
    // Rolled over on its long axis: one face edge-on, then the other to the pair.
    const k = smoothstep(clamp(into / Math.max(1, step?.beats ?? 1)));
    const turn = Math.cos(k * Math.PI);
    const from: 1 | 2 = face === 1 ? 2 : 1;
    return { ...base, turn, face: turn > 0 ? from : face, split: 0, reach: 0 };
  }
  if (s.phase === "core") return { ...base, split: 1, core: 1, arms: breathing(wave, 0.7) };
  if (s.phase === "clench") {
    // Shot: the halves clench back over the core, the arms knotted in.
    const k = smoothstep(clamp(into / Math.max(1, cfg.mimicClenchBeats)));
    return {
      ...base,
      split: lerp(1, AJAR, k),
      core: 1 - k,
      arms: breathing(wave * 2, 0.1),
      squash: 0.94,
    };
  }
  if (s.phase === "spent") {
    // Shapeless, falling down the field as plain mottle, its arms trailing.
    const k = clamp(into / Math.max(1, cfg.mimicSpentBeats));
    const fall = k * k * (l.hullY - y);
    return {
      ...base,
      y: y + fall,
      squash: lerp(1, 0.7, k),
      arms: breathing(wave * 0.4, 0.4),
      split: 0,
      reach: 0,
      spent: k,
    };
  }
  return base;
}

/**
 * Which way, on this screen, the half of a split skin a seat paints lies from the middle: -1
 * left or 1 right. The pilot's half is the field's left, wherever this screen
 * puts it (`field-flip.ts`).
 */
export function mimicHalfSide(l: Layout, seat: 1 | 2): -1 | 1 {
  const left = Math.sign(fieldX(l, l.cols - 1) - fieldX(l, 0)) || 1;
  return (seat === 1 ? -left : left) as -1 | 1;
}
