import {
  blisterTurnHeld,
  blisterTurnShare,
  blisterTurnWayOf,
  type Creature,
  type World,
} from "@neon-spore/sim";
import { handleRadius } from "./handle-draw.js";
import type { Layout } from "./layout.js";
import { drawMazeLever } from "./maze-lever.js";
import { PALETTE } from "./palette.js";
import { drawPullKnob } from "./pull-knob.js";
import { drawPullTrack, PULL_TRACK_W, type PullTrack, pullWay } from "./pull-track.js";

/**
 * **THE BLISTER's TURN help**: THE MAZE's turn, the one turn for every wave
 * (the owner, 5 October 2026) — a closed channel round the body, a lever
 * bolted to its rim and the knob on the lever's end with the way in it —
 * drawn the way THE HASP's wheel draws it (`hasp-knob.ts`, `maze-lever.ts`,
 * `pull-knob.ts`, `pull-track.ts`).
 *
 * The knob rests at the top and goes round with the turn in progress, so the
 * channel behind it fills green from the top the way the turn counts — a
 * whole ring is a blow, and the knob is back at the top. The arrow has one
 * head: the wrong way round counts nothing (`sim/blister-turn.ts`). On the
 * seat that may turn it only; the partner is drawn the waiting clock, never
 * the way (`blister-help.ts`).
 */
export function drawBlisterTurn(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  c: Creature,
  at: { x: number; y: number; r: number },
  time: number,
): void {
  const sign = blisterTurnWayOf(c) === "cw" ? 1 : -1;
  const share = blisterTurnShare(c);
  const ring = at.r + l.tile * OUT_TILES;
  const knobR = handleRadius(l, world.cfg) * KNOB_SHARE;
  const held = blisterTurnHeld(c);
  const a = REST + sign * share * Math.PI * 2;
  const knob = { x: at.x + Math.cos(a) * ring, y: at.y + Math.sin(a) * ring };
  const track = channel(at, ring, sign, knobR * PULL_TRACK_W);
  drawPullTrack(ctx, track, { ...LOOK, held, origin: 0, at: share, time });
  drawMazeLever(ctx, { cx: at.x, cy: at.y, r: at.r }, knob, knobR, held);
  drawPullKnob(ctx, knob, knobR, { ...LOOK, held, time, way: pullWay(track, share, 1) });
}

/** Where the knob rests: straight up, where a clock's turn starts. */
const REST = -Math.PI / 2;

/** How far the channel stands out of the body's rim, in tiles: THE HASP's lever. */
const OUT_TILES = 0.45;

/** The knob, as a share of every pull handle's radius: a blister is small. */
const KNOB_SHARE = 0.8;

/** The channel: the knob's whole circle, from the top, the way the turn counts. */
function channel(at: { x: number; y: number }, r: number, sign: 1 | -1, w: number): PullTrack {
  const pts = [];
  for (let i = 0; i <= 72; i++) {
    const a = REST + sign * (i / 72) * Math.PI * 2;
    pts.push({ x: at.x + Math.cos(a) * r, y: at.y + Math.sin(a) * r });
  }
  return { pts, w, closed: true };
}

/** THE MAZE's colours: the hull's rim, lit to the text colour while held. */
const LOOK = { hex: PALETTE.hullRim, rim: PALETTE.text } as const;
