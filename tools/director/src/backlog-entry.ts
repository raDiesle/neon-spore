/**
 * One card on the NOT BUILT YET page: the name, its frame, the plain-English
 * rows, the draft that was drawn at it, the scene it stands in, and the
 * argument behind an expander.
 *
 * Split out of `backlog-page.ts` on line count, the way `backlog-ideas.ts`
 * sits beside `backlog.ts`. That file is the sheet — what it opens, what it
 * fetches and how a group is laid out; this one is what a single entry looks
 * like.
 */

import { conceptArt, draftFor, hasConceptArt } from "./concept-art.js";
import { detailBox, inline, renderMarkdown } from "./markdown.js";
import { onTheField } from "./scene-box.js";
import { isWide } from "./shape-figure.js";

export interface PlainRow {
  label: string;
  text: string;
}

export interface BacklogEntry {
  name: string;
  kind: string;
  note: string;
  detail: string;
  ref: string;
  /** The spec's "In plain words" rows — see `plain-words.ts`. */
  plain?: PlainRow[];
}

/** A plain-words row that says nothing but "nobody has decided this yet". */
const OPEN_RE = /^not (decided|designed)( yet)?\.?$/i;

export function renderEntry(item: BacklogEntry, reading = false): HTMLElement {
  const div = document.createElement("div");
  div.className = reading ? "plan is-reading" : "plan";

  const head = document.createElement("div");
  head.className = "head";

  // Every named entry gets a frame, filled or empty. It used to get one only
  // where the *spec's* name happened to match a contour the game draws, which
  // on a page of unbuilt things is almost never — so the twenty ideas that do
  // have a shape drawn at them showed nothing, and the shape sat one tab away
  // beside the other shapes instead of beside the idea. `concept-art.ts` is
  // the join, and the empty frame is deliberate: a gap where a picture will go
  // has to look different from a picture that failed to draw.
  //
  // Except in a reading group, where the entry's name is a *sentence* rather
  // than a concept's name — so nothing is ever drawn at it, and seventy-five
  // question marks down the left margin say nothing seventy-five times.
  if (item.name) {
    // The concept's own name, on the row, so a terminal can reach one entry:
    // `bun run shot` presses a CSS selector and a page of a hundred identical
    // `.plan` rows had nothing to tell two of them apart, so a picture of one
    // idea's scene meant counting `details` elements and hoping. Nothing in
    // the page reads it — it is a handle for the outside.
    div.dataset.concept = item.name;
    if (!reading || hasConceptArt(item.name)) head.appendChild(conceptArt(item.name));
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

  // What the thing actually does, in words a person can read once. It sits
  // above the picture and above the expander on purpose: a name and a table
  // cell were all this page used to carry, and "fast switching" tells a reader
  // deciding what to build next nothing about who says what to whom. Open on
  // the page rather than behind the expander for the same reason — four short
  // lines are not a document, they are the entry.
  if (item.plain && item.plain.length > 0) div.appendChild(plainBox(item.plain));

  // Why the shape is *that* shape. A contour drawn at a mechanic is an
  // argument — the Echo is two bodies because the pair never sees one at the
  // same moment — and a picture with the argument left on the other tab is a
  // picture a person has to take on trust.
  const draft = draftFor(item.name);
  if (draft) {
    const why = document.createElement("p");
    // Indented to clear the frame above it, and a long shape gets a wide
    // frame — so the sentence has to know which one it is standing under.
    why.className = isWide(draft) ? "drawn is-wide" : "drawn";
    inline(why, `**${draft.subject.name}**, offered — ${draft.owner}`);
    div.appendChild(why);
  }

  // The shape, and then the *mechanic*. A contour in a 46 px frame says what
  // something looks like and cannot say what it does, and every one of these
  // entries is a behaviour first. `scene-box.ts` opens a real frame of the game
  // with the idea standing in it, at the size a phone would draw it.
  const field = onTheField(item.name);
  if (field) div.appendChild(field);

  // Open on the page in a reading group, behind an expander everywhere else.
  // A list of a hundred entries is scanned, and an expander is right there —
  // but a group somebody reads end to end to decide what is worth doing is
  // that page with its content removed once every box is closed.
  if (item.detail) {
    if (reading) {
      const body = document.createElement("div");
      body.className = "md";
      renderMarkdown(body, item.detail);
      div.appendChild(body);
    } else {
      div.appendChild(detailBox(item.detail, item.ref));
    }
  }
  return div;
}

/**
 * The four short lines: what it does, what each seat does, what is left to
 * decide. A definition list rather than a paragraph, because the whole value
 * of it is that "Player 2" is always in the same place on every card.
 */
function plainBox(rows: PlainRow[]): HTMLElement {
  const dl = document.createElement("dl");
  dl.className = "plainwords";
  for (const row of rows) {
    const dt = document.createElement("dt");
    dt.textContent = row.label;
    const dd = document.createElement("dd");
    inline(dd, row.text);
    // A row whose whole content is "not decided yet" is greyed, so a reader
    // scanning a column of cards sees at a glance which halves of a design are
    // still open. Only the bare disclaimer: a row that says it is not designed
    // and then says what *is* known is carrying an answer, and greying the
    // whole paragraph would hide it.
    if (OPEN_RE.test(row.text.trim())) dd.classList.add("is-open");
    dl.append(dt, dd);
  }
  return dl;
}
