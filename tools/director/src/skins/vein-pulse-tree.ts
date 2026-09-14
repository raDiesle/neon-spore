import { streamFor } from "./seed.js";
import { type SkinContext, SVG } from "./types.js";

/**
 * **VEIN PULSE's tree**: the branching filaments grown once, each arc kept with
 * its distance from the origin and a flag for whether it breaks the surface,
 * and the two ways one is stroked.
 *
 * Its own file beside `vein-pulse.ts`, split when that one reached the
 * 250-line ceiling. The seam is the card's own two halves: growing a tree
 * happens once, in `build()`, off a seeded stream, and is deliberately the
 * same walk `vein.ts` makes — the two skins are on the page to be compared,
 * and a different tree would answer a question nobody asked. Lighting it
 * happens on every frame and is about a front travelling out along arc length.
 * One is argued about against `vein.ts`; the other against a clock.
 */

/** One drawn arc of one filament, and how far along the strand it sits. */
export interface Segment {
  /** The path data, in the contour's own units. */
  readonly d: string;
  /** Arc length from the origin to this segment's middle. */
  readonly at: number;
  readonly proud: boolean;
}

/**
 * How likely a segment at each depth is to surface, root first. A trunk's first
 * stretch almost never does: it is the deepest part of the body, and a vein
 * surfacing at the origin reads as sitting on the core. Tips do it half the time.
 */
const SURFACES = [0.12, 0.45, 0.5];

/**
 * The branching filaments, unchanged from VEIN except that each arc is kept with
 * its arc length from the origin and a flag for whether it surfaces. The walk is
 * deliberately the same shape as `vein.ts`'s — the two skins are on the page to
 * be compared, and a different tree would answer a question nobody asked.
 */
export function grown(ctx: SkinContext): { segments: Segment[]; span: number } {
  const rand = streamFor(ctx.name);
  const reach = ctx.reach;
  const segments: Segment[] = [];
  let span = 1;

  const grow = (
    x: number,
    y: number,
    angle: number,
    len: number,
    depth: number,
    from: number,
  ): void => {
    const bend = (rand() - 0.5) * 0.7;
    const mx = x + Math.cos(angle) * len * 0.5;
    const my = y + Math.sin(angle) * len * 0.5;
    const ex = x + Math.cos(angle + bend) * len;
    const ey = y + Math.sin(angle + bend) * len;
    const end = from + len;
    if (end > span) span = end;
    segments.push({
      d: `M ${x.toFixed(1)} ${y.toFixed(1)} Q ${mx.toFixed(1)} ${my.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`,
      at: from + len * 0.5,
      proud: rand() < (SURFACES[2 - depth] ?? 0.4),
    });
    if (depth <= 0) return;
    for (const side of [-1, 1]) {
      if (rand() < 0.25) continue;
      grow(
        ex,
        ey,
        angle + bend + side * (0.4 + rand() * 0.5),
        len * (0.45 + rand() * 0.2),
        depth - 1,
        end,
      );
    }
  };

  const trunks = 4 + Math.floor(rand() * 3);
  const originX = (rand() - 0.5) * reach * 0.25;
  const originY = (rand() - 0.5) * reach * 0.25;
  for (let i = 0; i < trunks; i++) {
    const a = (i / trunks) * Math.PI * 2 + rand() * 0.7;
    grow(originX, originY, a, reach * (0.3 + rand() * 0.2), 2, 0);
  }
  return { segments, span };
}

/** One filament arc, at rest. */
export function strand(
  ctx: SkinContext,
  d: string,
  opacity: number,
  width: number,
): SVGPathElement {
  const f = document.createElementNS(SVG, "path");
  f.setAttribute("d", d);
  f.setAttribute("fill", "none");
  f.setAttribute("stroke", ctx.colour);
  f.setAttribute("stroke-opacity", opacity.toFixed(3));
  f.setAttribute("stroke-width", width.toFixed(3));
  f.setAttribute("stroke-linecap", "round");
  return f;
}

/**
 * A second clip on the body, for the strands drawn above the rim, keyed apart
 * so two clip paths do not land under one id and silently give the surfaced
 * strands the wrong shape. `clipGroup(ctx, "proud")` is now exactly this;
 * swapping it changes a picture still waiting on an eye, so it waits for that.
 */
export function proudGroup(ctx: SkinContext): SVGGElement {
  const clip = document.createElementNS(SVG, "clipPath");
  clip.setAttribute("id", `${ctx.uid}-proud`);
  clip.appendChild(ctx.contourPath());
  ctx.defs.appendChild(clip);
  const g = document.createElementNS(SVG, "g");
  g.setAttribute("clip-path", `url(#${ctx.uid}-proud)`);
  ctx.body.appendChild(g);
  return g;
}
