/**
 * RELEASE NOTES — what landed on `main`, newest first, and nothing to answer.
 *
 * The sheet TO CHECK used to occupy, with every control taken off it. There is
 * no ▶ RUN, no ✓ TESTED, no ✗ FAILED and no 🗑 DELETE, and the header button
 * carries no count: a count is a way of saying something is waiting, and
 * nothing here is. It is read when somebody wants to know what changed, and not
 * otherwise — which is the only way a list like this survives.
 *
 * Read on open rather than at load, so it is current after a landing without
 * the page being reloaded. A static build answers the same path with a file
 * baked at build time; the fetch does not know the difference.
 */

import { byDay, type Note } from "./notes.js";

function el(tag: string, cls = "", text = ""): HTMLElement {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text) node.textContent = text;
  return node;
}

function renderNote(note: Note): HTMLElement {
  const row = el("div", "note-entry");
  const head = el("div", "note-head");
  head.appendChild(el("span", "sha", note.sha));
  head.appendChild(el("span", "subject", note.subject));
  row.appendChild(head);
  if (note.summary) row.appendChild(el("p", "note-what", note.summary));
  return row;
}

function renderNotes(body: HTMLElement, notes: readonly Note[]): void {
  body.replaceChildren();
  if (notes.length === 0) {
    body.appendChild(
      el("p", "note", "nothing yet — bun run land writes an entry every time main moves."),
    );
    return;
  }
  for (const day of byDay(notes)) {
    body.appendChild(el("div", "note-day", day.date));
    for (const note of day.notes) body.appendChild(renderNote(note));
  }
}

export function bindNotes(): void {
  const sheet = document.getElementById("notes");
  const open = document.getElementById("notesOpen");
  const close = document.getElementById("notesClose");
  const body = document.getElementById("notesBody");
  if (!sheet || !open || !close || !body) return;

  const show = async (on: boolean): Promise<void> => {
    sheet.classList.toggle("on", on);
    if (!on) return;
    try {
      const res = await fetch("/api/notes");
      const view = (await res.json()) as { notes?: Note[] };
      renderNotes(body, view.notes ?? []);
    } catch {
      body.replaceChildren(el("p", "note", "could not read docs/release-notes.md"));
    }
  };

  open.addEventListener("click", () => void show(true));
  close.addEventListener("click", () => void show(false));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && sheet.classList.contains("on")) void show(false);
  });
}
