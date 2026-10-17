import type { Selection } from "./selection.js";

/**
 * **The selected cell's panel is a popover on the tile.** The owner, 17
 * October 2026: the lines above the map — a heading naming the beat and the
 * column, the picture and name of what the tile already draws and its
 * tooltip already says, and DELETE — cost every map its first rows, and the
 * fields belong next to the tile they change. So `#cellPanel` floats under
 * the selected tile while the pointer is on the tile or on the panel, and is
 * put away a moment after it leaves both.
 *
 * Not while a button is held: a stroke selects every cell it crosses, and a
 * panel that opened under the pointer would sit on the next row of the
 * stroke. It opens when the press comes up over the selected tile, which is
 * also how a touch screen — with no hover at all — reaches it; there a tap
 * anywhere else is what puts it away.
 *
 * It is placed in `.map-body`'s own coordinates rather than the window's, so
 * it scrolls with the tile it is about instead of staying where the tile was.
 */
export interface CellPopover {
  /** Re-place it after the panel's contents changed: an empty panel is
   * never shown, and a taller one may have to open above the tile. */
  place(): void;
}

/** How long the pointer may be off both the tile and the panel — the gap
 * between them is crossed in that time. */
const LINGER_MS = 280;
/** The space between the tile and the panel. */
const GAP_PX = 4;

export function bindCellPopover(
  panel: HTMLElement,
  grid: HTMLElement,
  selection: Selection,
): CellPopover {
  // `.map-body`, which is positioned for this (`director-brush.css`).
  const host = panel.parentElement;
  let open = false;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const selectedTile = (): HTMLElement | null => {
    const at = selection.at();
    if (!at) return null;
    return grid.querySelector<HTMLElement>(`.cell[data-beat="${at.beat}"][data-col="${at.col}"]`);
  };
  // By beat and column, not by node: a press can re-render the grid under
  // the event it is in the middle of, and the tile it started on is then a
  // node that is no longer in the map.
  const isSelectedTile = (el: EventTarget | null): boolean => {
    const tile = el instanceof Element ? el.closest<HTMLElement>(".cell") : null;
    const at = selection.at();
    return (
      !!tile && !!at && tile.dataset.beat === String(at.beat) && tile.dataset.col === String(at.col)
    );
  };

  const cancel = (): void => {
    if (timer) clearTimeout(timer);
    timer = null;
  };
  const hide = (): void => {
    cancel();
    open = false;
    panel.classList.remove("open");
  };
  const later = (): void => {
    cancel();
    timer = setTimeout(hide, LINGER_MS);
  };

  const place = (): void => {
    const tile = selectedTile();
    if (!open || !tile || !host || panel.childElementCount === 0) {
      panel.classList.remove("open");
      return;
    }
    panel.classList.add("open");
    const box = host.getBoundingClientRect();
    const at = tile.getBoundingClientRect();
    const h = panel.offsetHeight;
    // Under the tile, unless that runs off the bottom of the window and
    // there is room over it.
    const below = at.bottom + GAP_PX + h <= window.innerHeight || at.top - GAP_PX - h < 0;
    const top = below ? at.bottom + GAP_PX : at.top - GAP_PX - h;
    const maxLeft = Math.max(0, host.clientWidth - panel.offsetWidth);
    const left = Math.min(Math.max(0, at.left - box.left + host.scrollLeft), maxLeft);
    panel.style.top = `${top - box.top + host.scrollTop}px`;
    panel.style.left = `${left}px`;
  };

  const show = (): void => {
    cancel();
    open = true;
    place();
  };

  grid.addEventListener("pointerover", (e) => {
    if (e.buttons !== 0 || !isSelectedTile(e.target)) return;
    show();
  });
  grid.addEventListener("pointerout", (e) => {
    if (e.pointerType === "touch" || !isSelectedTile(e.target)) return;
    if (panel.contains(e.relatedTarget as Node | null)) return;
    if (open) later();
  });
  // `click` as well as `pointerup`: a tile selects itself on its click, which
  // comes after the press is up.
  for (const type of ["pointerup", "click"]) {
    grid.addEventListener(type, (e) => {
      if (isSelectedTile(e.target)) show();
    });
  }
  panel.addEventListener("pointerenter", cancel);
  panel.addEventListener("pointerleave", (e) => {
    if (e.pointerType === "touch" || isSelectedTile(e.relatedTarget)) return;
    later();
  });
  // A press anywhere but the panel puts it away: on the map it is the start
  // of a stroke or a new selection, and `pointerup` opens it again there.
  document.addEventListener(
    "pointerdown",
    (e) => {
      if (open && !panel.contains(e.target as Node | null)) hide();
    },
    true,
  );
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && open) hide();
  });
  selection.watch(() => {
    if (!selection.at()) hide();
  });

  return { place };
}
