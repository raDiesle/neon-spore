import { GESTURES } from "./gesture-catalogue.js";
import { BROWSER_EVENTS, type EventFamily, FAMILY_TITLES } from "./gesture-events.js";
import { eventColour, figureSvg } from "./gesture-figure.js";
import { type Gesture, type GestureState, STATE_TITLES } from "./gesture-types.js";

/**
 * GESTURES — the fourth inner tab of CONTROLS: every gesture a phone can make
 * that this game reads, could read, or has decided not to, each drawn as the
 * hand on the glass beside the events it fires; and under them the raw events
 * themselves, with what an iPhone and an Android do with each.
 *
 * The other three tabs are what the game *has*. This one is what it can be
 * built from, which is why it is not grouped by wave or boss but by where a
 * gesture stands. Data: `gesture-catalogue.ts` and `gesture-events.ts`;
 * picture: `gesture-figure.ts`. Built once, the first time CONTROLS opens.
 */

const ORDER: readonly GestureState[] = ["built", "specd", "consider", "missed"];

function text(tag: string, content: string, cls?: string): HTMLElement {
  const node = document.createElement(tag);
  node.textContent = content;
  if (cls) node.className = cls;
  return node;
}

function row(dl: HTMLElement, term: string, value: string | undefined): void {
  if (!value) return;
  dl.appendChild(text("dt", term));
  dl.appendChild(text("dd", value));
}

function card(g: Gesture): HTMLElement {
  const section = document.createElement("section");
  section.className = `gesture-card state-${g.state}`;
  const h3 = text("h3", g.name);
  h3.appendChild(text("span", STATE_TITLES[g.state].stamp, "stamp"));
  section.appendChild(h3);
  section.appendChild(figureSvg(g));
  const dl = document.createElement("dl");
  row(dl, "DOES", g.does);
  const events = [...new Set(g.timeline.lanes.map((l) => l.event))].join(" · ");
  row(dl, "EVENTS", events);
  row(dl, g.state === "built" ? "WHERE" : "SPEC", g.where?.join(" · "));
  row(dl, "PLATFORM", g.platform);
  row(dl, g.state === "missed" ? "WHY NOT" : "WHY", g.why);
  section.appendChild(dl);
  return section;
}

function legend(): HTMLElement {
  const box = document.createElement("div");
  box.className = "gesture-legend";
  const marks: [string, string][] = [
    ["dot", "a finger on the glass"],
    ["ring", "a finger that stays"],
    ["arrow", "where a finger travels"],
    ["blob", "the body being touched"],
    ["zone", "the OS's own strip"],
  ];
  for (const [cls, what] of marks) {
    const item = document.createElement("span");
    item.appendChild(text("i", "", `mark ${cls}`));
    item.appendChild(document.createTextNode(what));
    box.appendChild(item);
  }
  for (const ev of ["pointerdown", "pointermove", "pointerup", "pointercancel", "devicemotion"]) {
    const item = text("span", ev, "ev");
    item.style.color = eventColour(ev);
    box.appendChild(item);
  }
  box.appendChild(
    text(
      "span",
      "a tick is one event · a bar is a stream · ② is a second finger or the other phone",
      "ev-note",
    ),
  );
  return box;
}

function eventsTable(): HTMLElement {
  const wrap = document.createElement("div");
  wrap.className = "gesture-events";
  const families = [...new Set(BROWSER_EVENTS.map((e) => e.family))] as EventFamily[];
  for (const family of families) {
    wrap.appendChild(text("h4", FAMILY_TITLES[family]));
    const table = document.createElement("table");
    table.className = "md-table";
    const head = document.createElement("tr");
    for (const h of ["EVENT", "FIRES WHEN", "IPHONE", "ANDROID", "THE GAME"])
      head.appendChild(text("th", h));
    table.appendChild(head);
    for (const e of BROWSER_EVENTS.filter((x) => x.family === family)) {
      const tr = document.createElement("tr");
      const name = text("td", e.name, "ev-name");
      name.style.color = eventColour(e.name);
      tr.appendChild(name);
      tr.appendChild(text("td", e.fires));
      tr.appendChild(text("td", e.iphone));
      tr.appendChild(text("td", e.android));
      tr.appendChild(text("td", e.used ?? "—", e.used ? "used" : "unused"));
      table.appendChild(tr);
    }
    wrap.appendChild(table);
  }
  return wrap;
}

let drawn = false;

/** The whole tab, once. */
export function renderGestures(): void {
  if (drawn) return;
  const body = document.getElementById("gesturesBody");
  if (!body) return;
  drawn = true;
  body.replaceChildren(legend());
  for (const state of ORDER) {
    const head = document.createElement("div");
    head.className = `gesture-group state-${state}`;
    head.appendChild(text("h2", STATE_TITLES[state].title));
    head.appendChild(text("p", STATE_TITLES[state].sub, "sub"));
    body.appendChild(head);
    const grid = document.createElement("div");
    grid.className = "gesture-grid";
    for (const g of GESTURES.filter((x) => x.state === state)) grid.appendChild(card(g));
    body.appendChild(grid);
  }
  const events = document.createElement("div");
  events.className = "gesture-group";
  events.appendChild(text("h2", "THE RAW EVENTS"));
  events.appendChild(
    text("p", "what the browser hands the page, and which file of the game listens", "sub"),
  );
  body.appendChild(events);
  body.appendChild(eventsTable());
}
