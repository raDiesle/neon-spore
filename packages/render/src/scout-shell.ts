import { KEY } from "@neon-spore/content";
import { halo } from "./glow.js";
import { mixHex, rgba } from "./hex.js";
import { PALETTE } from "./palette.js";
import { px, py, type ScoutPose, SHELL, SHELL_U, SHELL_W } from "./scout-pose.js";

/**
 * **THE SCOUT's little ship as a living thing** — a nautilus the mother ship
 * grew and puts out into the dark. The owner, 7 October 2026: *improve the
 * visual of the scout pacman, change it to anything which looks cool alien
 * natural living, similar style to the ship*. WHORL's spiral (the kept look
 * for THE WARDEN) laid as a shell, and the warden's cilia as its tentacles.
 *
 * A coiled shell in the hull's violet, ridged like the hull's own bark and lit
 * from the one key every body on the field is lit from; a soft body at the
 * opening; and six tentacles that reach along the heading and open and shut
 * where the pacman's mouth used to chomp. Two of them are the old feelers,
 * longer, with the one green on the field that belongs to nothing the pair
 * must dodge or fetch. A drop of the ship's slime hangs off the underside.
 *
 * **The silhouette is posed; the light is placed** (`.claude/skills/depth`).
 * Shell, coil, ribs, body and tentacles turn with the heading; the shading,
 * the gloss, the bounce off the water and the hanging drop are screen-space
 * and never turn with it.
 */

/** Ridges on the rim, and how deep they go. They are hard: they do not move. */
const RIDGES = 11;
const RIDGE_DEPTH = 0.045;
/** How a whorl grows: three times wider in a turn, as a nautilus does. */
const COIL_GROWTH = Math.log(3) / (Math.PI * 2);
/** How many growth ribs run from the coil out to the rim. */
const RIBS = 7;

/** The shell: the coiled, ridged, lit hard part, and the drop under it. */
export function drawScoutShell(ctx: CanvasRenderingContext2D, p: ScoutPose, time: number): void {
  const cx = px(p, SHELL_U, SHELL_W);
  const cy = py(p, SHELL_U, SHELL_W);
  const s = SHELL * p.r;
  drawDrip(ctx, cx, cy + s * 0.98, p.r, time);

  const rim = new Path2D();
  for (let i = 0; i <= 44; i++) {
    const a = (i / 44) * Math.PI * 2;
    const k = SHELL * (1 + RIDGE_DEPTH * Math.cos(a * RIDGES));
    const x = px(p, SHELL_U + Math.cos(a) * k, SHELL_W + Math.sin(a) * k);
    const y = py(p, SHELL_U + Math.cos(a) * k, SHELL_W + Math.sin(a) * k);
    if (i === 0) rim.moveTo(x, y);
    else rim.lineTo(x, y);
  }
  rim.closePath();

  ctx.save();
  const lit = ctx.createRadialGradient(
    cx + KEY.x * s * 0.45,
    cy + KEY.y * s * 0.45,
    s * 0.06,
    cx,
    cy,
    s * 1.08,
  );
  lit.addColorStop(0, PALETTE.sheenRim);
  lit.addColorStop(0.3, PALETTE.hull);
  lit.addColorStop(0.75, mixHex(PALETTE.hull, PALETTE.sheenDeep, 0.6));
  lit.addColorStop(1, PALETTE.sheenDeep);
  ctx.fillStyle = lit;
  ctx.fill(rim);
  ctx.clip(rim);
  drawCoil(ctx, p, time);
  // The bounce off the water, on the underside.
  ctx.strokeStyle = rgba(PALETTE.sheenCold, 0.45);
  ctx.lineWidth = p.r * 0.14;
  ctx.beginPath();
  ctx.arc(cx, cy - s * 0.1, s * 0.98, Math.PI * 0.15, Math.PI * 0.85);
  ctx.stroke();
  // The gloss on the shoulder nearest the key.
  ctx.fillStyle = rgba(PALETTE.sheenRim, 0.55);
  ctx.beginPath();
  ctx.ellipse(
    cx + KEY.x * s * 0.5,
    cy + KEY.y * s * 0.5,
    s * 0.3,
    s * 0.12,
    -Math.PI / 4,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = rgba(PALETTE.sheenDeep, 0.8);
  ctx.lineWidth = Math.max(1, p.r * 0.06);
  ctx.stroke(rim);
  ctx.restore();
}

/**
 * The coil and its ribs, inside the shell's clip: a whorl winding in to the
 * navel, each line a groove in shadow with a lit edge on the key's side, the
 * way the hull's bark is cut. A vein of light runs down the coil, slowly.
 */
function drawCoil(ctx: CanvasRenderingContext2D, p: ScoutPose, time: number): void {
  // The coil ends at the back of the opening and winds a turn and a half in.
  const end = -0.55;
  const turns = Math.PI * 3;
  const coil = new Path2D();
  const steps = 28;
  const at = (t: number) => {
    const a = end - turns * (1 - t);
    const k = SHELL * 0.92 * Math.exp(-COIL_GROWTH * turns * (1 - t));
    return { u: SHELL_U + 0.08 + Math.cos(a) * k, w: SHELL_W + Math.sin(a) * k };
  };
  for (let i = 0; i <= steps; i++) {
    const q = at(i / steps);
    if (i === 0) coil.moveTo(px(p, q.u, q.w), py(p, q.u, q.w));
    else coil.lineTo(px(p, q.u, q.w), py(p, q.u, q.w));
  }
  const ribs = new Path2D();
  for (let i = 0; i < RIBS; i++) {
    const q = at(0.45 + (0.55 * i) / RIBS);
    const a = Math.atan2(q.w - SHELL_W, q.u - SHELL_U - 0.08) - 0.35;
    const ou = SHELL_U + Math.cos(a) * SHELL * 1.05;
    const ow = SHELL_W + Math.sin(a) * SHELL * 1.05;
    ribs.moveTo(px(p, q.u, q.w), py(p, q.u, q.w));
    ribs.quadraticCurveTo(
      px(p, (q.u + ou) / 2 + 0.06, (q.w + ow) / 2),
      py(p, (q.u + ou) / 2 + 0.06, (q.w + ow) / 2),
      px(p, ou, ow),
      py(p, ou, ow),
    );
  }
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  const groove = Math.max(1, p.r * 0.07);
  ctx.save();
  ctx.translate(-KEY.x * groove * 0.6, -KEY.y * groove * 0.6);
  ctx.strokeStyle = rgba(PALETTE.hullRim, 0.55);
  ctx.lineWidth = groove * 0.8;
  ctx.stroke(ribs);
  ctx.stroke(coil);
  ctx.restore();
  ctx.strokeStyle = rgba(PALETTE.sheenDeep, 0.75);
  ctx.lineWidth = groove * 0.8;
  ctx.stroke(ribs);
  ctx.lineWidth = groove * 1.5;
  ctx.stroke(coil);
  // The vein: a bead of the hull's light travelling the coil inward.
  const q = at(1 - ((time * 0.35) % 1));
  halo(ctx, px(p, q.u, q.w), py(p, q.u, q.w), p.r * 0.35, PALETTE.hull, 0.8);
  // The navel, where the coil ends, wet and dark with a light in it.
  const n = at(0);
  ctx.fillStyle = rgba(PALETTE.sheenDeep, 0.9);
  ctx.beginPath();
  ctx.arc(px(p, n.u, n.w), py(p, n.u, n.w), p.r * 0.1, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * A drop of the ship's slime off the underside, on a strand that stretches
 * and gives: it always hangs down the screen, whichever way the ship faces.
 */
function drawDrip(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  time: number,
): void {
  const cycle = (time * 0.45) % 1;
  const len = r * (0.15 + 0.35 * cycle * cycle);
  const drop = r * (0.07 + 0.04 * cycle);
  ctx.save();
  ctx.strokeStyle = rgba(PALETTE.hull, 0.7);
  ctx.lineWidth = Math.max(0.75, r * 0.04);
  ctx.beginPath();
  ctx.moveTo(x, y - r * 0.05);
  ctx.lineTo(x, y + len);
  ctx.stroke();
  ctx.fillStyle = rgba(PALETTE.hullRim, 0.85);
  ctx.beginPath();
  ctx.arc(x, y + len + drop * 0.6, drop, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
