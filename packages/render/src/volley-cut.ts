import type { Tint } from "./creature-tint.js";
import { mixHex, rgba } from "./hex.js";
import { STONE_FILL } from "./volley-stone.js";

/**
 * THE VOLLEY's inside, where a ward has cut the stone away.
 *
 * A ward takes a sector of the shell off and, until 12 September 2026, what
 * showed in the gap was nothing: the core ball in the middle and the dark
 * field behind it, with the seams drawn over. The owner: *make the volley
 * look inside like a full solid planet with a core in colour, so 3D — right
 * now it is flat, like you cut a quarter of a planet.* So the gap is a
 * **cutaway** now, the picture every diagram of a planet draws: the two flat
 * faces the cut leaves, meeting on the axis through the middle, and on them
 * the strata — a thin grey crust, a mantle in the body's own dark, a lit
 * mantle nearer in, and the core showing through the middle of it, which is
 * the glossy ball `volley-core.ts` has drawn there since the shell first
 * opened. The stone that is still on covers all of it, so the whole ball costs
 * nothing new; only the gap is painted.
 *
 * Two faces rather than one disc of rings, because that is what says solid.
 * A wedge out of a sphere shows two planes, and the one turned towards the
 * key light (`key-light.ts`, upper left) is the lighter; the seam where they
 * meet runs from the core to the rim. Both are drawn in the *unturned* frame,
 * like the cut itself: the gap faces the way the ball is going, not the way
 * the pattern has rolled (`volley.ts`).
 */

/** Where the strata change, as shares of the ball's radius, from the core out. */
const MANTLE_IN = 0.5;
const MANTLE_OUT = 0.82;
const CRUST = 0.92;
/** The key light's direction: upper left, as `litRound` shades every ball. */
const LIGHT = (-3 * Math.PI) / 4;

/** The angles a gap spans, from `volleyGap` in `volley.ts`. */
export interface Gap {
  from: number;
  to: number;
}

function wedge(r: number, from: number, to: number): Path2D {
  const p = new Path2D();
  p.moveTo(0, 0);
  p.arc(0, 0, r, from, to);
  p.closePath();
  return p;
}

/** The two cut faces and their strata, inside the gap. Centred on the origin. */
export function drawCutFaces(
  ctx: CanvasRenderingContext2D,
  r: number,
  gap: Gap,
  trio: Tint,
  time: number,
): void {
  const { from, to } = gap;
  ctx.save();
  ctx.clip(wedge(r * 1.02, from, to));

  // The strata, as hard bands: a gradient with each stop doubled is one fill
  // that reads as layers rather than as a glow. The mantle is the body's own
  // colour at full strength next to the core and its dark tone at the crust,
  // because the inside of this thing is the colour the pair has to say.
  const crust = mixHex(STONE_FILL, "#000000", 0.45);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
  g.addColorStop(0, trio.rim);
  g.addColorStop(MANTLE_IN, trio.rim);
  g.addColorStop(MANTLE_IN, trio.hex);
  g.addColorStop(MANTLE_OUT, trio.dark);
  g.addColorStop(MANTLE_OUT, crust);
  g.addColorStop(CRUST, crust);
  g.addColorStop(CRUST, STONE_FILL);
  g.addColorStop(1, STONE_FILL);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();

  // The heat in the mantle breathes with the core (`volley-core.ts`'s rate),
  // so the inside is a thing that is alive and not a diagram of one.
  const pulse = 0.5 + 0.5 * Math.sin(time * 3.1);
  ctx.fillStyle = rgba(trio.rim, 0.08 + 0.12 * pulse);
  ctx.beginPath();
  ctx.arc(0, 0, r * MANTLE_OUT, 0, Math.PI * 2);
  ctx.fill();

  // The faces. A quarter out of a sphere leaves two planes meeting on the
  // axis through the middle, and the one turned more towards the key light
  // is the lighter; a face is flat, so each is one even tone rather than a
  // gradient. Half the ball gone is one plane, cut straight through the
  // middle, and gets one tone — a fold down a flat face is what makes a
  // half-cut ball read as dented.
  const sweep = to - from;
  const mid = (from + to) / 2;
  const facing = (a: number) => Math.cos(a - LIGHT);
  const corner = Math.abs(sweep - Math.PI) > 0.1;
  if (corner) {
    const first = facing((from + mid) / 2) >= facing((mid + to) / 2);
    // Lit with the light tone rather than white, so a lit face is still the
    // body's colour and not a grey one.
    ctx.fillStyle = rgba(trio.rim, 0.28);
    ctx.fill(wedge(r, first ? from : mid, first ? mid : to));
    ctx.fillStyle = "rgba(0,0,0,0.42)";
    ctx.fill(wedge(r, first ? mid : from, first ? to : mid));
    // The corner the faces make is the deepest place in the picture, and it
    // takes the least light: a shade that gathers at the axis and is gone by
    // the middle of the mantle.
    const ao = ctx.createRadialGradient(0, 0, r * MANTLE_IN, 0, 0, r * 0.8);
    ao.addColorStop(0, "rgba(0,0,0,0.32)");
    ao.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = ao;
    ctx.fill(wedge(r, from, to));
    // The axis they meet on, from the core out to the crust.
    ctx.strokeStyle = "rgba(0,0,0,0.5)";
    ctx.lineWidth = Math.max(1, r * 0.03);
    ctx.beginPath();
    ctx.moveTo(Math.cos(mid) * r * MANTLE_IN * 0.9, Math.sin(mid) * r * MANTLE_IN * 0.9);
    ctx.lineTo(Math.cos(mid) * r, Math.sin(mid) * r);
    ctx.stroke();
  } else {
    ctx.fillStyle = facing(mid) >= 0 ? rgba(trio.rim, 0.16) : "rgba(0,0,0,0.22)";
    ctx.fill(wedge(r, from, to));
  }

  // The socket the core sits in: the mantle is molten against it, and a ring
  // of the light tone there is what sets the ball *into* the planet rather
  // than on top of a picture of one.
  ctx.strokeStyle = rgba(trio.rim, 0.55);
  ctx.lineWidth = Math.max(1, r * 0.045);
  ctx.beginPath();
  ctx.arc(0, 0, r * MANTLE_IN, from, to);
  ctx.stroke();
  ctx.restore();
}
