import { clampWidth, writeWidth } from "./column-width.js";
import { relayout } from "./columns.js";

/**
 * Every top-level column of `<main>` can be dragged wider or narrower by its
 * right-hand edge.
 *
 * The four tracks were tuned in CSS (`main`'s `grid-template-columns`) for one
 * window and one job; an author reading a long brief wants WAVE wide, and one
 * laying out a fourteen-beat map wants BRUSH & MAP wide, and neither of them
 * should have to want it in a stylesheet. A drag writes a pixel width
 * (`column-width.ts`) and `relayout` in columns.ts turns the whole set of
 * widths back into tracks — this module never touches `gridTemplateColumns`
 * itself, so the collapse mechanism and the drag cannot fight over it.
 *
 * The handles are absolutely positioned inside `main` rather than being grid
 * items of their own: an extra track per boundary would have to be threaded
 * through `relayout`'s DOM-order walk, and a handle inside a `<section>` would
 * scroll away with that section's own content. `main` scrolls horizontally, so
 * positioning against its padding box is what keeps a handle on its column's
 * edge at any scroll offset.
 *
 * Double-click gives a column its CSS default back — there is no other way to
 * un-drag one, and hunting for the original pixel width by hand is not it.
 */

/** Phones get one column at a time (`mobile-menu.ts`); there is no boundary
 * between two columns to grab, so no handle is drawn at all. */
const DESKTOP = "(min-width: 701px)";

function place(handles: readonly HTMLElement[], sections: readonly HTMLElement[]): void {
  for (const [i, handle] of handles.entries()) {
    const section = sections[i];
    if (!section) continue;
    handle.style.left = `${section.offsetLeft + section.offsetWidth - 3}px`;
  }
}

/**
 * Adds a drag handle to the right edge of every `<main> > section[data-column]`
 * but the last — the last one has no neighbour to take the space from, and its
 * own right edge is the window's.
 *
 * Call after `initColumns`, which is what wraps a section's children and so
 * decides how wide it measures.
 */
export function initColumnResize(root: ParentNode = document): void {
  const main = root.querySelector("main");
  if (!main) return;
  const sections = Array.from(main.querySelectorAll<HTMLElement>(":scope > section[data-column]"));
  if (sections.length < 2) return;

  const draggable = sections.slice(0, -1);
  const handles: HTMLElement[] = [];

  for (const section of draggable) {
    const id = section.dataset.column;
    if (!id) continue;
    const handle = document.createElement("div");
    handle.className = "column-grip";
    handle.title = "Drag to resize — double-click to reset";
    main.appendChild(handle);
    handles.push(handle);

    handle.addEventListener("pointerdown", (event: PointerEvent) => {
      // A collapsed column is a 36px strip on purpose; widening one would
      // leave a blank box with its body still hidden.
      if (section.classList.contains("collapsed")) return;
      event.preventDefault();
      const startX = event.clientX;
      const startWidth = section.offsetWidth;
      handle.setPointerCapture(event.pointerId);
      handle.classList.add("dragging");
      document.body.classList.add("resizing-columns");

      const move = (e: PointerEvent): void => {
        writeWidth(id, clampWidth(startWidth + (e.clientX - startX)));
        relayout(main);
        place(handles, draggable);
      };
      const stop = (): void => {
        handle.removeEventListener("pointermove", move);
        handle.classList.remove("dragging");
        document.body.classList.remove("resizing-columns");
      };
      handle.addEventListener("pointermove", move);
      handle.addEventListener("pointerup", stop, { once: true });
      handle.addEventListener("pointercancel", stop, { once: true });
    });

    handle.addEventListener("dblclick", () => {
      writeWidth(id, null);
      relayout(main);
      place(handles, draggable);
    });
  }

  const reposition = (): void => {
    const on = matchMedia(DESKTOP).matches;
    for (const handle of handles) handle.style.display = on ? "" : "none";
    if (on) place(handles, draggable);
  };
  reposition();
  // A collapse, a wave switch that lengthens the map, a window resize: all of
  // them move an edge, and a handle left behind is a handle that resizes the
  // wrong column. Each section is observed rather than `main` — `main`'s own
  // box does not change when one of its tracks does.
  const watcher = new ResizeObserver(reposition);
  for (const section of sections) watcher.observe(section);
  addEventListener("resize", reposition);
}
