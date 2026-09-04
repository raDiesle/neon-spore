import { waveGuideFrames } from "./guide-order.js";
import { waveLabel, wavesWithGuides } from "./guide-waves.js";

/**
 * GUIDES: every wave that carries a guide, in the order a pair plays them. A
 * tab of GAME MECHANICS (`states-page.ts` owns the sheet itself) rather than
 * a sheet of its own — one fewer topbar button, the same reasoning DEMOS and
 * TUNING joined that sheet for. Its own file since `guide-page.ts` (the NOT
 * BUILT YET tab, the other half of the same split) crossed the 250-line
 * limit `packages/sim/test/limits.test.ts` enforces.
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
  // `waveGuideFrames` returns full `.scene` boxes (a shot plus its own title
  // caption), one per page, so they go in a `.scenes` row — the same container
  // the ORDER page lays a guide's pages out in.
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
      const row = document.createElement("div");
      row.className = "scenes";
      row.append(...waveGuideFrames(waveIndex, waveLabel(waveIndex)));
      wrap.appendChild(row);
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

let guidesDrawn = false;

function renderGuidesTab(): void {
  if (guidesDrawn) return;
  guidesDrawn = true;
  const body = document.getElementById("guidesBody");
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

/**
 * Lazy like `demo-panel.ts`'s `bindDemoPanel` and `controlsets-page.ts`'s own
 * `bindControlSetsTab`: the list is cheap here, but the tab is still built on
 * first sight of it rather than at load. A restore straight to this tab
 * (`?sheet=states&inner=guides`) fires the same click `mountSheet` already
 * drives for every inner tab — called before `bindStates` in `main.ts`, the
 * same ordering `bindDemoPanel` uses, so that click finds this listener
 * already wired.
 */
export function bindGuidesTab(): void {
  document
    .querySelector<HTMLButtonElement>('#statesTabs button[data-tab="guides"]')
    ?.addEventListener("click", renderGuidesTab);
}
