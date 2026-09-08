import { BULB, livingPath } from "@neon-spore/content";
import { PALETTE, STROKE } from "@neon-spore/render";
import { label, panel, r } from "./page.js";

/**
 * The one panel that is an argument rather than an inventory: a body posed
 * against the same body placed, at the same five angles.
 *
 * `docs/dimensional.md` measured the difference at 22.9 : 1 against 1.10 : 1
 * and `tools/director/src/skins/turn.ts` is where the placement is implemented
 * for real, on the page that has a light. This draws the *bare* geometry of
 * both, which is the half a still can carry: a pose slides every mark at one
 * rate and can never bring anything out from behind, and placement crowds the
 * far marks against the limb and takes them away.
 */

export const DEPTH_STEPS = 5;
const STEPS = DEPTH_STEPS;
const MARKS = 8;
/** How far a surface feature stands from the middle, as a fraction of the body. */
const REACH = 0.72;
/** The drawn extent of a specimen, so a caller can size its own frame. */
export const DEPTH_SIZE = 96;
const SIZE = DEPTH_SIZE;

function dot(x: number, y: number, front: boolean): string {
  // Behind the limb is not drawn at all: that is the whole of the reveal, and
  // fading it out instead would say "translucent" rather than "round".
  if (!front) return "";
  return `<circle cx="${r(x)}" cy="${r(y)}" r="3.2" fill="${PALETTE.cyanRim}" fill-opacity="0.9"/>`;
}

/** The body, once, with a stroke that does not scale — the same rule as `form.ts`. */
function shell(scaleX: number): string {
  const k = (SIZE / 2 / 58) * 1;
  return `<g transform="scale(${r(scaleX * k)} ${r(k)})"><path d="${livingPath(BULB, 0)}" fill="${PALETTE.cyanDark}" fill-opacity="0.85" stroke="${PALETTE.cyan}" stroke-width="${r(STROKE.outline / k)}" stroke-linejoin="round"/></g>`;
}

/** An affine: one `sx`, and every mark on the body moves at very nearly one rate. */
export function posed(theta: number): string {
  const sx = Math.cos(theta) * 0.35 + 0.65;
  const marks: string[] = [];
  for (let i = 0; i < MARKS; i++) {
    const a = (i / MARKS) * Math.PI * 2;
    marks.push(dot(Math.cos(a) * REACH * (SIZE / 2) * sx, Math.sin(a) * REACH * (SIZE / 2), true));
  }
  return `${shell(sx)}${marks.join("")}`;
}

/** A turn: each feature at its own longitude, so half of them are behind. */
export function placed(theta: number): string {
  const marks: string[] = [];
  for (let i = 0; i < MARKS; i++) {
    const lon = (i / MARKS) * Math.PI * 2 + theta;
    const lat = Math.sin(i * 1.7) * 0.5;
    const x = Math.cos(lat) * Math.sin(lon);
    const y = Math.sin(lat);
    marks.push(dot(x * REACH * (SIZE / 2), y * REACH * (SIZE / 2), Math.cos(lon) > 0));
  }
  return `${shell(1)}${marks.join("")}`;
}

export const DEPTH_HEIGHT = 320;

export function depthPanel(y: number): string {
  const rows: string[] = [];
  for (let s = 0; s < STEPS; s++) {
    const theta = (s / STEPS) * Math.PI;
    const x = 150 + s * 150;
    rows.push(`    <g transform="translate(${x} ${y + 140})">${posed(theta)}</g>
    <g transform="translate(${x} ${y + 250})">${placed(theta)}</g>`);
  }
  rows.push(label(40, y + 144, "POSED", 9, PALETTE.dim));
  rows.push(label(40, y + 156, "1.10 : 1", 8, PALETTE.rock));
  rows.push(label(40, y + 254, "PLACED", 9, PALETTE.cyan));
  rows.push(label(40, y + 266, "22.9 : 1", 8, PALETTE.rock));
  return panel(
    y,
    "DEPTH · a silhouette is posed, a surface is placed",
    "eight marks, half a turn. An affine slides them at one rate and hides none; longitude crowds them at the limb and takes them behind.",
    rows.join("\n"),
  );
}
