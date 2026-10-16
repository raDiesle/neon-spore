import type { HuskLook } from "../../../../../packages/render/src/husk-look.js";
import * as look from "../../../../../packages/render/src/husk-look.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";
import { drawMoored, POD_TILES } from "../../../../../packages/render/src/pods.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * **The hollow pod as a ring round nothing** — THE CAIRN with its BULB ·
 * PEBBLE core taken out, and one of the six ring units gone besides. What is
 * left turns in depth the way a pod's units would, but lopsided, wobbling on a
 * tilt that will not settle, round a black socket where the light should be.
 *
 * Player 1 is drawn the real pod (`drawMoored`), whatever that is — the husk is
 * a lie on that screen and only there.
 */

/** THE CAIRN's ring of six, one of them missing. */
const RING = 6;
const GONE = 2;
const SIDES = 7;
/** The dimmed amber of a unit with no light behind it. */
const DEAD = "#8A6A3A";

function heptagon(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, spin: number) {
  ctx.beginPath();
  for (let i = 0; i < SIDES; i++) {
    const a = spin + (i / SIDES) * Math.PI * 2;
    if (i === 0) ctx.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
    else ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
  }
  ctx.closePath();
}

const gutted: NonNullable<HuskLook["body"]> = (ctx, l, x, y, t, _pod, beatsLeft) => {
  if (l.role === "p1") {
    drawMoored(ctx, l, x, y, t, beatsLeft);
    return;
  }
  const r = l.tile * POD_TILES;
  const yaw = t * 0.7;
  // A loose wobble: the ring rocks on two clocks that never agree.
  const tilt = 0.55 + Math.sin(t * 1.3) * 0.25 + Math.sin(t * 2.9) * 0.08;
  const roll = Math.sin(t * 0.9) * 0.22;
  const spread = r * 0.72;
  ctx.save();
  ctx.translate(x, y + Math.sin(t * 0.8) * l.tile * 0.03);
  ctx.rotate(roll);
  ctx.lineJoin = "round";

  // The socket: black, with a thin rim — a place a core was.
  heptagon(ctx, 0, 0, r * 0.46, -0.3);
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#000000";
  ctx.fill();
  ctx.globalAlpha = 0.5;
  ctx.strokeStyle = DEAD;
  ctx.setLineDash([r * 0.12, r * 0.1]);
  ctx.lineWidth = Math.max(1, r * 0.06);
  ctx.stroke();
  ctx.setLineDash([]);

  const units: { x: number; y: number; z: number; spin: number }[] = [];
  for (let k = 0; k < RING; k++) {
    if (k === GONE) continue;
    const a = yaw + (k / RING) * Math.PI * 2;
    const depth = Math.sin(a) * spread;
    units.push({
      x: Math.cos(a) * spread,
      y: depth * Math.sin(tilt),
      z: depth * Math.cos(tilt),
      spin: a * 0.5 + k,
    });
  }
  units.sort((a, b) => a.z - b.z);
  for (const u of units) {
    const near = (u.z / spread + 1) / 2;
    const ur = r * 0.38 * (0.82 + 0.3 * near);
    heptagon(ctx, u.x, u.y, ur, u.spin);
    ctx.globalAlpha = 1;
    ctx.fillStyle = PALETTE.podDark;
    ctx.fill();
    ctx.globalAlpha = 0.25 + 0.5 * near;
    ctx.strokeStyle = DEAD;
    ctx.lineWidth = Math.max(1, ur * 0.14);
    ctx.stroke();
    // A crack across each, where the light got out.
    ctx.beginPath();
    ctx.moveTo(u.x - ur * 0.5, u.y - ur * 0.3);
    ctx.lineTo(u.x, u.y + ur * 0.1);
    ctx.lineTo(u.x + ur * 0.35, u.y - ur * 0.15);
    ctx.lineWidth = Math.max(1, ur * 0.08);
    ctx.stroke();
  }
  ctx.restore();
};

export const POD_HOLLOW_GUTTED: Variant = {
  slot: "pod:hollow",
  name: "gutted",
  sentence:
    "THE CAIRN's ring with its core taken out and a unit missing — dull, cracked, wobbling round a black socket — on player 2's screen only",
  dir: "tools/versus/candidates/pod-hollow/gutted",
  patches: [
    patch({
      target: look.HUSK_LOOK,
      reached: () => look.HUSK_LOOK,
      where: { file: "packages/render/src/husk-look.ts", symbol: "HUSK_LOOK", type: "HuskLook" },
      fields: { body: gutted },
    }),
  ],
};
