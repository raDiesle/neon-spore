/**
 * The backlog page: a full-screen sheet over the editor, listing what the
 * design has agreed to and the game does not have.
 *
 * Full-screen rather than a fourth column, because this is not something you
 * consult while placing a creature — it is what you read *before* deciding
 * what the next wave is for, and a 300 px column is the wrong shape for a
 * paragraph. The stage keeps running behind it.
 *
 * Grouped by what a thing would become — creatures, shapes, mechanics,
 * controls, bosses — not by which spec file it was written in. `backlog.ts`
 * does that grouping on the server, out of the spec's own headings.
 */

import { detailBox, inline } from "./markdown.js";
import { renderShapes } from "./shapes-panel.js";
import { hasSilhouette, silhouette } from "./silhouette.js";
import { renderSpec } from "./spec.js";
import { bindTabs } from "./tabs.js";

interface BacklogEntry {
  name: string;
  kind: string;
  note: string;
  detail: string;
  ref: string;
}

interface BacklogGroup {
  title: string;
  note: string;
  entries: BacklogEntry[];
  builtHidden: number;
}

interface Backlog {
  bestiary: BacklogGroup[];
  mechanics: BacklogGroup[];
  controls: BacklogGroup[];
  bosses: BacklogGroup[];
  parked: BacklogGroup[];
}

function renderEntry(item: BacklogEntry): HTMLElement {
  const div = document.createElement("div");
  div.className = "plan";

  const head = document.createElement("div");
  head.className = "head";

  // A shape beside a name means that one is already drawn. Most of this page
  // is names with no picture, which is the whole reason SHAPES sits next to it.
  if (hasSilhouette(item.name)) {
    head.appendChild(silhouette(item.name, "var(--cyan)", 34));
  }

  if (item.name) {
    const name = document.createElement("span");
    name.className = "name";
    name.textContent = item.name;
    head.appendChild(name);
  }

  if (item.kind) {
    const kind = document.createElement("span");
    kind.className = "stamp";
    kind.textContent = /^\d+$/.test(item.kind) ? `ACT ${item.kind}` : item.kind.toUpperCase();
    head.appendChild(kind);
  }
  if (head.childElementCount > 0) div.appendChild(head);

  if (item.note) {
    const blurb = document.createElement("p");
    blurb.className = "blurb";
    inline(blurb, item.note);
    div.appendChild(blurb);
  }

  if (item.detail) div.appendChild(detailBox(item.detail, item.ref));
  return div;
}

/**
 * One group is one column, kept whole. It used to be poured into CSS columns,
 * which flowed a short group's heading into the first column and its four
 * entries into the second and third — three columns, one of them empty, and no
 * way to tell which heading an entry belonged to.
 */
function renderGroup(container: HTMLElement, group: BacklogGroup): void {
  const section = document.createElement("section");

  const h2 = document.createElement("h2");
  h2.textContent = group.title;
  section.appendChild(h2);

  const note = document.createElement("p");
  note.className = "note";
  note.textContent = group.note;
  section.appendChild(note);

  for (const entry of group.entries) section.appendChild(renderEntry(entry));

  if (group.entries.length === 0) {
    const empty = document.createElement("p");
    empty.className = "note";
    empty.textContent = "nothing here — all of it is built.";
    section.appendChild(empty);
  }

  // Said out loud rather than silently dropped: a group that shows three of
  // thirteen and does not say so reads as a bestiary of three.
  if (group.builtHidden > 0) {
    const hidden = document.createElement("p");
    hidden.className = "note";
    hidden.textContent = `${group.builtHidden} more are built and not listed here — they are in the brush palette.`;
    section.appendChild(hidden);
  }

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

  fill("backlogBestiary", backlog.bestiary);
  fill("backlogMechanics", backlog.mechanics);
  fill("backlogControls", backlog.controls);
  fill("backlogBosses", backlog.bosses);
  fill("backlogParked", backlog.parked);
  renderShapes();
  void renderSpec();
  loaded = true;
}

/**
 * Read on first open, not on page load. The editor's own job is the wave in
 * front of it; six spec files and a catalogue of animated contours are not
 * work a session that never opens this page should pay for.
 */
export function bindBacklog(): void {
  const sheet = document.getElementById("backlog");
  const open = document.getElementById("backlogOpen");
  const close = document.getElementById("backlogClose");
  if (!sheet || !open || !close) return;

  bindTabs("#backlogTabs", "sheetpage", "sheet-");

  const show = (on: boolean): void => {
    sheet.classList.toggle("on", on);
    if (!on) return;
    load().catch(() => {
      const failed = document.getElementById("backlogBestiary");
      if (!failed) return;
      failed.replaceChildren();
      const msg = document.createElement("p");
      msg.className = "note";
      msg.textContent = "no server — the backlog is read off the spec files, so it needs one.";
      failed.appendChild(msg);
    });
  };

  open.addEventListener("click", () => show(true));
  close.addEventListener("click", () => show(false));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && sheet.classList.contains("on")) show(false);
  });
}
