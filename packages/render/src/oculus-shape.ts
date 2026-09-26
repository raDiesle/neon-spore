import { midCol, OCULUS_LEAVES, type SimConfig } from "@neon-spore/sim";
import { fieldX } from "./field-flip.js";
import type { Layout } from "./layout.js";
import { splinePath } from "./spline.js";

/**
 * **THE OCULUS's geometry**: where the lens stands, and the paths it is made of.
 *
 * **The lens is two drafts combined** (`tools/shape-sheet/src/drafts/`): its
 * rim is THE SLATER — SHUT's disc, the chain of lapped hard plates curled
 * closed, laid here as six plates round the face, each lapping the next; and
 * the six even knobs of THROB · CROWN stand on the rim as the pins the leaves
 * pivot on. CROWN's own objection — *six even knobs on an even ring is a
 * machine* — is the reason it is here: §27 asks for the one body on its page
 * drawn as mechanism rather than flesh.
 *
 * **A leaf is a real iris blade**: it hangs from its pin and swings about it,
 * so shutting slides it across the face to the middle and opening swings it
 * back out under the rim. Nothing fades.
 *
 * Every path is laid round the lens's own middle at the origin; the draw moves
 * the canvas there, so the settle and the shatter are transforms and never a
 * second copy of the geometry.
 */

export interface Point {
  x: number;
  y: number;
}

/** The row the lens stands at, in tiles below the grid's top. */
const ROW = 2.7;
/** The rim's outer radius, and the face's inside it, in tiles. */
const RADIUS = 1.45;
const FACE = 0.84;
/** How far each plate of the rim steps out at the lap onto the next. */
const LAP = 0.05;
/** CROWN's pins: how far each stands proud of the rim, and how wide, in radians. */
const PIN = 0.11;
const PIN_WIDE = 0.2;
/** How far an open leaf is swung out about its pin, in radians. */
const SWING = 1.35;
/** The socket's radius at its widest, as a share of the face. */
const SOCKET = 0.3;
/** Samples round the rim. */
const N = 96;

/** Leaf `k`'s pin, as an angle: the first at the top, then round clockwise. */
export function oculusPinAngle(k: number): number {
  return -Math.PI / 2 + (k * Math.PI * 2) / OCULUS_LEAVES;
}

/** The middle of the lens: over the middle column, near the top of the field. */
export function oculusCentre(l: Layout, cfg: SimConfig): Point {
  return { x: fieldX(l, midCol(cfg)), y: l.gridTop + ROW * l.tile };
}

/** How far above its place the lens still is, `arrived` of the way in. */
export function oculusLift(l: Layout, arrived: number): number {
  return (1 - arrived) * 3 * l.tile;
}

/** The rim's radius, and the face's, in pixels. */
export function oculusRadius(l: Layout): { rim: number; face: number } {
  const rim = RADIUS * l.tile;
  return { rim, face: rim * FACE };
}

/**
 * The rim: six lapped plates in a ring (THE SLATER, shut), a pin standing
 * proud where each leaf hangs (CROWN), and the face cut out of the middle so
 * the ring fills with `evenodd`. `t` breathes it a hundredth of its width.
 */
export function oculusRimPath(l: Layout, t: number): Path2D {
  const { rim, face } = oculusRadius(l);
  const seg = (Math.PI * 2) / OCULUS_LEAVES;
  const outer: Point[] = [];
  for (let i = 0; i < N; i++) {
    const a = -Math.PI / 2 + (i * Math.PI * 2) / N;
    const along = (((a - oculusPinAngle(0)) % seg) + seg) % seg;
    // Each plate rises across its length and drops at the lap onto the next.
    const lap = LAP * (along / seg) ** 1.6;
    let pin = 0;
    for (let k = 0; k < OCULUS_LEAVES; k++) {
      const d = Math.atan2(Math.sin(a - oculusPinAngle(k)), Math.cos(a - oculusPinAngle(k)));
      pin = Math.max(pin, PIN * Math.sqrt(Math.max(0, 1 - (d / PIN_WIDE) ** 2)));
    }
    const r = rim * (1 + lap + pin) * (1 + 0.01 * Math.sin(t + i * 0.3));
    outer.push({ x: Math.cos(a) * r, y: Math.sin(a) * r });
  }
  const p = splinePath(outer, true);
  p.moveTo(face, 0);
  p.arc(0, 0, face, 0, Math.PI * 2, true);
  return p;
}

/** The seams between the rim's plates: a short stroke across the band at each lap. */
export function oculusLapPath(l: Layout): Path2D {
  const { rim, face } = oculusRadius(l);
  const p = new Path2D();
  const half = Math.PI / OCULUS_LEAVES;
  for (let k = 0; k < OCULUS_LEAVES; k++) {
    const a = oculusPinAngle(k) - half * 0.02;
    p.moveTo(Math.cos(a) * face * 1.02, Math.sin(a) * face * 1.02);
    p.lineTo(Math.cos(a) * rim * (1 + LAP) * 0.99, Math.sin(a) * rim * (1 + LAP) * 0.99);
  }
  return p;
}

/** The face: the glass the leaves slide across, and what they are clipped to. */
export function oculusFacePath(l: Layout): Path2D {
  const p = new Path2D();
  p.arc(0, 0, oculusRadius(l).face, 0, Math.PI * 2);
  return p;
}

/** Turn `p` about `about` by `a`. */
function turned(p: Point, about: Point, a: number): Point {
  const x = p.x - about.x;
  const y = p.y - about.y;
  const c = Math.cos(a);
  const s = Math.sin(a);
  return { x: about.x + x * c - y * s, y: about.y + x * s + y * c };
}

/**
 * Leaf `k`, `shut` of the way closed, as its five corners: the pin it hangs
 * from, the bow of its leading edge, its tip just past the middle, and two
 * corners out past the rim that the face's clip hides. Shut, it covers its
 * sixth of the face; open, it is swung out about the pin under the rim.
 */
function blade(l: Layout, k: number, shut: number): [Point, Point, Point, Point, Point] {
  const { face } = oculusRadius(l);
  const a = oculusPinAngle(k);
  const seg = (Math.PI * 2) / OCULUS_LEAVES;
  const at = (angle: number, r: number): Point => ({
    x: Math.cos(angle) * r,
    y: Math.sin(angle) * r,
  });
  const pin = at(a, face);
  const tip = at(a + seg * 0.5 + Math.PI, face * 0.08);
  const bow = at(a + seg * 0.5, face * 0.22);
  bow.x += (pin.x + tip.x) / 2;
  bow.y += (pin.y + tip.y) / 2;
  const past = at(a + seg * 1.2, face * 1.15);
  // Its back runs out past the rim before returning to the pin, so a shut
  // leaf covers its sixth right to the rim rather than stopping at a chord.
  const back = at(a + seg * 0.6, face * 1.5);
  const swing = -SWING * (1 - shut);
  const swung = (p: Point): Point => turned(p, pin, swing);
  return [pin, swung(bow), swung(tip), swung(past), swung(back)];
}

/**
 * Leaf `k`'s blade. Its leading edge bows, so six shut leaves draw the
 * iris's spiral rather than six spokes.
 */
export function oculusLeafPath(l: Layout, k: number, shut: number): Path2D {
  const [pin, bow, tip, past, back] = blade(l, k, shut);
  const p = new Path2D();
  p.moveTo(pin.x, pin.y);
  p.quadraticCurveTo(bow.x, bow.y, tip.x, tip.y);
  p.lineTo(past.x, past.y);
  p.lineTo(back.x, back.y);
  p.closePath();
  return p;
}

/** Leaf `k`'s leading edge alone: the line a shut iris is read by. */
export function oculusLeafEdge(l: Layout, k: number, shut: number): Path2D {
  const [pin, bow, tip] = blade(l, k, shut);
  const p = new Path2D();
  p.moveTo(pin.x, pin.y);
  p.quadraticCurveTo(bow.x, bow.y, tip.x, tip.y);
  return p;
}

/**
 * The socket at the middle, `open` of the way: a hexagon set between the
 * leaves' tips, so it reads as the six tips drawn back rather than a hole
 * punched through them.
 */
export function oculusSocketPath(l: Layout, open: number): Path2D {
  const r = oculusRadius(l).face * SOCKET * open;
  const p = new Path2D();
  for (let k = 0; k < OCULUS_LEAVES; k++) {
    const a = oculusPinAngle(k) + Math.PI / OCULUS_LEAVES;
    if (k === 0) p.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    else p.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  p.closePath();
  return p;
}

/** The socket's radius at its widest, in pixels: what the core is sized against. */
export function oculusSocketRadius(l: Layout): number {
  return oculusRadius(l).face * SOCKET;
}
