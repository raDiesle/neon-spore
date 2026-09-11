import { frameWorld, onCard } from "./pose-art.js";
import { type Callout, WORDING_SCREENS, type WordingScreen } from "./wordings.js";
import { GLOSSARY } from "./wordings-glossary.js";
import { wordingsWorld } from "./wordings-world.js";

/**
 * DOCUMENTATION → WORDINGS: an ordinary screen with every part of it named.
 *
 * Two whole phones, the pilot's and the navigator's, each a real frame of the
 * shipping renderer over the one world `wordings-world.ts` builds — the same
 * `frameWorld` the STATES cards use, at the phone's own width. A label stands
 * in the margin either side and a line runs from it to the thing it names;
 * where the thing is comes from `wordings.ts`, in the layout's own pixels,
 * and `onCard` turns that into a place on the drawn frame.
 *
 * The labels are laid out after they exist: each is put level with its
 * point, then the ones that would overlap are walked down until they do not.
 * That is done from measured heights rather than a guessed line count, so a
 * label two lines long does not sit on the one under it.
 *
 * Lazy, like every other room in this sheet: drawn on the first click of the
 * tab and kept.
 */

/** The phone's own width, so a tile here is the size it is on the STATES full crops. */
const FRAME_W = 340;
/** Width of a margin, label and leader together. */
const MARGIN = 220;
/** Least room between two labels on the same side. */
const GAP = 6;

interface Placed {
  callout: Callout;
  point: { x: number; y: number };
  el: HTMLElement;
}

/**
 * Place one side's labels: each level with its point, then walked down until
 * none overlaps the one above, then walked back up from the bottom if the
 * last ran past the frame. Returns how tall the column came out — taller
 * than the frame when the labels simply do not fit beside it, in which case
 * the figure grows rather than the labels piling up.
 */
function stack(items: Placed[], height: number): number {
  const sorted = [...items].sort((a, b) => a.point.y - b.point.y);
  const heights = sorted.map((it) => it.el.offsetHeight);
  const tops: number[] = [];
  let floor = 0;
  sorted.forEach((it, i) => {
    const top = Math.max(floor, it.point.y - (heights[i] ?? 0) / 2);
    tops.push(top);
    floor = top + (heights[i] ?? 0) + GAP;
  });
  const bottom = Math.max(height, floor - GAP);
  let ceiling = bottom;
  for (let i = tops.length - 1; i >= 0; i--) {
    const h = heights[i] ?? 0;
    tops[i] = Math.min(tops[i] ?? 0, ceiling - h);
    ceiling = (tops[i] ?? 0) - GAP;
  }
  sorted.forEach((it, i) => {
    it.el.style.top = `${tops[i] ?? 0}px`;
  });
  return bottom;
}

function svgEl<K extends keyof SVGElementTagNameMap>(
  tag: K,
  attrs: Record<string, string | number>,
): SVGElementTagNameMap[K] {
  const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  return el;
}

/** The figure, and the step that places its labels once it is on a visible page. */
function figure(screen: WordingScreen): { fig: HTMLElement; settle: () => void } {
  const world = wordingsWorld();
  const framed = frameWorld(world, screen.role, "full", FRAME_W, undefined, undefined, Infinity);
  const height = framed.canvas.height / (framed.canvas.width / FRAME_W);

  const fig = document.createElement("div");
  fig.className = "wordfig";
  fig.style.width = `${MARGIN * 2 + FRAME_W}px`;
  fig.style.height = `${height}px`;

  framed.canvas.classList.add("wordfig-frame");
  framed.canvas.style.left = `${MARGIN}px`;
  fig.appendChild(framed.canvas);

  const svg = svgEl("svg", { class: "wordfig-lines", width: MARGIN * 2 + FRAME_W, height });
  fig.appendChild(svg);

  const placed: Placed[] = [];
  for (const callout of screen.callouts) {
    const at = callout.at(framed.layout, world);
    if (!at) continue;
    const p = onCard(framed, at.x, at.y);
    const point = { x: p.x + MARGIN, y: p.y };
    const el = document.createElement("div");
    el.className = `wordlabel is-${callout.side}`;
    const name = document.createElement("b");
    name.textContent = callout.name;
    const says = document.createElement("span");
    says.textContent = callout.says;
    el.append(name, says);
    fig.appendChild(el);
    placed.push({ callout, point, el });
  }

  const settle = (): void => {
    let tall = height;
    for (const side of ["left", "right"] as const) {
      tall = Math.max(
        tall,
        stack(
          placed.filter((p) => p.callout.side === side),
          height,
        ),
      );
    }
    fig.style.height = `${tall}px`;
    svg.setAttribute("height", String(tall));
    // The leaders, drawn once the labels know where they stand: from the
    // label's near edge, level with its name, to a dot on the thing itself.
    svg.replaceChildren();
    for (const { callout, point, el } of placed) {
      const y = el.offsetTop + 9;
      const x = callout.side === "left" ? el.offsetLeft + el.offsetWidth : el.offsetLeft;
      const bend = callout.side === "left" ? x + 14 : x - 14;
      svg.appendChild(
        svgEl("path", {
          d: `M${x},${y} L${bend},${y} L${point.x},${point.y}`,
          class: "wordlead",
        }),
      );
      svg.appendChild(svgEl("circle", { cx: point.x, cy: point.y, r: 3.2, class: "worddot" }));
    }
  };
  return { fig, settle };
}

function screenSection(screen: WordingScreen): { section: HTMLElement; settle: () => void } {
  const section = document.createElement("section");
  const h2 = document.createElement("h2");
  h2.textContent = screen.title;
  const note = document.createElement("p");
  note.className = "note";
  note.textContent = screen.says;
  const { fig, settle } = figure(screen);
  section.append(h2, note, fig);
  return { section, settle };
}

function glossarySection(): HTMLElement {
  const section = document.createElement("section");
  const h2 = document.createElement("h2");
  h2.textContent = "WORDS WITH NO ONE PLACE ON THE PICTURE";
  const note = document.createElement("p");
  note.className = "note";
  note.textContent =
    "The rest of the words a prompt can use. Each names a thing or a rule the picture above cannot point at.";
  const dl = document.createElement("dl");
  dl.className = "wordlist";
  for (const [word, says] of GLOSSARY) {
    const dt = document.createElement("dt");
    dt.textContent = word;
    const dd = document.createElement("dd");
    dd.textContent = says;
    dl.append(dt, dd);
  }
  section.append(h2, note, dl);
  return section;
}

let drawn = false;

function renderWordings(): void {
  if (drawn) return;
  const body = document.getElementById("wordingsBody");
  if (!body) return;
  drawn = true;
  const screens = WORDING_SCREENS.map(screenSection);
  body.replaceChildren(...screens.map((s) => s.section), glossarySection());
  // The tab bar's own click handler shows the page after this one has run,
  // and a label on a hidden page measures as nothing — so the labels are
  // placed on the next frame, when the page is on screen.
  requestAnimationFrame(() => {
    for (const s of screens) s.settle();
  });
}

export function bindWordingsTab(): void {
  document
    .querySelector<HTMLButtonElement>('#statesTabs button[data-tab="wordings"]')
    ?.addEventListener("click", renderWordings);
}
