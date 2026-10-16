import type { HuskLook } from "../../../../../packages/render/src/husk-look.js";
import * as look from "../../../../../packages/render/src/husk-look.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";
import { drawMoored, POD_TILES } from "../../../../../packages/render/src/pods.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * **The hollow pod as an empty shell, turning** — THE SMART's round body cut
 * in half: a cup with the stumps of its studs on the outside. It tumbles, so
 * every couple of seconds its open face swings round to the viewer and shows
 * there is nothing inside, then swings away and it is a dull dome again. The
 * proof is the motion: a still might be a pod, the turn cannot be.
 *
 * Player 1 is drawn the real pod (`drawMoored`).
 */

const DEAD = "#8A6A3A";
const RIM_N = 28;
/** THE SMART's studs, broken off: directions on the dome, in its own frame
 * where the opening faces +z. */
const STUMPS = [
  { x: 0.6, y: -0.5, z: -0.62 },
  { x: -0.7, y: -0.2, z: -0.68 },
  { x: 0.1, y: 0.75, z: -0.65 },
  { x: -0.2, y: -0.15, z: -0.97 },
];
type V = { x: number; y: number; z: number };

/** Turned about y by `a`, then about x by `b`. */
function turn(v: V, a: number, b: number): V {
  const x = v.x * Math.cos(a) + v.z * Math.sin(a);
  const z0 = -v.x * Math.sin(a) + v.z * Math.cos(a);
  return { x, y: v.y * Math.cos(b) - z0 * Math.sin(b), z: v.y * Math.sin(b) + z0 * Math.cos(b) };
}

const cup: NonNullable<HuskLook["body"]> = (ctx, l, x, y, t, _pod, beatsLeft) => {
  if (l.role === "p1") {
    drawMoored(ctx, l, x, y, t, beatsLeft);
    return;
  }
  const R = l.tile * POD_TILES * 0.85;
  const a = t * 1.05;
  const b = 0.45 + Math.sin(t * 0.6) * 0.3;
  const n = turn({ x: 0, y: 0, z: 1 }, a, b);
  const phi = Math.atan2(n.y, n.x);
  const minor = R * Math.max(0.02, Math.abs(n.z));
  ctx.save();
  ctx.translate(x, y + Math.sin(t * 1.1) * l.tile * 0.04);
  ctx.lineCap = "round";

  // The outline: the dome's half of the limb, closed by the near half of the rim.
  ctx.beginPath();
  ctx.arc(0, 0, R, phi + Math.PI / 2, phi + (3 * Math.PI) / 2);
  ctx.ellipse(0, 0, minor, R, phi, -Math.PI / 2, Math.PI / 2);
  ctx.closePath();
  const g = ctx.createRadialGradient(-R * 0.4, -R * 0.45, R * 0.08, 0, 0, R);
  g.addColorStop(0, DEAD);
  g.addColorStop(1, PALETTE.podDark);
  ctx.globalAlpha = 1;
  ctx.fillStyle = g;
  ctx.fill();
  ctx.globalAlpha = 0.6;
  ctx.strokeStyle = DEAD;
  ctx.lineWidth = Math.max(1.5, R * 0.1);
  ctx.stroke();

  if (n.z > 0) {
    // Facing us: the inside, black, and the far wall catching a little light.
    ctx.beginPath();
    ctx.ellipse(0, 0, minor, R, phi, 0, Math.PI * 2);
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#000000";
    ctx.fill();
    ctx.globalAlpha = 0.25 * n.z;
    ctx.fillStyle = DEAD;
    ctx.beginPath();
    ctx.ellipse(
      -Math.cos(phi) * minor * 0.35,
      -Math.sin(phi) * minor * 0.35,
      minor * 0.5,
      R * 0.8,
      phi,
      Math.PI / 2,
      (3 * Math.PI) / 2,
    );
    ctx.fill();
  }
  rim(ctx, R, a, b, n.z > 0);
  for (const s of STUMPS) {
    const d = turn(s, a, b);
    if (d.z <= 0.05) continue;
    ctx.globalAlpha = 0.3 + 0.6 * d.z;
    ctx.strokeStyle = DEAD;
    ctx.lineWidth = R * 0.18;
    ctx.beginPath();
    ctx.moveTo(d.x * R * 0.9, d.y * R * 0.9);
    ctx.lineTo(d.x * R * 1.12, d.y * R * 1.12);
    ctx.stroke();
  }
  ctx.restore();
};

/** The lip: all of it when the inside faces us, its near half when it does not. */
function rim(ctx: CanvasRenderingContext2D, R: number, a: number, b: number, open: boolean) {
  ctx.strokeStyle = PALETTE.pod;
  ctx.lineWidth = Math.max(1, R * 0.08);
  let prev: V | null = null;
  for (let i = 0; i <= RIM_N; i++) {
    const th = (i / RIM_N) * Math.PI * 2;
    const p = turn({ x: Math.cos(th), y: Math.sin(th), z: 0 }, a, b);
    if (prev && (open || (p.z > 0 && prev.z > 0))) {
      ctx.globalAlpha = 0.35 + 0.3 * (p.z + 1);
      ctx.beginPath();
      ctx.moveTo(prev.x * R, prev.y * R);
      ctx.lineTo(p.x * R, p.y * R);
      ctx.stroke();
    }
    prev = p;
  }
}

export const POD_HOLLOW_CUP: Variant = {
  slot: "pod:hollow",
  name: "cup",
  sentence:
    "half a shell tumbling — THE SMART's body cut open, stud stumps outside — that keeps turning its empty inside to the viewer — on player 2's screen only",
  dir: "tools/versus/candidates/pod-hollow/cup",
  patches: [
    patch({
      target: look.HUSK_LOOK,
      reached: () => look.HUSK_LOOK,
      where: { file: "packages/render/src/husk-look.ts", symbol: "HUSK_LOOK", type: "HuskLook" },
      fields: { body: cup },
    }),
  ],
};
