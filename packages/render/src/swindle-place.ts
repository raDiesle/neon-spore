import {
  midCol,
  type Pod,
  type SimConfig,
  type SwindleState,
  swindleLitStep,
  swindleRealAll,
  swindleRealLeft,
  type World,
} from "@neon-spore/sim";
import { smoothstep } from "./ease.js";
import { type Layout, tileCX, tileCY } from "./layout.js";

/**
 * **Where THE SWINDLE is drawn**: her body over the middle and a hood over
 * every pod she still holds, in the pixels of this frame — read off the boss,
 * the pods and the beat, and nothing kept (`swindle-draw.ts`).
 *
 * **Her pods are the field's own** (`sim/swindle-step.ts`): each hangs on the
 * pod row and is drawn by `pods.ts` like any pod, under its hood. So a hood is
 * placed on its pod wherever the pod is this frame, and rides with it through
 * a swap; she hangs above the row with room for a strand to each hood.
 *
 * **Nothing here reads what a pod is.** A hood is drawn over a real pod and a
 * fake alike, and the body counts her real pods only as they are swallowed —
 * so the pilot's screen holds nothing the navigator's fake twin does not add
 * (`pods.ts`).
 */

/** Her half-width, in tiles: seven columns across. */
const HALF_TILES = 3.4;
/** Her height, in tiles, crown to belly: a mass rather than a lens. */
const TALL_TILES = 2.4;
/** How far above the pod row's middle her belly hangs, in tiles: a strand's length. */
export const SWINDLE_STRAND_TILES = 1.45;
/** How much lower her belly hangs than an ellipse's, in her radii
 * (`swindle-shape.ts`): she is raised by as much, so the strand keeps its length. */
export const SWINDLE_SAG = 0.3;
/** How much of her size she keeps with one real pod left. */
const SPENT_SIZE = 0.78;
/** Tiles she settles down through as she comes in, fading up: never from above
 * the frame, where the seat switcher stands (`render/test/boss-top.test.ts`). */
const DROP_TILES = 0.6;
/** How far she rears back between hands, in tiles. */
const REAR_TILES = 0.45;
/** How far a hood lifts off its pod while the pod glides, in tiles. */
const LIFT_TILES = 0.22;

export interface DealerBox {
  x: number;
  y: number;
  rx: number;
  ry: number;
  /** How seen she is, 0..1: she fades as she goes. */
  alpha: number;
  /** How far she has reared back, 0..1, rising and falling over a rear. */
  rear: number;
  /** Her tilt, in radians about her middle: toward the pod she last let go. */
  lean: number;
}

/** Beats since the phase began, with the beat's fraction. */
function since(s: SwindleState, beat: number, beatPhase: number): number {
  return beat - s.phaseBeat + beatPhase;
}

/** Her body this frame: coming in, dealing a hand, rearing back, or going. */
export function swindleBodyAt(
  l: Layout,
  cfg: SimConfig,
  s: SwindleState,
  beat: number,
  beatPhase: number,
  lean = 0,
): DealerBox {
  const all = Math.max(1, swindleRealAll(s));
  const size = SPENT_SIZE + (1 - SPENT_SIZE) * (swindleRealLeft(s) / all);
  const rx = HALF_TILES * l.tile * (0.85 + 0.15 * size);
  const ry = (TALL_TILES / 2) * l.tile * size;
  const belly = tileCY(l, cfg.swindlePodRow) - SWINDLE_STRAND_TILES * l.tile;
  let y = belly - ry * (1 + SWINDLE_SAG);
  let alpha = 1;
  let rear = 0;
  const t = since(s, beat, beatPhase);
  if (s.phase === "enter") {
    const k = smoothstep(Math.min(1, t / Math.max(1, cfg.swindleEnterBeats)));
    y -= (1 - k) * DROP_TILES * l.tile;
    alpha = k;
  } else if (s.phase === "rear") {
    rear = Math.sin(Math.PI * Math.min(1, t / Math.max(1, cfg.swindleRearBeats)));
    y -= rear * REAR_TILES * l.tile;
  } else if (s.phase === "spent") {
    const k = Math.min(1, t / Math.max(1, cfg.swindleSpentBeats));
    y += k * 0.8 * l.tile;
    alpha = 1 - smoothstep(k);
  }
  return { x: tileCX(l, midCol(cfg)), y, rx, ry, alpha, rear, lean };
}

/** A pod of hers still hanging, its index in the hand, and how far its hood
 * is lifted off it this frame (0..1, up while it glides). */
export interface Held {
  i: number;
  pod: Pod;
  lift: number;
}

/** The pods of the lit hand still hanging under their hoods. */
export function swindleHolding(world: World, s: SwindleState): Held[] {
  if (swindleLitStep(s) === null) return [];
  const out: Held[] = [];
  s.hung.forEach((id, i) => {
    const pod = world.pods.find((p) => p.id === id);
    if (pod !== undefined && !pod.loose) out.push({ i, pod, lift: pod.crossMilli === 0 ? 0 : 1 });
  });
  return out;
}

/** How far up a hood is lifted, in pixels, at `lift`. */
export function hoodLift(l: Layout, lift: number): number {
  return lift * LIFT_TILES * l.tile;
}

/** Two of her pods trading places this frame: which passes in front, which
 * behind, and how far through the glide they are (0..1). */
export interface Crossing {
  front: number;
  back: number;
  progress: number;
}

/**
 * The glide under way, read off the pods' own columns: the pod going right
 * passes in front, the other behind, so the pilot can follow two pods that
 * cross the same row by eye. The same whichever is real.
 */
export function swindleCrossing(world: World, s: SwindleState): Crossing | null {
  const [a, b] = s.glide;
  const to = s.glideTo[0];
  const from = s.glideTo[1];
  const pa = world.pods.find((p) => p.id === a);
  if (a === undefined || b === undefined || to === undefined || from === undefined) return null;
  if (pa === undefined || pa.loose || to === from) return null;
  const progress = Math.max(0, Math.min(1, (pa.colMilli - from) / (to - from)));
  return to > from ? { front: a, back: b, progress } : { front: b, back: a, progress };
}

/** How far a crossing pod is in front (+1) or behind (-1) this frame. */
export function crossingDepth(c: Crossing | null, id: number): number {
  if (c === null) return 0;
  const d = Math.sin(Math.PI * c.progress);
  return id === c.front ? d : id === c.back ? -d : 0;
}
