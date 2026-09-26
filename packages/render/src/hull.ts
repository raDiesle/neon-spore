import { LIGHT_HALF } from "@neon-spore/content";
import type { Scar } from "@neon-spore/sim";
import { hullBottom } from "./band-seam.js";
import { drawLay } from "./cannon-maw.js";
import { type Crater, clipOutMouths, drawCraters, craters as findCraters } from "./craters.js";
import { strokeGlow } from "./glow.js";
import { drawHarpoonDanger } from "./harpoon-danger.js";
import { drawHullBreaks } from "./hull-break.js";
import {
  frame,
  type HullFrame,
  type HullMood,
  type LobePositions,
  skin,
  surface,
} from "./hull-frame.js";
import { HULL_LIGHT } from "./hull-light.js";
import { hullOutline } from "./hull-outline.js";
import { HULL_SHEEN } from "./hull-sheen.js";
import { type HullSkin, OWN_SKIN } from "./hull-skin.js";
import { drawHullSplashes } from "./hull-splash.js";
import type { Layout } from "./layout.js";
import { drawCharge, drawChew, drawInhale } from "./maw.js";
import { drawMuzzle } from "./muzzle.js";
import { STROKE } from "./palette.js";
import { clipOutPlates, drawPlateGaps, type PlateGap, plateGaps } from "./plate-gap.js";
import { drawScars } from "./scars.js";
import { drawShieldRim } from "./shield.js";

export type { HullMood, LobePositions, SurfaceY } from "./hull-frame.js";
export { hullSkinY, surfaceSampler } from "./hull-frame.js";
export { type HullSkin, MIRROR_SKIN, OWN_SKIN } from "./hull-skin.js";

/**
 * The ship, from `legacy/style-guide.html`. One membrane, not a collection of
 * parts: the cannon and the shield are local swellings of the same contour
 * (`bumpAdd`), so nothing sits *on* the hull — the hull grows where a player
 * puts something. The shape of that membrane, frame by frame, is
 * `hull-frame.ts`, and the colours it is painted in are `hull-skin.ts`; this
 * file only draws it.
 *
 * The contour is an ellipse far wider than the screen; only the arc around its
 * apex is in view, which is what keeps the surface almost flat and lets the
 * angle-to-x mapping stay linear (`xToAngle` in the style guide). It is sampled
 * as a height field over x (`hullPointAtX`), so a lobe stands above the column
 * it belongs to instead of leaning towards the middle of the field.
 */
export function drawHull(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  scars: readonly Scar[],
  time: number,
  mood: HullMood,
  at: LobePositions,
  craterVisible: (x: number) => boolean = () => true,
  crackArrived: (col: number, beat: number) => boolean = () => true,
  skin_: HullSkin = OWN_SKIN,
  // Render-only, and off by default: nothing here moves the hull's own
  // coordinate math, only where the finished picture lands on the canvas.
  // The offset itself is a boss's business — `queen.ts`'s `hullShake` is the
  // one shape of it that exists today — so this file stays boss-agnostic and
  // only asks for the two numbers. See queen.ts `hullShake` for the signal
  // this is meant to carry; a shake here is a decision the owner made rather
  // than one this file invented.
  shake: { x: number; y: number } = { x: 0, y: 0 },
  // As `hullSkinY`: usually already built this tick and handed down.
  f: HullFrame = frame(l, time, mood, at),
  /**
   * Whether the cannon lobe is a **hand** rather than a mouth — THE CLAW's
   * panel, and nothing else in the game.
   *
   * It leaves the laying pass undrawn, which is the whole of it. That pass is
   * the cloaca a shot is pressed out of, and it is drawn at rest as well as
   * under load (`cannon-maw.ts`), so on a panel with no trigger on it the
   * swelling carried a mouth nothing would ever come out of — a round dark
   * shape sitting in the bump, which is what the owner asked to be replaced by
   * the arm itself. The throat is untouched: `mawTake` still opens it, because
   * the pod the arm brings home is caught by the other seat's mouth.
   *
   * It is a parameter rather than a field of `HullMood` because it is not a
   * mood: nothing about it is eased and nothing about it is transient. It is a
   * fact about the panel, and `frame-ship.ts` reads it off the one function
   * that answers which panel a frame is drawn on.
   */
  arm = false,
): void {
  // The contour and the body it closes, sampled past the stage's edges
  // (`hull-outline.ts`).
  const { pts, body, filled } = hullOutline(l, f);
  const bottom = hullBottom(l);

  // The hull is cut off at the stage, not at the columns: the contour is
  // sampled past both edges so it never ends in view. It was cut at the
  // columns until 24 September 2026, when a phone shorter than 9:16 of free
  // height stood the ship between two black bars and the owner asked for the
  // skin to reach the sides (`layout-stage.ts`). Wherever the field fills the
  // stage — every phone of ordinary height — the two are the same line.
  // The bottom edge is `hullBottom` —
  // not `l.height`, and no longer `bandTop`: the ship ends at its own membrane,
  // and everything here has to agree with it, or the one shape with negative
  // lift (the maw, inverted past the hull line) is sliced down its own throat.
  ctx.save();
  // The shake translates the whole hull pass — clip included, so the clipped
  // window shudders with the ship rather than cropping it against a window
  // that held still. Scoped to this `save`/`restore` alone: nothing drawn
  // outside this function (the other hand, the rock-impact overlay) reads
  // this offset, so it never reaches a hit region or anything `packages/sim`
  // believes.
  ctx.translate(shake.x, shake.y);
  ctx.beginPath();
  ctx.rect(0, 0, l.width, bottom);
  ctx.clip();

  // Dark where it is thick, bright at the skin: a jellyfish is mostly the
  // membrane, and a hull filled edge to edge with its own colour is a plate.
  // The light is put back on top, by the passes in sheen.ts.
  let top = Number.POSITIVE_INFINITY;
  for (const p of pts) if (p.y < top) top = p.y;
  const bg = ctx.createLinearGradient(0, top, 0, bottom);
  bg.addColorStop(0, skin_.body[0]);
  bg.addColorStop(0.14, skin_.body[1]);
  bg.addColorStop(0.5, skin_.body[2]);
  bg.addColorStop(1, skin_.body[3]);
  ctx.fillStyle = bg;
  ctx.fill(filled);

  // One clip for every sheen pass — see sheen.ts's header. Which passes, and
  // in what order, is the material's business (`hull-sheen.ts`).
  ctx.save();
  ctx.clip(filled);
  HULL_SHEEN.passes({ ctx, l, time, body, filled, skinY: (x) => skin(f, x).y, skin: skin_ });
  ctx.restore();
  // WHERE THE LIGHT IS. Everything above this line implies one — the vertical
  // body ramp, the inner glow, the sweep — and none of them names it, which is
  // why the ship read flat however good each pass was on its own. The key
  // light goes over all of them and under the outline, because a rim light
  // lies on the silhouette and the outline *is* the silhouette here. The
  // direction is `@neon-spore/content`'s `KEY`, the one constant the director's
  // skins and this renderer both read; nothing in this file names an angle.
  HULL_LIGHT.lit(ctx, {
    region: filled,
    body,
    x: 0,
    y: top,
    w: l.width,
    h: bottom - top,
    half: LIGHT_HALF.hull,
    skin: skin_,
  });
  // Every crater's geometry, open or not — a crack's *position* (`scars.ts`'s
  // `crackOrigin`) reads this unconditional list, so it never moves once drawn. The rim goes round every OPEN crater, not
  // over it: a hole in the skin that still has the ship's own bright outline
  // running across its mouth is not a hole, it is a stain. `craterVisible`
  // keeps an open crater — and so this gap in the rim — out of the picture
  // until the rock that made it has climbed back out of it.
  const allCraters = findCraters(l, scars, (x) => skin(f, x));
  const openCraters = allCraters.filter((c) => craterVisible(c.x));
  // And round every plate that is gone, for the same reason: a hull two
  // columns shorter is shorter in its outline first (`plate-gap.ts`).
  const gaps = plateGaps(l, scars, (x) => skin(f, x));
  strokeHullRim(ctx, l, body, openCraters, gaps, skin_.rim, skin_.rimGlow ?? 1);

  // What the thing that broke the hull left on it, in its own colour, under
  // the cracks: the tear is the sharpest thing about a breach and reads over
  // the paint rather than through it. Meteors are exempt — a rock leaves the
  // hole below instead (`hull-splash.ts`).
  drawHullSplashes(ctx, l, scars, (x) => surface(f, x), filled);
  // Cracks first, each rock's dent after: its opaque fill paints over whatever
  // a crack drew across that patch, so the crack reads as staying in the skin
  // around the crater rather than running into it. `crackArrived` is a rock's
  // own arrival, not its crater opening — a crack belongs to the impact, and
  // shows long before the hole itself is allowed to.
  drawScars(
    ctx,
    l,
    scars,
    time,
    (x) => surface(f, x),
    (x) => skin(f, x),
    allCraters,
    crackArrived,
  );
  // `filled`: a hole is clipped to the ship, never a mark in the sky (craters.ts).
  drawCraters(ctx, openCraters, skin_, filled);
  // The plates gone, inside the same clip: the outline carried down round
  // each and the ship's own dark inside it.
  if (gaps.length > 0) {
    ctx.save();
    ctx.clip(filled);
    drawPlateGaps(ctx, l, gaps, skin_, (x) => skin(f, x));
    ctx.restore();
  }
  // And whatever the ship wears around each of those holes — plating torn
  // open, a cavity, a buckled membrane. Over the pit rather than under it, and
  // *not* clipped to the ship: a hole has to be inside the outline and a piece
  // of plating bent back out of one does not. The shipped look draws nothing
  // and this call is the seam a candidate reaches through (`hull-break-look.ts`).
  drawHullBreaks(ctx, l, openCraters, time, (x) => skin(f, x), skin_.rim, skin_.muzzle);
  const on = (x: number) => surface(f, x);
  drawShieldRim(ctx, l, mood.armed, time, at, on, mood.resonance ?? 0, mood.wrong ?? 0);
  // A control held by a harpoon, heating up toward the tick it costs the round
  // — under the muzzle and the mouths rather than over them, because it is a
  // thing happening *to* the lobe and not a thing the lobe is doing
  // (`harpoon-danger.ts`).
  drawHarpoonDanger(ctx, l, mood.danger, time, f, at, on, skin_);
  const tip = surface(f, f.cannonX);
  drawInhale(ctx, l, mood.intake, time, tip.x, tip.y);
  drawMuzzle(ctx, f, l, mood.intake, skin_);
  drawChew(ctx, l, mood, time, f.cannonX, on);
  drawCharge(ctx, l, mood, filled, body);
  // Last, and over everything the ship is otherwise doing: a shot about to leave
  // is the only thing here either player has to act on within the beat. Not on
  // the panel where the swelling is a hand — see `arm`.
  if (!arm) {
    drawLay(ctx, l, mood.lay ?? 0, time, f.cannonX, tip.y, mood.intake, on, mood.layFlare);
  }
  ctx.restore();
}

/** The outline, minus the mouths of any craters and the plates gone it would otherwise run over. */
function strokeHullRim(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  body: Path2D,
  craters: Crater[],
  gaps: readonly PlateGap[],
  rim: string,
  glow: number,
): void {
  ctx.save();
  clipOutMouths(ctx, l, craters);
  clipOutPlates(ctx, l, gaps);
  strokeGlow(ctx, body, rim, STROKE.outline + 0.6, glow);
  ctx.restore();
}
