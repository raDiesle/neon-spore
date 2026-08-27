import { renderGallery } from "./card-gallery.js";
import { bindOrderPicker } from "./card-order.js";

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
    "Every briefing card the game ships, seen the way a fresh pair sees it — " +
    "which the game itself can only do once. Nothing here is a mock-up: each " +
    "frame is the shipping renderer against a real World, at the phone's own " +
    "380 CSS-pixel width, uncapped.";
  page.appendChild(intro);

  page.appendChild(gallerySection());
  page.appendChild(orderSection());
  body.appendChild(page);
}

function gallerySection(): HTMLElement {
  const section = document.createElement("section");
  const h2 = document.createElement("h2");
  h2.textContent = "EVERY CARD, BOTH SCREENS";
  section.appendChild(h2);

  const note = document.createElement("p");
  note.className = "note";
  note.textContent =
    "P1's screen and P2's screen for the same subject, at the same layout: the " +
    "redacted half on one sits beside the plain half it stands for on the " +
    "other, and the two plain halves read side by side as one instruction or " +
    "they do not.";
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
    "Not the catalogue — one wave's real due list, for a pair who has met " +
    "nothing yet, in the order and the count `openBriefings` actually raises " +
    "it. Wave 1 is the one the outstanding check names.";
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
