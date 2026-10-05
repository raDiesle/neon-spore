import { type HaspState, haspHandHasp, haspWoundMilli, type SimConfig } from "@neon-spore/sim";
import { handleRadius } from "./handle-draw.js";
import { drawHandleHint, type HandleWords, HINT_LOUD } from "./handle-word.js";
import { haspCentre, haspHubRadius, type Point } from "./hasp-shape.js";
import type { Layout } from "./layout.js";
import { drawMazeLever } from "./maze-lever.js";
import { PALETTE } from "./palette.js";
import { drawPullKnob } from "./pull-knob.js";
import { drawPullTrack, PULL_TRACK_W, type PullTrack, pullWay } from "./pull-track.js";

/**
 * **THE HASP's wheel turned the way THE MAZE's is**: a knob on a lever bolted
 * to the hub's rim, in a closed channel round it, with the arrow in the knob
 * and the word under it — `gimbal-knob.ts`'s drawing, which is THE MAZE's
 * (`maze-string.ts`, `maze-lever.ts`, `pull-knob.ts`, `pull-track.ts`).
 *
 * The owner, 5 October 2026: a turn is THE MAZE's turn on every wave, *a set
 * of reusable consistent controls across all waves, which players can learn
 * if they repeat and follow same visuals*. It takes the place of the knurl
 * the working wheel wore, and says the same thing: this is the wheel to turn.
 *
 * **The knob is bolted to the wheel**, `KNOB_OFF` round from the spokes'
 * nought, so it turns with them under her thumb and stops where the wheel
 * seizes — the tell the knurl gave.
 *
 * **The green is the winding, not the place.** A hasp is opened by how far
 * the wheel has been turned either way round, not by where it stands
 * (`sim/hasp-hand.ts`), so the channel fills from the knob's rest clockwise by
 * the share of this hasp's wind already turned, the whole ring when it gives —
 * further to go every hasp, the same ring. The backspin fills it the same way
 * with the wind that catches the spring; the rust and the sway count no wind,
 * and leave it empty. Either way round counts, so the arrow in the knob has
 * two heads, always.
 */

/**
 * How far round from the spokes' nought the knob is bolted, in radians:
 * 40° to the left of the top at a fresh wheel, THE GIMBAL's and THE MAZE's
 * figure — off the shell's nose, where the clasp is hinged.
 */
const KNOB_OFF = -Math.PI / 2 - (40 / 360) * Math.PI * 2;

/** How far the channel stands out of the hub's rim, in tiles: THE MAZE's lever, as THE GIMBAL's. */
const OUT_TILES = 0.45;

/** The circle the knob runs round: the hub's own, a lever's length out. */
function knobR(l: Layout): number {
  return haspHubRadius(l) + l.tile * OUT_TILES;
}

/** The knob's radius: every pull handle's (`handleRadius`). */
export function haspKnobSize(l: Layout, cfg: SimConfig): number {
  return handleRadius(l, cfg);
}

/** Where the knob stands with the working wheel's spokes `turns` round. */
export function haspKnobAt(l: Layout, cfg: SimConfig, s: HaspState, turns: number): Point {
  const at = haspCentre(l, cfg, haspHandHasp(s));
  const a = turns * Math.PI * 2 + KNOB_OFF;
  const r = knobR(l);
  return { x: at.x + Math.cos(a) * r, y: at.y + Math.sin(a) * r };
}

/** How much of the wind the channel shows filled, 0..1. */
export function haspWindShare(s: HaspState, cfg: SimConfig): number {
  if (s.phase === "work") return haspWoundMilli(s, cfg) / 1000;
  if (s.phase === "backspin") {
    return Math.min(1, s.travelMilli / Math.max(1, cfg.haspWindTravelMilli));
  }
  return 0;
}

/** The channel: the knob's whole circle, from its rest, clockwise. */
function knobTrack(l: Layout, at: Point, w: number): PullTrack {
  const r = knobR(l);
  const pts: Point[] = [];
  for (let i = 0; i <= 72; i++) {
    const a = KNOB_OFF + (i / 72) * Math.PI * 2;
    pts.push({ x: at.x + Math.cos(a) * r, y: at.y + Math.sin(a) * r });
  }
  return { pts, w, closed: true };
}

/** The wheel is hers alone, and only her screen and the test seat's draw it. */
const WORDS: HandleWords = { seat: 2, mine: "PULL", theirs: "P2'S" };

/**
 * The channel, the lever, the knob and the word round the working wheel,
 * its spokes `turns` round — drawn over the spokes, as the knurl was.
 * `free` is the pilot's grip: lit while the wheel will turn, dim while it is
 * seized, so the knob says what the rim said.
 */
export function drawHaspKnob(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: HaspState,
  turns: number,
  free: boolean,
  held: boolean,
  time: number,
): void {
  const at = haspCentre(l, cfg, haspHandHasp(s));
  const r = haspKnobSize(l, cfg);
  const knob = haspKnobAt(l, cfg, s, turns);
  const track = knobTrack(l, at, r * PULL_TRACK_W);
  const wound = haspWindShare(s, cfg);
  const lit = held && free;
  drawPullTrack(ctx, track, { ...LOOK, held: lit, origin: 0, at: wound, time });
  drawMazeLever(ctx, { cx: at.x, cy: at.y, r: haspHubRadius(l) }, knob, r, lit);
  const way = pullWay(track, wound, 1);
  drawPullKnob(ctx, knob, r, { ...LOOK, held: lit, time, way, either: true });
  // The word goes as soon as a hand lands, as THE MAZE's does.
  if (held) return;
  drawHandleHint(ctx, l, l.role, knob.x, knob.y + l.tile * 0.75, HINT_LOUD, WORDS);
}

/** The handle's colours: THE MAZE's — the hull's rim, lit to the text colour while held. */
const LOOK = { hex: PALETTE.hullRim, rim: PALETTE.text } as const;
