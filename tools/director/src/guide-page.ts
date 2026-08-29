import { renderGallery } from "./guide-gallery.js";
import { bindOrderPicker } from "./guide-order.js";

/**
 * A GUIDES tab, added to the NOT BUILT YET sheet.
 *
 * A wave's guide is the one drawn thing in the game that is awkward to review
 * on the phone: seeing it means starting the wave it belongs to, and seeing
 * all of them means starting sixteen. This tab exists so a guide can be looked
 * at as many times as the design needs it looked at, and beside every other
 * one.
 *
 * Every picture on it draws through the real `packages/render/src/briefing.ts`
 * against a real `World`, exactly as `pose-art.ts` draws a posed state for the
 * STATES sheet — see `guide-gallery.ts` and `guide-order.ts` for the two
 * questions it puts a picture to.
 *
 * It rides the backlog sheet's own header, close button and Esc handling
 * rather than opening one of its own: that chrome already exists once, on
 * `#backlog`, and a second copy of it here would be a second thing to keep in
 * step with the first. `mountCardTab` only asks the sheet's existing tab bar
 * for one more button, the same way a tenth spec file asks the SPEC tab for
 * one more file rather than a tab of its own.
 *
 * **Nothing here is a proposal any more, and that is why the first section
 * went.** This tab used to lead with the cards no wave could reach — a real
 * gap while help lived in a catalogue beside the waves rather than in them. A
 * guide is written inside the wave that plays it now, so a guide with no wave
 * cannot be expressed; what is left are the two review tools, which are
 * working aids for any guide rather than a listing of unbuilt ones. The list
 * of every guide that ships lives on its own top-level sheet,
 * `guide-sheet.ts`'s `bindCardsPage` — the same shape STATES and CONTROL
 * SETS already use for "built, and here is the proof".
 */

const TAB_ID = "cards";

/**
 * The tab button and its (empty) page, appended before `bindBacklog` calls
 * `bindTabs` over the bar — so a click on GUIDES is wired exactly like a click
 * on BESTIARY or SPEC, by the one place that already knows how a tab behaves.
 */
export function mountCardTab(): void {
  const tabs = document.getElementById("backlogTabs");
  const body = document.getElementById("backlogBody");
  if (!tabs || !body || document.getElementById(`sheet-${TAB_ID}`)) return;

  const tab = document.createElement("button");
  tab.type = "button";
  tab.dataset.tab = TAB_ID;
  tab.textContent = "GUIDES";
  tabs.appendChild(tab);

  const page = document.createElement("div");
  page.className = "sheetpage";
  page.id = `sheet-${TAB_ID}`;

  const intro = document.createElement("p");
  intro.className = "note";
  intro.textContent =
    "A wave opens on its number, its name and its sentence — plain text on the " +
    "field, no panel — and then, if it carries one, on a guide: a concrete " +
    "instruction about the control or the concept the pair is about to meet. " +
    "Each player gets their own half, and neither half is the whole of it.";
  page.appendChild(intro);

  const why = document.createElement("p");
  why.className = "note";
  why.textContent =
    "This page exists because seeing a guide in the game means playing the wave " +
    "it belongs to. Sixteen waves carry one, so checking them on a phone means " +
    "sixteen starts. Here they can be read as often as they need reading.";
  page.appendChild(why);

  const how = document.createElement("p");
  how.className = "note";
  how.textContent =
    "Nothing here is a mock-up. Every frame is drawn by the game's own renderer " +
    "at the phone's real width, so a guide that is too long, too small or " +
    "confusing here is too long, too small or confusing in the game.";
  page.appendChild(how);

  page.appendChild(gallerySection());
  page.appendChild(orderSection());
  body.appendChild(page);
}

function gallerySection(): HTMLElement {
  const section = document.createElement("section");
  const h2 = document.createElement("h2");
  h2.textContent = "EVERY GUIDE, BOTH SCREENS";
  section.appendChild(h2);

  const note = document.createElement("p");
  note.className = "note";
  note.textContent =
    "Both players' screens for the same wave, side by side. Each is missing " +
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
  h2.textContent = "HOW ONE WAVE OPENS, IN ORDER";
  section.appendChild(h2);

  const note = document.createElement("p");
  note.className = "note";
  note.textContent =
    "The two states before the field, as a pair actually meets them: the " +
    "introduction that stands on its own for a few seconds, and then the guide " +
    "that waits for both of them. Above is what exists; this is how much is " +
    "asked of somebody at once.";
  section.appendChild(note);

  const mount = document.createElement("div");
  mount.id = "cardOrderMount";
  section.appendChild(mount);
  return section;
}

let drawn = false;

/**
 * Built on first look at the tab, not on page load — thirty-two posed worlds
 * and their frames is not work a session that came here to place a creature on
 * the grid should pay for. Matches the lazy draw the SHAPES tab already does.
 */
export function drawCards(): void {
  if (drawn) return;
  drawn = true;
  const gallery = document.getElementById("cardGalleryMount");
  if (gallery) gallery.appendChild(renderGallery());
  const order = document.getElementById("cardOrderMount");
  if (order) bindOrderPicker(order);
}
