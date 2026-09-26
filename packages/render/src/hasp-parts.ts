import { LIGHT_HALF } from "@neon-spore/content";
import {
  type HaspState,
  haspBurning,
  haspHeld,
  haspWorking,
  NO_LATCH,
  type SimConfig,
} from "@neon-spore/sim";
import { strokeGlow } from "./glow.js";
import { haspFree, haspLatchHex, haspSpokeTurns, haspWorkIndex } from "./hasp-pose.js";
import { haspBarAt, haspCentre, haspHubRadius, haspRail, haspStapleFoot } from "./hasp-shape.js";
import { rgba } from "./hex.js";
import { litRound } from "./key-light.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * THE HASP's two halves, one to a seat: **the wheel** on the navigator's
 * screen and **the latch** on the pilot's, each the other's secret
 * (`view-role-clocks-c.ts`, §20). Off `hasp-draw.ts` because the row is one
 * thing both seats share and these are the two things neither does.
 *
 * Each carries the fifth standard — a mark saying which gesture it is for —
 * in its own shape rather than a word: a knurled rim is a thing to turn, and
 * a bar on a rail is a thing to pull down and hold.
 */

const SPOKES = 5;
const KNURL = 18;

/**
 * Hub `i` as the navigator sees it: a spoked wheel standing where her hand
 * left it, its rim lit while it is free and dark while it is seized, and a
 * knurl round the working one. Rock grey throughout — it is never shot.
 */
export function drawHaspWheel(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: HaspState,
  i: number,
  beat: number,
  beatPhase: number,
): void {
  const at = haspCentre(l, cfg, i);
  const r = haspHubRadius(l);
  const working = haspWorking(s) && i === haspWorkIndex(s);
  const free = working && haspFree(s, cfg);
  const clearing = s.phase === "clear";
  const disc = new Path2D();
  disc.arc(at.x, at.y, r, 0, Math.PI * 2);
  ctx.fillStyle = free ? rgba(PALETTE.rock, 0.28) : rgba(PALETTE.rockDark, 0.95);
  ctx.fill(disc);
  const turn = haspSpokeTurns(s, cfg, i, beat, beatPhase) * Math.PI * 2;
  // Lit by the same turn the spokes are drawn at: a hub genuinely spins, so
  // its own rotation is what feeds litRound's spin rather than an idle wobble
  // invented for it — and a seized wheel stopping the turn is the shading
  // stopping with it, exactly the tell the knurl already gives.
  ctx.save();
  ctx.clip(disc);
  litRound(ctx, at.x, at.y, r, LIGHT_HALF.rock, turn);
  ctx.restore();
  if (free || clearing) strokeGlow(ctx, disc, PALETTE.rock, STROKE.outline, clearing ? 0.6 : 1);
  else {
    ctx.lineWidth = STROKE.outline;
    ctx.strokeStyle = rgba(PALETTE.rock, working ? 0.4 : 0.25);
    ctx.stroke(disc);
  }
  const spokes = new Path2D();
  for (let k = 0; k < SPOKES; k++) {
    const a = turn + (k * Math.PI * 2) / SPOKES;
    spokes.moveTo(at.x + Math.cos(a) * r * 0.22, at.y + Math.sin(a) * r * 0.22);
    spokes.lineTo(at.x + Math.cos(a) * r * 0.88, at.y + Math.sin(a) * r * 0.88);
  }
  ctx.lineWidth = STROKE.outline;
  ctx.strokeStyle = free || clearing ? PALETTE.rock : rgba(PALETTE.rock, 0.3);
  ctx.stroke(spokes);
  if (!working) return;
  // The knurl: the mark that this is the wheel to turn. It turns with the
  // spokes, so a wheel that seized mid-turn is seen stopped *there*.
  const knurl = new Path2D();
  for (let k = 0; k < KNURL; k++) {
    const a = turn + (k * Math.PI * 2) / KNURL;
    knurl.moveTo(at.x + Math.cos(a) * r * 1.04, at.y + Math.sin(a) * r * 1.04);
    knurl.lineTo(at.x + Math.cos(a) * r * 1.2, at.y + Math.sin(a) * r * 1.2);
  }
  ctx.lineWidth = STROKE.inner;
  ctx.strokeStyle = rgba(PALETTE.rock, free ? 0.85 : 0.3);
  ctx.stroke(knurl);
}

/**
 * Hub `i` as the pilot sees it: a riveted cap, the same on every clasp and in
 * every phase. He is never shown a wheel, whether it turns, or that there is
 * one (§20), so nothing about it may move.
 */
export function drawHaspCap(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  i: number,
): void {
  const at = haspCentre(l, cfg, i);
  const r = haspHubRadius(l);
  const cap = new Path2D();
  cap.arc(at.x, at.y, r * 0.8, 0, Math.PI * 2);
  ctx.fillStyle = rgba(PALETTE.rockDark, 0.95);
  ctx.fill(cap);
  // No wobble here, on purpose: this cap is the one the docstring above says
  // may never move, so its light is fixed rather than fed a turn of its own.
  ctx.save();
  ctx.clip(cap);
  litRound(ctx, at.x, at.y, r * 0.8, LIGHT_HALF.rock, 0);
  ctx.restore();
  ctx.lineWidth = STROKE.outline;
  ctx.strokeStyle = rgba(PALETTE.rock, 0.6);
  ctx.stroke(cap);
  const rivet = new Path2D();
  rivet.arc(at.x, at.y, r * 0.18, 0, Math.PI * 2);
  ctx.fillStyle = rgba(PALETTE.rock, 0.6);
  ctx.fill(rivet);
}

/**
 * The latch beside the working clasp, on the pilot's screen: the rail, the
 * notch his thumb has to pass for the grip to count, the staple from the
 * shell's edge and the bar at the depth he has it — the bar and staple in
 * the heat's own colour, glowing while he holds, flaring as it burns him off.
 */
export function drawHaspLatch(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: HaspState,
  beat: number,
  beatPhase: number,
  flare: number,
): void {
  if (!haspWorking(s)) return;
  const i = haspWorkIndex(s);
  const rail = haspRail(l, cfg, i);
  const depth = s.latchMilli === NO_LATCH ? 0 : s.latchMilli;
  const bar = haspBarAt(l, cfg, i, depth);
  const notch = haspBarAt(l, cfg, i, cfg.haspGripMilli);
  const held = haspHeld(s, cfg);
  const hex = haspLatchHex(s, cfg, beat, beatPhase);

  const track = new Path2D();
  track.moveTo(rail.x, rail.top);
  track.lineTo(rail.x, rail.top + rail.length);
  track.moveTo(rail.x - bar.halfW * 0.5, notch.y);
  track.lineTo(rail.x + bar.halfW * 0.5, notch.y);
  ctx.lineWidth = STROKE.inner;
  ctx.strokeStyle = rgba(PALETTE.rock, 0.45);
  ctx.stroke(track);

  const foot = haspStapleFoot(l, cfg, i);
  const staple = new Path2D();
  staple.moveTo(foot.x, foot.y);
  staple.lineTo(bar.x - rail.side * bar.halfW, bar.y);
  ctx.lineWidth = STROKE.outline;
  ctx.strokeStyle = rgba(hex, 0.7);
  ctx.stroke(staple);

  const thick = l.tile * 0.14;
  const plate = new Path2D();
  plate.roundRect(bar.x - bar.halfW, bar.y - thick, bar.halfW * 2, thick * 2, thick);
  ctx.fillStyle = hex;
  ctx.fill(plate);
  const glow = (held ? 1.2 : haspBurning(s) ? 0.8 : 0.35) + 1.4 * flare;
  strokeGlow(ctx, plate, hex, STROKE.inner, glow);
}
