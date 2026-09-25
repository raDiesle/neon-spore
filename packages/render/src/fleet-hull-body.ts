import { drawHurt } from "./boss-hurt.js";
import { fittings, seams } from "./fleet-hull-detail.js";
import { halo } from "./glow.js";
import { mixHex } from "./hex.js";
import { litColour } from "./key-light.js";
import { STROKE } from "./palette.js";

/**
 * WHAT ONE OF THE FLEET'S HULLS IS MADE OF.
 *
 * Out of `fleet-hulls.ts`, which answers *which* hull this screen may see and
 * what a sinking one does; this answers what the pilot is looking at. The
 * owner asked for it by name on 18 September 2026 — *enhance the graphics of
 * each boss wave, so it looks like something real, a living thing or a space
 * ship with details* — and a real frame said what was there instead: a
 * six-sided outline with a faint wash in it, one grey line down the middle and
 * a bead at one end. A stroked hexagon is the one thing
 * `.claude/skills/new-boss-more` §6.3 names outright as not a picture.
 *
 * **It is a vessel of plate, and the plate is a solid.** `living-skin.ts`'s
 * argument, on a made thing rather than a grown one: what shipped was very
 * nearly the background with a neon line round it, so the body reads as a hole
 * in the chart. Here the fill is carried a third of the way toward the hull's
 * own hue and then **ramped across the beam** — lit at the sheer, through the
 * terminator, dark at the turn of the bilge, with the ramp's own bounce back
 * at the keel. That is four stops of `key-light.ts`'s table and one gradient,
 * which is what the flat fill cost.
 *
 * **One gradient serves both headings**, and that is the key light's doing
 * rather than a shortcut: `KEY` is `(-√½, -√½)`, equal parts up and left, so a
 * ramp running from `-across` to `+across` in the hull's own frame faces the
 * light whether the hull lies along the chart's rows or down its columns. A
 * third heading would need the angle taken properly; there is no third
 * heading (`FleetShip.dir`).
 *
 * **The details are the ones a ship has, and each is also a reading.** The
 * seams fall on the squares' own boundaries, so a hull is countable without
 * counting the grid behind it — which is the sentence the pilot has to say out
 * loud. The bridge stands where the light is, the transom carries its ports,
 * and the lamp at the bow is the one thing kept from the reference sheet: it
 * is what says which end is the front.
 *
 * Nothing here moves. The fleet is at anchor on a chart and the no-travel rule
 * is the game's (`CLAUDE.md`), so there is no wake, no exhaust and no drift —
 * every frame of a hull that has not been hit is the same frame.
 */

/** The two colours a fleet is drawn in, alternating down the list. */
export interface HullSkin {
  /** The hull's own hue: its rim, and what the plate is tinted toward. */
  readonly body: string;
  /** The brighter line: gloss, lamp, lit lips. */
  readonly rim: string;
  /** The deep this fleet's plate starts from. */
  readonly dark: string;
}

/** How far the plate is carried off its own deep toward the hull's hue.
 * Enough that a light has something to act on, not so much that the two
 * fleets stop being told apart by the rim. */
const FLESH = 0.2;

/** Where the bridge stands and how far it rises over the sheer, as shares of
 * the hull's length and half-beam. It is forward of centre, which is where a
 * bridge is, and it is the tallest thing on the ship without leaving the row
 * the hull is moored in — `across` is 0.34 of a tile and the bridge reaches
 * 1.25 of that, so half a hull is still 0.43 of a tile. */
export const BRIDGE = { at: 0.3, half: 0.13, rise: 1.5 } as const;

/**
 * The hull's contour: a cut transom, a sheer that lifts to a bridge and falls
 * away to a point at the bow, and a fuller bilge under it.
 *
 * Traced onto the context's own path rather than a `Path2D`: five of these
 * are built every frame the pilot's chart is up, and a held path would be a
 * cache keyed on a length, a beam and a heading that change with the layout.
 * The one `Path2D` is the blow's, and only on the frames it shows.
 */
export function hullOutline(ctx: CanvasPath, long: number, across: number, nose: number): void {
  const bx = long * BRIDGE.at;
  const bw = long * BRIDGE.half;
  ctx.moveTo(-long, -across * 0.55);
  ctx.quadraticCurveTo(-long + nose * 0.5, -across, -long + nose * 0.9, -across);
  // The sheer, over the bridge and down again. The bridge is part of the
  // contour rather than a box parked on it: a made thing is one shape.
  ctx.lineTo(bx - bw * 1.6, -across);
  ctx.quadraticCurveTo(bx - bw, -across * BRIDGE.rise, bx, -across * BRIDGE.rise);
  ctx.quadraticCurveTo(bx + bw, -across * BRIDGE.rise, bx + bw * 1.5, -across);
  ctx.lineTo(long - nose * 1.5, -across);
  ctx.quadraticCurveTo(long - nose * 0.4, -across * 0.5, long, 0);
  ctx.quadraticCurveTo(long - nose * 0.9, across * 0.86, long - nose * 1.7, across * 0.92);
  ctx.lineTo(-long + nose * 0.7, across * 0.92);
  ctx.quadraticCurveTo(-long + nose * 0.2, across * 0.9, -long, across * 0.5);
  ctx.closePath();
}

/** The plate, ramped across the beam so the hull reads as a solid. */
function plate(ctx: CanvasRenderingContext2D, across: number, skin: HullSkin): CanvasGradient {
  const base = mixHex(skin.dark, skin.body, FLESH);
  const g = ctx.createLinearGradient(0, -across * BRIDGE.rise, 0, across);
  g.addColorStop(0, litColour(base, 0.16));
  g.addColorStop(0.38, litColour(base, 0.5));
  g.addColorStop(0.86, litColour(base, 0.78));
  // The bounce off whatever the hull sits on, which is the stop that separates
  // a vessel from a shape cut out of the water (`key-light.ts`'s `RAMP`).
  g.addColorStop(1, litColour(base, 1));
  return g;
}

export interface HullPaint {
  readonly long: number;
  readonly across: number;
  readonly nose: number;
  /** A chart square, which is what the seams are spaced by. */
  readonly tile: number;
  /** How many squares this hull covers. */
  readonly len: number;
  readonly skin: HullSkin;
  /** -1 afloat, else 0..1 under. A hull going down is lit harder, because it
   * is the one moment the navigator is shown a hull at all. */
  readonly sinking: number;
  /** The blow the fleet took, 0..1 (`fleet-fx.ts`). */
  readonly hurt: number;
}

/** One hull, in a frame already translated to its middle and turned to its
 * heading. Everything is drawn from `(0, 0)` along `+x` toward the bow. */
export function paintHull(ctx: CanvasRenderingContext2D, p: HullPaint): void {
  const { long, across, nose, tile, len, skin, sinking } = p;
  const alpha = ctx.globalAlpha;
  ctx.beginPath();
  hullOutline(ctx, long, across, nose);
  ctx.fillStyle = plate(ctx, across, skin);
  ctx.fill();
  // Low, and lower than a creature's: a hull is plate rather than flesh, and a
  // bloom coming off it washes the ramp that makes it plate (`shell-plate.ts`
  // keeps the same rule about armour).
  halo(ctx, 0, 0, long * 0.9, skin.body, sinking >= 0 ? 0.42 : 0.16);
  ctx.strokeStyle = skin.body;
  ctx.lineWidth = STROKE.outline;
  ctx.stroke();

  seams(ctx, long, across, tile, len, skin);
  fittings(ctx, long, across, nose, skin);
  if (p.hurt <= 0) return;
  const path = new Path2D();
  hullOutline(path, long, across, nose);
  drawHurt(ctx, path, p.hurt * alpha);
  ctx.globalAlpha = alpha;
}
