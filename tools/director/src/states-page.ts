import { poseArt } from "./pose-art.js";
import type { Pose } from "./pose-kit.js";
import { POSE_GROUPS } from "./poses.js";

/**
 * The STATES sheet: every state the game can be held in, drawn.
 *
 * The other two sheets are lists of prose. This one exists because prose is
 * the slowest possible way to learn what something looks like, and most of
 * what the spec argues about is visual — the shield is *passively useless*,
 * one of the queen's two marks is a *lie that looks identical*, a rock full of
 * craters is *no closer to breaking*. Every one of those is a sentence a
 * person has to build a picture from, and two people build two pictures.
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

/** Build the sheet, once. */
export function renderStates(): void {
  if (drawn) return;
  const body = document.getElementById("statesBody");
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

/**
 * Read on first open, like the other two sheets. The editor's own job is the
 * wave in front of it, and sixteen simulated worlds are not work a session
 * that never opens this page should pay for.
 */
export function bindStates(): void {
  const sheet = document.getElementById("states");
  const open = document.getElementById("statesOpen");
  const close = document.getElementById("statesClose");
  if (!sheet || !open || !close) return;

  const show = (on: boolean): void => {
    sheet.classList.toggle("on", on);
    if (on) renderStates();
  };

  open.addEventListener("click", () => show(true));
  close.addEventListener("click", () => show(false));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && sheet.classList.contains("on")) show(false);
  });
}
