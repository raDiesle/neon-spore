import { view } from "@neon-spore/content";
import type { Heart } from "./filament-heart.js";
import {
  FLUSH_STEPS,
  filamentHeartRig,
  type HeartSqueeze,
  RISE,
  ventricles,
} from "./filament-heart-rig.js";
import { heartSurface, VESSEL_SLOTS } from "./filament-heart-surface.js";
import { halo } from "./glow.js";
import { PALETTE } from "./palette.js";
import { drawRig, type RigLook } from "./solid-rig.js";
import { TOP_CHROME_PX } from "./top-chrome.js";

/**
 * **THE FILAMENT's heart, drawn**: the organ (`filament-heart-rig.ts`) with
 * its muscle's grain and its vessels on it (`filament-heart-surface.ts`),
 * turned through a slow idle sway, beating in two strokes and flushing red
 * when it is struck.
 *
 * - **The turn** is a yaw there and back about the vertical, through the
 *   apex, so the vessels slide round the muscle and the great vessels pass
 *   in front of and behind one another — the reveal a flat heart cannot
 *   make (the `depth` skill). It is looked at a little from below.
 * - **The beat** is `lubDub`'s two strokes taken apart: the atria squeeze
 *   on the lub and the node on the near one flares, the ventricles on the
 *   dub; a pulse runs up every vessel from the apex.
 * - **The hurt** flushes every skin toward red in `FLUSH_STEPS` and turns the
 *   rim red, rather than laying a fill over an outline the rig never has.
 */

/** The idle turn: how far either way, in radians, and the wall-clock seconds there and back. */
const SWAY = 0.32;
const SWAY_PERIOD = 7.5;
/**
 * Looked at a little from below — it hangs over the players' heads — so the
 * vessels it hangs from go back into the body as they rise, and their roots
 * pass behind the muscle. The lens, in `rx`.
 */
export const HEART_PITCH = -0.1;
export const HEART_LENS = 8;
/** How far back the furthest part hazes. */
const HAZE = 0.45;
/** Where the pacemaker node sits on the near atrium, in `rx`, and its flare's reach. */
const NODE = { x: -0.68, y: -0.82, z: 0.2 } as const;
const NODE_REACH = 0.2;

const LOOK: RigLook = { deep: PALETTE.background, rim: PALETTE.sheenRim, haze: HAZE };
const HURT_LOOK: RigLook = { deep: PALETTE.background, rim: PALETTE.redRim, haze: HAZE };

/**
 * How far up the vessels may run, in `rx`: to `TOP_CLEAR` under the chrome
 * (`top-chrome.ts`) — the heart is jolted up a little on a pull — and never
 * shorter than `RISE_LEAST`, so the arch's stumps always stand.
 */
const TOP_CLEAR = 12;
const RISE_LEAST = 1.6;
function vesselRise(h: Heart): number {
  return Math.max(RISE_LEAST, Math.min(RISE, (h.y - TOP_CHROME_PX - TOP_CLEAR) / h.rx));
}

/** `lubDub` taken apart: the lub alone, and the dub a quarter of a beat later. */
export function heartSqueeze(beatPhase: number): HeartSqueeze {
  const dub = beatPhase - 0.25;
  return { atria: Math.exp(-beatPhase * 9), ventricles: dub > 0 ? Math.exp(-dub * 9) : 0 };
}

/** The heart's yaw at `time`: its idle sway. */
export function heartYaw(time: number): number {
  return SWAY * Math.sin((time * Math.PI * 2) / SWAY_PERIOD);
}

/**
 * The heart `h` with `strands` veins left in it, at `time` and `beatPhase`,
 * `alpha` faded and `hurt` struck (0..1).
 */
export function drawFilamentHeart(
  ctx: CanvasRenderingContext2D,
  h: Heart,
  strands: number,
  time: number,
  beatPhase: number,
  alpha: number,
  hurt: number,
): void {
  if (alpha <= 0) return;
  const rx = h.rx;
  const w = view(heartYaw(time), HEART_PITCH, rx * HEART_LENS);
  const sq = heartSqueeze(beatPhase);
  const flush = Math.round(Math.max(0, Math.min(1, hurt)) * FLUSH_STEPS);
  const v = ventricles(rx, sq.ventricles);
  const n = Math.ceil(strands);
  const vessels = VESSEL_SLOTS.slice(0, n).map((slot, i) => ({
    slot,
    left: i === n - 1 ? strands - (n - 1) : 1,
  }));
  const surface = { beatPhase, time, hurt };
  const parts = [
    ...filamentHeartRig(rx, sq, flush, time, vesselRise(h)),
    heartSurface(v.left, w, rx, {
      ...surface,
      squeeze: sq.ventricles,
      vessels: vessels.filter((x) => x.slot.side === "left"),
    }),
    heartSurface(v.right, w, rx, {
      ...surface,
      squeeze: sq.ventricles,
      vessels: vessels.filter((x) => x.slot.side === "right"),
    }),
    {
      kind: "mark" as const,
      c: { x: NODE.x * rx, y: NODE.y * rx, z: NODE.z * rx },
      draw: (g: CanvasRenderingContext2D, s: { x: number; y: number }, a: number) =>
        halo(
          g,
          s.x,
          s.y,
          Math.round(rx * NODE_REACH),
          PALETTE.sheenWarm,
          a * (0.25 + 0.6 * sq.atria),
        ),
    },
  ];
  drawRig(ctx, parts, w, h.x, h.y, flush > 0 ? HURT_LOOK : LOOK, alpha);
}
