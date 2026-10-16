import { halo } from "../../../../../packages/render/src/glow.js";
import type { Layout } from "../../../../../packages/render/src/layout.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";
import * as look from "../../../../../packages/render/src/pod-look.js";
import { POD_TILES } from "../../../../../packages/render/src/pods.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * **The pod as a tumbling seed** — THE SMART's seven studs on a round body,
 * taken off the flat card and put on a sphere. The sphere tumbles about a
 * tilted axis: studs ride over the limb and stand out of the outline as spikes,
 * then sink round the back and are gone, and a seam round its middle turns
 * with it so the roll is never ambiguous.
 *
 * From `WAKES_AT` beats left it tumbles faster and the studs throw themselves
 * out on every beat — a seed about to split.
 */

/** Beats left at which the seed wakes. */
const WAKES_AT = 6;
/** THE SMART's stud count. */
const STUDS = 7;
const SEAM_N = 32;
type V = { x: number; y: number; z: number };

/** Seven directions spread evenly over a sphere — the golden spiral. */
const DIRS: V[] = Array.from({ length: STUDS }, (_, i) => {
  const yy = 1 - ((i + 0.5) / STUDS) * 2;
  const rr = Math.sqrt(1 - yy * yy);
  const a = i * Math.PI * (3 - Math.sqrt(5));
  return { x: Math.cos(a) * rr, y: yy, z: Math.sin(a) * rr };
});
/** The axis it tumbles about, leaning off the upright. */
const AXIS: V = (() => {
  const v = { x: 0.55, y: 0.75, z: 0.35 };
  const n = Math.hypot(v.x, v.y, v.z);
  return { x: v.x / n, y: v.y / n, z: v.z / n };
})();

/** Rodrigues: `v` turned by `a` about `AXIS`. */
function turn(v: V, a: number): V {
  const c = Math.cos(a);
  const s = Math.sin(a);
  const d = (v.x * AXIS.x + v.y * AXIS.y + v.z * AXIS.z) * (1 - c);
  return {
    x: v.x * c + (AXIS.y * v.z - AXIS.z * v.y) * s + AXIS.x * d,
    y: v.y * c + (AXIS.z * v.x - AXIS.x * v.z) * s + AXIS.y * d,
    z: v.z * c + (AXIS.x * v.y - AXIS.y * v.x) * s + AXIS.z * d,
  };
}

export function smartPod(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  x: number,
  y: number,
  t: number,
  beatsLeft: number,
): void {
  const r = l.tile * POD_TILES;
  const awake = Math.max(0, Math.min(1, 1 - beatsLeft / WAKES_AT));
  const roll = t * (0.8 + 2.4 * awake);
  const R = r * 0.74;
  // On the beat, a throw of the studs that decays through it.
  const beat = beatsLeft % 1;
  const reach = 1.42 + 0.22 * awake * beat * beat;
  const by = y + Math.sin(t * 1.1) * l.tile * 0.05;
  const studs = DIRS.map((d) => turn(d, roll));
  const pulse = 0.5 + 0.5 * Math.sin(t * 2.4);

  halo(ctx, x, by, r * (2.1 + 0.3 * pulse), PALETTE.pod, 0.12 + 0.08 * pulse);
  ctx.save();
  ctx.lineCap = "round";
  for (const s of studs) if (s.z < 0) stud(ctx, x, by, R, reach, s);

  // The sphere, lit from up and to the left.
  const g = ctx.createRadialGradient(x - R * 0.4, by - R * 0.45, R * 0.08, x, by, R);
  g.addColorStop(0, PALETTE.pod);
  g.addColorStop(0.45, "#7A4C0C");
  g.addColorStop(1, PALETTE.podDark);
  ctx.globalAlpha = 1;
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, by, R, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = PALETTE.pod;
  ctx.lineWidth = Math.max(1.5, r * 0.1);
  ctx.globalAlpha = 0.85;
  ctx.stroke();

  seam(ctx, x, by, R, roll);
  for (const s of studs) if (s.z >= 0) stud(ctx, x, by, R, reach, s);
  ctx.restore();
}

/** One stud: a stalk out of the surface and a lit tip, dimmer round the back. */
function stud(ctx: CanvasRenderingContext2D, x: number, y: number, R: number, reach: number, d: V) {
  const near = (d.z + 1) / 2;
  ctx.globalAlpha = 0.25 + 0.75 * near;
  ctx.strokeStyle = PALETTE.pod;
  ctx.lineWidth = R * 0.2;
  ctx.beginPath();
  ctx.moveTo(x + d.x * R * 0.85, y + d.y * R * 0.85);
  ctx.lineTo(x + d.x * R * reach, y + d.y * R * reach);
  ctx.stroke();
  ctx.fillStyle = PALETTE.podRim;
  ctx.beginPath();
  ctx.arc(x + d.x * R * reach, y + d.y * R * reach, R * 0.12, 0, Math.PI * 2);
  ctx.fill();
}

/** The seam round the sphere's middle — the front half only. */
function seam(ctx: CanvasRenderingContext2D, x: number, y: number, R: number, roll: number) {
  ctx.lineWidth = R * 0.07;
  ctx.strokeStyle = PALETTE.podRim;
  let prev: V | null = null;
  for (let i = 0; i <= SEAM_N; i++) {
    const a = (i / SEAM_N) * Math.PI * 2;
    const p = turn({ x: Math.cos(a), y: 0, z: Math.sin(a) }, roll);
    if (prev && p.z > 0 && prev.z > 0) {
      ctx.globalAlpha = 0.3 + 0.5 * p.z;
      ctx.beginPath();
      ctx.moveTo(x + prev.x * R, y + prev.y * R);
      ctx.lineTo(x + p.x * R, y + p.y * R);
      ctx.stroke();
    }
    prev = p;
  }
}

export const POD_REAL_SMART: Variant = {
  slot: "pod:real",
  name: "smart",
  sentence:
    "a lit seed tumbling in depth — THE SMART's seven studs on a sphere, rising over the edge and sinking behind — that wakes and throws its studs on the beat as the clock runs out",
  dir: "tools/versus/candidates/pod-real/smart",
  patches: [
    patch({
      target: look.POD_LOOK,
      reached: () => look.POD_LOOK,
      where: { file: "packages/render/src/pod-look.ts", symbol: "POD_LOOK", type: "PodLook" },
      fields: { moored: smartPod },
    }),
  ],
};
