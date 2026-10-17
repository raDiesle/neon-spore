import {
  type BlisterHand,
  type BlisterTarget,
  blisterHandAt,
  blisterLift,
  blisterTarget,
  type GuideScene,
  type SceneAct,
} from "@neon-spore/content";
import { type Creature, occupiesCol, type World } from "@neon-spore/sim";
import { blisterTurnRing } from "./blister-turn-help.js";
import { flatCenter, flatRadius } from "./creature-place.js";
import { bodyX } from "./field-flip.js";
import { drawFingerHand, type FingerTip } from "./guide-finger-hand.js";
import { rgba } from "./hex.js";
import { type Layout, tileCY } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * **The ghost hand on a blister**: a drawn hand, its fingertip on the body,
 * doing the gesture the body asks for — a press, a press kept, a stroke, a
 * circle, a scrub, a press then a stroke, a knob carried down and held.
 *
 * The owner, 17 October 2026: *a hand should show the finger movement action
 * the player needs to do.* Every other hand in a film is a disc where a thumb
 * is (`guide-hand.ts`), which says *here* and nothing about *how*; a blister's
 * whole lesson is the how, so this one is a hand, and the path its fingertip
 * has just travelled is drawn behind it.
 *
 * **Where the tip is is the film's own path** (`content/scene-blister.ts`),
 * the one the commands were sampled from, laid on the body the act names —
 * so the finger is never on a stroke the world did not feel. The body is a
 * blister and never moves, so its place is its column and row; the tip stays
 * there for the few ticks after a blow knocks the body out, while the hand
 * lifts away.
 */

/** Ticks the hand is on screen before it touches, and after it lifts. */
const LEAD_TICKS = 24;
const TRAIL_TICKS = 24;
/** Ticks of path drawn behind the tip. */
const PATH_TICKS = 20;
/** How big the hand is drawn, in tiles: big enough to read as a hand on a
 * phone, a finger about as wide as a fingertip on the glass. */
const HAND_TILES = 1.5;

/** Every blister hand on this seat's screen at this tick, drawn. */
export function drawBlisterHands(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  scene: GuideScene,
  tick: number,
  seat: 1 | 2,
  beatPhase: number,
): void {
  for (const act of scene.acts) {
    if (act.blister !== seat) continue;
    if (tick < act.tick - LEAD_TICKS) continue;
    const t = blisterTarget(scene, act, world.cfg);
    if (!t) continue;
    const lift = blisterLift(act, t);
    if (tick > lift + TRAIL_TICKS) continue;
    const place = placeOf(l, world, t, beatPhase);
    drawOne(ctx, l, place, act, t, tick, lift);
  }
}

interface Place {
  x: number;
  y: number;
  /** The radius of the ring a turn goes round. */
  ring: number;
}

function placeOf(l: Layout, world: World, t: BlisterTarget, beatPhase: number): Place {
  const body = bodyIn(world, t.col);
  if (body) {
    const at = flatCenter(l, body, beatPhase);
    return { ...at, ring: blisterTurnRing(l, flatRadius(l, world.cfg, body, beatPhase)) };
  }
  return { x: bodyX(l, t.col, t.row), y: tileCY(l, t.row), ring: blisterTurnRing(l, l.tile * 0.4) };
}

function bodyIn(world: World, col: number): Creature | null {
  for (const c of world.creatures) if (c.kind === "blister" && occupiesCol(c, col)) return c;
  return null;
}

function tipOf(l: Layout, p: Place, h: BlisterHand): { x: number; y: number } {
  if (h.bearing !== undefined) {
    const a = -Math.PI / 2 + (h.bearing / 1000) * Math.PI * 2;
    return { x: p.x + Math.cos(a) * p.ring, y: p.y + Math.sin(a) * p.ring };
  }
  return { x: p.x + (h.xMilli * l.tile) / 1000, y: p.y + (h.yMilli * l.tile) / 1000 };
}

/** The hand of one act: coming in, on the body, and going away. */
function drawOne(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  p: Place,
  act: SceneAct,
  t: BlisterTarget,
  tick: number,
  lift: number,
): void {
  const s = l.tile;
  const first = blisterHandAt(act, t, act.tick);
  const last = lastHand(act, t, lift);
  if (!first || !last) return;
  let tip: FingerTip;
  let alpha = 1;
  if (tick < act.tick) {
    // Coming in from below and to the right, lifted, fading up.
    const k = (tick - (act.tick - LEAD_TICKS)) / LEAD_TICKS;
    const at = tipOf(l, p, first);
    tip = { x: at.x + (1 - k) * s * 0.5, y: at.y + (1 - k) * s * 0.8, down: false };
    alpha = k;
  } else if (tick >= lift) {
    const k = (tick - lift) / TRAIL_TICKS;
    const at = tipOf(l, p, last);
    tip = { x: at.x + k * s * 0.4, y: at.y + k * s * 0.7, down: false };
    alpha = 1 - k;
  } else {
    const h = blisterHandAt(act, t, tick) ?? last;
    tip = { ...tipOf(l, p, h), down: h.down };
  }
  ctx.save();
  ctx.globalAlpha *= Math.max(0, Math.min(1, alpha));
  drawPath(ctx, l, p, act, t, tick, lift);
  if (tip.down) drawTouch(ctx, tip, s, tick - act.tick);
  drawFingerHand(ctx, tip, s * HAND_TILES);
  ctx.restore();
}

function lastHand(act: SceneAct, t: BlisterTarget, lift: number): BlisterHand | null {
  for (let at = lift - 1; at >= act.tick; at--) {
    const h = blisterHandAt(act, t, at);
    if (h) return h;
  }
  return null;
}

/** The way the tip has just come, fading out behind it. */
function drawPath(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  p: Place,
  act: SceneAct,
  t: BlisterTarget,
  tick: number,
  lift: number,
): void {
  const end = Math.min(tick, lift - 1);
  ctx.lineCap = "round";
  ctx.lineWidth = Math.max(2, l.tile * 0.1);
  let prev: { x: number; y: number } | null = null;
  for (let at = Math.max(act.tick, end - PATH_TICKS); at <= end; at++) {
    const h = blisterHandAt(act, t, at);
    if (!h?.down) {
      prev = null;
      continue;
    }
    const xy = tipOf(l, p, h);
    if (prev) {
      const k = 1 - (end - at) / PATH_TICKS;
      ctx.strokeStyle = rgba(PALETTE.text, 0.55 * k);
      ctx.beginPath();
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(xy.x, xy.y);
      ctx.stroke();
    }
    prev = xy;
  }
}

/** Where the tip meets the glass: a lit dot, and a ring spreading from a fresh press. */
function drawTouch(ctx: CanvasRenderingContext2D, tip: FingerTip, s: number, since: number): void {
  const k = Math.min(1, (since % 30) / 18);
  ctx.strokeStyle = rgba(PALETTE.hullRim, 0.7 * (1 - k));
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(tip.x, tip.y, s * (0.14 + 0.3 * k), 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = rgba(PALETTE.hullRim, 0.55);
  ctx.beginPath();
  ctx.arc(tip.x, tip.y, s * 0.1, 0, Math.PI * 2);
  ctx.fill();
}
