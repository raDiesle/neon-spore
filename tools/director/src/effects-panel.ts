import { button, el } from "./dom.js";
import { EFFECTS, effectUrl } from "./effects/index.js";
import { openInNewTab } from "./versus-open.js";

/**
 * The EFFECTS view on GRAPHICS: a list of doors, one per kept effect, grouped
 * by the fight it belongs to. Nothing here draws — an effect only reads on its
 * own field at its own rate, so each button opens a page of its own in a new
 * tab (`effects-page.ts`), the way a VERSUS door does, and a list of five costs
 * the browser nothing until one is opened.
 */
export function renderEffects(): void {
  const mount = document.getElementById("effectsList");
  if (!mount) return;
  mount.replaceChildren();

  const groups = [...new Set(EFFECTS.map((e) => e.group))];
  for (const group of groups) {
    mount.appendChild(el("h2", "", group));
    // The LIBRARY's card row, so a door looks like the cards beside it.
    const cards = el("div", "holder-row");
    for (const effect of EFFECTS.filter((e) => e.group === group)) {
      const row = el("div", "plan holder-card");
      const open = button(effect.inGame ? `${effect.label} *` : effect.label, "effects-open");
      open.title = `opens ${effect.label} alone, live, in a new tab`;
      open.addEventListener("click", () => openInNewTab(effectUrl(effect)));
      row.appendChild(open);
      row.appendChild(el("p", "blurb", effect.claim));
      row.appendChild(
        el("p", "note", effect.inGame ? `IN THE GAME — ${effect.note}` : effect.note),
      );
      cards.appendChild(row);
    }
    mount.appendChild(cards);
  }
}
