/**
 * Where you are on a long sheet page, kept in sight while you read it.
 *
 * The owner, 10 October 2026, on CONTROLS › ON THE FIELD: the CONTENTS menu
 * scrolls away with the top of the page, and forty thousand pixels further
 * down nothing says which part of it a card belongs to. So under every
 * contents menu stands a bar that sticks to the top of the page's scroller
 * and names the part, the section and the step being read — each a jump back
 * to its own heading — and the menu marks the same row, so a return to it
 * finds its place.
 *
 * **A page says its outline with `data-depth` on a heading**: 1 a part, 2 a
 * section of one, 3 a step inside a section, which the bar names and the menu
 * does not list. A page that says nothing is flat, every listed heading a part
 * (`listedHeadings`, `tabs.ts`), and gets the same bar with one crumb in it.
 *
 * The heading being read is the last one whose top has gone above the bar's
 * own bottom edge. It is measured on scroll and never stored against the
 * page's layout, for the reason the menu is read off the page: these pages
 * redraw.
 */

/** A heading's place in its page's outline; a heading that says none is a part. */
export function depthOf(heading: HTMLElement): number {
  return Number(heading.dataset.depth) || 1;
}

/** What the bar calls a heading: its own text, or the shorter name it says
 * it goes by when it carries more than its name — a count beside it. */
export function labelOf(heading: HTMLElement): string {
  return heading.dataset.label ?? heading.textContent ?? "";
}

/**
 * The part, section and step the reader is in, outermost first, once `passed`
 * of the outline's headings have gone above the bar. A heading closes every
 * crumb at its own depth and under it: past a new part, the old part's
 * section is no longer where you are.
 */
export function trailOf(outline: readonly HTMLElement[], passed: number): HTMLElement[] {
  const trail: HTMLElement[] = [];
  for (const heading of outline.slice(0, passed)) {
    trail.length = Math.min(trail.length, depthOf(heading) - 1);
    trail.push(heading);
  }
  return trail;
}

/** How far under the bar a heading's top may sit and still count as read: a
 * jump lands it just there (`scroll-margin-top`, `director-contents.css`). */
const READ_SLACK = 12;

export interface Spot {
  nav: HTMLElement;
  container: HTMLElement;
  bar: HTMLElement;
  /** Every heading the bar can name, in the order the page draws them. */
  outline: HTMLElement[];
  /** A listed heading's row in the menu. */
  rows: Map<HTMLElement, HTMLElement>;
  /** The element that scrolls the page, learnt from its first scroll. */
  scroller: Element | null;
  /** The trail the bar last drew, so a scroll inside one section draws nothing. */
  drawn: string;
}

const spots: Spot[] = [];
const dirty = new Set<Spot>();
let listening = false;
let due = false;

/** The bar under `nav`, standing empty until the menu is first filled. */
export function standBar(nav: HTMLElement, container: HTMLElement): Spot {
  const bar = document.createElement("div");
  bar.className = "contents-here";
  bar.hidden = true;
  nav.after(bar);
  container.classList.add("has-contents");
  const spot: Spot = {
    nav,
    container,
    bar,
    outline: [],
    rows: new Map(),
    scroller: null,
    drawn: "",
  };
  spots.push(spot);
  if (!listening) {
    listening = true;
    // A scroll does not bubble, so one listener in the capture phase hears
    // every scroller on the sheet rather than one listener per page.
    document.addEventListener("scroll", onScroll, { capture: true, passive: true });
  }
  return spot;
}

function onScroll(event: Event): void {
  const target = event.target as Element | null;
  if (!target || typeof target.contains !== "function") return;
  for (const spot of spots) {
    if (!target.contains(spot.container)) continue;
    spot.scroller = target;
    dirty.add(spot);
  }
  if (due || dirty.size === 0) return;
  due = true;
  requestAnimationFrame(() => {
    due = false;
    for (const spot of dirty) markHere(spot);
    dirty.clear();
  });
}

/** How many of the outline's headings have gone above the bar. */
function passedCount(spot: Spot): number {
  const { scroller, container, bar, outline } = spot;
  // A page on a tab nobody is looking at has no layout, and every one of its
  // headings would read as passed.
  if (!scroller || container.offsetParent === null) return 0;
  const line = scroller.getBoundingClientRect().top + bar.offsetHeight + READ_SLACK;
  let passed = 0;
  for (const heading of outline) {
    if (heading.getBoundingClientRect().top > line) break;
    passed++;
  }
  return passed;
}

/** Draws the bar and marks the menu for wherever the page is scrolled to now. */
export function markHere(spot: Spot): void {
  spot.bar.hidden = spot.nav.hidden;
  const trail = trailOf(spot.outline, passedCount(spot));
  const key = trail.map((h) => spot.outline.indexOf(h)).join(",");
  if (key === spot.drawn && spot.bar.children.length > 0) return;
  spot.drawn = key;
  drawBar(spot, trail);
  // Back at the top — which is where the menu is — the row keeps saying the
  // section last read, so ↑ CONTENTS lands on a menu that shows the place.
  if (trail.length === 0) return;
  const here = [...trail].reverse().find((h) => spot.rows.has(h));
  for (const [heading, row] of spot.rows) {
    row.classList.toggle("here", heading === here);
    row.classList.toggle("within", heading !== here && trail.includes(heading));
  }
}

function jumpTo(
  target: HTMLElement,
  label: string,
  cls: string,
  behavior: ScrollBehavior = "smooth",
): HTMLElement {
  const button = document.createElement("button");
  button.type = "button";
  button.className = cls;
  button.textContent = label;
  button.addEventListener("click", () => {
    target.scrollIntoView({ behavior, block: "start" });
  });
  return button;
}

function span(text: string, cls: string): HTMLElement {
  const el = document.createElement("span");
  el.className = cls;
  el.textContent = text;
  return el;
}

function drawBar(spot: Spot, trail: readonly HTMLElement[]): void {
  const parts = spot.outline.filter((h) => depthOf(h) === 1);
  const kids: HTMLElement[] = [];
  const [part] = trail;
  if (part && depthOf(part) === 1) {
    kids.push(span(`${parts.indexOf(part) + 1} / ${parts.length}`, "here-num"));
  }
  if (trail.length === 0) kids.push(span("the top of the page", "here-none"));
  for (const [i, heading] of trail.entries()) {
    if (i > 0) kids.push(span("›", "here-sep"));
    kids.push(jumpTo(heading, labelOf(heading), `here-crumb depth-${depthOf(heading)}`));
  }
  // At once rather than smoothly: a glide up the page passes every section
  // on the way and the menu would arrive marking the first one.
  kids.push(jumpTo(spot.nav, "↑ CONTENTS", "here-up", "auto"));
  spot.bar.replaceChildren(...kids);
}
