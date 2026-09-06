import { renderGallery } from "./guide-gallery.js";
import { bindOrderPicker } from "./guide-order.js";

/**
 * The two review pictures a finished guide is put to, appended under
 * DOCUMENTATION's GUIDES list — `guide-sheet.ts` owns that tab and calls both
 * functions here.
 *
 * A wave's guide is the one drawn thing in the game that is awkward to review
 * on the phone: seeing it means starting the wave it belongs to, and seeing
 * all of them means starting sixteen. This exists so a guide can be looked at
 * as many times as the design needs it looked at, and beside every other one.
 *
 * Every picture draws through the real `packages/render/src/briefing.ts`
 * against a real `World`, exactly as `pose-art.ts` draws a posed state for the
 * STATES sheet — see `guide-gallery.ts` and `guide-order.ts` for the two
 * questions it puts a picture to.
 *
 * **It was a tab of NOT BUILT YET and is not one any more.** It led, once,
 * with the cards no wave could reach — a real gap while help lived in a
 * catalogue beside the waves rather than in them. A guide is written inside
 * the wave that plays it now, so a guide with no wave cannot be expressed and
 * there is no such thing as a proposed one: what was left were two review
 * tools, entirely about guides that ship, sitting under a heading reading NOT
 * BUILT YET and reading as work nobody got round to. The owner moved them here
 * on 6 September 2026, under the list of the very guides they draw.
 */

/**
 * The prose and the two mounts, appended to whatever container is given. Drawn
 * separately, by `drawGuideReview` — the mounts have to be in the document
 * before thirty-two posed worlds are rendered into them.
 */
export function mountGuideReview(body: HTMLElement): void {
  const intro = document.createElement("p");
  intro.className = "note";
  intro.textContent =
    "A wave opens on its number, its name and its sentence — plain text on the " +
    "field, no panel — and then, if it carries one, on a guide: a concrete " +
    "instruction about the control or the concept the pair is about to meet. " +
    "Each player gets their own half, and neither half is the whole of it.";
  body.appendChild(intro);

  const how = document.createElement("p");
  how.className = "note";
  how.textContent =
    "Nothing below is a mock-up. Every frame is drawn by the game's own renderer " +
    "at the phone's real width, so a guide that is too long, too small or " +
    "confusing here is too long, too small or confusing in the game.";
  body.appendChild(how);

  body.appendChild(gallerySection());
  body.appendChild(orderSection());
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
 * Drawn on first look at the tab, not on page load — thirty-two posed worlds
 * and their frames is not work a session that came here to place a creature on
 * the grid should pay for. `renderGuidesTab` is itself lazy for the same
 * reason, so this runs exactly once, on the first click of GUIDES.
 */
export function drawGuideReview(): void {
  if (drawn) return;
  drawn = true;
  const gallery = document.getElementById("cardGalleryMount");
  if (gallery) gallery.appendChild(renderGallery());
  const order = document.getElementById("cardOrderMount");
  if (order) bindOrderPicker(order);
}
