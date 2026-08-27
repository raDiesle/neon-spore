/**
 * The shape catalogue: every contour that has been drawn, and every one drawn
 * for something the design has not worked out yet.
 *
 * A creature in the bestiary is a behaviour and a name with no picture. A
 * contour tuned in `legacy/style-guide.html` and never claimed is a picture
 * with no behaviour. This panel is the second half of that pair, put on the
 * same screen as the first, so a concept can be handed a shape — by a person
 * deciding it, not by the editor: nothing here writes anything.
 *
 * Three states, in reading order. DRAFTS are pictures drawn *at* a named idea,
 * offered to it and not yet accepted. FREE are pictures with nothing behind
 * them. TAKEN is what the game already draws, on the page so that a proposal
 * is judged beside the thing it will stand next to rather than on its own.
 *
 * Everything here animates, and that is the point: motion is what tells two
 * blobs apart at 26 px, and there is no simulation running behind this page to
 * take the frames from.
 */

import { boundsOver, CATALOGUE, type CatalogueEntry, WOBBLE_PERIOD } from "@neon-spore/shape-sheet";
import { inline } from "./markdown.js";
import { motionTransform, tilePixels, transformedBounds } from "./shapes-motion.js";

const SVG = "http://www.w3.org/2000/svg";
const BOX = 92;
/**
 * The hull is six times as wide as it is tall, and a span of it far more.
 * Fitted into a square such a shape becomes a hairline across the middle, so
 * anything this long gets a wide frame and everything else stays square.
 */
const WIDE = 620;
const WIDE_RATIO = 3;

/** The moments a card's frame is fitted over: one whole wobble, sampled. */
const FIT_TIMES = [0, 0.2, 0.4, 0.6, 0.8].map((f) => f * WOBBLE_PERIOD);

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

const STROKE: Record<CatalogueEntry["status"], string> = {
  draft: "var(--cyan)",
  free: "var(--gold)",
  taken: "var(--dim)",
};

const STAMP: Record<CatalogueEntry["status"], string> = {
  draft: "DRAFT",
  free: "FREE",
  taken: "TAKEN",
};

function text(parent: HTMLElement, cls: string, body: string, tag = "p"): void {
  const el = document.createElement(tag);
  el.className = cls;
  inline(el, body);
  parent.appendChild(el);
}

function card(entry: CatalogueEntry): HTMLElement {
  const div = document.createElement("div");
  div.className = `shape is-${entry.status}`;

  // The box is sized on the shape's whole wobble *and* its whole own-motion,
  // not on its rest pose: a frame fitted to t = 0 clips the moment the outline
  // breathes outwards, and one fitted to the contour alone clips the sway.
  const still = boundsOver(entry.subject, FIT_TIMES);

  // Measured, not assumed. This used to ask whether the contour was open, on
  // the reasoning that an open one is the hull — but an arm is open too, and
  // it is *taller* than it is wide. It got a 686 px card with a thumbnail in
  // the middle of it and six inches of nothing either side.
  const wide = (still.x1 - still.x0) / (still.y1 - still.y0) > WIDE_RATIO;
  if (wide) div.classList.add("is-wide");

  const w = wide ? WIDE : BOX;
  const svg = document.createElementNS(SVG, "svg");
  svg.setAttribute("viewBox", `0 0 ${w} ${BOX}`);
  svg.setAttribute("width", String(w));
  svg.setAttribute("height", String(BOX));

  const tile = tilePixels(still);
  // The still shape's middle is the pivot, fixed once. Both the box below and
  // the transform written every frame turn about this same point, or the two
  // disagree and the card clips whatever the box did not know was coming.
  const pivot = { x: (still.x0 + still.x1) / 2, y: (still.y0 + still.y1) / 2 };
  const b = transformedBounds(entry.subject, entry.motion, FIT_TIMES, tile, pivot);
  const scale = Math.min((w - 18) / (b.x1 - b.x0), (BOX - 18) / (b.y1 - b.y0));
  const cx = (b.x0 + b.x1) / 2;
  const cy = (b.y0 + b.y1) / 2;

  const frame = document.createElementNS(SVG, "g");
  frame.setAttribute(
    "transform",
    `translate(${w / 2} ${BOX / 2}) scale(${scale.toFixed(4)}) translate(${-cx} ${-cy})`,
  );
  const body = document.createElementNS(SVG, "g");

  const path = document.createElementNS(SVG, "path");
  path.setAttribute("fill", "none");
  path.setAttribute("stroke", STROKE[entry.status]);
  path.setAttribute("stroke-width", String(2 / scale));
  path.setAttribute("stroke-linecap", "round");
  path.setAttribute("stroke-linejoin", "round");
  body.appendChild(path);
  frame.appendChild(body);
  svg.appendChild(frame);
  div.appendChild(svg);

  const side = document.createElement("div");
  const head = document.createElement("div");
  text(head, "name", entry.subject.name, "span");
  text(head, "stamp", STAMP[entry.status], "span");
  side.appendChild(head);

  // The suggestion is the first line a draft has to say, because a shape with
  // no behaviour attached to it is what the FREE column already is.
  if (entry.suggests) text(side, "suggest", `for **${entry.suggests}**`);
  text(side, "blurb", entry.owner);

  const figures = entry.motion
    ? `${entry.subject.note} · moves: ${entry.motion.note}`
    : entry.subject.note;
  text(side, "figures", figures);

  div.appendChild(side);
  drawn.push({ entry, path, body, centre: pivot, tile });
  return div;
}

/**
 * One loop for every card. `performance.now` is the clock here and nowhere
 * near the simulation — this panel draws no world, holds no state a replay
 * could disagree about, and the wobble is a decoration on a still page.
 */
function tick(): void {
  const t = performance.now() / 1000;
  for (const d of drawn) {
    if (!d.path.isConnected) continue;
    const subject = d.entry.subject;
    // The card strokes rather than fills, so a hole is just a second loop in
    // the same `d`. Without this a ring draws as an ordinary blob.
    const outline = subject.path(subject.pointsAt(t));
    d.path.setAttribute("d", subject.hole ? outline + subject.path(subject.hole(t)) : outline);
    d.body.setAttribute("transform", motionTransform(d.entry.motion, t, d.centre, d.tile));
  }
  requestAnimationFrame(tick);
}

function fill(id: string, entries: CatalogueEntry[]): void {
  const el = document.getElementById(id);
  if (!el) return;
  el.replaceChildren();
  // Square cards first, the wide ones after them: a 686 px card in the middle
  // of a wrapping row leaves a hole beside every shape before it. Built first
  // and sorted after, because how wide a card is now depends on the shape it
  // was fitted to and is not knowable before it is built.
  const built = entries.map(card);
  built.sort(
    (a, b) => Number(a.classList.contains("is-wide")) - Number(b.classList.contains("is-wide")),
  );
  for (const el2 of built) el.appendChild(el2);
}

export function renderShapes(): void {
  if (!document.getElementById("shapesFree")) return;

  drawn.length = 0;
  fill(
    "shapesDrafts",
    CATALOGUE.filter((e) => e.status === "draft"),
  );
  fill(
    "shapesFree",
    CATALOGUE.filter((e) => e.status === "free"),
  );
  fill(
    "shapesTaken",
    CATALOGUE.filter((e) => e.status === "taken"),
  );

  if (!running) {
    running = true;
    requestAnimationFrame(tick);
  }
}
