import { SVG } from "./types.js";

/**
 * How CHAMBER is packed, and the elements it packs with.
 *
 * Split from `chamber.ts` when that file passed 250 lines. The seam is the
 * useful one rather than an arbitrary halfway point: everything here is
 * arithmetic and element-making that never looks at a `SkinContext`, and
 * `chamber.ts` is left as the order the passes stack in. The three failures
 * the skin's own comment records were all failures of *this* file — where a
 * mass sits, how big it is, and where its top edge runs — so having them in
 * one place is where the next one will be looked for.
 */

/** How many compartments. More than five is mush at card size. */
const CHAMBERS = 5;
/** How many swellings sit over them. */
export const BLISTERS = 6;
/** Samples along one lumpy top. */
const CREST = 26;
/**
 * How much of `reach` the interior is allowed to use.
 *
 * `reach` is half the *fitted* extent, which on a body with anything standing
 * off its rim — clubs, spines, a halo — is a good deal more than the body. The
 * first draft sized the compartments against it directly and they flooded THE
 * POMMEL: masses out to the edge of the frame, and blisters sitting on the
 * clubs rather than in the body carrying them. A skin cannot ask how big the
 * body alone is, so it assumes the rim is furniture and works inside it.
 */
export const INSIDE = 0.74;

export interface Chamber {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  rot: number;
  top: number;
  alpha: number;
}

/**
 * The compartments, in units of `reach`.
 *
 * Drawn from bands rather than freely, so a mass is never centred and two are
 * never the same height: the first is the wide one across the middle, then two
 * low ones at deliberately different sizes, then two small ones out at the
 * sides. Every number is jittered off the shape's own stream, so no two bodies
 * on the page are packed alike and each is the same on every reload.
 */
export function place(rnd: () => number): Chamber[] {
  const bands: [number, number, number, number][] = [
    // cx, cy, rx, ry — the centre of each band, before jitter.
    [-0.12, 0.02, 0.68, 0.38],
    [-0.44, 0.46, 0.36, 0.3],
    [0.3, 0.58, 0.5, 0.28],
    [0.56, 0.08, 0.26, 0.22],
    [-0.62, -0.06, 0.22, 0.18],
  ];
  return bands.slice(0, CHAMBERS).map(([cx, cy, rx, ry], i) => {
    const j = (k: number): number => (rnd() - 0.5) * k;
    const y = cy + j(0.1);
    return {
      cx: cx + j(0.12),
      cy: y,
      rx: rx * (1 + j(0.24)),
      ry: ry * (1 + j(0.24)),
      rot: j(40),
      // The level sits above the centre, so the mass reads as most of the
      // compartment rather than as a puddle in the bottom of it.
      top: y - ry * 0.9,
      alpha: 0.95 - i * 0.11,
    };
  });
}

/** One lumpy top, closed downward. Wide enough that its ends are always clipped. */
export function crest(c: Chamber, reach: number, freq: number, phase: number): string {
  const span = reach * 1.6;
  let d = "";
  for (let i = 0; i <= CREST; i++) {
    const x = -span + (i / CREST) * span * 2;
    const u = x / reach;
    const y =
      c.top * reach +
      (Math.sin(u * freq + phase) + Math.sin(u * freq * 2.3 + phase * 1.7) * 0.4) * reach * 0.035;
    d += `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)} `;
  }
  return `${d}L ${span.toFixed(1)} ${(reach * 2).toFixed(1)} L ${(-span).toFixed(1)} ${(reach * 2).toFixed(1)} Z`;
}

export function el<K extends keyof SVGElementTagNameMap>(
  tag: K,
  attrs: Record<string, string>,
): SVGElementTagNameMap[K] {
  const n = document.createElementNS(SVG, tag) as SVGElementTagNameMap[K];
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  return n;
}

export function ellipse(
  c: Chamber,
  reach: number,
  attrs: Record<string, string>,
): SVGEllipseElement {
  const cx = (c.cx * reach).toFixed(1);
  const cy = (c.cy * reach).toFixed(1);
  return el("ellipse", {
    cx,
    cy,
    rx: (c.rx * reach).toFixed(1),
    ry: (c.ry * reach).toFixed(1),
    transform: `rotate(${c.rot.toFixed(1)} ${cx} ${cy})`,
    ...attrs,
  });
}
