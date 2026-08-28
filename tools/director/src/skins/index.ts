import { CARAPACE } from "./carapace.js";
import { CORE } from "./core.js";
import { LIGHT } from "./light.js";
import { LINE } from "./line.js";
import { MEMBRANE } from "./membrane.js";
import { SCALE } from "./scale.js";
import { type SkinContext, type SkinFrame, SVG } from "./types.js";
import { VEIN } from "./vein.js";
import { VEIN_PULSE } from "./vein-pulse.js";

/**
 * Every way to draw the same contour, so the question `docs/alive.md` sends to
 * a vote can be looked at instead of argued.
 *
 * That question is slot 4 — *is the spec right that detail does not survive*.
 * `docs/spec/graphics.md` says liveliness at 20–26 px comes from motion and
 * not from detail, and it says it about a creature in a wave; the catalogue is
 * full of bosses, which are drawn several times that size, and the rule has
 * been applied to both because there was only ever one way to draw a card.
 * A wireframe is not a neutral choice, it is a claim — and it was the only
 * claim on offer.
 *
 * The list below is the **only** place that knows which skins exist, in the
 * same way `tools/shape-sheet/src/drafts/index.ts` is the only place that
 * knows which drafts do. A new skin is one file beside this one and one line
 * here; the switcher, the id union and the lookup all follow from the array.
 *
 * Nothing here touches `packages/render`. This is the tool learning to draw
 * what the game already draws, which is a different change from the game
 * learning to draw something new — and it has to come first, because until a
 * card can show an interior nobody can vote on whether an interior is worth
 * having. `docs/skins.md` has the four rules an author works to.
 */
export const SKINS = [LINE, MEMBRANE, CORE, VEIN, VEIN_PULSE, LIGHT, SCALE, CARAPACE] as const;

// LIGHT goes last and stands apart from the four before it. Those are one
// picture with one thing added each time; this one is the same contour under a
// key light, and it is on the switcher so the light can be taken *off* — CORE
// is the honest baseline it has to beat, and the only way to know whether a
// light does the work is to remove it and look.
export {
  contactPass,
  KEY,
  litPass,
  rimLightPass,
  specularPass,
  terminatorPass,
} from "./light.js";

/** The id of a skin that exists, derived from the registry and never typed. */
export type SkinId = (typeof SKINS)[number]["id"];

export { rng, seedOf, streamFor } from "./seed.js";
export type { Skin, SkinContext, SkinFrame } from "./types.js";
export { BEAT_SECONDS } from "./types.js";

/** What `shape-figure.ts` gets back, and drives every frame. */
export interface SkinBuild {
  /** Every path that must be handed the contour's `d` on each frame. */
  contour: SVGPathElement[];
  /** The skin's own animation, if it has one. */
  onFrame?: (f: SkinFrame) => void;
}

/**
 * Build one skin into `body`, and hand back the paths that follow the contour.
 *
 * `uid` keys the gradient and the clip, because several cards draw at once and
 * an id collision silently gives two shapes one texture. `reach` is half the
 * shape's own extent, in contour units, which is what a texture and the
 * gradient are sized against — a card's pixel scale is applied above this by
 * the fitting, so nothing here has to know about it.
 *
 * A skin cannot forget to register a contour path, because it has no way to
 * make one except `ctx.contourPath()`, and that is what collects them.
 */
export function buildSkin(
  skin: SkinId,
  body: SVGGElement,
  defs: SVGDefsElement,
  opts: { colour: string; weight: number; uid: string; name: string; reach: number },
): SkinBuild {
  const contour: SVGPathElement[] = [];
  const frames: ((f: SkinFrame) => void)[] = [];
  const ctx: SkinContext = {
    body,
    defs,
    ...opts,
    contourPath(): SVGPathElement {
      const p = document.createElementNS(SVG, "path");
      p.setAttribute("stroke-linecap", "round");
      p.setAttribute("stroke-linejoin", "round");
      contour.push(p);
      return p;
    },
    onFrame(fn): void {
      frames.push(fn);
    },
  };
  (SKINS.find((s) => s.id === skin) ?? LINE).build(ctx);
  // Nothing registered is nothing called: the four skins here are all static,
  // and a static figure should cost the loop no closure at all.
  if (frames.length === 0) return { contour };
  const only = frames[0];
  if (frames.length === 1 && only) return { contour, onFrame: only };
  return {
    contour,
    onFrame: (f) => {
      for (const fn of frames) fn(f);
    },
  };
}
