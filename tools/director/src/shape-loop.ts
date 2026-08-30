import type { LongAxis, OwnMotion, Pose } from "@neon-spore/content";
import { REST } from "@neon-spore/content";
import { type CatalogueEntry, contourAt } from "@neon-spore/shape-sheet";
import type { HitMoment } from "./hits/types.js";
import { poseAtSecond, poseTransform } from "./shapes-motion.js";
import { hitAt } from "./shapes-trigger.js";
import { BEAT_SECONDS, type SkinFrame } from "./skins/index.js";

/**
 * The page's one clock, and every figure hanging off it.
 *
 * Split out of `shape-figure.ts` when GLOW took that file past the length
 * limit, and the seam is the one that was already there in prose: that file
 * says of itself that "the fitting is the whole of it", and this is the other
 * half — what happens sixty times a second to everything that has been fitted.
 * One is about building a card, this is about running a page of them.
 *
 * **One loop, not one per card.** A disconnected figure is skipped and then
 * forgotten, so a tab that is rebuilt does not leave its old shapes wobbling
 * in a detached tree forever.
 *
 * `performance.now` is the clock and it is nowhere near the simulation: these
 * cards draw no world and hold no state a replay could disagree about.
 */

export interface Drawn {
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
  frame: { t: number; beat: number; pose: Pose; hit: HitMoment };
  /** The figure's own `<svg>`, the box `watch` observes. */
  svg: SVGSVGElement;
  /**
   * Whether any of this figure is within sight. Starts true so a card draws on
   * the frame it is added, before the observer has said anything about it.
   */
  seen: boolean;
}

const drawn: Drawn[] = [];
let running = false;

/**
 * A card nobody can see does not get a frame.
 *
 * The SHAPES tab holds ninety-nine figures in a column ten screens long, and
 * three to six of them are in sight. The rest were being animated into a
 * scroll container that clips them away — not a small saving on the page's
 * cost but most of it.
 *
 * `rootMargin` gives a card a little warning before it arrives. Nothing here
 * needs the warning to *look* right: every figure is a pure function of the
 * clock, so one scrolled into view is in exactly the phase it would have been
 * had it never stopped. A skin that smooths across frames gets a few frames to
 * settle, which is what the margin is actually for.
 */
const observed = new WeakMap<Element, Drawn>();
const watch =
  typeof IntersectionObserver === "function"
    ? new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            const d = observed.get(e.target);
            if (d) d.seen = e.isIntersecting;
          }
        },
        { rootMargin: "120px" },
      )
    : null;

/** Reused across frames: `clear()` on a `Map` keeps its table. See `tick`. */
const shapeCache = new Map<CatalogueEntry["subject"], string>();

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
  // Worked out once for the page, like `beat` and for the same reason: thirty
  // bodies flinching on thirty clocks is noise, and a flinch is only legible
  // because the page does it together. `shapes-trigger.ts` owns the clock.
  const hit = hitAt(t);
  // A contour at one moment depends on the subject and the clock, nothing
  // else, so the forty cells of `shapes-all.ts` — one body walked across every
  // skin, motion and light — are forty identical strings. THE CAIRN's costs
  // three milliseconds to build.
  shapeCache.clear();
  let live = 0;
  for (const d of drawn) {
    const first = d.paths[0];
    if (!first?.isConnected) {
      watch?.unobserve(d.svg);
      continue;
    }
    drawn[live++] = d;
    if (!d.seen) continue;
    let shape = shapeCache.get(d.entry.subject);
    if (shape === undefined) {
      shape = contourAt(d.entry.subject, t);
      shapeCache.set(d.entry.subject, shape);
    }
    for (const p of d.paths) p.setAttribute("d", shape);
    // One pose, used twice: it is what the group is transformed by and what a
    // skin that leans or slides is told. Two derivations of it would be two
    // answers, and the fringe would lean against a sway the body is not doing.
    const pose = d.motion ? poseAtSecond(d.motion, t, d.long) : REST;
    d.body.setAttribute("transform", d.motion ? poseTransform(pose, d.centre, d.tile) : "");
    d.frame.t = t;
    d.frame.beat = beat;
    d.frame.pose = pose;
    d.frame.hit = hit;
    d.onFrame?.(d.frame);
  }
  drawn.length = live;
  requestAnimationFrame(tick);
}

/**
 * Hand a freshly built figure to the loop, and start the loop if it is the
 * first. The observer and the array are private to this file on purpose:
 * `shape-figure.ts` builds a card and then forgets about it, which is why a
 * card that is scrolled away costs nothing without that file knowing.
 */
export function runFigure(record: Drawn): void {
  drawn.push(record);
  observed.set(record.svg, record);
  watch?.observe(record.svg);
  if (!running) {
    running = true;
    requestAnimationFrame(tick);
  }
}
