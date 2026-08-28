import { BRIEFINGS } from "@neon-spore/content";
import type { BriefingId } from "@neon-spore/sim";
import { subjectCardFrame } from "./card-order.js";
import { cardFirstWave, waveLabel } from "./card-waves.js";

/**
 * The CARDS sheet: every assigned card, grouped by the wave that first raises
 * it for a pair playing in order — the documented half `card-page.ts`'s own
 * doc comment promises. Split into its own file once `card-page.ts` (the
 * NOT BUILT YET tab, the other half of the same split) crossed the 250-line
 * limit `packages/sim/test/limits.test.ts` enforces.
 *
 * Built from `cardFirstWave` directly (`card-waves.ts`), so a wave that stops
 * raising a subject — or starts raising a new one — is reflected here without
 * anyone updating a second list. The same derivation is what puts the third
 * mark on a row in `rail.ts`'s wave list.
 */

/**
 * Which cards a session has asked not to draw on this sheet — a preview
 * convenience, `localStorage`, exactly like `BRUSH_HINTS_KEY` in `main.ts`.
 *
 * This is deliberately not the game's own already-seen set
 * (`packages/sim/src/briefing.ts`'s `world.brief.met`): that bitmask is world
 * state because two devices have to agree whether the world ticked, and a
 * restarted wave rebuilds a fresh `World` on purpose so a pair is never
 * re-taught a card mid-run. Here there is one browser and no lockstep to keep
 * — a card hidden from this sheet stays hidden the next time the sheet is
 * opened, or after a reload, because nothing about it is a game rule.
 */
const HIDDEN_KEY = "neon-spore-director-cards-hidden";

function loadHidden(): Set<BriefingId> {
  try {
    const raw = window.localStorage.getItem(HIDDEN_KEY);
    return raw ? new Set(JSON.parse(raw) as BriefingId[]) : new Set();
  } catch {
    return new Set();
  }
}

function saveHidden(hidden: ReadonlySet<BriefingId>): void {
  try {
    window.localStorage.setItem(HIDDEN_KEY, JSON.stringify([...hidden]));
  } catch {
    // Private browsing or a full quota: the toggle still works for this
    // sheet's lifetime, it just does not survive a reload.
  }
}

/**
 * One card, shown by default — the owner's own ask — with a checkbox that
 * hides it and remembers that choice. Unchecking does not remove the row: a
 * card taken out of the preview is still a fact worth seeing was assigned,
 * just not one worth drawing again right now.
 */
function cardBox(id: BriefingId, hidden: Set<BriefingId>): HTMLElement {
  // No class of its own: `subjectCardFrame` already returns a full `.scene`
  // box (shot plus its own title caption), and a second `.scene` wrapped
  // around it would only duplicate that class's width rule.
  const wrap = document.createElement("div");

  const label = document.createElement("label");
  label.className = "seat";
  const box = document.createElement("input");
  box.type = "checkbox";
  box.checked = !hidden.has(id);
  label.append(box, document.createTextNode(" SHOW IN PREVIEW"));

  const paint = (): void => {
    wrap.replaceChildren();
    if (!hidden.has(id)) wrap.appendChild(subjectCardFrame(id, BRIEFINGS[id].title));
    wrap.appendChild(label);
  };
  box.addEventListener("change", () => {
    if (box.checked) hidden.delete(id);
    else hidden.add(id);
    saveHidden(hidden);
    paint();
  });
  paint();
  return wrap;
}

function waveGroup(
  waveIndex: number,
  ids: readonly BriefingId[],
  hidden: Set<BriefingId>,
): HTMLElement {
  const section = document.createElement("section");
  const h2 = document.createElement("h2");
  h2.className = "card-wave-head";
  h2.textContent = waveLabel(waveIndex);
  section.appendChild(h2);

  const row = document.createElement("div");
  row.className = "scenes";
  for (const id of ids) row.appendChild(cardBox(id, hidden));
  section.appendChild(row);
  return section;
}

let cardsSheetDrawn = false;

function renderCardsSheet(): void {
  if (cardsSheetDrawn) return;
  cardsSheetDrawn = true;
  const body = document.getElementById("cardsSheetBody");
  if (!body) return;
  const hidden = loadHidden();

  const byWave = new Map<number, BriefingId[]>();
  for (const [id, waveIndex] of cardFirstWave()) {
    const list = byWave.get(waveIndex) ?? [];
    list.push(id);
    byWave.set(waveIndex, list);
  }

  body.replaceChildren();
  for (const waveIndex of [...byWave.keys()].sort((a, b) => a - b)) {
    body.appendChild(waveGroup(waveIndex, byWave.get(waveIndex)!, hidden));
  }
  if (byWave.size === 0) {
    const empty = document.createElement("p");
    empty.className = "note";
    empty.textContent = "no wave raises a card yet.";
    body.appendChild(empty);
  }
}

export function bindCardsPage(): void {
  const sheet = document.getElementById("cardsSheet");
  const open = document.getElementById("cardsOpen");
  const close = document.getElementById("cardsSheetClose");
  if (!sheet || !open || !close) return;

  const show = (on: boolean): void => {
    sheet.classList.toggle("on", on);
    if (on) renderCardsSheet();
  };

  open.addEventListener("click", () => show(true));
  close.addEventListener("click", () => show(false));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && sheet.classList.contains("on")) show(false);
  });
}
