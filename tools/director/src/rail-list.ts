import { wavePressure } from "@neon-spore/content";
import type { RowDrag } from "./rail-drag.js";
import { waveGroups } from "./rail-groups.js";
import { waveMarks } from "./rail-marks.js";
import { openButtons } from "./rail-open.js";
import type { Store } from "./state.js";

/**
 * ONE ROW OF THE WAVE LIST, AND WHAT IS ON IT.
 *
 * Split out of `rail.ts` on that file's length limit, which the two ways out
 * of a row pushed it past (`rail-open.ts`). What is here is the drawing alone:
 * which waves a filter left standing is `rail-filter.ts` and `rail-symbols.ts`
 * between them, and the caller hands the answer in; so is which groups are
 * folded (`rail-folds.ts`), and only the fold's own button is drawn here.
 */

/** The groups as the list draws them: which heads are folded, and the press
 * that opens or folds one. Absent, every group is drawn open. */
export interface RowFolds {
  folded(head: number): boolean;
  toggle(head: number): void;
}

/** Draws every row the filter left standing, and answers how many *matched* —
 * which is not how many rows were drawn, for the reason written below. */
export function renderRows(
  list: HTMLElement,
  store: Store,
  passes: (waves: Store["waves"], i: number) => boolean,
  select: (i: number) => void,
  drag?: RowDrag,
  folds?: RowFolds,
): number {
  list.replaceChildren();
  let matched = 0;
  const groups = waveGroups(store.waves);
  for (const [i, wave] of store.waves.entries()) {
    const hit = passes(store.waves, i);
    if (hit) matched++;
    // A variant under a folded head is not drawn — unless it is the wave being
    // edited, for the reason given just below about the filter.
    const head = groups.head[i] ?? -1;
    if (head !== -1 && folds?.folded(head) && i !== store.index) continue;
    // The wave being edited stays in the list whatever the filter says: the
    // whole column beside it is that wave's own fields, and a list that hid
    // the row they belong to would leave the editor pointing at nothing a
    // person can see. Dimmed, so it is plain it is there for that reason and
    // not because it answered.
    if (!hit && i !== store.index) continue;
    const marks = [i === store.index ? "on" : "", hit ? "" : "off-filter"].filter(Boolean);
    const button = document.createElement("button");
    button.type = "button";
    button.className = marks.join(" ");
    const n = document.createElement("span");
    n.className = "n";
    n.textContent = String(i + 1).padStart(2, "0");
    button.append(n);
    // A boss, a panel the pair has not held before, a guide (`rail-marks.ts`).
    button.append(...waveMarks(store.waves, i));
    const name = document.createElement("span");
    name.className = "name";
    name.textContent = wave.name || "— unnamed —";
    button.append(name);
    // Its pressure, at the end of the row, so a block reads as a rising
    // number down the list (`docs/spec/wave-curriculum.md` §5). Nothing on a
    // boss, or on a wave with nothing placed yet.
    const pressure = wavePressure(wave);
    if (pressure !== undefined && wave.entries.length > 0) {
      const p = document.createElement("span");
      p.className = "pressure";
      p.textContent = pressure.toFixed(1);
      button.append(p);
    }
    button.addEventListener("click", () => select(i));
    // A row is the name and the two ways out of it, and the wrapper carries
    // the row's own marks so that everything which reads the list still finds
    // them on the child of `#waveList` rather than one level further in.
    const row = document.createElement("div");
    row.className = ["wave-row", ...marks, head === -1 ? "" : "variant"].filter(Boolean).join(" ");
    row.append(button);
    // The fold stands left of the name (the owner, 16 October 2026), and a
    // row with nothing to fold holds the same width empty, so the names still
    // start in one column. Laid out first by `order` rather than put first,
    // because the name's button is the row's first child to everything that
    // reads the list.
    const size = groups.size[i] ?? 0;
    row.append(size > 0 ? foldButton(i, size, folds) : foldSlot());
    row.append(...openButtons(i, select));
    // Carried to a new place by dragging it (`rail-drag.ts`).
    drag?.bind(row, i);
    list.appendChild(row);
  }
  return matched;
}

/** The empty place a fold takes on a row that has none. */
function foldSlot(): HTMLElement {
  const slot = document.createElement("span");
  slot.className = "fold-slot";
  return slot;
}

/** The press on a head that folds its group away or opens it, with how many
 * waves are under it — so a folded group still says how big it is. */
function foldButton(i: number, size: number, folds: RowFolds | undefined): HTMLButtonElement {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "fold";
  const folded = folds?.folded(i) ?? false;
  button.textContent = `${folded ? "▸" : "▾"} ${size}`;
  button.setAttribute("aria-label", `${folded ? "Open" : "Fold"} the ${size} waves under this one`);
  button.addEventListener("click", (e) => {
    e.stopPropagation?.();
    folds?.toggle(i);
  });
  return button;
}
