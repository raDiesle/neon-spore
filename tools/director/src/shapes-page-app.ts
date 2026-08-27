/**
 * The shape catalogue as a page that can be handed to somebody.
 *
 * The director's SHAPES tab already animates every contour, and it is the
 * right place to judge one — beside the wave editor, on a machine with the
 * repo on it. This is the same catalogue for the case that tab cannot cover:
 * a session running in the cloud has no browser the human can see, and the
 * human is holding a phone. A still is no use, because motion is most of what
 * tells two blobs apart at 26 px, so what gets handed over has to move.
 *
 * It is one file with the geometry compiled into it and nothing fetched, so it
 * survives being mailed, published or opened offline. Nothing here writes
 * anything: it is a look, not an editor.
 */

import type { OwnMotion } from "@neon-spore/content";
import {
  boundsOver,
  CATALOGUE,
  type CatalogueEntry,
  contourAt,
  MOTIONS,
  type Subject,
  WOBBLE_PERIOD,
} from "@neon-spore/shape-sheet";
import { inline } from "./markdown.js";
import { motionTransform, tilePixels, transformedBounds } from "./shapes-motion.js";

const SVG = "http://www.w3.org/2000/svg";
const BOX = 132;
/** A hull span is forty times as wide as it is tall; a square frame hides it. */
const WIDE = 620;
const WIDE_RATIO = 3;
const FIT_TIMES = [0, 0.2, 0.4, 0.6, 0.8].map((f) => f * WOBBLE_PERIOD);

interface Drawn {
  subject: Subject;
  motion: OwnMotion | undefined;
  path: SVGPathElement;
  body: SVGGElement;
  centre: { x: number; y: number };
  tile: number;
}

const drawn: Drawn[] = [];
let paused = false;

/**
 * One animated contour in a fitted frame.
 *
 * The frame is fitted over the whole wobble *and* the whole own-motion, which
 * is the one thing a card like this must get right: a box fitted to the rest
 * pose clips the moment the shape breathes or sways, and a clipped outline
 * reads as the shape being wrong rather than the frame being small.
 */
function panel(subject: Subject, motion: OwnMotion | undefined, stroke: string): SVGSVGElement {
  const still = boundsOver(subject, FIT_TIMES);
  const wide = (still.x1 - still.x0) / (still.y1 - still.y0) > WIDE_RATIO;
  const w = wide ? WIDE : BOX;

  const svg = document.createElementNS(SVG, "svg");
  svg.setAttribute("viewBox", `0 0 ${w} ${BOX}`);
  svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
  if (wide) svg.classList.add("is-wide");

  const tile = tilePixels(still);
  const centre = { x: (still.x0 + still.x1) / 2, y: (still.y0 + still.y1) / 2 };
  const b = transformedBounds(subject, motion, FIT_TIMES, tile, centre);
  const scale = Math.min((w - 16) / (b.x1 - b.x0), (BOX - 16) / (b.y1 - b.y0));
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
  path.setAttribute("stroke", stroke);
  path.setAttribute("stroke-width", String(2 / scale));
  path.setAttribute("stroke-linecap", "round");
  path.setAttribute("stroke-linejoin", "round");
  path.setAttribute("d", contourAt(subject, 0));
  body.appendChild(path);
  frame.appendChild(body);
  svg.appendChild(frame);

  drawn.push({ subject, motion, path, body, centre, tile });
  return svg;
}

/**
 * `inline` rather than `textContent`, and for the same reason the director
 * uses it: the notes in the catalogue are written as prose with emphasis in
 * them, and a card that prints the asterisks is a card that shows its own
 * source. The blurbs say things like "visible to the *other* player".
 */
function line(parent: HTMLElement, cls: string, body: string, tag = "p"): void {
  const el = document.createElement(tag);
  el.className = cls;
  inline(el, body);
  parent.appendChild(el);
}

interface CardText {
  name: string;
  stamp: string;
  /** What the shape is offered to, when it is offered to anything. */
  suggests?: string;
  blurb: string;
  figures: string;
}

function card(subject: Subject, motion: OwnMotion | undefined, t: CardText, kind: string): Element {
  const fig = document.createElement("figure");
  fig.className = `card is-${kind}`;
  const stage = document.createElement("div");
  stage.className = "stage";
  const svg = panel(subject, motion, `var(--${kind})`);
  if (svg.classList.contains("is-wide")) fig.classList.add("spans");
  stage.appendChild(svg);
  fig.appendChild(stage);

  const cap = document.createElement("figcaption");
  const head = document.createElement("div");
  head.className = "head";
  line(head, "name", t.name, "span");
  line(head, "stamp", t.stamp, "span");
  cap.appendChild(head);
  if (t.suggests) line(cap, "suggest", `for ${t.suggests}`);
  line(cap, "blurb", t.blurb);
  line(cap, "figures", t.figures);
  fig.appendChild(cap);
  return fig;
}

const STAMP = { draft: "DRAFT", free: "FREE", taken: "TAKEN" } as const;

function shapeCard(entry: CatalogueEntry): Element {
  return card(
    entry.subject,
    entry.motion,
    {
      name: entry.subject.name,
      stamp: STAMP[entry.status],
      suggests: entry.suggests,
      blurb: entry.owner,
      figures: entry.motion
        ? `${entry.subject.note} · moves: ${entry.motion.note}`
        : entry.subject.note,
    },
    entry.status,
  );
}

/**
 * A spare motion has no body of its own, so it borrows one — the same body for
 * all nine, because the only question a motion sheet answers is whether two of
 * them can be told apart, and two different carriers would answer it falsely.
 */
function motionCard(motion: OwnMotion, carrier: Subject): Element {
  return card(
    carrier,
    motion,
    {
      name: motion.name,
      stamp: "MOTION",
      blurb: motion.note,
      figures: `carried by ${carrier.name} · nothing claims this motion yet`,
    },
    "motion",
  );
}

function section(id: string, build: () => Element[]): void {
  const host = document.getElementById(id);
  if (!host) return;
  host.replaceChildren(...build());
}

function tick(): void {
  requestAnimationFrame(tick);
  if (paused) return;
  const t = performance.now() / 1000;
  for (const d of drawn) {
    d.path.setAttribute("d", contourAt(d.subject, t));
    d.body.setAttribute("transform", motionTransform(d.motion, t, d.centre, d.tile));
  }
}

const of = (status: CatalogueEntry["status"]) => CATALOGUE.filter((e) => e.status === status);

section("drafts", () => of("draft").map(shapeCard));
section("free", () => of("free").map(shapeCard));
section("taken", () => of("taken").map(shapeCard));
section("motions", () => {
  // Something round, plain and already in the game: a motion drawn on an
  // unfamiliar body is a shape being judged, which is the other page.
  const carrier =
    CATALOGUE.find((e) => e.status === "taken" && e.subject.name === "BULB")?.subject ??
    CATALOGUE[0]?.subject;
  return carrier ? MOTIONS.map((m) => motionCard(m, carrier)) : [];
});

for (const el of document.querySelectorAll<HTMLElement>("[data-count]")) {
  const target = document.getElementById(el.dataset.count ?? "");
  el.textContent = String(target?.childElementCount ?? 0);
}

const toggle = document.getElementById("pause");
if (toggle) {
  paused = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const label = () => {
    toggle.textContent = paused ? "PLAY" : "PAUSE";
    toggle.setAttribute("aria-pressed", String(paused));
  };
  toggle.addEventListener("click", () => {
    paused = !paused;
    label();
  });
  label();
}

requestAnimationFrame(tick);
