/**
 * Four ways to draw the same contour, so the question `docs/alive.md` sends to
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
 * So: four skins, one control among them. LINE is exactly what the cards did
 * before and is kept as the baseline, because a comparison against nothing is
 * how a new look wins by being new. The other three add one thing each, in
 * order, so the card that finally reads can be attributed:
 *
 * - MEMBRANE — a dark fill and the game's own layered aura. This is not an
 *   invention; `packages/render/src/glow.ts` draws creatures this way and the
 *   sheet simply never did. On its own it answers "is the card flat because
 *   the shape is flat, or because the sheet is".
 * - CORE — a radial value gradient under the membrane, whose outer stop falls
 *   toward the card's own dark rather than toward the rim colour. That
 *   direction is the whole point and it is `alive.md`'s: a gradient that
 *   brightens the rim raises contrast, one that brightens the edge erodes it.
 * - VEIN — filaments under the skin, clipped to the body. The one treatment
 *   here that is genuinely *detail* in the sense the spec forbids, and so the
 *   one that actually settles the argument. It is deterministic per shape: the
 *   name seeds it, so a card looks the same on every reload and two shapes do
 *   not share a texture.
 *
 * Nothing here touches `packages/render`. This is the tool learning to draw
 * what the game already draws, which is a different change from the game
 * learning to draw something new — and it has to come first, because until a
 * card can show an interior nobody can vote on whether an interior is worth
 * having.
 */

const SVG = "http://www.w3.org/2000/svg";

export type SkinId = "line" | "membrane" | "core" | "vein";

export const SKINS: ReadonlyArray<{ id: SkinId; label: string; hint: string }> = [
  { id: "line", label: "LINE", hint: "outline only — what the cards drew before" },
  { id: "membrane", label: "MEMBRANE", hint: "dark fill and the game's layered aura" },
  { id: "core", label: "CORE", hint: "a value gradient under the skin, falling outward" },
  { id: "vein", label: "VEIN", hint: "filaments under the skin — detail, on purpose" },
];

/** Aura passes, widest and faintest first — `glow.ts`'s shape, in SVG. */
const PASSES = 3;
const SPREAD = 5;

/** A small integer hash, so a shape's filaments are its own and never move. */
function seedOf(name: string): number {
  let h = 2166136261;
  for (let i = 0; i < name.length; i++) {
    h ^= name.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** A deterministic 0..1 stream from one seed. */
function rng(seed: number): () => number {
  let s = seed || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0;
    return s / 4294967296;
  };
}

/**
 * Filaments for one body, in the contour's own units.
 *
 * They **branch**, and that is the whole of it. The first version struck every
 * strand from one point, which is what a radial sample naturally gives you and
 * which reads as a sunburst — a made thing, a wheel — at exactly the moment
 * the word being reached for is *grown*. A vascular texture is not lines from
 * a centre, it is a few trunks that fork, and fork again, each fork thinner
 * and shorter than its parent. Two levels is enough to say it.
 *
 * Everything is seeded from the name, so a shape's skin is its own and is the
 * same on every reload; nothing here is animated, so the texture rides under
 * the membrane with the body instead of crawling on it.
 */
function filaments(name: string, reach: number): string[] {
  const rand = rng(seedOf(name));
  const out: string[] = [];

  /** One strand, walked outward from a point, forking while depth remains. */
  const grow = (x: number, y: number, angle: number, len: number, depth: number): void => {
    // A slight curve per strand: straight is a spoke, curved is a vessel.
    const bend = (rand() - 0.5) * 0.7;
    const mx = x + Math.cos(angle) * len * 0.5;
    const my = y + Math.sin(angle) * len * 0.5;
    const ex = x + Math.cos(angle + bend) * len;
    const ey = y + Math.sin(angle + bend) * len;
    out.push(
      `M ${x.toFixed(1)} ${y.toFixed(1)} Q ${mx.toFixed(1)} ${my.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`,
    );
    if (depth <= 0) return;
    // Two children, splaying either side of where the parent was heading.
    for (const side of [-1, 1]) {
      if (rand() < 0.25) continue;
      grow(
        ex,
        ey,
        angle + bend + side * (0.4 + rand() * 0.5),
        len * (0.45 + rand() * 0.2),
        depth - 1,
      );
    }
  };

  const trunks = 4 + Math.floor(rand() * 3);
  const originX = (rand() - 0.5) * reach * 0.25;
  const originY = (rand() - 0.5) * reach * 0.25;
  for (let i = 0; i < trunks; i++) {
    const a = (i / trunks) * Math.PI * 2 + rand() * 0.7;
    grow(originX, originY, a, reach * (0.3 + rand() * 0.2), 2);
  }
  return out;
}

export interface SkinBuild {
  /** Every path that must be handed the contour's `d` on each frame. */
  contour: SVGPathElement[];
}

/**
 * Build one skin into `body`, and hand back the paths that follow the contour.
 *
 * `uid` keys the gradient and the clip, because several cards draw at once and
 * an id collision silently gives two shapes one texture. `reach` is half the
 * shape's own extent, in contour units, which is what the filaments and the
 * gradient are sized against — a card's pixel scale is applied above this by
 * the fitting, so nothing here has to know about it.
 */
export function buildSkin(
  skin: SkinId,
  body: SVGGElement,
  defs: SVGDefsElement,
  opts: { colour: string; weight: number; uid: string; name: string; reach: number },
): SkinBuild {
  const { colour, weight, uid, name, reach } = opts;
  const contour: SVGPathElement[] = [];
  const path = (): SVGPathElement => {
    const p = document.createElementNS(SVG, "path");
    p.setAttribute("stroke-linecap", "round");
    p.setAttribute("stroke-linejoin", "round");
    contour.push(p);
    return p;
  };

  if (skin !== "line") {
    // The fill goes down first, under every stroke. `evenodd` so a mouth or a
    // parted body stays a hole rather than being flooded.
    const back = path();
    back.setAttribute("fill", colour);
    back.setAttribute("fill-opacity", "0.12");
    back.setAttribute("fill-rule", "evenodd");
    back.setAttribute("stroke", "none");
    body.appendChild(back);
  }

  if (skin === "core" || skin === "vein") {
    const grad = document.createElementNS(SVG, "radialGradient");
    grad.setAttribute("id", `${uid}-core`);
    grad.setAttribute("r", "0.72");
    // Outward to the card's own dark, never outward to the rim colour: the
    // gradient has to raise rim-to-interior contrast, not erode it.
    for (const [offset, stop, alpha] of [
      ["0%", colour, "0.34"],
      ["58%", colour, "0.12"],
      ["100%", "#07060F", "0.55"],
    ] as const) {
      const s = document.createElementNS(SVG, "stop");
      s.setAttribute("offset", offset);
      s.setAttribute("stop-color", stop);
      s.setAttribute("stop-opacity", alpha);
      grad.appendChild(s);
    }
    defs.appendChild(grad);
    const lit = path();
    lit.setAttribute("fill", `url(#${uid}-core)`);
    lit.setAttribute("fill-rule", "evenodd");
    lit.setAttribute("stroke", "none");
    body.appendChild(lit);
  }

  if (skin === "vein") {
    const clip = document.createElementNS(SVG, "clipPath");
    clip.setAttribute("id", `${uid}-clip`);
    const clipPath = path();
    clip.appendChild(clipPath);
    defs.appendChild(clip);
    const g = document.createElementNS(SVG, "g");
    g.setAttribute("clip-path", `url(#${uid}-clip)`);
    for (const d of filaments(name, reach)) {
      const f = document.createElementNS(SVG, "path");
      f.setAttribute("d", d);
      f.setAttribute("fill", "none");
      f.setAttribute("stroke", colour);
      f.setAttribute("stroke-opacity", "0.3");
      f.setAttribute("stroke-width", String(weight * 0.45));
      f.setAttribute("stroke-linecap", "round");
      g.appendChild(f);
    }
    body.appendChild(g);
  }

  if (skin !== "line") {
    // The aura: the same outline a few times, widest and faintest first. Three
    // passes is `STROKE.glowPasses`, and the spread matches `STROKE.glowSpread`.
    for (let i = PASSES; i >= 1; i--) {
      const g = path();
      g.setAttribute("fill", "none");
      g.setAttribute("stroke", colour);
      g.setAttribute("stroke-opacity", (0.1 + 0.05 * (PASSES - i)).toFixed(2));
      g.setAttribute("stroke-width", String(weight + (i * SPREAD) / PASSES));
      body.appendChild(g);
    }
  }

  const rim = path();
  rim.setAttribute("fill", "none");
  rim.setAttribute("stroke", colour);
  rim.setAttribute("stroke-width", String(weight));
  body.appendChild(rim);

  return { contour };
}
