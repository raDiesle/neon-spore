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
  // Every row drawn, with the head it hangs from (-1 for a head), so the tree's
  // lines can be told where a group ends once the filter and the folds have had
  // their say (`treeEnds`).
  const drawn: { row: HTMLElement; head: number; i: number }[] = [];
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
    // No pressure at the end of the row: the owner, 17 October 2026, *do not
    // show the difficulty number in the wave list*. DOCUMENTATION › WAVES
    // still has it, in its own column.
    button.addEventListener("click", () => select(i));
    // A row is the name and the two ways out of it, and the wrapper carries
    // the row's own marks so that everything which reads the list still finds
    // them on the child of `#waveList` rather than one level further in.
    const row = document.createElement("div");
    row.className = ["wave-row", ...marks, head === -1 ? "" : "variant"].filter(Boolean).join(" ");
    row.append(button);
    // The tree's own column, left of the number: a head's fold, or the line a
    // child hangs from (`director-groups.css`). Laid out first by `order`
    // rather than put first, because the name's button is the row's first
    // child to everything that reads the list. No count beside the fold: the
    // owner, 17 October 2026, and the lines say how big an open group is.
    const size = groups.size[i] ?? 0;
    row.append(
      head !== -1 ? treeSlot("branch") : size > 0 ? foldButton(i, folds) : treeSlot("leaf"),
    );
    row.append(...openButtons(i, select));
    // Carried to a new place by dragging it (`rail-drag.ts`).
    drag?.bind(row, i);
    list.appendChild(row);
    drawn.push({ row, head, i });
  }
  treeEnds(drawn);
  return matched;
}

/**
 * Where each drawn group's lines stop: its last drawn child is `last` (the
 * line turns into it and goes no further), and a head with a child drawn under
 * it is `open` (a line leaves its fold downwards). Read off the rows drawn,
 * not off the groups, because a filter or a fold leaves some out.
 */
function treeEnds(drawn: readonly { row: HTMLElement; head: number; i: number }[]): void {
  for (const [k, { row, head, i }] of drawn.entries()) {
    const next = drawn[k + 1];
    if (head !== -1 && next?.head !== head) row.classList.add("last");
    if (head === -1 && next?.head === i) row.classList.add("open");
  }
}

/** The tree's column on a row with no fold: a child's line, or nothing. */
function treeSlot(kind: "branch" | "leaf"): HTMLElement {
  const slot = document.createElement("span");
  slot.className = `tree ${kind}`;
  return slot;
}

/** The press on a head that folds its group away or opens it. */
function foldButton(i: number, folds: RowFolds | undefined): HTMLButtonElement {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "tree fold";
  const folded = folds?.folded(i) ?? false;
  button.textContent = folded ? "▸" : "▾";
  button.setAttribute("aria-label", `${folded ? "Open" : "Fold"} the waves under this one`);
  button.addEventListener("click", (e) => {
    e.stopPropagation?.();
    folds?.toggle(i);
  });
  return button;
}
