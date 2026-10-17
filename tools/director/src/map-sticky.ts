/**
 * **The top of MAP stays while the map scrolls.** The owner, 16 October 2026:
 * *make "map editor" top controls sticky when I scroll the tiles down.* The
 * row of column numbers went off the top with the first rows, so an author
 * painting beat forty could not read which column a tile was in.
 *
 * Two things stack, each `position: sticky`: MAP's own column head, which
 * carries ⏸/↺ since 17 October 2026 (`director-brush.css`), and the column
 * numbers (`director-map-sticky.css`), which start where the head ends. The
 * head's height is the font's, not a number written anywhere, so it is
 * measured here and handed to the CSS as a property on `#mapCol`. The
 * selected cell's panel is a popover now (`cell-popover.ts`) and takes no
 * place in the stack.
 */
export function bindMapSticky(doc: Document = document): void {
  const col = doc.getElementById("mapCol");
  const head = col?.closest("section")?.querySelector<HTMLElement>(":scope > .column-head");
  if (!col || !head) return;
  const measure = (): void => {
    // The head sticks at minus the section's padding (`top` is negative), so
    // what it covers ends that much short of its own height.
    const top = Number.parseFloat(getComputedStyle(head).top) || 0;
    col.style.setProperty("--map-head-top", `${head.offsetHeight + top}px`);
  };
  new ResizeObserver(measure).observe(head);
  measure();
}

/**
 * How much of the scrolling column the stuck header covers, measured from the
 * column's top — what `grid-follow.ts` has to keep the beat playing below. Zero
 * where the header does not stick (the phone layout).
 */
export function stickyCoverPx(grid: HTMLElement): number {
  const head = grid.querySelector<HTMLElement>(".head");
  if (!head) return 0;
  const style = getComputedStyle(head);
  if (style.position !== "sticky") return 0;
  return (Number.parseFloat(style.top) || 0) + head.offsetHeight;
}
