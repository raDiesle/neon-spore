import { POSE_CATEGORIES } from "./poses.js";
import { mountSheet } from "./session.js";
import { section } from "./states-section.js";
import { bindTabs } from "./tabs.js";
import { renderWordings } from "./wordings-page.js";

/**
 * DOCUMENTATION: the topbar's reference doors folded into one full-screen
 * sheet, one tab per room. This file owns the sheet itself — the tab bar and
 * the open/close/Escape wiring — and `wordings-page.ts`, `controlsets-page.ts`
 * and `style-page.ts` own what each of the other rooms draws.
 *
 * **It is four rooms now, and every one of them is reference.** The owner took
 * GUIDES, SPEC and DEMOS off on 14 September 2026 and moved TUNING out to a
 * topbar button of its own, taking SHIP's dials with it: TUNING was the one
 * room here that changed the run rather than describing it, which the note
 * above `#mech-tuning` used to apologise for. WORDINGS leads what is left,
 * because what a thing is *called* is the first question anybody brings to a
 * reference sheet and every other room answers a later one.
 *
 * STATES is the room this file draws directly: every state the game can be
 * held in. The other three sheets used to be lists of prose; this one exists
 * because prose is the slowest possible way to learn what something looks
 * like, and most of what the spec argues about is visual — the shield is
 * *passively useless*, one of the queen's two marks is a *lie that looks
 * identical*, a rock full of craters is *no closer to breaking*. Every one of
 * those is a sentence a person has to build a picture from, and two people
 * build two pictures.
 *
 * So each row is a real frame of the shipping renderer against a real world
 * that was run into that state, cut down to the part of the phone it is about.
 * See `pose-kit.ts` for why it is a run rather than a screenshot, and
 * `pose-art.ts` for the scissors, and `states-section.ts` for one group's row.
 *
 * Built on first open and kept. Sixteen posed worlds is sixteen short runs of
 * the simulation and sixteen canvases — nothing to wait for once, and not
 * worth doing again every time the sheet is opened.
 */

let drawn = false;

/** Build the STATES tab's own cards, once. */
function renderStates(): void {
  if (drawn) return;
  const body = document.getElementById("statesCards");
  if (!body) return;
  drawn = true;
  body.replaceChildren();

  // A category is an `h1`: the contents menu lists the shallowest heading
  // level with more than one entry (`tabs.ts` `listedHeadings`), and the
  // groups are what a reader jumps to — two category rows would hide them.
  for (const category of POSE_CATEGORIES) {
    const block = document.createElement("div");
    block.className = "states-category";

    const head = document.createElement("h1");
    head.textContent = category.title;
    block.appendChild(head);

    const what = document.createElement("p");
    what.className = "note";
    what.textContent = category.note;
    block.appendChild(what);

    for (const group of category.groups) block.appendChild(section(group));
    body.appendChild(block);
  }
}

/** The STATES room's own lazy render, bound with the rest of them
 * (`documentation-rooms.ts`). It stopped being the room the sheet opens on
 * when WORDINGS took that place, and a room nobody has clicked should cost
 * nothing: sixteen posed worlds is sixteen short runs of the simulation. */
export function bindStatesTab(): void {
  document
    .querySelector<HTMLButtonElement>('#statesTabs button[data-tab="states"]')
    ?.addEventListener("click", renderStates);
}

/**
 * Wires the sheet itself: the tab bar (`#statesTabs`, the same shape
 * `#backlogTabs` already has) and the open/close/Escape/inner-tab plumbing
 * `mountSheet` gives every such sheet.
 *
 * **The room the sheet opens on is drawn eagerly, and that is WORDINGS now.**
 * It is the default tab, so nothing would ever click it; the other three bind
 * their own lazy renders to their own tab buttons, for the same reason
 * `backlog-page.ts` defers SHAPES, CARDS and VERSUS — a room nobody has
 * clicked yet should cost nothing. STATES was the eager one until 14 September
 * 2026 and is one of the three now (`bindStatesTab` above).
 */
export function bindStates(): void {
  const sheet = document.getElementById("states");
  const open = document.getElementById("statesOpen");
  const close = document.getElementById("statesClose");
  if (!sheet || !open || !close) return;

  bindTabs("#statesTabs", "sheetpage", "mech-");

  mountSheet({
    name: "states",
    sheet,
    open,
    close,
    innerBar: "#statesTabs",
    onOpen: renderWordings,
  });
}
