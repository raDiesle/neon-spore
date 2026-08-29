import { poseArt } from "./pose-art.js";
import { fresh, type Pose, rock, run } from "./pose-kit.js";
import { POSE_GROUPS } from "./poses.js";
import { mountSheet } from "./session.js";
import { bindTabs } from "./tabs.js";

/**
 * GAME MECHANICS: the topbar's four reference doors — STATES, CONTROL SETS,
 * SHIP and DEMOS — folded into one full-screen sheet, plus TUNING out of the
 * wave panel, one tab per room. This file owns the sheet itself (the tab bar,
 * the open/close/Escape wiring, and the lazy renders the other three rooms
 * need); `controlsets-page.ts`, `ship.ts` and `demo-panel.ts` still own what
 * each room draws. See `docs/queue.md`'s `claude/burn-topbar-fold` entry.
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

/**
 * ONE ROCK, THREE TICKS: the falling shadow's own stages, side by side.
 *
 * `docs/queue.md`'s `claude/burn-shadow-states` entry: the owner FAILed the
 * shadow with "i still dont see it" and asked for exactly this — the same
 * rock near the top of its fall, at the window's midpoint, and at contact, in
 * one row, so a working effect proves itself and a broken one is caught by
 * the same picture. `poses-mechanics.ts` is outside this lane's paths, so
 * these three are built straight off `pose-kit.ts`'s own exports rather than
 * added to `MECHANIC_POSES`.
 *
 * The ticks are read off a probe run of the real simulation, not guessed —
 * `fresh([rock(SHADOW_COL)])` stepped one tick at a time and its beat
 * boundaries logged. That run turned up the reason "at contact" cannot mean
 * what `contact-shadow.ts`'s own `t === 1` means: `resolveHull` removes a
 * falling body the same tick its row would reach the hull, before that beat
 * ever interpolates a frame there. The rock's last drawn row is always one
 * short of the hull — tick 1124 here, row 13 of 14, `t ≈ 0.667` by
 * `contact-shadow.ts`'s own formula — and there is no tick at which the
 * shadow's darkest, tightest, centred state is ever on screen. The three
 * ticks below are what the game actually draws: entering the lead window,
 * the window's own midpoint (`t ≈ 0.5`), and that last tick before the rock
 * is gone.
 */
const SHADOW_COL = 5;
const SHADOW_TICKS: ReadonlyArray<readonly [name: string, note: string, tick: number]> = [
  ["ENTERING", "Just inside the lead window — the shadow has only begun to gather.", 1013],
  ["HALFWAY", "The window's own midpoint, t ≈ 0.5 by contact-shadow.ts's own formula.", 1088],
  [
    "AT CONTACT",
    "The last tick the rock exists, t ≈ 0.667. resolveHull removes it the instant its row would reach the hull, one tick before the shadow's own formula ever reaches t = 1.",
    1124,
  ],
];

function shadowPose(name: string, note: string, tick: number): Pose {
  return {
    name: `SHADOW · ${name}`,
    note,
    crop: "ship",
    build: () => {
      const w = fresh([rock(SHADOW_COL)]);
      run(w, tick);
      return w;
    },
  };
}

const SHADOW_POSES: Pose[] = SHADOW_TICKS.map(([name, note, tick]) => shadowPose(name, note, tick));

function shadowSection(): HTMLElement {
  const section = document.createElement("section");

  const h2 = document.createElement("h2");
  h2.textContent = "FALLING SHADOW";
  section.appendChild(h2);

  const note = document.createElement("p");
  note.className = "note";
  note.textContent = "one rock, three ticks — docs/queue.md's claude/burn-shadow-states check";
  section.appendChild(note);

  const row = document.createElement("div");
  row.className = "states-row";
  for (const pose of SHADOW_POSES) row.appendChild(card(pose));
  section.appendChild(row);

  return section;
}

let drawn = false;

/** Build the STATES tab's own cards, once. */
export function renderStates(): void {
  if (drawn) return;
  const body = document.getElementById("statesCards");
  if (!body) return;
  drawn = true;
  body.replaceChildren();

  body.appendChild(shadowSection());

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
 * Wires the sheet itself: the tab bar (`#statesTabs`, the same shape
 * `#backlogTabs` already has) and the open/close/Escape/inner-tab plumbing
 * `mountSheet` gives every such sheet. STATES is drawn eagerly on first open
 * — it is the default tab — the same way it always was; sixteen simulated
 * worlds are not work a session that never opens this page should pay for,
 * but they are work every session that does open it pays for once. The other
 * three rooms bind their own lazy renders to their own tab buttons —
 * `controlsets-page.ts`'s `bindControlSetsTab`, `demo-panel.ts`'s
 * `bindDemoPanel` — for the same reason `backlog-page.ts` defers SHAPES,
 * CARDS and VERSUS: a room nobody has clicked yet should cost nothing.
 */
export function bindStates(): void {
  const sheet = document.getElementById("states");
  const open = document.getElementById("statesOpen");
  const close = document.getElementById("statesClose");
  if (!sheet || !open || !close) return;

  bindTabs("#statesTabs", "sheetpage", "mech-");

  mountSheet({ name: "states", sheet, open, close, innerBar: "#statesTabs", onOpen: renderStates });
}

/**
 * Closes GAME MECHANICS the same way its own CLOSE button would — a real
 * click, so the URL place clears the same way it does for any other close.
 * DEMOS calls this once a demo is picked: there is no sheet of its own left
 * for it to close, only this one's DEMOS tab.
 */
export function closeMechanicsSheet(): void {
  const close = document.getElementById("statesClose");
  if (close instanceof HTMLElement) close.click();
}
