import type { RowVerbs } from "./grid-rows.js";

/**
 * **Many rows out at once**: press the trash, drag up or down along the trash
 * column, let go — the rows between are marked, and a press on any trash
 * inside the mark takes them all. The owner asked for it on 25 September
 * 2026, in the same breath as taking the question out of a removal.
 *
 * A press that does not move is the one-row trash it always was, gone at once.
 * A mark is let go of by pressing anywhere else, by `Escape`, or by any
 * redraw of the map: rows shift under an edit, and a mark that stayed put
 * while they moved would take the wrong ones.
 *
 * The row under the pointer is read from the point rather than from the
 * element an event lands on: a touch holds its pointer to the element it
 * started on, so on a phone nothing else would ever hear the drag.
 */
interface Span {
  from: number;
  to: number;
}

export function bindRowMark(grid: HTMLElement, verbs: RowVerbs): void {
  let anchor: number | null = null;
  let head = 0;
  let span: Span | null = null;
  let band: HTMLElement | null = null;
  // Set by a drag, so the click that ends it takes nothing.
  let dragged = false;

  const live = (): Span | null => (span && band?.isConnected ? span : null);

  const draw = (at: Span | null, settled: boolean): void => {
    band?.remove();
    band = null;
    for (const el of grid.querySelectorAll(".rowdel.doomed")) el.classList.remove("doomed");
    if (!at) return;
    for (const el of grid.querySelectorAll<HTMLElement>(".rowdel")) {
      const b = Number(el.dataset.beat);
      if (b >= at.from && b <= at.to) el.classList.add("doomed");
    }
    band = document.createElement("div");
    band.className = "rowmark";
    // Row 1 is the column heads, so beat `b` is row `b + 2` (`grid-row-acts.ts`).
    band.style.gridRow = `${at.from + 2} / ${at.to + 3}`;
    band.style.gridColumn = "1 / -1";
    const n = at.to - at.from + 1;
    if (settled && n > 1) {
      const say = document.createElement("span");
      say.className = "say";
      say.textContent = `${n} beats · press 🗑 to remove`;
      band.appendChild(say);
    }
    grid.appendChild(band);
  };

  const clear = (): void => {
    span = null;
    draw(null, false);
  };

  const beatAt = (x: number, y: number): number | null => {
    const el = document.elementFromPoint(x, y)?.closest("[data-beat]");
    if (!(el instanceof HTMLElement) || !grid.contains(el)) return null;
    const b = Number(el.dataset.beat);
    return Number.isFinite(b) ? b : null;
  };

  const binOf = (target: EventTarget | null): HTMLElement | null => {
    const el = target instanceof Element ? target.closest(".rowdel") : null;
    return el instanceof HTMLElement ? el : null;
  };

  grid.addEventListener("pointerdown", (e) => {
    dragged = false;
    const bin = binOf(e.target);
    const beat = bin ? Number(bin.dataset.beat) : null;
    const marked = live();
    if (beat === null || e.button !== 0) {
      if (marked) clear();
      return;
    }
    // A press inside the mark is the press that removes it, on the click.
    if (marked && beat >= marked.from && beat <= marked.to) return;
    anchor = beat;
    head = beat;
    span = { from: beat, to: beat };
    draw(span, false);
  });

  window.addEventListener("pointermove", (e) => {
    if (anchor === null) return;
    const at = beatAt(e.clientX, e.clientY);
    if (at === null || at === head) return;
    head = at;
    span = { from: Math.min(anchor, head), to: Math.max(anchor, head) };
    draw(span, false);
  });

  window.addEventListener("pointerup", () => {
    if (anchor === null) return;
    const moved = head !== anchor;
    anchor = null;
    if (moved && span) {
      dragged = true;
      draw(span, true);
    } else clear();
  });

  window.addEventListener("pointercancel", () => {
    if (anchor === null) return;
    anchor = null;
    clear();
  });

  // The click, rather than the release, is what removes: `Enter` on a focused
  // trash arrives as a click with no press before it, and still takes its row.
  grid.addEventListener("click", (e) => {
    const bin = binOf(e.target);
    if (!bin || dragged) {
      dragged = false;
      return;
    }
    const beat = Number(bin.dataset.beat);
    const marked = live();
    clear();
    if (marked && beat >= marked.from && beat <= marked.to)
      verbs.removeRows(marked.from, marked.to);
    else verbs.removeRows(beat, beat);
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && live()) clear();
  });
}
