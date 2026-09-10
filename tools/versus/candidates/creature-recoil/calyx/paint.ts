import { KEY } from "../../../../../packages/content/src/light.js";
import { mixHex, rgba } from "../../../../../packages/render/src/hex.js";
import { STROKE } from "../../../../../packages/render/src/palette.js";
import type { CageDraw } from "../../../../../packages/render/src/recoil-look.js";

/**
 * CALYX — no cage: the body is a fruit held in a cup of leaves.
 *
 * One leaf per bounce the body arrived with, fanning out and down from
 * under the body the way a calyx holds a berry — so the body sits *in*
 * something rather than inside a frame, and the something is grown, like
 * everything else on this field that is not rock. Each leaf is a curved
 * blade with a midrib, cupped: its outer half is lit by where it faces
 * against the key, so the left leaf is pale and the right one falls into the
 * body's dark, and the pair reads three leaves at three bearings as a cup
 * with a near side. They stir a little on the clock. A spent bounce is a
 * **wilted** leaf — half its length, curled down at the tip, scorched — so
 * the count reads from the left going round: fresh leaves left, wilted ones
 * spent.
 *
 * The leaves start under the body's rim and only their bases touch it, so
 * the colour the cannon has to match is the body's and uncovered; every
 * leaf is stained that colour by the caller.
 *
 * **How it can lose.** *A cup under a body that jumps.* A recoil is kicked
 * back up its lane on a shot, and a calyx that reads as holding the body
 * from below may read as the thing being knocked *off* it — which is fine
 * if the eye takes it as the body jumping out of its cup, and a defect if it
 * takes it as two things parting. Judge it on the beat after the shot.
 */

/** How far a leaf reaches, as a share of the hoop, and how wide it is at
 * its broadest as a share of its length. */
const REACH = 1.15;
const WIDTH = 0.42;
/** Where the leaves fan: the bearings they spread across, centred on
 * straight down, in radians. */
const FAN = 1.7;
/** How much a leaf stirs, in radians, and a wilted one's share of a fresh
 * one's length. */
const STIR = 0.06;
const WILT = 0.55;
/** What a leaf keeps of its colour turned fully from the key. */
const FLOOR = 0.3;
const SHEEN = "#F4F1EA";
const SHADOW = "#0B1024";

/** A leaf as a path along +x from its base, `len` long, cupped so its outer
 * edge bows further than its inner one. `curl` bends the tip back down. */
function leafPath(len: number, curl: number): Path2D {
  const w = len * WIDTH;
  const p = new Path2D();
  p.moveTo(0, 0);
  p.bezierCurveTo(len * 0.3, -w * 0.9, len * 0.75, -w * 0.7, len, curl * w);
  p.bezierCurveTo(len * 0.75, w * 0.85 + curl * w * 0.4, len * 0.3, w * 0.8, 0, 0);
  p.closePath();
  return p;
}

/** Lambert against the key for a leaf at bearing `a` whose face is turned
 * up toward the viewer and out along its bearing. */
function leafLit(a: number): number {
  const out = 0.6;
  const nx = Math.cos(a) * out;
  const ny = Math.sin(a) * out;
  const nz = Math.sqrt(1 - out * out);
  const lz = 0.6;
  const len = Math.hypot(KEY.x, KEY.y, lz);
  return Math.max(0, Math.min(1, (nx * KEY.x + ny * KEY.y + nz * lz) / len));
}

export function calyx(d: CageDraw): void {
  const { ctx, x, y, inner, hoop, struts, left, strain, metal, dark, burnt, time, phase } = d;
  ctx.save();
  ctx.translate(x, y);
  ctx.lineJoin = "round";
  const len = hoop * REACH * (1 + 0.06 * (strain - 1));
  for (let i = 0; i < struts; i++) {
    const spent = i >= left;
    // Bearings across the fan, left to right under the body, so the count is
    // read the way the ribs were: from one end going round.
    const t = struts === 1 ? 0.5 : i / (struts - 1);
    const a = Math.PI / 2 - FAN / 2 + FAN * t + STIR * Math.sin(time * 1.7 + phase + i * 2.4);
    ctx.save();
    ctx.rotate(a);
    // The base sits under the rim, so only the root of the leaf is over the
    // body.
    ctx.translate(inner * 0.7, 0);
    const lit = FLOOR + (1 - FLOOR) * leafLit(a);
    if (spent) {
      const leaf = leafPath(len * WILT, 0.9);
      ctx.fillStyle = rgba(mixHex(SHADOW, burnt, 0.6), 0.9);
      ctx.fill(leaf);
      ctx.strokeStyle = rgba(burnt, 0.8);
      ctx.lineWidth = STROKE.inner;
      ctx.stroke(leaf);
      ctx.restore();
      continue;
    }
    const leaf = leafPath(len, 0.05);
    // The blade: the body's dark at the root, lit toward the tip's outer
    // edge.
    const grad = ctx.createLinearGradient(0, len * WIDTH * 0.6, len, -len * WIDTH * 0.6);
    grad.addColorStop(0, rgba(mixHex(dark, metal, 0.25), 0.95));
    grad.addColorStop(1, rgba(mixHex(dark, mixHex(metal, SHEEN, 0.3), 0.35 + 0.65 * lit), 0.95));
    ctx.fillStyle = grad;
    ctx.fill(leaf);
    ctx.strokeStyle = rgba(mixHex(dark, metal, lit), 0.9);
    ctx.lineWidth = STROKE.inner;
    ctx.stroke(leaf);
    // The midrib, from the root to the tip, lit like the blade.
    ctx.beginPath();
    ctx.moveTo(len * 0.05, 0);
    ctx.quadraticCurveTo(len * 0.5, -len * WIDTH * 0.15, len * 0.95, 0);
    ctx.strokeStyle = rgba(mixHex(dark, metal, lit * 0.8), 0.7);
    ctx.lineWidth = STROKE.inner * 0.8;
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}
