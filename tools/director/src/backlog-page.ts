/**
 * The backlog page: a full-screen sheet over the editor, listing what the
 * design has agreed to and the game does not have.
 *
 * Full-screen rather than a fourth column, because this is not something you
 * consult while placing a creature — it is what you read *before* deciding
 * what the next wave is for, and a 300 px column is the wrong shape for a
 * paragraph. The stage keeps running behind it.
 *
 * Grouped by what a thing would become — bosses and the rounds beside them,
 * creatures, shapes, mechanics — not by which spec file it was written in.
 * `backlog.ts` does that grouping on the server, out of the spec's own
 * headings.
 */

import { type BacklogEntry, renderEntry } from "./backlog-entry.js";
import { mountLazyTabs } from "./backlog-tabs.js";
import { renderHolders } from "./holders-panel.js";
import { bindOrphans } from "./orphans-panel.js";
import { mountSheet } from "./session.js";
import { renderWholeDoc } from "./whole-doc.js";

interface BacklogGroup {
  title: string;
  note: string;
  entries: BacklogEntry[];
  builtHidden: number;
  /** Where a built one went — see `backlog.ts`; the palette when unsaid. */
  builtWhere?: string;
  /** One column at prose width, every argument open — see `backlog.ts`. */
  reading?: boolean;
}

interface Backlog {
  bosses: BacklogGroup[];
  bestiary: BacklogGroup[];
  mechanics: BacklogGroup[];
  designs: BacklogGroup[];
}

/**
 * One group is one column, kept whole. It used to be poured into CSS columns,
 * which flowed a short group's heading into the first column and its four
 * entries into the second and third — three columns, one of them empty, and no
 * way to tell which heading an entry belonged to.
 */
function renderGroup(container: HTMLElement, group: BacklogGroup): void {
  const section = document.createElement("section");
  if (group.reading) section.className = "reading";

  const h2 = document.createElement("h2");
  h2.textContent = group.title;
  section.appendChild(h2);

  const note = document.createElement("p");
  note.className = "note";
  note.textContent = group.note;
  section.appendChild(note);

  for (const entry of group.entries) section.appendChild(renderEntry(entry, group.reading));

  // Said out loud rather than silently dropped: a group that shows three of
  // thirteen and does not say so reads as a bestiary of three. One sentence
  // when the group is empty — "nothing here" followed by "12 more" counted
  // more than nothing, the day the bestiary's last idea rows were retired.
  const said = document.createElement("p");
  said.className = "note";
  const where = group.builtWhere ?? "the brush palette";
  if (group.entries.length === 0) {
    said.textContent =
      group.builtHidden > 1
        ? `nothing left here — all ${group.builtHidden} are built and in ${where}.`
        : group.builtHidden === 1
          ? `nothing left here — the one it had is built and in ${where}.`
          : "nothing here — all of it is built.";
  } else if (group.builtHidden > 0) {
    said.textContent = `${group.builtHidden} more are built and not listed here — they are in ${where}.`;
  }
  if (said.textContent) section.appendChild(said);

  container.appendChild(section);
}

function fill(id: string, groups: BacklogGroup[]): void {
  const el = document.getElementById(id);
  if (!el) return;
  el.replaceChildren();
  for (const group of groups) renderGroup(el, group);
}

let loaded = false;

async function load(): Promise<void> {
  if (loaded) return;
  const res = await fetch("/api/backlog");
  if (!res.ok) throw new Error(res.statusText);
  const backlog = (await res.json()) as Backlog;

  fill("backlogBosses", backlog.bosses);
  fill("backlogBestiary", backlog.bestiary);
  fill("backlogMechanics", backlog.mechanics);
  fill("backlogDesigns", backlog.designs);
  void renderWholeDoc("borrowedDoc", "/api/borrowed");
  void renderWholeDoc("partyGamesDoc", "/api/party-games");
  renderHolders();
  loaded = true;
}

/**
 * Read on first open, not on page load. The editor's own job is the wave in
 * front of it; six spec files and a catalogue of animated contours are not
 * work a session that never opens this page should pay for.
 */
export function bindBacklog(): void {
  // ORPHANS is its own sheet and header button, not a tab of this one — see
  // `orphans-panel.ts`. Bound alongside the backlog rather than from
  // `main.ts` because this file is where a lane not touching the wave editor
  // proper gets to add a sheet without another file to wire it through.
  bindOrphans();

  const sheet = document.getElementById("backlog");
  const open = document.getElementById("backlogOpen");
  const close = document.getElementById("backlogClose");
  if (!sheet || !open || !close) return;

  // The tabs that cost something to draw are mounted and wired together, in
  // `backlog-tabs.ts` — SHAPES, GUIDES and OTHER GRAPHICS, each drawn on first
  // sight of its own tab rather than on the first open of this sheet.
  mountLazyTabs();

  // `mountSheet` (`session.ts`) wires open/close/Escape/inner-tab and the
  // restoring click to the URL; the load below is this sheet's own `onOpen`.
  mountSheet({ name: "backlog", sheet, open, close, innerBar: "#backlogTabs", onOpen: onceOpen });

  function onceOpen(): void {
    load().catch(() => {
      const failed = document.getElementById("backlogBosses");
      if (!failed) return;
      failed.replaceChildren();
      const msg = document.createElement("p");
      msg.className = "note";
      msg.textContent = "no server — the backlog is read off the spec files, so it needs one.";
      failed.appendChild(msg);
    });
  }
}
