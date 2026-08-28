import { auraPass, clipGroup, corePass, fillPass, rimPass } from "./parts.js";
import { streamFor } from "./seed.js";
import { BEAT_SECONDS, type Skin, type SkinContext, SVG } from "./types.js";

/**
 * VEIN again, with the strands breaking the surface and a pulse running out
 * along them. VEIN draws every filament under one clip at one opacity for ever,
 * which is why it reads as a texture printed on a body rather than as something
 * inside one. Two things differ here and nothing else does:
 *
 * **The strands surface.** A subset of segments is drawn a second time, above
 * the aura and the rim instead of under them, brighter and wider. The copy is
 * still clipped to the contour — a strand spilling past the outline would be a
 * spur on the silhouette, the one thing a card may not lie about — so depth is
 * carried by stacking order and weight, not by escaping the body. Which segments
 * surface comes from the same seeded stream as the branching, so it is
 * interrupted: a strand goes proud for a fork and under for the next, and the
 * gaps are the effect. A strand bright end to end is a line.
 *
 * **Every second beat it beats.** A front of brightness leaves the origin the
 * trunks grow from and travels outward *along the filaments* — arc length, not
 * radius, so it follows the vessel rather than sweeping as a ring. Each segment
 * lifts as the front arrives and falls behind it, the surfaced copies hardest.
 *
 * Seeded from the name (rule (b)), ids keyed on `uid` (rule (c)), and the pulse
 * is one `onFrame` mutating two attributes on paths built once (rule (d)).
 */

/** The pulse's period: two beats, so 1.25 s at the game's 96 bpm. */
const CYCLE = BEAT_SECONDS * 2;

/**
 * How long the front takes to cross the whole filament tree, in seconds.
 *
 * The number the card lives or dies on. The tree's longest arc is about three
 * quarters of `reach`, and on a 92 px catalogue card `reach` lands near 37 px —
 * so the front covers some 30 px, and 0.40 s puts it at 75 px/s: slow enough to
 * watch travel, far too slow to read as a light switched on. Half is a flash;
 * double it and the front still crawls when the next cycle is due. That is 32%
 * of the cycle, so with the tail counted the body is dark for roughly half a
 * second — systole and then a wait, not a texture that never stops moving.
 *
 * It is a **time** and not a speed: held constant, every card lights and darkens
 * together however big its body is, which is the reason `beat` is computed once
 * for the whole frame. Per second instead, the hull would conduct for two
 * seconds while a spore took a fifth of one. The cost is that a long body
 * conducts fast — on the 620 px hull card 0.40 s is about 410 px/s.
 */
const TRAVEL = 0.4;

/** How far ahead of the front a segment lifts, and how far behind it goes dark
 * again — both as a share of the tree's span. */
const LEAD = 0.1;
const TAIL = 0.85;

/** One drawn arc of one filament, and how far along the strand it sits. */
interface Segment {
  /** The path data, in the contour's own units. */
  readonly d: string;
  /** Arc length from the origin to this segment's middle. */
  readonly at: number;
  readonly proud: boolean;
}

/**
 * A path whose two attributes the pulse writes, and what it rests at. `at` is
 * normalised to 0..1 over the whole tree; `lit` is set while the segment is
 * away from rest, so a dark card writes nothing.
 */
interface Lit {
  readonly el: SVGPathElement;
  readonly at: number;
  readonly dimOpacity: number;
  readonly litOpacity: number;
  readonly dimWidth: number;
  readonly litWidth: number;
  lit: boolean;
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
function grown(ctx: SkinContext): { segments: Segment[]; span: number } {
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
function strand(ctx: SkinContext, d: string, opacity: number, width: number): SVGPathElement {
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
 * A second clip on the body, for the strands drawn above the rim. `clipGroup` in
 * `parts.ts` is the shared one, keyed `${uid}-clip`; calling it twice would put
 * two clip paths under one id and silently give the surfaced strands the wrong
 * shape. So this one is keyed apart, and is otherwise the same thing.
 */
function proudGroup(ctx: SkinContext): SVGGElement {
  const clip = document.createElementNS(SVG, "clipPath");
  clip.setAttribute("id", `${ctx.uid}-proud`);
  clip.appendChild(ctx.contourPath());
  ctx.defs.appendChild(clip);
  const g = document.createElementNS(SVG, "g");
  g.setAttribute("clip-path", `url(#${ctx.uid}-proud)`);
  ctx.body.appendChild(g);
  return g;
}

/** How one layer of strands is drawn, and how far the pulse lifts it. */
type Layer = { proudOnly: boolean; width: number; dim: number; lit: number; swell: number };

/** The under-skin tree: VEIN's own weight and opacity, and a modest lift. */
const UNDER: Layer = { proudOnly: false, width: 0.45, dim: 0.3, lit: 0.62, swell: 1.3 };

/** The stretches standing proud: wider, brighter at rest, and lighting hardest. */
const PROUD: Layer = { proudOnly: true, width: 0.7, dim: 0.5, lit: 1, swell: 1.6 };

/** One layer of strands into one group, each registered with the pulse. */
function layer(
  ctx: SkinContext,
  g: SVGGElement,
  tree: { segments: Segment[]; span: number },
  out: Lit[],
  a: Layer,
): void {
  const w = ctx.weight * a.width;
  for (const s of tree.segments) {
    if (a.proudOnly && !s.proud) continue;
    const el = strand(ctx, s.d, a.dim, w);
    g.appendChild(el);
    out.push({
      el,
      at: s.at / tree.span,
      dimOpacity: a.dim,
      litOpacity: a.lit,
      dimWidth: w,
      litWidth: w * a.swell,
      lit: false,
    });
  }
}

/**
 * The one animation: the front's position, and two attributes per segment.
 * Nothing is allocated but the attribute strings SVG insists on, and a segment
 * at rest is skipped — the body is dark for two thirds of the cycle, so most
 * frames on most cards write nothing at all.
 */
function pulse(ctx: SkinContext, lit: Lit[]): void {
  ctx.onFrame(({ t }) => {
    // One `LEAD` short of the origin, so the innermost segments ramp in rather
    // than snapping from dark to full at the wrap: an upstroke, not a jump.
    const front = (((t % CYCLE) + CYCLE) % CYCLE) / TRAVEL - LEAD;
    for (const p of lit) {
      const lead = front - p.at;
      let g = 0;
      if (lead < 0) g = lead < -LEAD ? 0 : (lead + LEAD) / LEAD;
      else g = lead > TAIL ? 0 : 1 - lead / TAIL;
      if (g <= 0) {
        if (!p.lit) continue;
        p.lit = false;
      } else p.lit = true;
      p.el.setAttribute(
        "stroke-opacity",
        (p.dimOpacity + (p.litOpacity - p.dimOpacity) * g).toFixed(3),
      );
      p.el.setAttribute("stroke-width", (p.dimWidth + (p.litWidth - p.dimWidth) * g).toFixed(3));
    }
  });
}

export const VEIN_PULSE: Skin<"vein-pulse"> = {
  id: "vein-pulse",
  label: "PULSE",
  hint: "veins that surface, and beat every second beat",
  build(ctx) {
    const tree = grown(ctx);
    const lit: Lit[] = [];
    fillPass(ctx);
    corePass(ctx);
    layer(ctx, clipGroup(ctx), tree, lit, UNDER);
    auraPass(ctx);
    rimPass(ctx);
    layer(ctx, proudGroup(ctx), tree, lit, PROUD);
    pulse(ctx, lit);
  },
};
