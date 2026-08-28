import { BRIEFINGS } from "@neon-spore/content";
import { renderGallery } from "./card-gallery.js";
import { bindOrderPicker } from "./card-order.js";
import { subjectsWithNoWave } from "./card-waves.js";

/**
 * A CARDS tab, added to the NOT BUILT YET sheet.
 *
 * The briefing card is the one drawn thing in the game that cannot be
 * reviewed on the phone itself: the game shows each card exactly once per
 * fresh pair, so seeing it a second time means a reload and seeing all of
 * them means several. This tab exists so a card can be looked at as many
 * times as the design needs it looked at, without a reload standing in for
 * every one of them.
 *
 * Every picture on it draws through the real `packages/render/src/briefing.ts`
 * against a real `World`, exactly as `pose-art.ts` draws a posed state for the
 * STATES sheet — see `card-gallery.ts` and `card-order.ts` for the two
 * questions it puts a picture to.
 *
 * It rides the backlog sheet's own header, close button and Esc handling
 * rather than opening one of its own: that chrome already exists once, on
 * `#backlog`, and a second copy of it here would be a second thing to keep in
 * step with the first. `mountCardTab` only asks the sheet's existing tab bar
 * for one more button, the same way a tenth spec file asks the SPEC tab for
 * one more file rather than a tab of its own.
 *
 * **A card that has a wave is not a proposal any more.** `docs/queue.md`'s
 * card-assignment lane derives, for every subject, the wave that first raises
 * it (`card-waves.ts`'s `cardFirstWave`) — and once that fact exists, showing
 * the card here, under NOT BUILT YET, alongside a genuine proposal like a
 * creature nothing draws yet, is the wrong claim. So this tab now only
 * carries what stays a proposal — a card whose subject no wave reaches — and
 * the two review tools below it, which are working aids for any card rather
 * than a listing of unbuilt ones. Every assigned card moved to its own
 * top-level sheet, `card-catalogue.ts`'s `bindCardsPage` — the same shape
 * STATES and CONTROL SETS already use for "built, and here is the proof" —
 * grouped by the wave that teaches it, which is the fact a reader of the wave
 * list actually wants once they see the new mark `rail.ts` puts there.
 */

const TAB_ID = "cards";

/**
 * The tab button and its (empty) page, appended before `bindBacklog` calls
 * `bindTabs` over the bar — so a click on CARDS is wired exactly like a click
 * on BESTIARY or SPEC, by the one place that already knows how a tab behaves.
 */
export function mountCardTab(): void {
  const tabs = document.getElementById("backlogTabs");
  const body = document.getElementById("backlogBody");
  if (!tabs || !body || document.getElementById(`sheet-${TAB_ID}`)) return;

  const tab = document.createElement("button");
  tab.type = "button";
  tab.dataset.tab = TAB_ID;
  tab.textContent = "CARDS";
  tabs.appendChild(tab);

  const page = document.createElement("div");
  page.className = "sheetpage";
  page.id = `sheet-${TAB_ID}`;

  const intro = document.createElement("p");
  intro.className = "note";
  intro.textContent =
    "A briefing card is how the game teaches a new pair one thing — a creature, " +
    "a control — on the screen just before the wave that needs it. Each player " +
    "gets their own half, and neither half is the whole instruction.";
  page.appendChild(intro);

  const why = document.createElement("p");
  why.className = "note";
  why.textContent =
    "This page exists because the game will only show you a card once. A fresh " +
    "pair meets each one on its wave and never again, so checking a card on a " +
    "phone means starting a run over, and checking all of them means starting " +
    "over several times. Here they can be read as often as they need reading.";
  page.appendChild(why);

  const how = document.createElement("p");
  how.className = "note";
  how.textContent =
    "Nothing here is a mock-up. Every frame is drawn by the game's own renderer " +
    "at the phone's real width, so a card that is too long, too small or " +
    "confusing here is too long, too small or confusing in the game.";
  page.appendChild(how);

  page.appendChild(unassignedSection());
  page.appendChild(gallerySection());
  page.appendChild(orderSection());
  body.appendChild(page);
}

/**
 * The one thing left that is genuinely "not built yet": a card whose subject
 * `cardFirstWave` cannot find in any wave. Empty is the expected state — see
 * `test/card-waves.test.ts` for what pins that down — and reads the same way
 * every other empty backlog group already does (`backlog-page.ts`'s own
 * "nothing here — all of it is built.").
 */
function unassignedSection(): HTMLElement {
  const section = document.createElement("section");
  const h2 = document.createElement("h2");
  h2.textContent = "NOT REACHED BY ANY WAVE";
  section.appendChild(h2);

  const orphans = subjectsWithNoWave();
  const note = document.createElement("p");
  note.className = "note";
  note.textContent =
    orphans.length === 0
      ? "nothing here — every card is reached by some wave. The assigned list is under 🗎 CARDS."
      : `${orphans.length} card${orphans.length === 1 ? "" : "s"} name something no wave contains: ` +
        `${orphans.map((id) => `${BRIEFINGS[id].title} (${id})`).join(", ")}.`;
  section.appendChild(note);
  return section;
}

function gallerySection(): HTMLElement {
  const section = document.createElement("section");
  const h2 = document.createElement("h2");
  h2.textContent = "EVERY CARD, BOTH SCREENS";
  section.appendChild(h2);

  const note = document.createElement("p");
  note.className = "note";
  note.textContent =
    "Both players' screens for the same subject, side by side. Each is missing " +
    "what the other has, on purpose — that is what makes them talk. Read the " +
    "two together: do they add up to one instruction, or does a pair holding " +
    "these two screens still not know what to do?";
  section.appendChild(note);

  const mount = document.createElement("div");
  mount.id = "cardGalleryMount";
  section.appendChild(mount);
  return section;
}

function orderSection(): HTMLElement {
  const section = document.createElement("section");
  const h2 = document.createElement("h2");
  h2.textContent = "A WAVE'S OWN CARDS, IN ORDER";
  section.appendChild(h2);

  const note = document.createElement("p");
  note.className = "note";
  note.textContent =
    "The same cards, but as a pair actually meets them: one wave, everything " +
    "that wave introduces, in the order it comes and with the counter they " +
    'will see ("NEW — 2 TO READ", then "NEW"). Above is what exists; this ' +
    "is how much is asked of somebody at once.";
  section.appendChild(note);

  const mount = document.createElement("div");
  mount.id = "cardOrderMount";
  section.appendChild(mount);
  return section;
}

let drawn = false;

/**
 * Built on first look at the tab, not on page load — thirty-eight posed
 * worlds and their frames, twice over for the wave-order section's own
 * cards, is not work a session that came here to place a creature on the
 * grid should pay for. Matches the lazy draw the SHAPES tab already does.
 */
export function drawCards(): void {
  if (drawn) return;
  drawn = true;
  const gallery = document.getElementById("cardGalleryMount");
  if (gallery) gallery.appendChild(renderGallery());
  const order = document.getElementById("cardOrderMount");
  if (order) bindOrderPicker(order);
}
