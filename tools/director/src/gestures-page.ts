import { BROWSER_EVENTS, type EventFamily, FAMILY_TITLES } from "./gesture-events.js";
import { eventColour, figureSvg } from "./gesture-figure.js";
import { type Gesture, STATE_TITLES } from "./gesture-types.js";

/**
 * How a gesture is drawn on CONTROLS › ON THE FIELD: a card per gesture, the
 * hand on the glass beside the events it fires, the key to the marks, and the
 * raw events themselves with what an iPhone and an Android do with each.
 *
 * Once the fourth inner tab; since 30 September 2026 the lower half of the
 * one ON THE FIELD page (`field-page.ts`), which says where each card goes.
 * Data: `gesture-catalogue.ts` and `gesture-events.ts`; picture:
 * `gesture-figure.ts`.
 */

export function text(tag: string, content: string, cls?: string): HTMLElement {
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

export function card(g: Gesture): HTMLElement {
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

export function legend(): HTMLElement {
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

export function eventsTable(): HTMLElement {
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
