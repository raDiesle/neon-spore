import { crystalRadiusMul, KEY, METEOR } from "@neon-spore/content";
import type { CrustDraw } from "./carom-look.js";
import { mixHex, rgba } from "./hex.js";
import { STROKE } from "./palette.js";

/**
 * THE CAROM's crust as a cut stone — the faces every capsule look is built on.
 *
 * FACET was the `creature:carom` candidate the owner picked on 10 September
 * 2026, and asked to be taken further: *more like a space rescue capsule*,
 * keeping this outline, pointing its nose along its heading, and wearing
 * seams and rivets, a band of hazard chevrons, a beacon on the beat and a
 * scorched shield on the side it travels toward. The three capsules offered
 * on it differ in where those go, so what they share is here: the geometry
 * of the faces and the light on each, with the colour of a face left to the
 * caller.
 *
 * **Two rings of faces.** An outer ring sloping out to the silhouette and a
 * bevel sloping *down* into the hole, each face shaded flat by its own normal
 * against `KEY` — so the faces that lean toward the light are pale and the
 * ones that lean away fall into the rock's dark, and the bevel makes the
 * window a hole in something thick: its near lip is in shadow and its far
 * wall is lit. A capsule that points along its heading turns at the wall, and
 * as it does every face turns through the light and brightens or dims on its
 * own, which is what a solid does and a flat disc never does.
 *
 * **The frame.** Everything is drawn in a frame rotated by `angle`, with the
 * capsule's nose on +x: face 0 is centred on the nose, faces 3 and 4 meet at
 * the tail, and `bearing` is each face's outward direction in that frame.
 */

/** Where the ridge between the two rings sits, as a share of the rock's
 * radius — nearer the glass than the edge, so the bevel is the narrow ring
 * and the outer faces carry the bulk. */
export const RIDGE = 0.76;
/** How steeply the outer faces lean out and the inner ones lean in, as the
 * share of a face's normal that lies in the picture plane. */
const OUT_TILT = 0.55;
const IN_TILT = 0.7;
/** What a face keeps of its lit colour turned fully from the key. */
const FLOOR = 0.22;
export const SHADOW = "#0B1024";
export const LIT = "#D8DCE6";

export interface Pt {
  readonly x: number;
  readonly y: number;
}

export interface Face {
  /** Which side, counting round from the nose. */
  readonly i: number;
  /** The face's outward direction in the capsule's frame, nose at 0. */
  readonly bearing: number;
  /** The outer face — silhouette edge to ridge — and the bevel under it. */
  readonly outer: Path2D;
  readonly inner: Path2D;
  /** Lambert against the key, 0 to 1, for each ring. */
  readonly outerLit: number;
  readonly innerLit: number;
  /** The face's two ends, on the silhouette and on the ridge. */
  readonly rimA: Pt;
  readonly rimB: Pt;
  readonly ridgeA: Pt;
  readonly ridgeB: Pt;
}

/**
 * The diagonal a carom walks, as the angle its nose points down: `caromCols`
 * columns across for every row down, which is the slope the shipped streak
 * leans back along (`wedge`, `TRAIL_MUL`). +x is right and +y is down, so a
 * body crossing to the right points a little below the horizontal.
 */
export function headingAngle(dir: number): number {
  return Math.atan2(1, 2 * dir);
}

/** A plate's colour at a given Lambert value. */
export function plate(lit: number): string {
  return mixHex(SHADOW, LIT, FLOOR + (1 - FLOOR) * lit);
}

/** A colour shaded the way a plate is, so a marking still turns through the
 * light with the face it is painted on. */
export function shaded(hex: string, lit: number): string {
  return mixHex(SHADOW, hex, FLOOR + (1 - FLOOR) * lit);
}

/** Lambert against the key, for a face whose normal is `(nx, ny)` in the
 * picture plane scaled by `tilt`, the rest of it toward the viewer. The
 * light sits a little above the picture plane, so a face square to the
 * viewer is lit rather than dark. */
function faceLit(nx: number, ny: number, tilt: number): number {
  const nz = Math.sqrt(Math.max(0, 1 - tilt * tilt));
  const lz = 0.6;
  const len = Math.hypot(KEY.x, KEY.y, lz);
  const dot = (nx * tilt * KEY.x + ny * tilt * KEY.y + nz * lz) / len;
  return Math.max(0, Math.min(1, dot));
}

/** A quad between two bearings and two radii, straight-edged — the bevel's
 * faces, and any band a look cuts across them. */
export function quad(a0: number, a1: number, r0: number, r1: number): Path2D {
  const p = new Path2D();
  p.moveTo(Math.cos(a0) * r0, Math.sin(a0) * r0);
  p.lineTo(Math.cos(a1) * r0, Math.sin(a1) * r0);
  p.lineTo(Math.cos(a1) * r1, Math.sin(a1) * r1);
  p.lineTo(Math.cos(a0) * r1, Math.sin(a0) * r1);
  p.closePath();
  return p;
}

/** The silhouette's vertices at the rock's own facet rule, in the capsule's
 * frame — vertex `i` is the leading end of face `i`. */
export function rimPoints(r: number, time: number): (Pt & { readonly a: number })[] {
  const pts = [];
  const step = (Math.PI * 2) / METEOR.sides;
  for (let i = 0; i < METEOR.sides; i++) {
    const a = i * step - step / 2;
    const m = crystalRadiusMul(
      a,
      METEOR.sides,
      METEOR.depth,
      METEOR.wobble,
      time * 0.15,
      METEOR.seed,
    );
    pts.push({ x: Math.cos(a) * r * m, y: Math.sin(a) * r * m, a });
  }
  return pts;
}

/** Every face, with its light worked out for a capsule turned by `angle`. */
export function facetFaces(d: CrustDraw, angle: number): Face[] {
  const { r, glass, time } = d;
  const rim = rimPoints(r, time);
  const n = rim.length;
  const ridge = r * RIDGE;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const faces: Face[] = [];
  for (let i = 0; i < n; i++) {
    const p = rim[i] as Pt & { a: number };
    const q = rim[(i + 1) % n] as Pt & { a: number };
    const qa = i === n - 1 ? q.a + Math.PI * 2 : q.a;
    const bearing = (p.a + qa) / 2;
    const ridgeA = { x: Math.cos(p.a) * ridge, y: Math.sin(p.a) * ridge };
    const ridgeB = { x: Math.cos(qa) * ridge, y: Math.sin(qa) * ridge };
    // The face's normal in the picture plane is its bearing, turned with the
    // capsule so the light stays where it is.
    const bx = Math.cos(bearing);
    const by = Math.sin(bearing);
    const nx = bx * cos - by * sin;
    const ny = bx * sin + by * cos;
    const outer = new Path2D();
    outer.moveTo(p.x, p.y);
    outer.lineTo(q.x, q.y);
    outer.lineTo(ridgeB.x, ridgeB.y);
    outer.lineTo(ridgeA.x, ridgeA.y);
    outer.closePath();
    faces.push({
      i,
      bearing,
      outer,
      inner: quad(p.a, qa, ridge, glass),
      outerLit: faceLit(nx, ny, OUT_TILT),
      innerLit: faceLit(-nx, -ny, IN_TILT),
      rimA: p,
      rimB: q,
      ridgeA,
      ridgeB,
    });
  }
  return faces;
}

/**
 * The whole shell, in the turned frame: every face filled by `colour`, its
 * seams in the rock's dark, the silhouette stroked in the metal, and then
 * `over` for whatever a look sets on top — still inside the frame, so a
 * marking is placed by bearing and not by screen.
 */
export function drawFacets(
  d: CrustDraw,
  angle: number,
  colour: (f: Face, ring: "outer" | "inner") => string,
  over?: (ctx: CanvasRenderingContext2D, faces: Face[]) => void,
): void {
  const { ctx, metal, dark } = d;
  const faces = facetFaces(d, angle);
  ctx.save();
  ctx.rotate(angle);
  ctx.lineJoin = "round";
  ctx.lineWidth = STROKE.inner * 0.8;
  ctx.strokeStyle = rgba(dark, 0.6);
  for (const f of faces) {
    ctx.fillStyle = colour(f, "outer");
    ctx.fill(f.outer);
    ctx.stroke(f.outer);
    ctx.fillStyle = colour(f, "inner");
    ctx.fill(f.inner);
    ctx.stroke(f.inner);
  }
  const shell = new Path2D();
  faces.forEach((f, i) => {
    if (i === 0) shell.moveTo(f.rimA.x, f.rimA.y);
    else shell.lineTo(f.rimA.x, f.rimA.y);
  });
  shell.closePath();
  ctx.strokeStyle = metal;
  ctx.lineWidth = STROKE.outline;
  ctx.stroke(shell);
  over?.(ctx, faces);
  ctx.restore();
}

/** The beacon's brightness: a flash on the beat that is gone a third of the
 * way to the next, over a dim steady glow — so the light keeps the game's
 * time and never goes out. */
export function beaconPulse(beat: number): number {
  return 0.25 + 0.75 * Math.max(0, 1 - beat * 3);
}
