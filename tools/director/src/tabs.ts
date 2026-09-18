/**
 * Buttons carrying `data-tab`, pages with the matching `<prefix><name>` id.
 *
 * The page class and the id prefix are arguments because there are two tab
 * bars now — the authoring rail and the backlog sheet — and a bar that
 * switched *every* `.tabpage` on the document would close the rail behind it
 * every time the sheet changed tab.
 *
 * **`button[data-tab]` and not `button`**, which is the whole of a bug the
 * owner found on 15 September 2026: the wave arrows live in `#tabs` beside
 * the tabs, so every press of one ran this with `dataset.tab` undefined,
 * looked for a page called `tab-undefined`, found none, and turned the open
 * page off. Stepping to the next wave left the editor blank until the tab was
 * pressed again. A bar is allowed to hold something that is not a tab.
 */
export function bindTabs(bar: string, pageClass = "tabpage", prefix = "tab-"): void {
  for (const tab of document.querySelectorAll<HTMLElement>(`${bar} button[data-tab]`)) {
    tab.addEventListener("click", () => {
      // The marking is the tabs' too: `on` on an arrow would draw it as the
      // open page, and taking `on` off one would fight whatever else marks it.
      for (const other of document.querySelectorAll(`${bar} button[data-tab]`)) {
        other.classList.toggle("on", other === tab);
      }
      for (const page of document.querySelectorAll(`.${pageClass}`)) {
        page.classList.toggle("on", page.id === `${prefix}${tab.dataset.tab}`);
      }
    });
  }
}

/**
 * `EXPAND ALL` over one panel's detail expanders. The panels are lists first,
 * so every expander opens shut; this is for the other reading, the one where
 * you want the whole of what the spec says about the accepted creatures in
 * one scroll rather than nine clicks.
 */
export function bindExpanders(): void {
  for (const button of document.querySelectorAll<HTMLButtonElement>("button[data-expand]")) {
    const selector = button.dataset.expand;
    if (!selector) continue;
    button.addEventListener("click", () => {
      const open = button.dataset.state !== "open";
      for (const box of document.querySelectorAll<HTMLDetailsElement>(`${selector} details`)) {
        box.open = open;
      }
      button.dataset.state = open ? "open" : "shut";
      button.textContent = open ? "COLLAPSE ALL" : "EXPAND ALL";
    });
  }
}

/**
 * A contents menu on a sheet page that runs past a screen or two: every
 * heading the page already draws, each one a jump to it.
 *
 * The owner asked for it on 15 September 2026, naming NOT BUILT YET and
 * DOCUMENTATION — the two pages you scroll blind. It is mounted by markup, one
 * `<nav class="contents" data-contents="<id>">` standing where the menu should
 * appear and naming the element whose headings it lists, so a new long page
 * gets one by typing a line rather than by being wired through a module.
 *
 * **The list stands open, always.** It began as a button that opened a list,
 * and on 18 September 2026 the owner asked for the list itself, there to be
 * clicked without a press to reveal it first. So there is no opener: the
 * label is a label, and a jump leaves the list where it was.
 *
 * **The list is read off the page, never kept.** The pages under it draw
 * themselves lazily and some of them redraw, so a list made once at binding
 * time would be empty for a page drawn on first sight of its tab and stale
 * after every redraw. A `MutationObserver` on the page refills it each time
 * the page's children change, which is also the whole reason this cannot
 * disagree with what is under it: there is no second list to keep.
 */
export function bindContents(): void {
  for (const nav of document.querySelectorAll<HTMLElement>("nav[data-contents]")) {
    const container = document.getElementById(nav.dataset.contents ?? "");
    if (!container) continue;

    const label = document.createElement("span");
    label.className = "contents-label";
    label.textContent = "CONTENTS";

    const list = document.createElement("ol");
    list.className = "contents-list";
    nav.replaceChildren(label, list);

    fillContents(nav, list, container);
    // Coalesced to one refill per frame: a page that appends its sections one
    // by one would otherwise rebuild the list once per section.
    let due = false;
    const refill = (): void => {
      if (due) return;
      due = true;
      requestAnimationFrame(() => {
        due = false;
        fillContents(nav, list, container);
      });
    };
    new MutationObserver(refill).observe(container, { childList: true, subtree: true });
  }
}

/** The heading levels a sheet page writes its own sections at, shallowest first. */
const HEADINGS = ["H2", "H3", "H4"];

/**
 * The one level of heading that is this page's sections.
 *
 * A page is written at one level and titled at another: a whole document
 * rendered by `markdown.ts` puts its `#` title in an `h3` and every `##`
 * section under it in an `h4`, while the backlog's groups are `h2` with
 * nothing above them. So the level taken is **the shallowest one with more
 * than one heading at it** — which is the sections in both shapes, and never
 * the single title standing over them. A page with one heading in total lists
 * that one rather than nothing.
 */
export function listedHeadings(container: HTMLElement): HTMLElement[] {
  const all: HTMLElement[] = [];
  collectHeadings(container, all);
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

function fillContents(nav: HTMLElement, list: HTMLElement, container: HTMLElement): void {
  const headings = listedHeadings(container);
  list.replaceChildren();

  // Hidden rather than shown empty: the pages here are drawn on first sight
  // of their own tab, and a label over a page with nothing on it yet is not
  // a fault to report — the observer shows it when the page arrives.
  nav.hidden = headings.length === 0;

  for (const [index, heading] of headings.entries()) {
    const item = document.createElement("li");
    const jump = document.createElement("button");
    jump.type = "button";
    jump.textContent = heading.textContent ?? "";

    const where = document.createElement("span");
    where.className = "where";
    where.textContent = whereOnPage(index, headings.length);
    jump.appendChild(where);

    jump.addEventListener("click", () => {
      heading.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    item.appendChild(jump);
    list.appendChild(item);
  }
}
