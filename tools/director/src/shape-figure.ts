import { type OwnMotion, REST } from "@neon-spore/content";
import type { CatalogueEntry } from "@neon-spore/shape-sheet";
import { type GlowId, glowSpread } from "./glows/index.js";
import { type HitId, hitSpread } from "./hits/index.js";
import { figureLayout } from "./shape-fit.js";
import { type Drawn, runFigure } from "./shape-loop.js";
import { IDLE_HIT } from "./shapes-trigger.js";
import { buildSkin, type SkinId } from "./skins/index.js";
import { type TailId, tailReach } from "./tails/index.js";

/**
 * One contour, fitted into a frame and animated.
 *
 * Split out of `shapes-panel.ts` the day the backlog page needed the same
 * picture. A draft shape is drawn *at* a named idea, and until now it was only
 * ever visible on the SHAPES tab — beside the other shapes rather than beside
 * the idea it was offered to, which is the one place it would answer a
 * question. Both draw it now, and this is the one copy of the fitting.
 *
 * The fitting is the whole of it. A frame sized on the rest pose clips the
 * moment the outline breathes outwards, and one sized on the contour alone
 * clips the sway — so the box is fitted over a whole wobble *and* a whole
 * own-motion before anything is drawn into it.
 *
 * What happens to a card *after* it is built is `shape-loop.ts` — the one
 * clock every figure on the page hangs off. The two were one file until GLOW
 * took it past the length limit, and the seam was already written into the
 * sentence above: this file is about building a card, that one is about
 * running a page of them.
 */

const SVG = "http://www.w3.org/2000/svg";
/** Unique per figure, and the reason a `<defs>` id never collides: the backlog
 * page draws the same shape twice on purpose, beside the idea it was offered
 * to. Lives here rather than with the loop because it is a fact about
 * *building* a card, not about running one. */
let uid = 0;

export { FIT_TIMES, isWide, WIDE_RATIO } from "./shape-fit.js";

export interface FigureOptions {
  /** Height of the frame, in CSS pixels. */
  box: number;
  /** Width. Defaults to `box` — pass more for a shape `isWide` says is long. */
  width?: number;
  stroke: string;
  /** Line weight in frame pixels, before the fit's own scaling. */
  weight?: number;
  /**
   * How the body is drawn. `line` is the bare outline the cards had before
   * skins existed and is still the control the others are judged against;
   * `skins/` says what each of the rest adds and why, one file each.
   */
  skin?: SkinId;
  /**
   * Whether the key light is on, default true. Orthogonal to `skin` — LIGHT,
   * TURN and CRATER all read it, so any of them can be seen with the light
   * and without it without switching to a different look.
   */
  lit?: boolean;
  /**
   * Which own-motion drives the body, overriding `entry.motion`. Undefined —
   * the default — means the card keeps its own catalogue motion, same as
   * before this option existed: nothing may change until a caller passes one.
   * Orthogonal to `skin` and `lit` the same way those are orthogonal to each
   * other, so all three compose. See `docs/dimensional.md` for why a chosen
   * motion under a chosen skin is the pairing that was missing.
   */
  motion?: OwnMotion;
  /**
   * Which glows the body wears, stacked under and over the skin. Unlike
   * `skin`, this is a *set* — a glow composes with every other one, and the
   * combination is what the axis exists to show. Empty is the default and is
   * a real choice: it is the picture every value has to beat.
   *
   * Orthogonal to the other three the same way they are to each other, with
   * one consequence they do not have: a glow reaches past the contour, so it
   * is the only option here that changes the *frame*. See below.
   */
  glows?: readonly GlowId[];
  /**
   * Pad the frame as though the body were wearing *these* glows, while drawing
   * only the ones in `glows`.
   *
   * For one card this is never needed and is left unset — a figure is padded
   * for what it draws. A **grid** of cards that differ only in their glow is
   * the case it exists for: padded each for its own, the seven cells come out
   * at seven sizes, and a reader comparing them is reading the padding rather
   * than the effect. OVERVIEW's glow row passes every glow here, so all of its
   * cells are the size of the widest and only the light differs.
   *
   * Defaults to `glows`, so nothing that does not ask for it changes.
   */
  padFor?: readonly GlowId[];
  /**
   * Which hits the body wears. A set like `glows` and unlike `skin`: an impact
   * is three or four simple layers stacked, not one picked.
   *
   * They draw nothing at all between hits, so a figure wearing these looks
   * identical to one wearing none until `shapes-trigger.ts`'s clock fires.
   */
  hits?: readonly HitId[];
  /** `padFor`, for the hit axis: pad as though wearing these, draw only
   * `hits`. The hit row on OVERVIEW passes every hit, so its eight cells come
   * out one size and the reader compares effects rather than frames. */
  padForHits?: readonly HitId[];
  /**
   * Which tails the body wears — what it leaves behind as it falls. A set,
   * like `glows` and `hits`, and the one that is different in kind: a tail
   * reaches **upward only**, so it is the sole option here that makes the
   * frame asymmetric.
   */
  tails?: readonly TailId[];
  /** `padFor`, for the tail axis. */
  padForTails?: readonly TailId[];
}

/** The fitted, animated contour. Add it to the document and it starts moving. */
export function shapeFigure(entry: CatalogueEntry, opts: FigureOptions): SVGSVGElement {
  const { box, stroke } = opts;
  const w = opts.width ?? box;
  const motion = opts.motion ?? entry.motion;

  const svg = document.createElementNS(SVG, "svg");
  svg.setAttribute("viewBox", `0 0 ${w} ${box}`);
  svg.setAttribute("width", String(w));
  svg.setAttribute("height", String(box));

  // One copy of the fitting, shared with `skin-still.ts`. The glow padding
  // goes through it too: a still that framed its subject differently from a
  // glowing card would be a picture of the card rather than the card.
  const layout = figureLayout(
    entry,
    motion,
    box,
    opts.width,
    // The widest of either even axis, not the sum: a ring and a halo overlap
    // rather than queueing up, so padding for both would shrink every card for
    // room nothing uses. RING reaches further than any glow, which is why the
    // hit stack is in here at all — it was left out when this call moved into
    // `figureLayout`, and the symptom was a shockwave cropped by its own frame.
    Math.max(
      glowSpread(opts.padFor ?? opts.glows ?? []),
      hitSpread(opts.padForHits ?? opts.hits ?? []),
    ),
    tailReach(opts.padForTails ?? opts.tails ?? []),
  );
  const { scale, tile, pivot } = layout;

  const frame = document.createElementNS(SVG, "g");
  frame.setAttribute("transform", layout.transform);
  const body = document.createElementNS(SVG, "g");
  // A second group inside the motion, for a hit that moves the whole figure.
  // Inside rather than outside, so a squash composes *after* the sway and
  // turns about the body's own pivot — outside, it would scale a body that had
  // already been translated somewhere else and shear it off its own centre.
  const shell = document.createElementNS(SVG, "g");
  body.appendChild(shell);

  const defs = document.createElementNS(SVG, "defs");
  svg.appendChild(defs);
  // Unique per figure: the gradient and the clip are referenced by id, and the
  // same shape is on screen twice the moment the backlog page draws a draft
  // beside the idea it was offered to.
  uid += 1;
  const { contour, onFrame } = buildSkin(opts.skin ?? "line", shell, defs, {
    colour: stroke,
    weight: (opts.weight ?? 2) / scale,
    uid: `sk${uid}`,
    name: entry.subject.name,
    reach: layout.reach,
    extent: layout.extent,
    tile,
    lit: opts.lit ?? true,
    centre: pivot,
    glows: opts.glows,
    hits: opts.hits,
    tails: opts.tails,
    shell,
  });
  frame.appendChild(body);
  svg.appendChild(frame);

  const record: Drawn = {
    entry,
    paths: contour,
    onFrame,
    body,
    centre: pivot,
    tile,
    motion,
    long: layout.long,
    frame: { t: 0, beat: 0, pose: REST, hit: IDLE_HIT },
    svg,
    seen: true,
  };
  runFigure(record);
  return svg;
}
