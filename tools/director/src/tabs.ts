import { standBar } from "./contents-here.js";
import { fillContents } from "./contents-list.js";

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
    const spot = standBar(nav, container);

    fillContents(spot, list);
    // Coalesced to one refill per frame: a page that appends its sections one
    // by one would otherwise rebuild the list once per section.
    let due = false;
    const refill = (): void => {
      if (due) return;
      due = true;
      requestAnimationFrame(() => {
        due = false;
        fillContents(spot, list);
      });
    };
    new MutationObserver(refill).observe(container, { childList: true, subtree: true });
  }
}
