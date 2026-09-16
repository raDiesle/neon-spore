import type { MeteorLook, RockHit } from "../../../../../packages/render/src/meteor-look.js";
import {
  BLAZE_LOOK,
  COMET_LOOK,
  meteorLookFor,
  SMOULDER_LOOK,
} from "../../../../../packages/render/src/meteor-looks.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * `creature:bite` / `notch` — a shot takes a piece out of the rock's edge
 * instead of leaving a crater in its face, and the broken edge stays hot.
 *
 * **What the shipped side is.** A rock keeps its whole silhouette forever. A
 * hit places a round pit at a third to two thirds of the radius and paints it:
 * a dark bowl with a lit lip on the blaze, a pale strike on the comet, a red
 * eye on the smoulder. The contour is untouched by every one of them, which is
 * the rule made visible — a rock cannot be broken, and the shield is the only
 * answer to one.
 *
 * **What this argues.** That `docs/spec/systems.md` asked for the third piece
 * of destruction and damage — *a hit cuts a real piece out of the body* — and
 * a rock is the only thing in the game that survives a hit long enough to wear
 * one. Each hole is pushed out to the rim and cut *out* of the stone rather
 * than drawn on it: the look clips itself to everything but the bites before
 * it lays down a single stroke, so what is missing is material that was never
 * painted, and the field behind the rock comes through untouched. The rim goes
 * from a closed polygon to a chewed one, and the edge the shot opened glows
 * and breathes, so four hits read as four bites taken out of a stone rather
 * than as four marks on a stone that does not care.
 *
 * It is the same argument on all three rocks, because a rock picks its look by
 * its own id and a slot judged on one of the three would be judged on whichever
 * rock the pose happened to spawn.
 *
 * **How it can lose.** It argues against the fiction the whole rule rests on:
 * a rock is indestructible *because* it does not live, and a stone visibly
 * losing material four hits in is a stone that looks like it could be finished
 * off with a fifth. A pair that reads it that way will spend shots on it, and
 * spending shots on a rock is the exact mistake the craters were drawn to
 * prevent. The size is the other half: at 26 px a bite is four pixels wide,
 * and four pixels off a contour that is already faceted and wobbling may read
 * as nothing at all — or, at two shots in the same quarter, as a rock that has
 * changed silhouette, which breaks the one-shape-one-word rule the bestiary is
 * built on. And a bite goes through the blaze's fire as well as its stone,
 * because the fire is painted by the same hand: the notch is taken out of the
 * fireball, not only out of the rock inside it.
 */

/** How far out the bite sits, as a share of the radius — just past the faceted
 * rim, so it opens the contour rather than touching it from inside. */
const OUT = 1.06;
/** A bite against a crater, as a multiple of the pit's own radius. Under about
 * 1.2 the cut closes up inside the facets and there is nothing to see; over
 * two, four hits leave a jigsaw piece rather than a stone. */
const WIDE = 1.55;
/** The hot edge, at rest and at its brightest. It breathes rather than fading
 * out: a rock is not cooling down, it is being hit again. */
const GLOW = [0.45, 0.85] as const;

/** Where a hole's bite is, from the hole the game placed. Both halves of the
 * look work this out the same way, from the same numbers, so the cut and the
 * edge drawn on it are the same circle. */
function biteAt(hx: number, hy: number, pr: number, r: number) {
  const a = Math.atan2(hy, hx);
  return { x: Math.cos(a) * r * OUT, y: Math.sin(a) * r * OUT, br: pr * WIDE, a };
}

/**
 * The shipped body, painted through a clip that is everything **but** the
 * bites — a rectangle round the whole rock with a circle per hole added to it
 * and the even-odd rule sorting out which is which.
 *
 * This is why `MeteorLook.body` is handed the holes at all. A mark made after
 * the stone is down can only ever be paint; the one way to show material that
 * is gone, without reaching through the canvas and erasing what was drawn
 * behind the rock, is to not lay it down in the first place.
 */
function bitten(shipped: MeteorLook["body"]): MeteorLook["body"] {
  return (ctx, path, r, turn, time, within, hits) => {
    const list: readonly RockHit[] = hits ?? [];
    if (list.length === 0) {
      shipped(ctx, path, r, turn, time, within, hits);
      return;
    }
    const cut = new Path2D();
    cut.rect(-r * 4, -r * 4, r * 8, r * 8);
    for (const h of list) {
      const b = biteAt(h.x, h.y, h.pr, r);
      cut.moveTo(b.x + b.br, b.y);
      cut.arc(b.x, b.y, b.br, 0, Math.PI * 2);
    }
    ctx.save();
    ctx.clip(cut, "evenodd");
    shipped(ctx, path, r, turn, time, within, hits);
    ctx.restore();
  };
}

/**
 * The edge the shot opened, instead of a crater: the inward-facing half of the
 * bite's own circle, which is the only half with stone still behind it. Drawn
 * after the body and outside its clip, so it sits on the lip of the cut.
 */
const hotEdge: MeteorLook["pit"] = (ctx, hx, hy, pr, _dx, _dy, r, time) => {
  const b = biteAt(hx, hy, pr, r);
  const alpha = GLOW[0] + (GLOW[1] - GLOW[0]) * (0.5 + 0.5 * Math.sin(time * 5 + b.a * 3));
  ctx.beginPath();
  ctx.arc(b.x, b.y, b.br, b.a + Math.PI * 0.5, b.a + Math.PI * 1.5);
  ctx.strokeStyle = `rgba(255, 146, 68, ${alpha.toFixed(3)})`;
  ctx.lineWidth = Math.max(1.2, b.br * 0.42);
  ctx.stroke();
};

// Captured before anything patches them, which is what a candidate that wraps
// the shipped drawing rather than replacing it has to do. `apply` overwrites
// the field and `restore` puts it back, so these stay the real ones.
const SHIPPED = {
  blaze: BLAZE_LOOK.body,
  comet: COMET_LOOK.body,
  smoulder: SMOULDER_LOOK.body,
};

const FILE = "packages/render/src/meteor-looks.ts";

export const BITE_NOTCH: Variant = {
  slot: "creature:bite",
  name: "notch",
  sentence:
    "a hit takes a piece out of the rock's edge rather than leaving a crater in its face — the stone is clipped to everything but the holes before it is painted, so the contour is chewed and the opened edge stays hot",
  dir: "tools/versus/candidates/creature-bite/notch",
  patches: [
    // One patch per look a rock can wear. `meteorLookFor` is the route the
    // drawing code takes — `drawRockBody` calls it for every rock on the field
    // — and the three seeds below are the three answers it can give.
    patch({
      target: BLAZE_LOOK,
      reached: () => meteorLookFor(0),
      where: { file: FILE, symbol: "BLAZE_LOOK", type: "MeteorLook" },
      fields: { body: bitten(SHIPPED.blaze), pit: hotEdge },
    }),
    patch({
      target: COMET_LOOK,
      reached: () => meteorLookFor(1),
      where: { file: FILE, symbol: "COMET_LOOK", type: "MeteorLook" },
      fields: { body: bitten(SHIPPED.comet), pit: hotEdge },
    }),
    patch({
      target: SMOULDER_LOOK,
      reached: () => meteorLookFor(3),
      where: { file: FILE, symbol: "SMOULDER_LOOK", type: "MeteorLook" },
      fields: { body: bitten(SHIPPED.smoulder), pit: hotEdge },
    }),
  ],
};
