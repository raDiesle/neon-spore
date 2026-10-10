import { actionSection, suggested } from "./field-action-cards.js";
import { EVERY_WAVE_ROWS, sortedActions } from "./field-actions.js";
import type { FieldControlDef } from "./field-control-def.js";
import { FIELD_CONTROLS } from "./field-controls-page.js";
import { fieldControlRow } from "./field-controls-rows.js";
import { MARKS } from "./field-looks.js";
import { DECISIONS, ROW_NOTES } from "./field-notes.js";
import { GESTURE_NOTES, TRIED_NOTES } from "./field-notes-gestures.js";
import { GRAB } from "./field-numbers.js";
import { GESTURES } from "./gesture-catalogue.js";
import { type GestureState, STATE_TITLES } from "./gesture-types.js";
import { card, eventsTable, legend, text } from "./gestures-page.js";
import { TRIED_CONTROLS, triedControlRow } from "./tried-controls-page.js";

/**
 * CONTROLS › ON THE FIELD — one page for every touch the field answers and
 * every gesture it could be built from (30 September 2026, the owner: the
 * old ON THE FIELD, TRIED AND SET ASIDE and GESTURES tabs merged).
 *
 * In order: the decisions that cut across types; every action the field
 * answers, most used first, each with its control types and a card per enemy
 * or boss wave that uses it (`field-actions.ts`, 6 October 2026, the owner),
 * each action and type opening on the generic gestures it is made of (9
 * October 2026); the gestures the game does not read, with the controls
 * tried and set aside; and the raw events. Every gesture the game reads is
 * drawn under an action — the last one that was not, TWO THUMBS ON ONE
 * PHONE, the owner ruled out on 10 October 2026, and its part went with it. The rows every wave has are drawn on
 * their own tab, EVERY WAVE, in the long form they always had.
 *
 * The SUGGESTED lines (`field-notes.ts`, `field-notes-gestures.ts`) are
 * proposals for the owner to accept or strike, never a change.
 */

/** A part of the page; its h2 is what the CONTENTS list above it jumps to
 * (`bindContents`, `tabs.ts`).
 *
 * **The page is four parts, numbered, with the sections inside them nested
 * under each** (10 October 2026, the owner: twelve headings at one level, and
 * nothing to say which part of the page a card was in). Each heading says its
 * depth in the outline (`data-depth`, `contents-here.ts`): a part is 1, an
 * action or a group of ideas 2, a control type inside an action 3 — which is
 * what the bar standing at the top of the page names as you scroll. */
interface Part {
  id: string;
  title: string;
}

const PART = {
  decide: { id: "fp-decisions", title: "DECISIONS" },
  answers: { id: "fp-answers", title: "WHAT THE FIELD ANSWERS" },
  ideas: { id: "fp-ideas", title: "NOT USED YET — IDEAS" },
  events: { id: "fp-events", title: "THE RAW EVENTS" },
} satisfies Record<string, Part>;

const IDEA_STATES: readonly GestureState[] = ["specd", "missed"];

function partHead(part: Part, sub: string): HTMLElement {
  const head = document.createElement("div");
  head.className = "field-part depth-1";
  head.id = part.id;
  const h2 = text("h2", part.title);
  h2.dataset.depth = "1";
  // Drawn by the stylesheet, so the heading's text — what CONTENTS lists —
  // stays the part's name.
  h2.dataset.num = String(Object.values(PART).indexOf(part) + 1);
  head.appendChild(h2);
  head.appendChild(text("p", sub, "sub"));
  return head;
}

function decisions(): HTMLElement {
  const box = document.createElement("div");
  box.className = "field-decisions";
  for (const d of DECISIONS) {
    const item = document.createElement("section");
    item.className = "field-decision";
    item.appendChild(text("h3", d.title));
    item.appendChild(text("p", d.text));
    if (d.rows) item.appendChild(text("p", `ROWS · ${d.rows.join(" · ")}`, "rows"));
    box.appendChild(item);
  }
  return box;
}

/** The EVERY WAVE tab: its rows in full, as they were drawn before the
 * sheet was sorted by action. */
function renderEveryWave(byName: ReadonlyMap<string, FieldControlDef>): void {
  const body = document.getElementById("everyWaveBody");
  if (!body) return;
  body.replaceChildren();
  for (const name of EVERY_WAVE_ROWS) {
    const c = byName.get(name);
    if (!c) continue;
    const row = fieldControlRow(c);
    const own = ROW_NOTES[name];
    if (own) row.appendChild(suggested(own));
    body.appendChild(row);
  }
}

function gestureGrid(state: GestureState): HTMLElement {
  const grid = document.createElement("div");
  grid.className = "gesture-grid";
  for (const g of GESTURES.filter((x) => x.state === state)) {
    const c = card(g);
    const note = GESTURE_NOTES[g.name];
    if (note) c.appendChild(suggested(note));
    grid.appendChild(c);
  }
  return grid;
}

function stateHead(state: GestureState): HTMLElement {
  const head = document.createElement("div");
  head.className = `gesture-group state-${state}`;
  head.appendChild(section("h2", STATE_TITLES[state].title));
  head.appendChild(text("p", STATE_TITLES[state].sub, "sub"));
  return head;
}

/** A section's heading inside a part: depth 2 of the outline. */
function section(tag: string, title: string): HTMLElement {
  const h = text(tag, title);
  h.dataset.depth = "2";
  return h;
}

let drawn = false;

/** The whole page, once, behind `renderControlSets`'s own gate: every row
 * poses a world and draws a canvas. */
export function renderFieldPage(): void {
  if (drawn) return;
  const body = document.getElementById("fieldControlsBody");
  if (!body) return;
  drawn = true;
  const byName = new Map(FIELD_CONTROLS.map((c) => [c.name, c]));
  body.replaceChildren();
  renderEveryWave(byName);

  body.appendChild(partHead(PART.decide, "what this page suggests deciding, across types"));
  body.appendChild(decisions());

  body.appendChild(
    partHead(
      PART.answers,
      "every action, most used first: its types, and a card per wave that uses one",
    ),
  );
  body.appendChild(text("p", MARKS, "field-marks"));
  body.appendChild(text("p", GRAB, "field-marks"));
  for (const { action, uses, types } of sortedActions()) {
    body.appendChild(actionSection(action, uses, types, byName));
  }

  body.appendChild(
    partHead(PART.ideas, "gestures nothing reads yet, and controls the game had and set aside"),
  );
  body.appendChild(legend());
  for (const state of IDEA_STATES) {
    // SPECIFIED is empty while the spec asks for nothing unbuilt, and a
    // heading over no cards reads as a page that failed to draw.
    if (!GESTURES.some((g) => g.state === state)) continue;
    body.appendChild(stateHead(state));
    body.appendChild(gestureGrid(state));
  }
  const tried = document.createElement("div");
  tried.className = "gesture-group";
  tried.appendChild(section("h2", "TRIED AND SET ASIDE"));
  tried.appendChild(text("p", "played with once, kept because the owner asked", "sub"));
  body.appendChild(tried);
  for (const c of TRIED_CONTROLS) {
    const row = triedControlRow(c);
    const note = TRIED_NOTES[c.name];
    if (note) row.appendChild(suggested(note));
    body.appendChild(row);
  }

  body.appendChild(
    partHead(PART.events, "what the browser hands the page, and which file of the game listens"),
  );
  body.appendChild(eventsTable());
}
