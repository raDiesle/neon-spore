import { LIGHT_HALF } from "@neon-spore/content";
import type { At } from "./bastion-shape.js";
import { halo, strokeGlowFaded } from "./glow.js";
import { sinHash } from "./hash.js";
import { rgba } from "./hex.js";
import { litRound } from "./key-light.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **THE BASTION's lattice** (§11.62): a cage of bright titanium struts round
 * the inner hull, turning slowly about the moon's upright, its near struts
 * drawn as tubes — a dark core and a lit edge — and its far ones left to the
 * hull to hide. Hung on its lower face, over their columns, the **nodes**: a
 * hexagonal pod each, a crystal at its heart.
 *
 * The node charging is lit, its crystal brighter and its crackle wilder the
 * nearer it is to throwing its lightning down; a node the shield burst is a
 * blackened pod with its crystal out.
 */

/** A node as the cage draws it. */
export interface NodeMark extends At {
  state: "idle" | "charging" | "burst";
}

/** The cage's meridians and how fast it turns, in radians a second. */
const STRUTS = 5;
const CAGE_SPIN = 0.3;
/** A node's pod, against the cage's radius. */
const POD = 0.16;

export function drawBastionCage(
  ctx: CanvasRenderingContext2D,
  c: At,
  r: number,
  time: number,
  nodes: readonly NodeMark[],
  charge: number,
): void {
  const spin = time * CAGE_SPIN;
  const struts = new Path2D();
  for (let k = 0; k < STRUTS; k++) {
    const phi = spin + (k * Math.PI) / STRUTS;
    // Only the half of each meridian turned toward the screen.
    const w = Math.max(0.5, Math.abs(Math.sin(phi)) * r);
    struts.ellipse(c.x, c.y, w, r, 0, -Math.PI / 2, Math.PI / 2, Math.cos(phi) < 0);
  }
  for (const lat of [-0.55, 0, 0.55]) {
    const rr = r * Math.cos(Math.asin(lat));
    struts.moveTo(c.x + rr, c.y + lat * r);
    struts.ellipse(c.x, c.y + lat * r, rr, rr * 0.3, 0, 0, Math.PI);
  }
  // A tube: its shadow, then its lit edge over it.
  ctx.lineWidth = r * 0.05;
  ctx.strokeStyle = PALETTE.bastionArmourDark;
  ctx.stroke(struts);
  ctx.lineWidth = r * 0.022;
  ctx.strokeStyle = PALETTE.bastionStrut;
  ctx.stroke(struts);
  for (const n of nodes) {
    // A spar from the node up into the cage.
    ctx.lineWidth = r * 0.04;
    ctx.strokeStyle = PALETTE.bastionStrut;
    ctx.beginPath();
    ctx.moveTo(n.x, n.y);
    ctx.lineTo(c.x + (n.x - c.x) * 0.55, c.y + (n.y - c.y) * 0.35);
    ctx.stroke();
  }
  for (const n of nodes) drawNode(ctx, n, r * POD, time, n.state === "charging" ? charge : 0);
}

function hexPath(x: number, y: number, r: number): Path2D {
  const p = new Path2D();
  for (let k = 0; k < 6; k++) {
    const a = Math.PI / 6 + (k * Math.PI) / 3;
    if (k === 0) p.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
    else p.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
  }
  p.closePath();
  return p;
}

function drawNode(
  ctx: CanvasRenderingContext2D,
  n: NodeMark,
  r: number,
  time: number,
  charge: number,
): void {
  const pod = hexPath(n.x, n.y, r);
  ctx.save();
  ctx.fillStyle = n.state === "burst" ? PALETTE.bastionArmourDark : PALETTE.bastionStrut;
  ctx.fill(pod);
  ctx.clip(pod);
  litRound(ctx, n.x, n.y, r, LIGHT_HALF.rock);
  ctx.restore();
  strokeGlowFaded(ctx, pod, PALETTE.bastionEdge, STROKE.inner, 0.5);
  const crystal = new Path2D();
  crystal.arc(n.x, n.y, r * 0.5, 0, Math.PI * 2);
  if (n.state === "burst") {
    ctx.fillStyle = "#000";
    ctx.fill(crystal);
    ctx.strokeStyle = rgba(PALETTE.bastionLight, 0.5);
    ctx.lineWidth = STROKE.inner;
    ctx.beginPath();
    ctx.moveTo(n.x - r * 0.6, n.y - r * 0.3);
    ctx.lineTo(n.x + r * 0.1, n.y + r * 0.1);
    ctx.lineTo(n.x + r * 0.5, n.y - r * 0.5);
    ctx.stroke();
    return;
  }
  ctx.fillStyle = n.state === "charging" ? PALETTE.bastionNode : rgba(PALETTE.bastionNode, 0.35);
  ctx.fill(crystal);
  if (n.state !== "charging") return;
  halo(ctx, n.x, n.y, r * (2 + 3 * charge), PALETTE.bastionNode, 0.5 + 0.5 * charge);
  drawCrackle(ctx, n, r, time, charge);
}

/**
 * The crackle round a charging node: short forks of lightning that jump
 * about a dozen times a second, more of them and longer as it fills.
 */
function drawCrackle(
  ctx: CanvasRenderingContext2D,
  n: At,
  r: number,
  time: number,
  charge: number,
): void {
  const tick = Math.floor(time * 12);
  const forks = 2 + Math.round(4 * charge);
  const crackle = new Path2D();
  for (let f = 0; f < forks; f++) {
    let a = sinHash(tick, f) * Math.PI * 2;
    let x = n.x;
    let y = n.y;
    const step = r * (0.7 + 1.1 * charge);
    crackle.moveTo(x, y);
    for (let s = 0; s < 3; s++) {
      a += (sinHash(tick + s, f + 7) - 0.5) * 1.6;
      x += Math.cos(a) * step;
      y += Math.sin(a) * step;
      crackle.lineTo(x, y);
    }
  }
  strokeGlowFaded(ctx, crackle, PALETTE.bastionNode, STROKE.inner, 1 + charge);
}
