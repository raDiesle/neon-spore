import { type Seen, see, type Vec3, type View } from "@neon-spore/content";
import { strokeGlow } from "./glow.js";
import { mixHex } from "./hex.js";
import type { Point } from "./instar-place.js";
import { faded, type Look, toward } from "./instar-plate.js";
import { FACE_ON, HEM_AT, SPAN, WRIST, wingRig } from "./instar-wing-rig.js";
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
  const { fade, r } = look;
  const { rig, shoulder, elbow, wrist, tips, root, outline } = wingRig(look, hinge, side);
  const haze = (skin: Skin) => hazeSkin(skin, dark, PALETTE.background, 0.55);
  const sheet = seeSheet(outline, w);
  ctx.save();
  ctx.translate(at.x, at.y);
  const skin = haze(MEMBRANE);
  const membrane = drawSheet(ctx, sheet, skin, fade, { from: 2, to: HEM_AT });
  const lit = 1 - 0.45 * dark;
  const frame: [Point, Point, Point] = [
    see(shoulder, w),
    see(rig({ x: 1, y: 0 }), w),
    see(rig({ x: 0, y: 1 }), w),
  ];
  WING_LOOK.paint(ctx, {
    membrane,
    frame,
    root: see(root, w),
    wrist: see(wrist, w),
    tips: tips.map((q) => see(q, w)),
    unit: r * SPAN * FACE_ON.reach,
    fade,
    lit,
    sheen: sheet.lit,
  });
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

/**
 * What the skin of one wing is drawn from, in the wing's screen space: the
 * membrane, the flat wing's origin and its `x` and `y` axes one head radius
 * out as the lens puts them, the bones the veins leave from, and how lit it is.
 * `unit` is the flat wing's head radius at its widest carriage, in pixels.
 */
export interface WingSkin {
  membrane: Path2D;
  frame: readonly [Point, Point, Point];
  root: Point;
  wrist: Point;
  tips: readonly Point[];
  unit: number;
  fade: number;
  lit: number;
  sheen: number;
}

/** What lays the veins in the skin, read on every call so VERSUS can offer another (`tools/versus`). */
export const WING_LOOK: { paint: (ctx: CanvasRenderingContext2D, skin: WingSkin) => void } = {
  paint: drawVeins,
};

/** Veins, from each bone into the skin, forking as they go. */
function drawVeins(ctx: CanvasRenderingContext2D, skin: WingSkin): void {
  const { root: o, wrist: pw, fade, lit } = skin;
  ctx.save();
  ctx.clip(skin.membrane);
  ctx.strokeStyle = faded(PALETTE.sheenCold, fade, (0.2 + 0.25 * skin.sheen) * lit);
  ctx.lineWidth = STROKE.inner;
  ctx.beginPath();
  for (const t of skin.tips) {
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
