import { CREATURES, type Wave } from "@neon-spore/content";
import { brushArtImage } from "./brush-art.js";
import { BRUSHES, type Brush } from "./brushes.js";
import { waveMarks } from "./rail-marks.js";
import { type Flag, pairSeconds, type WaveRow, waveRows } from "./waves-table-rows.js";
import { whenSeen } from "./when-seen.js";

/**
 * DOCUMENTATION › WAVES › EVERY WAVE, drawn live — the owner, 15 October
 * 2026: *"every wave" table should help me visually see stuff better*: the
 * rail's own marks for the kind, the brushes' own pictures for what is new,
 * a short panel name, the bosses against their bands in the same rows, a
 * notes column of what is out of range, and the rows folded under their
 * heads the way the wave list folds them (`rail-groups.ts`).
 *
 * The markdown page `bun run waves:measure` writes keeps both of its tables
 * for a reader outside the director; here they are replaced by this one.
 */

const COLUMNS = [
  ["#", "Play order"],
  ["Wave", "Its name; ▸ opens the waves folded under it"],
  ["Kind", "♛ boss, ⎈ a panel, ✎ a guide, ⚠ a fault, ≡ regular"],
  ["New", "What it brings that no wave before it did"],
  ["Panel", "S is STANDARD; hover for the full name"],
  ["Arr.", "Arrivals: entries and pods"],
  ["Span", "Beat of the last arrival"],
  ["AUTO s", "Seconds to a clear field, AUTO on both seats"],
  ["Pair s", "A pair, about: AUTO × 2"],
  ["Press.", "wavePressure: what the hands do"],
  ["Talk", "waveTalk: the facts said aloud in the busiest eight beats"],
  ["Notes", "What is out of range, worst first"],
] as const;

/** The brush that paints a thing `waveIntroduces` names, if one does. */
function brushOf(thing: string): Brush | undefined {
  const brushes = new Set<string>(BRUSHES.map((b) => b.brush));
  // Every speed of rock is the one ROCK brush (`brush-lists.ts`).
  if (/^meteor/.test(thing)) return "rock";
  const fault = /^(.*)Fault$/.exec(thing);
  const id = fault ? `fault:${fault[1]}` : thing;
  if (brushes.has(id)) return id as Brush;
  return thing in CREATURES ? (thing as Brush) : undefined;
}

function newCell(row: WaveRow): HTMLTableCellElement {
  const td = document.createElement("td");
  td.className = "wt-new";
  for (const thing of row.fresh) {
    const chip = document.createElement("span");
    chip.className = "wt-thing";
    chip.title = thing;
    if (thing === "panel") chip.textContent = "⎈";
    else {
      chip.textContent = thing;
      const brush = brushOf(thing);
      if (brush)
        whenSeen(chip, () => {
          const art = brushArtImage(brush, 22);
          if (art) chip.replaceChildren(art);
        });
    }
    td.append(chip);
  }
  return td;
}

function cell(text: string, column: string, flags: readonly Flag[], title = ""): HTMLElement {
  const td = document.createElement("td");
  td.textContent = text;
  const mine = flags.filter((f) => f.column === column);
  if (mine[0]) td.classList.add(`wt-${mine[0].level}`);
  const said = [title, ...mine.map((f) => f.text)].filter(Boolean).join(" — ");
  if (said) td.title = said;
  return td;
}

const num = (n: number | undefined): string => (n === undefined ? "—" : String(n));

export interface WaveTable {
  element: HTMLElement;
}

/**
 * The table, its rows folded under their heads. `onWave` is called with a
 * wave's index when its name is pressed.
 */
export function waveTable(
  waves: readonly Wave[],
  clear: Readonly<Record<string, number>>,
  onWave?: (index: number) => void,
): WaveTable {
  const rows = waveRows(waves, clear);
  const open = new Set<number>();
  const element = document.createElement("div");
  element.className = "wave-table";

  const bar = document.createElement("div");
  bar.className = "wt-bar";
  const all = document.createElement("button");
  all.type = "button";
  const flagged = document.createElement("button");
  flagged.type = "button";
  let onlyFlagged = false;
  bar.append(all, flagged);

  const table = document.createElement("table");
  const head = table.createTHead().insertRow();
  for (const [name, title] of COLUMNS) {
    const th = document.createElement("th");
    th.textContent = name;
    th.title = title;
    head.append(th);
  }
  const body = table.createTBody();
  const trs: HTMLTableRowElement[] = [];
  const toggles = new Map<number, HTMLButtonElement>();

  for (const row of rows) {
    const tr = body.insertRow();
    tr.className = `wt-${row.kind}`;
    if (row.head !== -1) tr.classList.add("wt-child");
    tr.dataset.index = String(row.index);
    const name = document.createElement("td");
    name.className = "wt-name";
    if (row.size > 0) {
      const fold = document.createElement("button");
      fold.type = "button";
      fold.className = "wt-fold";
      fold.addEventListener("click", () => {
        if (open.has(row.index)) open.delete(row.index);
        else open.add(row.index);
        paint();
      });
      toggles.set(row.index, fold);
      name.append(fold);
    }
    const label = document.createElement(onWave ? "button" : "span");
    label.className = "wt-label";
    label.textContent = row.wave.name;
    if (onWave) label.addEventListener("click", () => onWave(row.index));
    name.append(label);
    const kind = document.createElement("td");
    kind.className = "wt-kind";
    kind.append(...waveMarks(waves, row.index));
    if (row.kind === "regular") kind.append("≡");
    if (row.wave.bossType === "special") kind.title = "special boss";
    const notes = document.createElement("td");
    notes.className = "wt-notes";
    if (row.wave.note) {
      const n = document.createElement("span");
      n.className = "wt-note wt-written";
      n.textContent = `✎ ${row.wave.note}`;
      notes.append(n);
    }
    for (const f of row.flags) {
      const n = document.createElement("span");
      n.className = `wt-note wt-${f.level}`;
      n.textContent = f.text;
      notes.append(n);
    }
    tr.append(
      cell(String(row.index + 1), "#", row.flags),
      name,
      kind,
      newCell(row),
      cell(row.panel.short, "panel", row.flags, row.panel.full),
      cell(String(row.arrivals), "arrivals", row.flags),
      cell(String(row.span), "span", row.flags),
      cell(row.clearBeat === -1 ? "fails" : num(row.autoSeconds), "auto", row.flags),
      cell(num(pairSeconds(row)), "pair", row.flags),
      cell(num(row.pressure), "pressure", row.flags),
      cell(num(row.talk), "talk", row.flags),
      notes,
    );
    trs.push(tr);
  }

  const paint = (): void => {
    const heads = rows.filter((r) => r.size > 0);
    const allOpen = heads.every((r) => open.has(r.index));
    all.textContent = allOpen ? "▾ fold all" : "▸ open all";
    flagged.textContent = onlyFlagged ? "show every wave" : "only out of range";
    flagged.classList.toggle("on", onlyFlagged);
    for (const [i, button] of toggles) {
      const size = rows[i]?.size ?? 0;
      button.textContent = `${open.has(i) ? "▾" : "▸"} ${size}`;
    }
    for (const [i, row] of rows.entries()) {
      const tr = trs[i];
      if (!tr) continue;
      const shut = row.head !== -1 && !open.has(row.head);
      const hidden = onlyFlagged ? !row.flags.some((f) => f.level !== "info") : shut;
      tr.hidden = hidden;
    }
  };
  all.addEventListener("click", () => {
    const heads = rows.filter((r) => r.size > 0).map((r) => r.index);
    const allOpen = heads.every((i) => open.has(i));
    open.clear();
    if (!allOpen) for (const i of heads) open.add(i);
    paint();
  });
  flagged.addEventListener("click", () => {
    onlyFlagged = !onlyFlagged;
    paint();
  });
  paint();
  element.append(bar, table);
  return { element };
}
