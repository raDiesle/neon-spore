/**
 * The shape catalogue: every contour that has been drawn, free ones first.
 *
 * A creature in the bestiary is a behaviour and a name with no picture. A
 * contour tuned in `legacy/style-guide.html` and never claimed is a picture
 * with no behaviour. This panel is the second half of that pair, put on the
 * same screen as the first, so a concept can be handed a shape — by a person
 * deciding it, not by the editor: nothing here writes anything.
 *
 * The shapes animate, unlike the still thumbnail beside a bestiary row. This
 * is the one place motion is the question — whether a lobe swings or only
 * shivers is most of what tells two blobs apart at 26 px — and there is no
 * simulation running behind this page to take the frames from.
 */

import { boundsOver, CATALOGUE, type CatalogueEntry, WOBBLE_PERIOD } from "@neon-spore/shape-sheet";
import { inline } from "./markdown.js";

const SVG = "http://www.w3.org/2000/svg";
const BOX = 92;
/**
 * An open contour is the hull or a span of it, and the hull is six times as
 * wide as it is tall. Fitted into a square it becomes a hairline across the
 * middle, so those get a wide frame and the closed ones stay square.
 */
const WIDE = 620;

interface Drawn {
  entry: CatalogueEntry;
  path: SVGPathElement;
  /** Fixed at t = 0, so the outline breathes inside a frame that does not. */
  transform: string;
}

const drawn: Drawn[] = [];
let running = false;

function card(entry: CatalogueEntry): HTMLElement {
  const div = document.createElement("div");
  div.className = entry.status === "free" ? "shape is-free" : "shape";
  if (entry.subject.open) div.classList.add("is-wide");

  const w = entry.subject.open ? WIDE : BOX;
  const svg = document.createElementNS(SVG, "svg");
  svg.setAttribute("viewBox", `0 0 ${w} ${BOX}`);
  svg.setAttribute("width", String(w));
  svg.setAttribute("height", String(BOX));

  // The box is sized on the shape's whole wobble, not on its rest pose: a
  // frame fitted to t = 0 clips the moment the outline breathes outwards.
  const b = boundsOver(
    entry.subject,
    [0, 0.25, 0.5, 0.75].map((f) => f * WOBBLE_PERIOD),
  );
  const scale = Math.min((w - 18) / (b.x1 - b.x0), (BOX - 18) / (b.y1 - b.y0));
  const cx = (b.x0 + b.x1) / 2;
  const cy = (b.y0 + b.y1) / 2;

  const path = document.createElementNS(SVG, "path");
  path.setAttribute("fill", "none");
  path.setAttribute("stroke", entry.status === "free" ? "var(--gold)" : "var(--dim)");
  path.setAttribute("stroke-width", String(2 / scale));
  path.setAttribute("stroke-linecap", "round");
  const transform = `translate(${w / 2} ${BOX / 2}) scale(${scale.toFixed(4)}) translate(${-cx} ${-cy})`;
  path.setAttribute("transform", transform);
  svg.appendChild(path);
  div.appendChild(svg);

  const body = document.createElement("div");
  const name = document.createElement("span");
  name.className = "name";
  name.textContent = entry.subject.name;
  body.appendChild(name);

  const stamp = document.createElement("span");
  stamp.className = "stamp";
  stamp.textContent = entry.status === "free" ? "FREE" : "TAKEN";
  body.appendChild(stamp);

  const owner = document.createElement("p");
  owner.className = "blurb";
  owner.textContent = entry.owner;
  body.appendChild(owner);

  const note = document.createElement("p");
  note.className = "figures";
  inline(note, entry.subject.note);
  body.appendChild(note);

  div.appendChild(body);
  drawn.push({ entry, path, transform });
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
    d.path.setAttribute("d", d.entry.subject.path(d.entry.subject.pointsAt(t)));
  }
  requestAnimationFrame(tick);
}

export function renderShapes(): void {
  const free = document.getElementById("shapesFree");
  const taken = document.getElementById("shapesTaken");
  if (!free || !taken) return;

  drawn.length = 0;
  free.replaceChildren();
  taken.replaceChildren();
  // Closed contours first, the wide open ones after them: a 686 px card in
  // the middle of a wrapping row leaves a hole beside every shape before it.
  const ordered = [...CATALOGUE].sort((a, b) => Number(a.subject.open) - Number(b.subject.open));
  for (const entry of ordered) {
    (entry.status === "free" ? free : taken).appendChild(card(entry));
  }

  if (!running) {
    running = true;
    requestAnimationFrame(tick);
  }
}
