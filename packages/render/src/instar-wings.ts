import {
  type Anchor,
  hang,
  poseOf,
  type Seen,
  see,
  type Vec3,
  type View,
} from "@neon-spore/content";
import { strokeGlow } from "./glow.js";
import { mixHex } from "./hex.js";
import type { Point } from "./instar-place.js";
import { faded, type Look, toward } from "./instar-plate.js";
import { PALETTE, STROKE } from "./palette.js";
import { hazeSkin } from "./solid-haze.js";
import { drawRig, type Part } from "./solid-rig.js";
import { drawSheet, seeSheet } from "./solid-sheet.js";
import type { Skin } from "./solid-tube-draw.js";

/**
 * **THE INSTAR's wings**: a bat's, membrane stretched between an arm and
 * three long fingers — and solid. Each wing is authored once, flat, about its
 * own shoulder in the rig's model space (`packages/content/src/solid.ts`),
 * and hangs off that shoulder on an anchor (`solid-anchor.ts`): the arm is a
 * lit tube of the rig, the membrane a sheet lit by its own normal
 * (`solid-sheet.ts`), and the fingers are drawn where the same turn puts them.
 *
 * The anchor is the whole pose. **`roll`** lifts the wing off the flank,
 * **`pitch`** hangs its trailing edge down, **`yaw`** sweeps it back toward
 * the tail — and the figure's `side` carries it between the two carriages:
 * face-on spread wide and hanging, side-on raised high off the back. The beat
 * is on the roll, so as the wing comes up and goes down it turns its face to
 * the key and away, brightening and going dark on its own, and the tips
 * swept back behind the shoulder go smaller and further into the dark.
 *
 * They beat slowly, all the time: the body is flying, and the flight is what
 * makes THE SLOW visible on it (`instar-sway.ts`).
 */

/** The wing laid flat, in head radii: `x` out from the shoulder, `y` back along the trailing edge. */
const ELBOW: Point = { x: 0.7, y: -0.75 };
const WRIST: Point = { x: 1.45, y: -1.05 };
const TIPS: readonly Point[] = [
  { x: 2.1, y: -0.05 },
  { x: 1.55, y: 0.6 },
  { x: 0.8, y: 0.8 },
];
/** Where the membrane's hem meets the body, behind the shoulder. */
const ROOT: Point = { x: 0.15, y: 1.15 };
/** The light through the skin runs from the wrist, third in the outline, to the last fingertip. */
const HEM_AT = 3 + 4 * 2 + 3;
/** One head radius of the flat wing, in pixels of `r`. */
const SPAN = 0.82;

/** The two carriages the figure's `side` runs between. */
const FACE_ON = { lift: 0.12, droop: 1.2, sweep: 0.18, reach: 1.18 };
const SIDE_ON = { lift: 1.25, droop: 0, sweep: 0.15, reach: 1 };
/** How far the beat rolls the wing, at full spread. */
const BEAT = 0.22;

const MEMBRANE = { base: PALETTE.sheenDeep, lift: PALETTE.hull, sheen: PALETTE.sheenMid };
const ARM = {
  base: mixHex(PALETTE.sheenDeep, PALETTE.hull, 0.3),
  lift: PALETTE.hull,
  sheen: PALETTE.sheenRim,
};

/**
 * One wing, its shoulder at `at` on the screen and at `hinge` in the rig's
 * space about it, seen in `w`. `side` is `1` for the wing on the near flank,
 * `+z`, and `-1` for the one mirrored onto the far flank; `dark` hazes it
 * toward the field, for a wing behind the body.
 */
export function drawWing(
  ctx: CanvasRenderingContext2D,
  look: Look,
  at: Point,
  w: View,
  hinge: Vec3,
  side: 1 | -1,
  dark = 0,
): void {
  const { f, time, fade, r } = look;
  const spread = 0.35 + 0.65 * f.wing;
  const beat = Math.sin(time * 1.7) * BEAT * (0.4 + f.wing);
  const k = f.side;
  const mix = (a: number, b: number) => a + (b - a) * k;
  const anchor: Anchor = {
    at: hinge,
    roll: side * (mix(FACE_ON.lift, SIDE_ON.lift) + beat),
    pitch: mix(FACE_ON.droop, SIDE_ON.droop),
    yaw: side * mix(FACE_ON.sweep, SIDE_ON.sweep),
  };
  const s = r * SPAN * mix(FACE_ON.reach, SIDE_ON.reach);
  // Folded, the wing draws in along the arm and its trailing edge shortens.
  const flat = (q: Point): Vec3 => ({
    x: q.y * (0.6 + 0.4 * spread) * s,
    y: 0,
    z: side * q.x * spread * s,
  });
  const pose = poseOf(anchor);
  const rig = (q: Point) => hang(pose, flat(q));
  const shoulder = rig({ x: 0, y: 0 });
  const elbow = rig(ELBOW);
  const wrist = rig(WRIST);
  const tips = TIPS.map(rig);
  const root = rig(ROOT);
  // The hem: each scallop of skin sags in toward the wrist between two bones.
  const hem: Vec3[] = [];
  let last = WRIST;
  for (const t of [...TIPS, ROOT]) {
    const c = toward(toward(last, t, 0.5), WRIST, last === WRIST ? 0 : 0.3);
    for (const u of [0.25, 0.5, 0.75]) hem.push(rig(bend(last, c, t, u)));
    hem.push(rig(t));
    last = t;
  }
  const outline = [shoulder, elbow, wrist, ...hem];
  const haze = (skin: Skin) => hazeSkin(skin, dark, PALETTE.background, 0.55);
  const sheet = seeSheet(outline, w);
  ctx.save();
  ctx.translate(at.x, at.y);
  const skin = haze(MEMBRANE);
  const membrane = drawSheet(ctx, sheet, skin, fade, { from: 2, to: HEM_AT });
  // Veins, from each bone into the skin, forking as they go.
  const o = see(root, w);
  const pw = see(wrist, w);
  const lit = 1 - 0.45 * dark;
  ctx.save();
  ctx.clip(membrane);
  ctx.strokeStyle = faded(PALETTE.sheenCold, fade, (0.2 + 0.25 * sheet.lit) * lit);
  ctx.lineWidth = STROKE.inner;
  ctx.beginPath();
  for (const t of tips.map((q) => see(q, w))) {
    for (const u of [0.35, 0.6, 0.82]) {
      const m = toward(pw, t, u);
      const out = toward(m, o, 0.22);
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(out.x, out.y);
      const fork = toward(m, out, 0.55);
      const twig = toward(out, t, 0.35);
      ctx.moveTo(fork.x, fork.y);
      ctx.lineTo(twig.x, twig.y);
    }
  }
  ctx.stroke();
  ctx.restore();
  strokeGlow(ctx, membrane, faded(PALETTE.sheenMid, fade, lit), STROKE.inner, 0.3 * fade);
  // The fingers: thin, and thinner where the lens puts them further off.
  for (const t of tips) {
    const a = see(wrist, w);
    const b = see(t, w);
    const bone = new Path2D();
    bone.moveTo(a.x, a.y);
    bone.lineTo(b.x, b.y);
    const width = STROKE.outline * 1.4 * Math.min(1, (a.s + b.s) / 2);
    strokeGlow(ctx, bone, faded(PALETTE.hull, fade, lit), width, 0.6 * fade);
  }
  ctx.restore();
  // The arm, shoulder to wrist, a lit tube tapering out; the claw on the wrist.
  const arm: Part = {
    kind: "tube",
    rings: [
      { c: shoulder, r: r * 0.1 },
      { c: elbow, r: r * 0.075 },
      { c: wrist, r: r * 0.05 },
    ],
    skin: haze(ARM),
  };
  drawRig(ctx, [arm], w, at.x, at.y, { deep: PALETTE.background, rim: PALETTE.sheenRim }, fade);
  drawClaw(ctx, at, see(wrist, w), see(rig({ x: WRIST.x + 0.12, y: WRIST.y - 0.3 }), w), fade, lit);
}

/** A point `u` along the quadratic from `a` through control `c` to `b`. */
function bend(a: Point, c: Point, b: Point, u: number): Point {
  const v = 1 - u;
  return {
    x: v * v * a.x + 2 * v * u * c.x + u * u * b.x,
    y: v * v * a.y + 2 * v * u * c.y + u * u * b.y,
  };
}

function drawClaw(
  ctx: CanvasRenderingContext2D,
  at: Point,
  wrist: Seen,
  hook: Seen,
  fade: number,
  lit: number,
): void {
  const claw = new Path2D();
  claw.moveTo(at.x + wrist.x, at.y + wrist.y);
  claw.lineTo(at.x + hook.x, at.y + hook.y);
  strokeGlow(ctx, claw, faded(PALETTE.rock, fade, lit), STROKE.outline, 0.3 * fade);
}
