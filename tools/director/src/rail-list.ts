import { waveMarks } from "./rail-marks.js";
import { openButtons } from "./rail-open.js";
import type { Store } from "./state.js";

/**
 * ONE ROW OF THE WAVE LIST, AND WHAT IS ON IT.
 *
 * Split out of `rail.ts` on that file's length limit, which the two ways out
 * of a row pushed it past (`rail-open.ts`). What is here is the drawing alone:
 * which waves a filter left standing is `rail-filter.ts` and `rail-symbols.ts`
 * between them, and the caller hands the answer in.
 */

/** Draws every row the filter left standing, and answers how many *matched* —
 * which is not how many rows were drawn, for the reason written below. */
export function renderRows(
  list: HTMLElement,
  store: Store,
  passes: (waves: Store["waves"], i: number) => boolean,
  select: (i: number) => void,
): number {
  list.replaceChildren();
  let matched = 0;
  for (const [i, wave] of store.waves.entries()) {
    const hit = passes(store.waves, i);
    if (hit) matched++;
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
    button.append(document.createTextNode(wave.name || "— unnamed —"));
    button.addEventListener("click", () => select(i));
    // A row is the name and the two ways out of it, and the wrapper carries
    // the row's own marks so that everything which reads the list still finds
    // them on the child of `#waveList` rather than one level further in.
    const row = document.createElement("div");
    row.className = ["wave-row", ...marks].join(" ");
    row.append(button, ...openButtons(i, select));
    list.appendChild(row);
  }
  return matched;
}
