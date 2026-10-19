import { type MothState, mothBellyOpen, mothLitSpots, type SimConfig } from "@neon-spore/sim";
import { smoothstep } from "./ease.js";
import { type Layout, tileCX } from "./layout.js";

/**
 * **Where THE MOTH is drawn, and in what pose**: read off the boss and the
 * beat every frame, and nothing kept (`moth-draw.ts`).
 *
 * **Its spots hang on the row a bolt meets it** (`sim/moth-shot.ts`
 * `mothAlong`): the body sits a little over that row, and each eyespot is on
 * its own column exactly on it, so a bolt up a spot's column ends on the
 * spot, and one up any other column under the wings ends on the wing.
 *
 * Its poses, each a set of numbers and the moth between two a blend of them:
 * - **coming in** — dropping from just over its row, fading in, wings a blur;
 * - **flying** — wings beating on the beat's own rate, the body bobbing;
 * - **sinking** over a still cannon — wings spread wide and slow, the body
 *   tipped back so its belly turns to the pair, legs reaching for the cannon;
 * - **resting** between steps — wings folded up over its back, seen edge on,
 *   and opened again on its other face (`fold`, `face`): dusk-violet on one
 *   step, moon-pale on the next, so the face the pair was reading goes away;
 * - **beaten** — wings drooping, greying, falling as it fades.
 */

/** How far over the meet row the body's middle hangs, in tiles. */
export const BODY_LIFT = 0.3;
/** Tiles above its place it comes down from: short, so it never crosses the
 * top of the screen (`render/test/boss-top.test.ts`). */
const DROP_TILES = 1.1;
/** Tiles it falls while it fades, beaten. */
const FALL_TILES = 1.6;

export interface MothPose {
  /** The body's middle. */
  x: number;
  y: number;
  /** The row a bolt meets it on, in pixels: where the spots hang. */
  meetY: number;
  /** How seen it is, 0..1. */
  alpha: number;
  /** Wing beat, radians: 0 spread flat, toward π/2 raised edge on. */
  flap: number;
  /** Folded over its back for a rest, 0..1, and which face shows: 1 the
   * dusk side, -1 the moon side. */
  fold: number;
  face: 1 | -1;
  /** Tipped back to show its belly, 0..1: sinking over the cannon. */
  pitch: number;
  /** How far its legs reach toward the cannon, 0..1: the landing coming. */
  reach: number;
  /** Beaten and drooping, 0..1. */
  spent: number;
}

/** The face a step is fought on: the dusk side, then the moon side, in turn. */
function faceOf(step: number): 1 | -1 {
  return Math.max(0, step) % 2 === 0 ? 1 : -1;
}

/** Beats since the phase began, with the beat's fraction. */
function since(s: MothState, beat: number, beatPhase: number): number {
  return beat - s.phaseBeat + beatPhase;
}

/** The moth this frame, in pixels and pose numbers. */
export function mothPoseAt(
  l: Layout,
  cfg: SimConfig,
  s: MothState,
  beat: number,
  beatPhase: number,
  time: number,
): MothPose {
  const t = since(s, beat, beatPhase);
  // The sinking itself, a step a beat in the simulation, eased into each step.
  const sunk = s.settle > 0 ? s.settle - 1 + smoothstep(Math.min(1, beatPhase * 2.5)) : 0;
  const meet = cfg.mothRow + (sunk * cfg.mothSinkMilli) / 1000;
  const meetY = l.gridTop + (meet + 0.5) * l.tile;
  let y = meetY - BODY_LIFT * l.tile;
  let alpha = 1;
  let spent = 0;
  // Beating: fast and shallow coming in, steady flying, slow and wide sinking.
  const sinking = s.settle > 0;
  const rate = s.phase === "enter" ? 11 : sinking ? 2.2 : 5.5;
  const depth = s.phase === "enter" ? 0.75 : sinking ? 0.22 : 0.42;
  let flap = depth * (0.5 + 0.5 * Math.sin(time * rate));
  y += Math.sin(time * rate + 1.2) * l.tile * (sinking ? 0.02 : 0.06);
  let fold = 0;
  // Its two faces take the steps in turn: each rest turns the other one out.
  let face = faceOf(s.cursor);
  if (s.phase === "enter") {
    const k = smoothstep(Math.min(1, t / Math.max(1, cfg.mothEnterBeats)));
    y -= (1 - k) * DROP_TILES * l.tile;
    alpha = k;
  } else if (s.phase === "rest") {
    // Folded up and opened again, the other face out once past the middle.
    const k = Math.min(1, t / Math.max(1, cfg.mothRestBeats));
    fold = Math.sin(k * Math.PI);
    if (k < 0.5) face = faceOf(s.cursor - 1);
    flap = 0;
  } else if (s.phase === "spent") {
    spent = Math.min(1, t / Math.max(1, cfg.mothSpentBeats));
    y += smoothstep(spent) * FALL_TILES * l.tile;
    alpha = 1 - smoothstep(spent);
    flap = 0.1 + 0.1 * Math.sin(time * 3);
  }
  const pitch = mothBellyOpen(s) ? smoothstep(Math.min(1, sunk / 1.5)) : 0;
  const reach = sinking ? Math.min(1, sunk / Math.max(1, cfg.mothLandBeats - 1)) : 0;
  return { x: tileCX(l, s.centre), y, meetY, alpha, flap, fold, face, pitch, reach, spent };
}

/**
 * How many times each wing has been torn, keyed by its spot's offset: every
 * spot shot on a step gone by, and the ones shot so far on this one. A fore
 * wing carries the spots two columns out, a hind wing the ones one column out.
 */
export function mothWingTears(s: MothState): Map<number, number> {
  const tears = new Map<number, number>();
  const add = (off: number) => tears.set(off, (tears.get(off) ?? 0) + 1);
  for (let i = 0; i < Math.min(s.cursor, s.steps.length); i++) {
    const st = s.steps[i];
    if (st?.kind === "wings") for (const off of st.spots) add(off);
  }
  const now = s.steps[s.cursor];
  if (now?.kind === "wings" && s.phase === "flit") {
    for (const off of now.spots) if (!s.spots.includes(off)) add(off);
  }
  return tears;
}

/** The spots on the wings now, and whether each glows: lit, or waiting its turn. */
export function mothSpotsShown(s: MothState): { off: number; lit: boolean }[] {
  if (s.phase !== "flit") return [];
  const lit = mothLitSpots(s);
  return s.spots.map((off) => ({ off, lit: lit.includes(off) }));
}

/** Belly plates still on it: one for every belly hit still owed. */
export function mothPlates(s: MothState): number {
  if (s.phase === "spent") return 0;
  let n = 0;
  for (let i = s.cursor; i < s.steps.length; i++) {
    const st = s.steps[i];
    if (st?.kind === "belly") n += i === s.cursor ? st.hits - s.hits : st.hits;
  }
  return n;
}
