import type { RowVerbs } from "./grid-rows.js";
import type { Selection } from "./selection.js";

/**
 * The two row verbs as things you can see: a line between two rows that opens
 * a beat where it is drawn, and a trash button at the right end of a row that
 * takes the row out — **and, in the same strip as the trash, the name of any
 * fault that enters on that row**.
 *
 * They were a `+` and a `−` tucked into the beat number's own column, which
 * is where every editor that has them puts them and where the owner never
 * found them. The line is the spreadsheet's answer — you see *where* the new
 * row lands before you commit to it — and the trash is at the other end of
 * the row so the two verbs are never a pixel apart.
 *
 * **They belong to one row at a time**: the row under the pointer, or, when
 * the pointer is off the map altogether, the row of the selected cell — so a
 * tile clicked open for editing keeps its own line above, its line below and
 * its trash, and the hand can leave the map and come back to them.
 *
 * ## Why the rails are positioned the way they are
 *
 * A rail spans the whole row, and the cells of that row are already in it.
 * An ordinary grid item would be placed *around* them; an absolutely
 * positioned child with a `grid-row` is laid out in that row's area and takes
 * no part in placement at all, which is the one arrangement that overlays a
 * row without moving it.
 *
 * The rail itself takes no pointer — a strip across the row that did would
 * swallow the first three pixels of every cell under it. Only the round `+`
 * badge does, and it sits out in the beat-number column where there is
 * nothing to swallow. The line is what the badge means, not what you press.
 */
export interface RowActs {
  /**
   * The last track of this beat's own row: the faults standing on it, named,
   * and the trash that takes the row out.
   *
   * The two are one element because they are one grid cell. The trash comes
   * and goes with the pointer; the name is there as long as the fault is, and
   * a fault is what the author is looking for when they scan the map
   * (`grid-metrics.ts` for why the strip is as wide as it is).
   */
  end(beat: number, faults: readonly string[]): HTMLElement;
  /** This beat's two insert lines, one above the row and one below it. */
  rail(beat: number): HTMLElement;
}

export function bindRowActs(grid: HTMLElement, verbs: RowVerbs, selection: Selection): RowActs {
  let hovered: number | null = null;

  const settle = (): void => {
    const hot = hovered ?? selection.at()?.beat ?? null;
    const want = hot === null ? null : String(hot);
    for (const el of grid.querySelectorAll<HTMLElement>(".rowrail, .rowdel")) {
      el.classList.toggle("hot", want !== null && el.dataset.beat === want);
    }
  };

  // Bound on the grid rather than on a row: every render replaces every
  // element in it, and a listener per row would be rebound thirty times a
  // stroke. The rails carry no pointer, so hovering one reads as the row
  // underneath — which is what it is drawn on.
  grid.addEventListener("pointerover", (e) => {
    const at = beatOf(e.target);
    if (at === hovered) return;
    hovered = at;
    settle();
  });
  grid.addEventListener("pointerleave", () => {
    hovered = null;
    settle();
  });
  selection.watch(settle);

  return {
    end(beat, faults) {
      const strip = document.createElement("div");
      strip.className = "rowend";
      strip.dataset.beat = String(beat);
      if (faults.length > 0) {
        const tag = document.createElement("span");
        tag.className = "rowtag";
        // Joined rather than stacked: two faults entering on one row is rare
        // and the block under the map is what names them properly. What this
        // has to do is say *a fault starts here, and it is this one* without
        // making the row taller than every other row.
        tag.textContent = faults.join("·");
        tag.title = `${faults.join(", ")} — enters on beat ${beat}`;
        strip.appendChild(tag);
      }
      const button = document.createElement("button");
      button.type = "button";
      button.className = "rowdel";
      button.dataset.beat = String(beat);
      button.textContent = "🗑";
      button.title = `Remove beat ${beat}. Every row below moves up one.`;
      button.addEventListener("click", () => verbs.removeRow(beat));
      strip.appendChild(button);
      return strip;
    },
    rail(beat) {
      const rail = document.createElement("div");
      rail.className = "rowrail";
      rail.dataset.beat = String(beat);
      // Row 1 is the column heads, so beat `b` is row `b + 2`. Both lines,
      // not just the first: an absolutely positioned grid child with an
      // `auto` end line is stretched to the container's own padding edge, and
      // a rail that ran to the bottom of the map drew its lower line under
      // the last beat of the wave.
      rail.style.gridRow = `${beat + 2} / ${beat + 3}`;
      rail.style.gridColumn = "1 / -1";
      rail.appendChild(
        insert(
          "above",
          `Add an empty beat above beat ${beat}. This row and every row below move down one.`,
          () => verbs.insertRow(beat),
        ),
      );
      rail.appendChild(
        insert(
          "below",
          `Add an empty beat below beat ${beat}. Every row below moves down one.`,
          () => verbs.insertRow(beat + 1),
        ),
      );
      return rail;
    },
  };
}

/** One insert line: the badge that is pressed, and the line that says where. */
function insert(where: string, title: string, onClick: () => void): HTMLElement {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `ins ${where}`;
  button.title = title;
  const dot = document.createElement("span");
  dot.className = "dot";
  dot.textContent = "+";
  const line = document.createElement("span");
  line.className = "line";
  button.appendChild(dot);
  button.appendChild(line);
  button.addEventListener("click", onClick);
  return button;
}

/** Which row an event happened on, or null for the heads and the gaps. */
function beatOf(target: EventTarget | null): number | null {
  const el = target instanceof Element ? target.closest("[data-beat]") : null;
  const at = el instanceof HTMLElement ? el.dataset.beat : undefined;
  if (at === undefined) return null;
  const beat = Number(at);
  return Number.isFinite(beat) ? beat : null;
}
