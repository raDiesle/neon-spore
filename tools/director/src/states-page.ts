import { poseArt } from "./pose-art.js";
import type { Pose } from "./pose-kit.js";
import { POSE_GROUPS } from "./poses.js";
import { mountSheet } from "./session.js";
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
 * `pose-art.ts` for the scissors.
 *
 * Built on first open and kept. Sixteen posed worlds is sixteen short runs of
 * the simulation and sixteen canvases — nothing to wait for once, and not
 * worth doing again every time the sheet is opened.
 */

const CARD = 210;

function card(pose: Pose): HTMLElement {
  const div = document.createElement("div");
  div.className = "state";

  const frame = document.createElement("div");
  frame.className = "shot";
  try {
    frame.appendChild(poseArt(pose, CARD));
  } catch (e) {
    // A pose that can no longer reach its own state is a caption without a
    // picture, and that is worth seeing rather than hiding: it means the
    // simulation moved and this list did not. `test/poses.test.ts` fails on
    // the same thing, which is where it should be caught first.
    frame.classList.add("is-broken");
    const why = document.createElement("span");
    why.textContent = "✕";
    why.title = e instanceof Error ? e.message : String(e);
    frame.appendChild(why);
  }
  div.appendChild(frame);

  const name = document.createElement("div");
  name.className = "name";
  name.textContent = pose.name;
  div.appendChild(name);

  if (pose.role && pose.role !== "test") {
    const seat = document.createElement("span");
    seat.className = "seat";
    seat.textContent = pose.role === "p1" ? "PILOT'S SCREEN" : "NAVIGATOR'S SCREEN";
    div.appendChild(seat);
  }

  const note = document.createElement("p");
  note.className = "blurb";
  note.textContent = pose.note;
  div.appendChild(note);
  return div;
}

let drawn = false;

/** Build the STATES tab's own cards, once. */
function renderStates(): void {
  if (drawn) return;
  const body = document.getElementById("statesCards");
  if (!body) return;
  drawn = true;
  body.replaceChildren();

  for (const group of POSE_GROUPS) {
    const section = document.createElement("section");

    const h2 = document.createElement("h2");
    h2.textContent = group.title;
    section.appendChild(h2);

    const note = document.createElement("p");
    note.className = "note";
    note.textContent = group.note;
    section.appendChild(note);

    const row = document.createElement("div");
    row.className = "states-row";
    for (const pose of group.poses) row.appendChild(card(pose));
    section.appendChild(row);

    body.appendChild(section);
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
