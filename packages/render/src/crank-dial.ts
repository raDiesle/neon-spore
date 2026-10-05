import type { Point } from "@neon-spore/content";
import {
  BEARING_TURN,
  crankBites,
  crankPays,
  crankTurnedMilli,
  crankWinds,
  NO_BEARING,
  type World,
} from "@neon-spore/sim";
import { halo } from "./glow.js";
import { HINT_LOUD } from "./handle-word.js";
import type { Circle } from "./layout.js";
import { paintLobe } from "./lobe-shell.js";
import { drawMazeLever } from "./maze-lever.js";
import { PALETTE } from "./palette.js";
import { drawPullKnob } from "./pull-knob.js";
import type { PullWay } from "./pull-line.js";
import { drawPullTrack, PULL_TRACK_W, type PullTrack, pullWay } from "./pull-track.js";
import type { SeatSkin } from "./seat-skin.js";

/**
 * THE CLAW's crank, drawn: the winder that brings the arm home.
 *
 * **It is a control that is turned, and the picture has to say so before
 * anybody has turned it.** Every other button on the band is a thing to press,
 * so a crank drawn as another lit lobe would be pressed once and then stared
 * at. What says *turn me* is the handle standing off the middle: a knob on a
 * bar, sitting round the circle a finger has to go round, exactly where the
 * hand should be. It is the one part of the panel that is a mechanism rather
 * than tissue, which is the decision the arm itself already made
 * (`reach-arm.ts`) — the two are one machine and are drawn as one.
 *
 * **The knob stands where the drum has turned to, and that is read off the
 * rope.** `crankTurnedMilli` is how far the drum is wound out, which is
 * `world.reachMilli` in another unit — so the handle comes round under the
 * finger at exactly the rate the arm comes down, and it is back at the top the
 * moment the arm is home. Nothing here is remembered between frames, so a
 * restart cannot carry a half-turned crank into the next run.
 *
 * **It is lit only while it bites.** A lit control that answers nothing is the
 * one thing a panel must not do, so it sits in the seat's dead flesh whenever
 * a finger on it would turn nothing (`crankBites`) — which is the arm's
 * automatic climb, and that alone: the crank goes both ways now, so a hand can
 * wind a hanging arm home *and* raise one off the hull, and it is lit for
 * both.
 *
 * **The green is the rope still out**: from the rest at the top round to the
 * knob, anticlockwise, and shrinking to nothing as the arm comes home — the
 * share of a turn THE GIMBAL's green is, the way back to rest. The arrow in
 * the knob says which way bites: clockwise to wind in, anticlockwise to pay
 * out, both heads while both do.
 *
 * **And while it bites with nobody on it, it breathes.** The owner asked for
 * exactly that — *a bigger white circle inside where to rotate, and glowing in
 * pulsing when unused* — and both halves are the same problem: a pair meeting
 * this panel for the first time has to see that the button is a *path* rather
 * than a target, and then be told that the path is waiting. The channel is the
 * circle a finger traces; the pulse runs only while `world.crankAtMilli`
 * says no hand is reporting a bearing, so it stops the moment somebody starts
 * turning and comes back if they stop.
 */

/** Where the knob rides, as a share of the button's radius. Far enough out
 * that a finger has a circle to travel, inside enough that the whole path is
 * in the hit region a thumb is answered in (`hitCircle`) — the whole button
 * is the grab, wider than `PULL_GRAB` would make the knob. */
const HANDLE_AT = 0.6;
/** And how big the knob is, as the same share: big enough for its arrow. */
const KNOB_R = 0.28;
/** The boss the lever is bolted to, as the same share. */
const BOSS_R = 0.11;
/** How long one breath of a crank nobody is turning takes, in seconds. Slow:
 * it is an invitation rather than an alarm, and the panel already has a beat
 * of its own running under it. */
const BREATH = 1.6;

/** A point on the knob's circle, `a` radians clockwise from the top. */
function round(x: number, y: number, r: number, a: number): Point {
  return { x: x + Math.sin(a) * r, y: y - Math.cos(a) * r };
}

/** The channel: the knob's whole circle, from the rest at the top, clockwise — the way in. */
function crankTrack(x: number, y: number, r: number, w: number): PullTrack {
  const pts: Point[] = [];
  for (let i = 0; i <= 72; i++) pts.push(round(x, y, r, (i / 72) * Math.PI * 2));
  return { pts, w, closed: true };
}

/** Which way the arrow in the knob points: in, out, or both while both bite. */
function crankWay(world: World, track: PullTrack, at: number): { way: PullWay; either: boolean } {
  const winds = crankWinds(world);
  const either = winds && crankPays(world);
  return { way: pullWay(track, at, winds ? 1 : 0), either };
}

export function drawCrankDial(
  ctx: CanvasRenderingContext2D,
  circle: Circle,
  world: World,
  skin: SeatSkin,
  /** Seconds since the page opened, for the breath. Nought is a still frame,
   * which is what every test and every still capture hands it. */
  time = 0,
): void {
  const { x, y, r } = circle;
  const live = crankBites(world);
  const held = world.crankAtMilli !== NO_BEARING;
  // Live and nobody reporting a bearing: the arm is hanging up there waiting
  // for a hand. That is what breathes (`sim/crank.ts`).
  const waiting = crankWinds(world) && !held;
  const breath = waiting ? 0.5 + 0.5 * Math.sin((time / BREATH) * Math.PI * 2) : 0;
  const hex = live ? PALETTE.hull : skin.dead[0];
  // Clockwise from the top, which is the way the hand winds — the drum's own
  // angle as a share of a turn, nought with the arm home and below it out.
  const at = crankTurnedMilli(world) / BEARING_TURN;

  if (live) halo(ctx, x, y, r * (1.9 + 0.5 * breath), PALETTE.hull, 0.4 + 0.35 * breath);
  ctx.fillStyle = skin.face;
  ctx.strokeStyle = hex;
  ctx.lineWidth = 2;
  paintLobe(ctx, x, y, r, "both");

  const kr = r * KNOB_R;
  const knob = round(x, y, r * HANDLE_AT, at * Math.PI * 2);
  const track = crankTrack(x, y, r * HANDLE_AT, kr * PULL_TRACK_W);
  const boss = { cx: x, cy: y, r: r * BOSS_R };
  if (live) {
    drawPullTrack(ctx, track, { ...LOOK, held, origin: 0, at, time: time + breath });
    drawMazeLever(ctx, boss, knob, kr, held);
    drawPullKnob(ctx, knob, kr, { ...LOOK, held, time, ...crankWay(world, track, at) });
  } else {
    // **Dark while it bites nothing**: a lit control that answers nothing is
    // the one thing a panel must not do, so the same knob and lever stand in
    // the seat's dead flesh, with no channel lit and no arrow in the knob.
    ctx.save();
    ctx.globalAlpha = 0.4;
    drawMazeLever(ctx, boss, knob, kr, false);
    drawPullKnob(ctx, knob, kr, { hex: skin.dead[1], rim: skin.dead[1], held, time, way: null });
    ctx.restore();
  }

  // The boss the lever turns on — the panel's own grown contour rather than a
  // circle, which is the rule every other button on this band is drawn by
  // (`lobe-shell.ts`). Dark and rimmed: it is the one part of this that does
  // not move, and a bright middle would read as the thing to press.
  ctx.fillStyle = skin.dead[1];
  ctx.strokeStyle = hex;
  ctx.lineWidth = 1.5;
  paintLobe(ctx, x, y, r * BOSS_R, "both");

  // The word, under the button as the salvo's label is (`controls-fleet.ts`),
  // and gone as soon as a hand lands, as THE MAZE's is.
  if (!live || held || r <= 16) return;
  ctx.save();
  ctx.font = `600 ${Math.round(r * 0.36)}px system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = PALETTE.text;
  ctx.globalAlpha = HINT_LOUD.mine;
  ctx.fillText("PULL", x, y + r * 1.22);
  ctx.restore();
}

/** The handle's colours: THE MAZE's — the hull's rim, lit to the text colour while held. */
const LOOK = { hex: PALETTE.hullRim, rim: PALETTE.text } as const;
