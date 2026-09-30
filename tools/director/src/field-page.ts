import type { FieldControlDef } from "./field-control-def.js";
import { FIELD_CONTROLS } from "./field-controls-page.js";
import { fieldControlRow } from "./field-controls-rows.js";
import { BOSS_FAMILIES, EVERY_WAVE, type FieldGroup, ONE_CREATURE } from "./field-families.js";
import { DECISIONS, ROW_NOTES } from "./field-notes.js";
import { GESTURE_NOTES, TRIED_NOTES } from "./field-notes-gestures.js";
import { GESTURES } from "./gesture-catalogue.js";
import { type GestureState, STATE_TITLES } from "./gesture-types.js";
import { card, eventsTable, legend, text } from "./gestures-page.js";
import { TRIED_CONTROLS, triedControlRow } from "./tried-controls-page.js";

/**
 * CONTROLS › ON THE FIELD — one page for every touch the field answers and
 * every gesture it could be built from (30 September 2026, the owner: the
 * old ON THE FIELD, TRIED AND SET ASIDE and GESTURES tabs merged).
 *
 * In order: the decisions that cut across families; the generic rows, every
 * wave's and one creature's; each boss's own rows grouped by what the thumb
 * does (`field-families.ts`); the gestures the game reads; the ones it does
 * not, with the controls tried and set aside; and the raw events.
 *
 * Every item carries a SUGGESTED line (`field-notes.ts`,
 * `field-notes-gestures.ts`) — a proposal for the owner to accept or strike,
 * never a change. The rows and cards are drawn by the helpers the old tabs
 * used, so a row here is the row it always was.
 */

/** A part of the page; its h2 is what the CONTENTS list above it jumps to
 * (`bindContents`, `tabs.ts`). */
interface Part {
  id: string;
  title: string;
}

const PART = {
  decide: { id: "fp-decisions", title: "DECISIONS" },
  every: { id: "fp-every", title: "GENERIC — EVERY WAVE" },
  creature: { id: "fp-creature", title: "GENERIC — ONE CREATURE OR WAVE" },
  boss: { id: "fp-boss", title: "BOSS-SPECIFIC" },
  built: { id: "fp-built", title: "GESTURES THE GAME READS" },
  ideas: { id: "fp-ideas", title: "NOT USED YET — IDEAS" },
  events: { id: "fp-events", title: "THE RAW EVENTS" },
} satisfies Record<string, Part>;

const IDEA_STATES: readonly GestureState[] = ["specd", "consider", "missed"];

function suggested(line: string): HTMLElement {
  const p = text("p", "", "suggested");
  p.appendChild(text("b", "SUGGESTED "));
  p.appendChild(document.createTextNode(line));
  return p;
}

function partHead(part: Part, sub: string): HTMLElement {
  const head = document.createElement("div");
  head.className = "field-part";
  head.id = part.id;
  head.appendChild(text("h2", part.title));
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

function group(g: FieldGroup, byName: ReadonlyMap<string, FieldControlDef>): HTMLElement {
  const box = document.createElement("div");
  box.className = `field-group field-group-${g.key}`;
  const h = text("h3", g.title, "field-group-title");
  h.appendChild(text("span", `${g.members.length}`, "count"));
  box.appendChild(h);
  box.appendChild(text("p", g.shared, "shared"));
  box.appendChild(suggested(g.suggest));
  for (const name of g.members) {
    const c = byName.get(name);
    if (!c) continue;
    const row = fieldControlRow(c);
    const own = ROW_NOTES[name];
    row.appendChild(suggested(own ?? `as its family, ${g.title}.`));
    box.appendChild(row);
  }
  return box;
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
  head.appendChild(text("h2", STATE_TITLES[state].title));
  head.appendChild(text("p", STATE_TITLES[state].sub, "sub"));
  return head;
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

  body.appendChild(partHead(PART.decide, "what this page suggests deciding, across families"));
  body.appendChild(decisions());

  body.appendChild(partHead(PART.every, "reached on every wave, whatever the wave is"));
  body.appendChild(group(EVERY_WAVE, byName));
  body.appendChild(partHead(PART.creature, "no boss owns it; one creature or one wave brings it"));
  body.appendChild(group(ONE_CREATURE, byName));

  body.appendChild(
    partHead(
      PART.boss,
      "one boss's own, grouped by what the thumb does — the same verb under two " +
        "bosses' words sits side by side, a candidate for one generic control",
    ),
  );
  for (const g of BOSS_FAMILIES) body.appendChild(group(g, byName));

  body.appendChild(partHead(PART.built, "the vocabulary: every gesture a row above is made of"));
  body.appendChild(legend());
  body.appendChild(gestureGrid("built"));

  body.appendChild(
    partHead(PART.ideas, "gestures nothing reads yet, and controls the game had and set aside"),
  );
  for (const state of IDEA_STATES) {
    body.appendChild(stateHead(state));
    body.appendChild(gestureGrid(state));
  }
  const tried = document.createElement("div");
  tried.className = "gesture-group";
  tried.appendChild(text("h2", "TRIED AND SET ASIDE"));
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
