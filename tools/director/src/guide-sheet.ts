import { waveGuideFrame } from "./guide-order.js";
import { waveLabel, wavesWithGuides } from "./guide-waves.js";

/**
 * The GUIDES sheet: every wave that carries a guide, in the order a pair plays
 * them. Its own file since `guide-page.ts` (the NOT BUILT YET tab, the other
 * half of the same split) crossed the 250-line limit
 * `packages/sim/test/limits.test.ts` enforces.
 *
 * Read straight off `WAVES` (`guide-waves.ts`), so a wave that gains or loses a
 * guide is reflected here without anyone updating a second list. That lookup
 * used to be a replay of the whole campaign against a catalogue of card
 * subjects; a guide belongs to its wave now, so there is nothing left to
 * derive. The same lookup puts the third mark on a row in `rail.ts`.
 */

/**
 * Which guides a session has asked not to draw on this sheet — a preview
 * convenience, `localStorage`, exactly like `BRUSH_HINTS_KEY` in `main.ts`.
 *
 * Nothing about it is a game rule. The game keeps no memory at all of what a
 * pair has read (`packages/sim/src/briefing.ts`): a wave shows its guide on
 * every start, because the director restarts a wave twenty times an afternoon
 * and wants to see it every time. Here there is one browser and no lockstep to
 * keep, so a guide hidden from this sheet stays hidden after a reload.
 */
const HIDDEN_KEY = "neon-spore-director-guides-hidden";

function loadHidden(): Set<number> {
  try {
    const raw = window.localStorage.getItem(HIDDEN_KEY);
    return raw ? new Set(JSON.parse(raw) as number[]) : new Set();
  } catch {
    return new Set();
  }
}

function saveHidden(hidden: ReadonlySet<number>): void {
  try {
    window.localStorage.setItem(HIDDEN_KEY, JSON.stringify([...hidden]));
  } catch {
    // Private browsing or a full quota: the toggle still works for this
    // sheet's lifetime, it just does not survive a reload.
  }
}

/**
 * One guide, shown by default — the owner's own ask — with a checkbox that
 * hides it and remembers that choice. Unchecking does not remove the row: a
 * guide taken out of the preview is still a fact worth seeing exists, just not
 * one worth drawing again right now.
 */
function guideBox(waveIndex: number, hidden: Set<number>): HTMLElement {
  // No class of its own: `waveGuideFrame` already returns a full `.scene` box
  // (shot plus its own title caption), and a second `.scene` wrapped around it
  // would only duplicate that class's width rule.
  const wrap = document.createElement("div");

  const label = document.createElement("label");
  label.className = "seat";
  const box = document.createElement("input");
  box.type = "checkbox";
  box.checked = !hidden.has(waveIndex);
  label.append(box, document.createTextNode(" SHOW IN PREVIEW"));

  const paint = (): void => {
    wrap.replaceChildren();
    if (!hidden.has(waveIndex)) {
      wrap.appendChild(waveGuideFrame(waveIndex, waveLabel(waveIndex)));
    }
    wrap.appendChild(label);
  };
  box.addEventListener("change", () => {
    if (box.checked) hidden.delete(waveIndex);
    else hidden.add(waveIndex);
    saveHidden(hidden);
    paint();
  });
  paint();
  return wrap;
}

function waveGroup(waveIndex: number, hidden: Set<number>): HTMLElement {
  const section = document.createElement("section");
  const h2 = document.createElement("h2");
  h2.className = "card-wave-head";
  h2.textContent = waveLabel(waveIndex);
  section.appendChild(h2);

  const row = document.createElement("div");
  row.className = "scenes";
  row.appendChild(guideBox(waveIndex, hidden));
  section.appendChild(row);
  return section;
}

let guidesSheetDrawn = false;

function renderGuidesSheet(): void {
  if (guidesSheetDrawn) return;
  guidesSheetDrawn = true;
  const body = document.getElementById("cardsSheetBody");
  if (!body) return;
  const hidden = loadHidden();
  const waves = wavesWithGuides();

  body.replaceChildren();
  for (const waveIndex of waves) body.appendChild(waveGroup(waveIndex, hidden));
  if (waves.length === 0) {
    const empty = document.createElement("p");
    empty.className = "note";
    empty.textContent = "no wave carries a guide yet.";
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
    if (on) renderGuidesSheet();
  };

  open.addEventListener("click", () => show(true));
  close.addEventListener("click", () => show(false));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && sheet.classList.contains("on")) show(false);
  });
}
