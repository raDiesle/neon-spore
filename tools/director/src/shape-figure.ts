import { boundsOver, type CatalogueEntry, contourAt, WOBBLE_PERIOD } from "@neon-spore/shape-sheet";
import { motionTransform, tilePixels, transformedBounds } from "./shapes-motion.js";

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

/** Whether this shape needs the wide frame rather than the square one. */
export function isWide(entry: CatalogueEntry): boolean {
  const b = boundsOver(entry.subject, FIT_TIMES);
  return (b.x1 - b.x0) / (b.y1 - b.y0) > WIDE_RATIO;
}

interface Drawn {
  entry: CatalogueEntry;
  path: SVGPathElement;
  /** The group the own-motion is written onto, inside the fitted frame. */
  body: SVGGElement;
  centre: { x: number; y: number };
  tile: number;
}

const drawn: Drawn[] = [];
let running = false;

/**
 * Every figure on the page, redrawn. One loop rather than one per card: a
 * disconnected figure is skipped and then forgotten, so a tab that is rebuilt
 * does not leave its old shapes wobbling in a detached tree forever.
 */
function tick(): void {
  const t = performance.now() / 1000;
  let live = 0;
  for (const d of drawn) {
    if (!d.path.isConnected) continue;
    drawn[live++] = d;
    d.path.setAttribute("d", contourAt(d.entry.subject, t));
    d.body.setAttribute("transform", motionTransform(d.entry.motion, t, d.centre, d.tile));
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
}

/** The fitted, animated contour. Add it to the document and it starts moving. */
export function shapeFigure(entry: CatalogueEntry, opts: FigureOptions): SVGSVGElement {
  const { box, stroke } = opts;
  const w = opts.width ?? box;

  const svg = document.createElementNS(SVG, "svg");
  svg.setAttribute("viewBox", `0 0 ${w} ${box}`);
  svg.setAttribute("width", String(w));
  svg.setAttribute("height", String(box));

  const still = boundsOver(entry.subject, FIT_TIMES);
  const tile = tilePixels(still);
  // The still shape's middle is the pivot, fixed once. Both the frame below
  // and the transform written every frame turn about this same point, or the
  // two disagree and the card clips whatever the frame did not know was coming.
  const pivot = { x: (still.x0 + still.x1) / 2, y: (still.y0 + still.y1) / 2 };
  const b = transformedBounds(entry.subject, entry.motion, FIT_TIMES, tile, pivot);
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

  const path = document.createElementNS(SVG, "path");
  path.setAttribute("fill", "none");
  path.setAttribute("stroke", stroke);
  path.setAttribute("stroke-width", String((opts.weight ?? 2) / scale));
  path.setAttribute("stroke-linecap", "round");
  path.setAttribute("stroke-linejoin", "round");
  body.appendChild(path);
  frame.appendChild(body);
  svg.appendChild(frame);

  drawn.push({ entry, path, body, centre: pivot, tile });
  if (!running) {
    running = true;
    requestAnimationFrame(tick);
  }
  return svg;
}
