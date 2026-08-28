import { type LongAxis, type OwnMotion, type Pose, REST } from "@neon-spore/content";
import { type CatalogueEntry, contourAt } from "@neon-spore/shape-sheet";
import { fitOf, stillOf } from "./shape-fit.js";
import { poseAtSecond, poseTransform } from "./shapes-motion.js";
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

export { FIT_TIMES, isWide, WIDE_RATIO } from "./shape-fit.js";

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
  /** Which way this body is long, for a motion written along one. */
  long: LongAxis;
  /**
   * This card's own frame, reused rather than rebuilt.
   *
   * `t` and `beat` are the same on every card and could be one shared object;
   * `pose` is this body's alone, so the frame has to be per card, and a page
   * of sixty cards must not allocate sixty objects sixty times a second to say
   * so. Written here each tick and read by the skin, never kept by it.
   */
  frame: { t: number; beat: number; pose: Pose };
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
  // One phase, worked out once and written onto every card's frame. Not per
  // figure: a page of cards each pulsing on its own clock reads as noise, and
  // the whole value of a heartbeat is that the page does it together.
  // `BEAT_SECONDS` is the game's own tempo — see `skins/types.ts`.
  const beat = (t / BEAT_SECONDS) % 1;
  let live = 0;
  for (const d of drawn) {
    const first = d.paths[0];
    if (!first?.isConnected) continue;
    drawn[live++] = d;
    const shape = contourAt(d.entry.subject, t);
    for (const p of d.paths) p.setAttribute("d", shape);
    // One pose, used twice: it is what the group is transformed by and what a
    // skin that leans or slides is told. Two derivations of it would be two
    // answers, and the fringe would lean against a sway the body is not doing.
    const pose = d.motion ? poseAtSecond(d.motion, t, d.long) : REST;
    d.body.setAttribute("transform", d.motion ? poseTransform(pose, d.centre, d.tile) : "");
    d.frame.t = t;
    d.frame.beat = beat;
    d.frame.pose = pose;
    d.onFrame?.(d.frame);
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
    extent: { w: still.extent.x1 - still.extent.x0, h: still.extent.y1 - still.extent.y0 },
    tile,
    lit: opts.lit ?? true,
  });
  frame.appendChild(body);
  svg.appendChild(frame);

  drawn.push({
    entry,
    paths: contour,
    onFrame,
    body,
    centre: pivot,
    tile,
    motion,
    long: still.long,
    frame: { t: 0, beat: 0, pose: REST },
  });
  if (!running) {
    running = true;
    requestAnimationFrame(tick);
  }
  return svg;
}
