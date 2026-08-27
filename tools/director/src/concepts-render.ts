/**
 * The CONCEPTS tab: couplings, assist forms, not-yet-built systems and the
 * idea store, next to the creatures and bosses that already have panels.
 * Parsed out of the spec on every request — see concepts.ts.
 */

import { detailBox, inline } from "./markdown.js";

interface ConceptTable {
  headers: string[];
  rows: string[][];
}

interface Concept {
  name: string;
  status: string;
  note: string;
  table: ConceptTable | null;
  detail: string;
  ref: string;
}

interface Idea {
  name: string;
  note: string;
  ref: string;
}

interface ConceptSheet {
  couplings: Concept[];
  assists: Concept[];
  systems: Concept[];
  ideas: Idea[];
  deferred: Idea[];
}

function renderTable(container: HTMLElement, table: ConceptTable): void {
  const el = document.createElement("table");
  el.className = "concept-table";

  const thead = document.createElement("thead");
  const headRow = document.createElement("tr");
  for (const h of table.headers) {
    const th = document.createElement("th");
    th.textContent = h;
    headRow.appendChild(th);
  }
  thead.appendChild(headRow);
  el.appendChild(thead);

  const tbody = document.createElement("tbody");
  for (const row of table.rows) {
    const tr = document.createElement("tr");
    for (const cell of row) {
      const td = document.createElement("td");
      inline(td, cell);
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
  el.appendChild(tbody);
  container.appendChild(el);
}

function renderConceptGroup(container: HTMLElement, items: Concept[]): void {
  for (const item of items) {
    const div = document.createElement("div");
    div.className = "concept";

    const name = document.createElement("span");
    name.className = "name";
    name.textContent = item.name;
    div.appendChild(name);

    if (item.status) {
      const status = document.createElement("span");
      status.className = item.status.includes("not built") ? "status" : "status is-built";
      status.textContent = item.status.toUpperCase();
      div.appendChild(status);
    }

    if (item.note) {
      const blurb = document.createElement("p");
      blurb.className = "blurb";
      inline(blurb, item.note);
      div.appendChild(blurb);
    }

    if (item.table) renderTable(div, item.table);

    // The lead sentence answers "what is this"; the section answers "why", and
    // for a coupling the why is the argument the whole control model rests on.
    if (item.detail) div.appendChild(detailBox(item.detail, item.ref));

    container.appendChild(div);
  }
}

function renderIdeaGroup(container: HTMLElement, items: Idea[]): void {
  for (const item of items) {
    const div = document.createElement("div");
    div.className = "idea";

    const name = document.createElement("span");
    name.className = "name";
    name.textContent = item.name;
    div.appendChild(name);

    const blurb = document.createElement("p");
    blurb.className = "blurb";
    inline(blurb, item.note);
    div.appendChild(blurb);

    container.appendChild(div);
  }
}

export async function renderConcepts(): Promise<void> {
  const couplings = document.getElementById("conceptCouplings");
  const assists = document.getElementById("conceptAssists");
  const systems = document.getElementById("conceptSystems");
  const ideas = document.getElementById("conceptIdeas");
  const deferred = document.getElementById("conceptDeferred");
  if (!couplings || !assists || !systems || !ideas || !deferred) return;

  try {
    const res = await fetch("/api/concepts");
    if (!res.ok) throw new Error(res.statusText);
    const sheet = (await res.json()) as ConceptSheet;

    const groups = [couplings, assists, systems, ideas, deferred];
    for (const el of groups) el.replaceChildren();

    renderConceptGroup(couplings, sheet.couplings);
    renderConceptGroup(assists, sheet.assists);
    renderConceptGroup(systems, sheet.systems);
    renderIdeaGroup(ideas, sheet.ideas);
    renderIdeaGroup(deferred, sheet.deferred);
  } catch {
    for (const el of [couplings, assists, systems, ideas, deferred]) {
      el.replaceChildren();
      const msg = document.createElement("p");
      msg.textContent = "no server — read only";
      msg.style.color = "var(--dim)";
      el.appendChild(msg);
    }
  }
}
