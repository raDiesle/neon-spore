/**
 * **The top of MAP stays while the map scrolls.** The owner, 16 October 2026:
 * *make "map editor" top controls sticky when I scroll the tiles down.* The
 * ⏸/↺ bar already stuck; the selected cell's panel and the row of column
 * numbers went off the top with the first rows, so an author painting beat
 * forty could neither read which column a tile was in nor change the cell
 * they had just picked without scrolling back for it.
 *
 * Three things stack, each `position: sticky` (`director-map-sticky.css`), and
 * each has to start where the one above it ends. The heights are not fixed —
 * the cell's panel grows with the fields of whatever is selected — so they
 * are measured here and handed to the CSS as two properties on `#mapCol`
 * rather than written into it as numbers.
 */
export function bindMapSticky(doc: Document = document): void {
  const col = doc.getElementById("mapCol");
  const transport = col?.querySelector<HTMLElement>(".map-transport");
  const panel = doc.getElementById("cellPanel");
  if (!col || !transport || !panel) return;
  const measure = (): void => {
    const cellTop = transport.offsetHeight;
    col.style.setProperty("--map-cell-top", `${cellTop}px`);
    col.style.setProperty("--map-head-top", `${cellTop + panel.offsetHeight}px`);
  };
  new ResizeObserver(measure).observe(transport);
  new ResizeObserver(measure).observe(panel);
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
