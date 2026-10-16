import {
  type MatronState,
  matronLitStep,
  matronLobesAll,
  matronLobesLeft,
  matronTaken,
  midCol,
  type Pod,
  type SimConfig,
  type World,
} from "@neon-spore/sim";
import { smoothstep } from "./ease.js";
import { type Layout, tileCX, tileCY } from "./layout.js";

/**
 * **Where THE MATRON is drawn**: her body over the middle, the lobes reaching
 * down to the pods she hangs, and the eggs still in her, in the pixels of this
 * frame — read off the boss, the pods and the beat, and nothing kept
 * (`matron-draw.ts`).
 *
 * **Her pods are the field's own** (`sim/matron-step.ts`): each hangs on the
 * pod row on its column and is drawn by `pods.ts` like any pod, over the tip
 * of the lobe that holds it. So she hangs above that row with room for a lobe
 * between, and a lobe ends wherever its pod is this frame.
 */

/** Her half-width, in tiles: seven columns across. */
const HALF_TILES = 3.6;
/** Her height, in tiles, crown to belly. */
const TALL_TILES = 2.3;
/** How far above the pod row's middle her belly hangs, in tiles: a lobe's length. */
export const MATRON_LOBE_TILES = 1.35;
/** How much of her size she keeps with one lobe left. */
const SPENT_SIZE = 0.75;
/** Tiles she settles down through as she comes in, fading up: never from above
 * the frame, where the seat switcher stands (`render/test/boss-top.test.ts`). */
const DROP_TILES = 0.6;
/** How far she rears back between clutches, in tiles. */
const REAR_TILES = 0.5;

export interface MotherBox {
  x: number;
  y: number;
  rx: number;
  ry: number;
  /** How seen she is, 0..1: she fades as she goes. */
  alpha: number;
  /** How far she has reared back, 0..1, rising and falling over a rear. */
  rear: number;
  /** Her tilt, in radians about her middle: toward the column she throws down. */
  lean: number;
}

/** Beats since the phase began, with the beat's fraction. */
function since(s: MatronState, beat: number, beatPhase: number): number {
  return beat - s.phaseBeat + beatPhase;
}

/** Her body this frame: coming down, hanging a clutch, rearing back, or sagging away. */
export function matronBodyAt(
  l: Layout,
  cfg: SimConfig,
  s: MatronState,
  beat: number,
  beatPhase: number,
  lean = 0,
): MotherBox {
  const all = Math.max(1, matronLobesAll(s));
  const size = SPENT_SIZE + (1 - SPENT_SIZE) * (matronLobesLeft(s) / all);
  const rx = HALF_TILES * l.tile * (0.85 + 0.15 * size);
  const ry = (TALL_TILES / 2) * l.tile * size;
  const belly = tileCY(l, cfg.matronPodRow) - MATRON_LOBE_TILES * l.tile;
  let y = belly - ry;
  let alpha = 1;
  let rear = 0;
  const t = since(s, beat, beatPhase);
  if (s.phase === "enter") {
    const k = smoothstep(Math.min(1, t / Math.max(1, cfg.matronEnterBeats)));
    y -= (1 - k) * DROP_TILES * l.tile;
    alpha = k;
  } else if (s.phase === "rear") {
    rear = Math.sin(Math.PI * Math.min(1, t / Math.max(1, cfg.matronRearBeats)));
    y -= rear * REAR_TILES * l.tile;
  } else if (s.phase === "spent") {
    const k = Math.min(1, t / Math.max(1, cfg.matronSpentBeats));
    y += k * 0.8 * l.tile;
    alpha = 1 - smoothstep(k);
  }
  return { x: tileCX(l, midCol(cfg)), y, rx, ry, alpha, rear, lean };
}

/** The pods of the lit clutch still hanging off her, each with its index. */
export function matronHanging(world: World, s: MatronState): { i: number; pod: Pod }[] {
  if (matronLitStep(s) === null) return [];
  const out: { i: number; pod: Pod }[] = [];
  s.hung.forEach((id, i) => {
    if (matronTaken(s, i)) return;
    const pod = world.pods.find((p) => p.id === id);
    if (pod !== undefined && !pod.loose) out.push({ i, pod });
  });
  return out;
}

/** The eggs still in her: every pod of the clutches she has not hung yet. */
export function matronEggs(s: MatronState): number {
  const from = s.phase === "hang" ? s.cursor + 1 : s.cursor;
  let n = 0;
  for (let i = from; i < s.steps.length; i++) n += s.steps[i]?.pods.length ?? 0;
  return s.phase === "spent" ? 0 : n;
}
