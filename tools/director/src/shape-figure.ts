import type { OwnMotion } from "@neon-spore/content";
import {
  type Bounds,
  boundsOver,
  type CatalogueEntry,
  contourAt,
  WOBBLE_PERIOD,
} from "@neon-spore/shape-sheet";
import { type Centre, motionTransform, tilePixels, transformedBounds } from "./shapes-motion.js";
import { BEAT_SECONDS, buildSkin, type SkinFrame, type SkinId } from "./skins/index.js";

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
 * `performance.now` is the clock and it is nowhere near the simulation: these
 * cards draw no world and hold no state a replay could disagree about.
 */

const SVG = "http://www.w3.org/2000/svg";

/** The moments a frame is fitted over: one whole wobble, sampled. */
export const FIT_TIMES = [0, 0.2, 0.4, 0.6, 0.8].map((f) => f * WOBBLE_PERIOD);

/**
 * The hull is six times as wide as it is tall, and a span of it far more.
 * Fitted into a square such a shape becomes a hairline across the middle, so
 * anything this long gets a wide frame and everything else stays square.
 */
export const WIDE_RATIO = 3;

/**
 * The rest pose's box, and the two numbers derived from it. Depends on the
 * contour and on nothing else — not on the frame it will be drawn into, not
 * on the skin, not on the light.
 */
interface Still {
  bounds: Bounds;
  tile: number;
  /**
   * The still shape's middle. Both the frame and the transform written every
   * frame turn about this same point, or the two disagree and the card clips
   * whatever the frame did not know was coming.
   */
  pivot: Centre;
}

/**
 * The fit, remembered.
 *
 * A card's frame is found by scanning: a hundred and thirty contour samples,
 * each a metaball bisection, and then six thousand poses over the sixty-four
 * seconds `DRIFT` takes to reach its widest excursion. That is the honest
 * price of a frame that never clips, and it is nearly the whole price of a
 * card — measured on the SHAPES tab, 6130 ms of a 6376 ms skin switch, against
 * 112 ms for every `buildSkin` on the page and 2 ms for every element.
 *
 * None of it depends on the skin, the light, or the frame the answer is drawn
 * into. So switching skin used to re-derive sixty identical numbers and throw
 * the old ones away — the rebuild was never the cost, recomputing the fit
 * sixty times for no new information was. The catalogue is a fixed table and
 * `FIT_TIMES` a constant, so the answer for a given contour and a given
 * own-motion is the same answer forever; it is worked out once and kept.
 *
 * Keyed on the entry and the motion because those are the only two inputs.
 * The stored boxes are handed out by reference and read, never written.
 */
const stills = new Map<CatalogueEntry, Still>();
const fits = new Map<CatalogueEntry, Map<OwnMotion | undefined, Bounds>>();

function stillOf(entry: CatalogueEntry): Still {
  const had = stills.get(entry);
  if (had) return had;
  const bounds = boundsOver(entry.subject, FIT_TIMES);
  const still: Still = {
    bounds,
    tile: tilePixels(bounds),
    pivot: { x: (bounds.x0 + bounds.x1) / 2, y: (bounds.y0 + bounds.y1) / 2 },
  };
  stills.set(entry, still);
  return still;
}

/** The box the shape needs once its own-motion is counted in. */
function fitOf(entry: CatalogueEntry, motion: OwnMotion | undefined, still: Still): Bounds {
  let byMotion = fits.get(entry);
  if (!byMotion) {
    byMotion = new Map();
    fits.set(entry, byMotion);
  }
  const had = byMotion.get(motion);
  if (had) return had;
  const b = transformedBounds(entry.subject, motion, FIT_TIMES, still.tile, still.pivot);
  byMotion.set(motion, b);
  return b;
}

/** Whether this shape needs the wide frame rather than the square one. */
export function isWide(entry: CatalogueEntry): boolean {
  const b = stillOf(entry).bounds;
  return (b.x1 - b.x0) / (b.y1 - b.y0) > WIDE_RATIO;
}

interface Drawn {
  entry: CatalogueEntry;
  /**
   * Every path that wears the contour. One for a bare outline, six or more for
   * a skin with a fill, an aura and a clip — they all take the same `d`, so
   * the skin never lags its own rim by a frame.
   */
  paths: SVGPathElement[];
  /** The skin's own animation, if it has one. See `skins/types.ts`. */
  onFrame?: (f: SkinFrame) => void;
  /** The group the own-motion is written onto, inside the fitted frame. */
  body: SVGGElement;
  centre: { x: number; y: number };
  tile: number;
  /** `entry.motion` unless a forced motion overrode it. See `FigureOptions.motion`. */
  motion?: OwnMotion;
}

const drawn: Drawn[] = [];
let running = false;
let uid = 0;

/**
 * Every figure on the page, redrawn. One loop rather than one per card: a
 * disconnected figure is skipped and then forgotten, so a tab that is rebuilt
 * does not leave its old shapes wobbling in a detached tree forever.
 */
function tick(): void {
  const t = performance.now() / 1000;
  // One phase, built once and handed to every card. Not per figure: a page of
  // cards each pulsing on its own clock reads as noise, and the whole value of
  // a heartbeat is that the page does it together. `BEAT_SECONDS` is the
  // game's own tempo — see `skins/types.ts`.
  const frame: SkinFrame = { t, beat: (t / BEAT_SECONDS) % 1 };
  let live = 0;
  for (const d of drawn) {
    const first = d.paths[0];
    if (!first?.isConnected) continue;
    drawn[live++] = d;
    const shape = contourAt(d.entry.subject, t);
    for (const p of d.paths) p.setAttribute("d", shape);
    d.body.setAttribute("transform", motionTransform(d.motion, t, d.centre, d.tile));
    d.onFrame?.(frame);
  }
  drawn.length = live;
  requestAnimationFrame(tick);
}

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

  const still = stillOf(entry);
  const { tile, pivot } = still;
  const b = fitOf(entry, motion, still);
  const pad = Math.max(6, box * 0.18);
  const scale = Math.min((w - pad) / (b.x1 - b.x0), (box - pad) / (b.y1 - b.y0));
  const cx = (b.x0 + b.x1) / 2;
  const cy = (b.y0 + b.y1) / 2;

  const frame = document.createElementNS(SVG, "g");
  frame.setAttribute(
    "transform",
    `translate(${w / 2} ${box / 2}) scale(${scale.toFixed(4)}) translate(${-cx} ${-cy})`,
  );
  const body = document.createElementNS(SVG, "g");

  const defs = document.createElementNS(SVG, "defs");
  svg.appendChild(defs);
  // Unique per figure: the gradient and the clip are referenced by id, and the
  // same shape is on screen twice the moment the backlog page draws a draft
  // beside the idea it was offered to.
  uid += 1;
  const { contour, onFrame } = buildSkin(opts.skin ?? "line", body, defs, {
    colour: stroke,
    weight: (opts.weight ?? 2) / scale,
    uid: `sk${uid}`,
    name: entry.subject.name,
    reach: Math.max(b.x1 - b.x0, b.y1 - b.y0) / 2,
    lit: opts.lit ?? true,
  });
  frame.appendChild(body);
  svg.appendChild(frame);

  drawn.push({ entry, paths: contour, onFrame, body, centre: pivot, tile, motion });
  if (!running) {
    running = true;
    requestAnimationFrame(tick);
  }
  return svg;
}
