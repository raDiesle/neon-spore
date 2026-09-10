import { crystalRadiusMul, METEOR } from "../../../../../packages/content/src/index.js";
import { KEY } from "../../../../../packages/content/src/light.js";
import type { CrustDraw } from "../../../../../packages/render/src/carom-look.js";
import { mixHex, rgba } from "../../../../../packages/render/src/hex.js";
import { STROKE } from "../../../../../packages/render/src/palette.js";

/**
 * FACET — the crust is a cut stone, and every face takes its own light.
 *
 * The shipped crystal is one seven-sided outline filled flat and lit by one
 * gradient laid across the whole of it: a shape with facets drawn round its
 * edge and none on its surface. This cuts the surface into the faces the
 * outline promises. Two rings of them — an outer ring sloping out to the
 * silhouette and an inner ring sloping *down* into the hole — and each face
 * is shaded flat by its own normal against `KEY`, so the faces that lean
 * toward the light are pale and the ones that lean away fall into the rock's
 * dark. The stone still spins as it ships, and the spin is now the picture:
 * as each face turns through the light it brightens and dims, which is what
 * a cut stone does in a hand and a flat disc never does.
 *
 * The inner ring is the part that makes the window a hole in something
 * thick. Its faces slope inward, so on the side toward the key they face
 * away from it and are dark, and on the side away from the key they face
 * into it and are lit — a bevel with a shadowed near lip and a bright far
 * wall, `creature:echo`'s CLEFT argument on a rock. The window is drawn by
 * `carom.ts` over whatever the shell is, and the streak is the shipped
 * `wedge`.
 *
 * **How it can lose.** *Fourteen faces on a twelve-pixel wall are a
 * checker.* The rock is a tile across and the glass is three fifths of it,
 * so every face here is a few pixels wide; if the ring reads as a pattern
 * of light and dark squares rather than as a stone with sides, it is a
 * texture and not a solid. Judge it as it turns.
 */

/** Where the ridge between the two rings sits, as a share of the rock's
 * radius — nearer the glass than the edge, so the bevel is the narrow ring
 * and the outer faces carry the bulk. */
const RIDGE = 0.76;
/** How steeply the outer faces lean out and the inner ones lean in, as the
 * share of a face's normal that lies in the picture plane. */
const OUT_TILT = 0.55;
const IN_TILT = 0.7;
/** What a face keeps of its lit colour turned fully from the key. */
const FLOOR = 0.22;
const SHADOW = "#0B1024";
const LIT = "#D8DCE6";

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

/** The outline's vertices, at the rock's own facet rule, in the turned
 * frame. */
function rimPoints(r: number, time: number): { x: number; y: number; a: number }[] {
  const pts = [];
  for (let i = 0; i < METEOR.sides; i++) {
    const a = (i / METEOR.sides) * Math.PI * 2;
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

export function faceted(d: CrustDraw): void {
  const { ctx, r, glass, turn, time, metal, dark } = d;

  const rim = rimPoints(r, time);
  const n = rim.length;
  const ridge = r * RIDGE;
  const cos = Math.cos(turn);
  const sin = Math.sin(turn);

  ctx.save();
  ctx.rotate(turn);
  ctx.lineJoin = "round";
  ctx.lineWidth = STROKE.inner * 0.8;
  for (let i = 0; i < n; i++) {
    const p = rim[i]!;
    const q = rim[(i + 1) % n]!;
    // The ridge vertex under the middle of this edge, and the two under its
    // ends — the outer face is the quad between the edge and the ridge.
    const mid = (p.a + q.a + (i === n - 1 ? Math.PI * 2 : 0)) / 2;
    const ra = { x: Math.cos(p.a) * ridge, y: Math.sin(p.a) * ridge };
    const rb = { x: Math.cos(q.a) * ridge, y: Math.sin(q.a) * ridge };
    // The face's normal in the picture plane is its outward bearing, turned
    // with the stone so the light stays where it is.
    const bx = Math.cos(mid);
    const by = Math.sin(mid);
    const nx = bx * cos - by * sin;
    const ny = bx * sin + by * cos;

    const outer = new Path2D();
    outer.moveTo(p.x, p.y);
    outer.lineTo(q.x, q.y);
    outer.lineTo(rb.x, rb.y);
    outer.lineTo(ra.x, ra.y);
    outer.closePath();
    const lo = faceLit(nx, ny, OUT_TILT);
    ctx.fillStyle = mixHex(SHADOW, LIT, FLOOR + (1 - FLOOR) * lo);
    ctx.fill(outer);
    ctx.strokeStyle = rgba(dark, 0.6);
    ctx.stroke(outer);

    // The inner face: from the ridge down to the glass, leaning inward, so
    // its normal is the outward bearing reversed.
    const ga = { x: Math.cos(p.a) * glass, y: Math.sin(p.a) * glass };
    const gb = { x: Math.cos(q.a) * glass, y: Math.sin(q.a) * glass };
    const inner = new Path2D();
    inner.moveTo(ra.x, ra.y);
    inner.lineTo(rb.x, rb.y);
    inner.lineTo(gb.x, gb.y);
    inner.lineTo(ga.x, ga.y);
    inner.closePath();
    const li = faceLit(-nx, -ny, IN_TILT);
    ctx.fillStyle = mixHex(SHADOW, LIT, FLOOR + (1 - FLOOR) * li);
    ctx.fill(inner);
    ctx.stroke(inner);
  }
  // The silhouette over the faces, as the shipped stone strokes it.
  const shell = new Path2D();
  rim.forEach((p, i) => {
    if (i === 0) shell.moveTo(p.x, p.y);
    else shell.lineTo(p.x, p.y);
  });
  shell.closePath();
  ctx.strokeStyle = metal;
  ctx.lineWidth = STROKE.outline;
  ctx.stroke(shell);
  ctx.restore();
}
