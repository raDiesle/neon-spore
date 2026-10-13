import { depthOf, isCard, labelOf, markHere, type Spot } from "./contents-here.js";
import { linkButton } from "./section-link.js";

/**
 * What a contents menu lists, and the list itself (`bindContents`, `tabs.ts`,
 * which mounts it and refills it as the page under it redraws).
 *
 * **A page that writes its own outline is listed whole** (13 October 2026,
 * the owner, on CONTROLS › ON THE FIELD: every level of the page in the menu
 * and every one a jump). Its sections are rows, each numbered by where it
 * sits — `2`, `2.1`, `2.1.3` — and the same number is drawn on the heading
 * itself, so the menu and the page say one outline. The cards inside a
 * section — an enemy's or a boss wave's use, a gesture, a decision — are too
 * many to be rows, so they stand as one wrapped line of names under the row
 * of the section they are in, each a jump of its own.
 */

/** The heading levels a sheet page writes its own sections at, shallowest first. */
const HEADINGS = ["H2", "H3", "H4"];

/** A heading that is part of a page's own outline: a section or a card. */
const inOutline = (h: HTMLElement): boolean => !!h.dataset.depth || isCard(h);

/**
 * Every heading the menu lists.
 *
 * A page is written at one level and titled at another: a whole document
 * rendered by `markdown.ts` puts its `#` title in an `h3` and every `##`
 * section under it in an `h4`, while the backlog's groups are `h2` with
 * nothing above them. So the level taken is **the shallowest one with more
 * than one heading at it** — which is the sections in both shapes, and never
 * the single title standing over them. A page with one heading in total lists
 * that one rather than nothing.
 *
 * A page that writes its own outline (`data-depth`, `data-card`,
 * `contents-here.ts`) is taken at its word instead, every level of it,
 * whatever level of heading each is drawn at.
 */
export function listedHeadings(container: HTMLElement): HTMLElement[] {
  const all: HTMLElement[] = [];
  collectHeadings(container, all);
  const outline = all.filter(inOutline);
  if (outline.length > 0) return outline;
  const at = (level: string): HTMLElement[] => all.filter((h) => h.tagName === level);
  for (const level of HEADINGS) if (at(level).length > 1) return at(level);
  for (const level of HEADINGS) if (at(level).length === 1) return at(level);
  return [];
}

/** Every heading under `el`, in the order the page draws them. */
function collectHeadings(el: HTMLElement, into: HTMLElement[]): void {
  for (const child of Array.from(el.children) as HTMLElement[]) {
    if (HEADINGS.includes(child.tagName)) into.push(child);
    collectHeadings(child, into);
  }
}

/**
 * Where on the page an item is, in the words somebody would use out loud.
 *
 * The owner asked the menu to say where a thing is, and a heading's real
 * offset is not it: these pages redraw, and a figure in pixels or a percent
 * read at open time is precise about something nobody is asking. The position
 * through the page's own sections is what a reader wants — whether the jump is
 * a short one or the length of the sheet.
 */
export function whereOnPage(index: number, count: number): string {
  if (count < 2) return "the whole page";
  if (index === 0) return "at the top";
  if (index === count - 1) return "at the end";
  const through = index / (count - 1);
  if (through < 0.34) return "near the top";
  if (through < 0.67) return "halfway down";
  return "near the end";
}

/** Each section's number in its outline, `2.1.3` for the third step of the
 * first section of the second part, in the order given. */
export function outlineNumbers(sections: readonly HTMLElement[]): string[] {
  const counters: number[] = [];
  return sections.map((h) => {
    const depth = depthOf(h);
    counters.length = depth;
    counters[depth - 1] = (counters[depth - 1] ?? 0) + 1;
    return Array.from(counters, (n) => n ?? 0).join(".");
  });
}

function jumpButton(heading: HTMLElement, cls: string): HTMLButtonElement {
  const jump = document.createElement("button");
  jump.type = "button";
  jump.className = cls;
  jump.textContent = labelOf(heading);
  jump.addEventListener("click", () => {
    heading.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  return jump;
}

export function fillContents(spot: Spot, list: HTMLElement): void {
  const { nav, container } = spot;
  const headings = listedHeadings(container);
  const sections = headings.filter((h) => !isCard(h));
  const numbers = outlineNumbers(sections);
  list.replaceChildren();
  list.classList.toggle("outlined", headings.some(inOutline));
  spot.rows.clear();
  spot.outline = sections.filter((h) => h.dataset.depth);
  if (spot.outline.length === 0) spot.outline = sections;

  // Hidden rather than shown empty: the pages here are drawn on first sight
  // of their own tab, and a label over a page with nothing on it yet is not
  // a fault to report — the observer shows it when the page arrives.
  nav.hidden = headings.length === 0;

  let chips: HTMLElement | null = null;
  let depth = 0;
  for (const heading of headings) {
    if (isCard(heading)) {
      if (!chips) {
        chips = document.createElement("li");
        chips.className = `chips at-${depth + 1}`;
        list.appendChild(chips);
      }
      chips.appendChild(jumpButton(heading, `chip chip-${heading.dataset.card}`));
      continue;
    }
    chips = null;
    const index = sections.indexOf(heading);
    depth = depthOf(heading);
    const item = document.createElement("li");
    item.className = `depth-${depth}`;
    const jump = jumpButton(heading, "");
    // The number, drawn by the stylesheet off this attribute so the row's
    // own text stays the heading's — and on the heading too, when the page
    // wrote its outline, so the two say the same thing.
    jump.dataset.num = numbers[index];
    if (heading.dataset.depth) heading.dataset.num = numbers[index];

    const where = document.createElement("span");
    where.className = "where";
    where.textContent = whereOnPage(index, sections.length);
    jump.appendChild(where);

    // A link to this section, to paste elsewhere (`section-link.ts`).
    item.append(jump, linkButton(heading.textContent ?? ""));
    list.appendChild(item);
    spot.rows.set(heading, item);
  }
  spot.drawn = "";
  markHere(spot);
}
