import { halo } from "../../../../../packages/render/src/glow.js";
import type { Layout } from "../../../../../packages/render/src/layout.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";
import * as look from "../../../../../packages/render/src/pod-look.js";
import { POD_TILES } from "../../../../../packages/render/src/pods.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * **The pod as a turning gem** — THE CAIRN combined with BULB · PEBBLE, the
 * pairing THE RIME wore until it left the game on 9 October 2026: THE CAIRN's
 * seven heptagon units, one of them a pebble core and six on a ring round it.
 *
 * The ring turns about the pod's own upright, seen a little from above, so the
 * near units come forward bright and large and the far ones fall back dark and
 * small — a whole body turning in depth, not a blob breathing. It answers to
 * the clock: from `LOOSENS_AT` beats left the ring spreads off the core and
 * spins up, a pile coming apart, so how long is left is a shape.
 */

/** Beats left at which the ring starts to loosen — the shipped ring's hot
 * stretch and one beat more, so the gem moves first and the ring then agrees. */
const LOOSENS_AT = 6;
/** THE CAIRN's units, less the core. */
const RING = 6;
const SIDES = 7;

function heptagon(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, spin: number) {
  ctx.beginPath();
  for (let i = 0; i < SIDES; i++) {
    const a = spin + (i / SIDES) * Math.PI * 2;
    const px = x + Math.cos(a) * r;
    const py = y + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

/** One unit, lit by how far forward it is: `near` 0 at the back, 1 in front. */
function unit(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  spin: number,
  near: number,
) {
  heptagon(ctx, x, y, r, spin);
  ctx.globalAlpha = 1;
  ctx.fillStyle = PALETTE.podDark;
  ctx.fill();
  ctx.globalAlpha = 0.3 + 0.7 * near;
  ctx.strokeStyle = PALETTE.pod;
  ctx.lineWidth = Math.max(1, r * 0.16);
  ctx.stroke();
  if (near < 0.45) return;
  // The facet turned to the light, up and to the left of the unit's middle.
  heptagon(ctx, x - r * 0.18, y - r * 0.2, r * 0.42, spin);
  ctx.globalAlpha = (near - 0.45) * 1.4;
  ctx.fillStyle = PALETTE.podRim;
  ctx.fill();
}

export function cairnPod(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  x: number,
  y: number,
  t: number,
  beatsLeft: number,
): void {
  const r = l.tile * POD_TILES;
  const loose = Math.max(0, Math.min(1, 1 - beatsLeft / LOOSENS_AT));
  const yaw = t * (0.9 + 2.6 * loose);
  // Seen from a little above, and the view itself nodding so the turn never
  // flattens into a sideways slide.
  const tilt = 0.5 + Math.sin(t * 0.7) * 0.14;
  const spread = r * (0.66 + 0.4 * loose);
  const bob = Math.sin(t * 1.1) * l.tile * 0.05;
  const units: { x: number; y: number; z: number; spin: number }[] = [];
  for (let k = 0; k < RING; k++) {
    const a = yaw + (k / RING) * Math.PI * 2;
    const depth = Math.sin(a) * spread;
    units.push({
      x: x + Math.cos(a) * spread,
      y: y + bob + depth * Math.sin(tilt),
      z: depth * Math.cos(tilt),
      spin: a * 0.5 + k,
    });
  }
  units.sort((a, b) => a.z - b.z);
  const pulse = 0.5 + 0.5 * Math.sin(t * 2.4);
  halo(ctx, x, y + bob, r * (2 + 0.3 * pulse), PALETTE.pod, 0.12 + 0.08 * pulse);
  ctx.save();
  ctx.lineJoin = "round";
  let coreDrawn = false;
  for (const u of units) {
    if (!coreDrawn && u.z > 0) {
      core(ctx, x, y + bob, r, t, pulse);
      coreDrawn = true;
    }
    const near = (u.z / spread + 1) / 2;
    unit(ctx, u.x, u.y, r * 0.4 * (0.82 + 0.3 * near), u.spin, near);
  }
  if (!coreDrawn) core(ctx, x, y + bob, r, t, pulse);
  ctx.restore();
}

/** The pebble at the middle, turning the other way, and the light in it. */
function core(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  t: number,
  pulse: number,
) {
  unit(ctx, x, y, r * 0.52, -t * 0.6, 1);
  ctx.globalAlpha = 0.55 + 0.45 * pulse;
  ctx.fillStyle = PALETTE.podRim;
  ctx.beginPath();
  ctx.arc(x, y, r * (0.14 + 0.04 * pulse), 0, Math.PI * 2);
  ctx.fill();
}

export const POD_REAL_CAIRN: Variant = {
  slot: "pod:real",
  name: "cairn",
  sentence:
    "seven amber facets — THE CAIRN round a BULB · PEBBLE core — turning in depth, the ring loosening and spinning up as the clock runs out",
  dir: "tools/versus/candidates/pod-real/cairn",
  patches: [
    patch({
      target: look.POD_LOOK,
      reached: () => look.POD_LOOK,
      where: { file: "packages/render/src/pod-look.ts", symbol: "POD_LOOK", type: "PodLook" },
      fields: { moored: cairnPod },
    }),
  ],
};
