import { REST } from "@neon-spore/content";
import { type CatalogueEntry, contourAt } from "@neon-spore/shape-sheet";
import type { FillingId } from "./fillings/index.js";
import { type GlowId, glowSpread } from "./glows/index.js";
import { type HitId, type HitMoment, hitSpread } from "./hits/index.js";
import { figureLayout } from "./shape-fit.js";
import { poseAtSecond, poseTransform } from "./shapes-motion.js";
import { IDLE_HIT } from "./shapes-trigger.js";
import { BEAT_SECONDS, buildSkin, type SkinId } from "./skins/index.js";
import { element, type ShimElement, serialise, withDocument } from "./svg-dom.js";
import { type TailId, tailReach } from "./tails/index.js";

/**
 * One card, drawn at one moment, as a string.
 *
 * This is the terminal's version of what the SHAPES tab shows: the same
 * fitting through `figureLayout`, the same `buildSkin`, the same own-motion
 * pose. What it drops is the loop — `onFrame` is called once, at a moment the
 * caller names, and then the tree is serialised.
 *
 * **It is a still and not a preview.** A skin that eases across frames (CILIA
 * settling, VEIN-PULSE filling) is caught mid-thought here, which is correct
 * for the question this answers — *is the picture right* — and useless for the
 * one it does not: *does the motion read*. That second question still needs the
 * director and a pair of eyes, and nothing here should be taken as having
 * answered it.
 *
 * **`t` is a moment, not a duration.** Both the contour's wobble and the own
 * motion are pure functions of it, so the same `t` gives the same still on
 * every machine forever — which is what makes a still committable and what
 * makes two of them comparable.
 */
export interface StillOptions {
  skin: SkinId;
  /** Seconds on the page clock. The wobble, the sway and the drift all read it. */
  t?: number;
  /** Box size in pixels. The SHAPES tab draws its cards at 92. */
  box?: number;
  width?: number;
  /** The rim colour, and what every other pass is tinted from. */
  stroke?: string;
  weight?: number;
  lit?: boolean;
  /**
   * Glows to stack under the skin, as the SHAPES tab's fourth axis does.
   * Carried here because a still that could not show a glow would be a picture
   * of half the card, and the frame pads for them through `figureLayout` — so
   * a glowing still is framed exactly as the glowing card is.
   */
  glows?: readonly GlowId[];
  /**
   * What the body has in it, if anything — the SHAPES tab's seventh axis.
   *
   * Here for the same reason `glows` is, and the reason is sharper: a filling
   * is *placed on a turning surface*, so the one question it exists to answer
   * is whether the marks land where the projection says they do, and until this
   * field existed nothing outside a browser could ask it. The axis is ten
   * values and every one of them was written from a terminal.
   */
  filling?: FillingId;
  /**
   * What the body leaves behind it — the SHAPES tab's TAIL axis. Here since
   * 10 September 2026, when three tails were written from a terminal in one
   * sitting and there was no way to see one without starting the director.
   * The frame grows upward for it exactly as the card's does.
   */
  tails?: readonly TailId[];
  /**
   * Which hits the body wears, and the moment of the hit to draw them at —
   * `IDLE_HIT` when not given, which is the frame between hits where every
   * value on that axis draws nothing. A still of a hit is a still of one
   * instant, so the instant is an argument.
   */
  hits?: readonly HitId[];
  hit?: HitMoment;
  /** Draw the body at rest, ignoring its own-motion. The frame is unchanged. */
  still?: boolean;
}

/** What the SHAPES tab uses, so a still is the card and not a version of it. */
const DEFAULTS = { t: 0, box: 92, stroke: "#FFC24A", weight: 2, lit: true } as const;

/**
 * Skins this cannot draw, and why — never a stub that returns a number.
 *
 * CILIA measures a rendered path through `contour-ruler.ts`, which needs
 * `getTotalLength`. There is no rendering here, so there is no length; a shim
 * that invented one would produce a fringe of plausible hairs at the wrong
 * density, and a still that is quietly wrong is worse than one that is
 * missing. It is named rather than discovered, so the failure is a sentence
 * instead of a stack trace.
 */
export const UNDRAWABLE: Partial<Record<SkinId, string>> = {
  cilia: "measures a rendered path (getTotalLength), which a string has no way to answer",
};

export function skinStill(entry: CatalogueEntry, opts: StillOptions): string {
  const why = UNDRAWABLE[opts.skin];
  if (why) throw new Error(`${opts.skin} cannot be drawn as a still: ${why}`);

  const o = { ...DEFAULTS, ...opts };
  const motion = o.still ? undefined : entry.motion;
  const layout = figureLayout(
    entry,
    entry.motion,
    o.box,
    o.width,
    Math.max(glowSpread(o.glows ?? []), hitSpread(o.hits ?? [])),
    tailReach(o.tails ?? []),
  );

  return withDocument(() => {
    const svg = element("svg");
    svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svg.setAttribute("viewBox", `0 0 ${layout.w} ${o.box}`);
    svg.setAttribute("width", String(layout.w));
    svg.setAttribute("height", String(o.box));

    const defs = element("defs");
    svg.appendChild(defs);

    const frame = element("g");
    frame.setAttribute("transform", layout.transform);
    const body = element("g");

    const pose = motion ? poseAtSecond(motion, o.t, layout.long) : REST;
    const { contour, onFrame } = buildSkin(
      o.skin,
      body as unknown as SVGGElement,
      defs as unknown as SVGDefsElement,
      {
        colour: o.stroke,
        weight: o.weight / layout.scale,
        // Keyed on the shape rather than on a counter: a still is one figure,
        // and a name makes two stills of the same body diffable instead of
        // differing in every id.
        uid: `st${entry.subject.name.replace(/[^A-Za-z0-9]/g, "")}`,
        name: entry.subject.name,
        reach: layout.reach,
        extent: layout.extent,
        tile: layout.tile,
        lit: o.lit,
        centre: layout.pivot,
        glows: o.glows,
        filling: o.filling,
        tails: o.tails,
        hits: o.hits,
      },
    );

    const d = contourAt(entry.subject, o.t);
    for (const p of contour) (p as unknown as ShimElement).setAttribute("d", d);
    body.setAttribute("transform", poseTransform(pose, layout.pivot, layout.tile));
    onFrame?.({ t: o.t, beat: (o.t / BEAT_SECONDS) % 1, pose, hit: o.hit ?? IDLE_HIT });

    frame.appendChild(body);
    svg.appendChild(frame);
    return serialise(svg);
  });
}
