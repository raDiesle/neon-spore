import {
  CONTROL_SETS,
  type ControlDef,
  type ControlSet,
  deskKeys,
  heldBack,
  keyLabel,
  panelForm,
  setControls,
} from "@neon-spore/content";
import { backButton, el, type MenuPage } from "./menu-parts.js";

/**
 * CONTROLS: what a thumb does, then every panel the game has, then the field
 * itself, then the keys.
 *
 * It was a table of keyboard keys called CONTROLS AT A DESK, which is the
 * control scheme almost nobody plays: the game is portrait mobile web and the
 * keys are the rig for one person testing both halves. So the phone comes
 * first and at length, and the desk is the last section on the page.
 *
 * **The panels are read off `CONTROL_SETS`, never typed out here.** A control
 * set is the whole panel for one wave and sets do not compose
 * (`packages/content/src/control-sets.ts`), so the only honest way to say what
 * the game's controls *are* is one block per set with both seats in it — and a
 * hand-typed copy of that is a copy that drifts the first time a round is
 * added. Each control already carries the sentence it does, so this page is
 * the reading and not a second opinion.
 *
 * It hangs off SETTINGS rather than the front page: the keys and the buttons
 * are a thing about this device, and that is where a person looks for one.
 */

/** What a finger does on the band, before any particular panel is named. */
const PHONE: [string, string][] = [
  [
    "THE BAND",
    "The row of controls across the bottom is yours and only yours. In a room each phone draws its own seat's half — the other player's buttons are not there to be pressed by mistake.",
  ],
  [
    "A STRIP",
    "Touch it anywhere and the thing it carries jumps to that column, then follows your thumb along it. It is a place, not a nudge: where the finger is, is where the cannon or the shield stands.",
  ],
  [
    "A LOBE",
    "A round button beside the strip. A tap, and it is over the moment it happens — except the two colours, which are held as well: a thumb that stays on one fills the cannon lobe, and at the top of the fill a lance goes by itself.",
  ],
  [
    "A SLAB",
    "A round's own button, squared off across the seat's width with the band gone. THE GAUGE's two and PINBALL's bucket are held; the rest are taps.",
  ],
  [
    "THE FIELD",
    "Everything above the band answers both of you. Press and hold anything falling and your hand drags at it and slows it, for as long as the finger stays — both screens are told whose hand it is.",
  ],
  [
    "THE SHIP",
    "The two swellings on the hull answer a finger as well as their strips do. Player 1 takes hold of the cannon and slides it — or lets go without carrying it anywhere, which opens the maw — and presses the shield plate to fire the guard where it stands. Player 2 slides that same plate, and takes hold of the muzzle, carries it left for red or right for cyan, and lets go: the shot leaves on the lift, so a hand that comes back to the middle fires nothing. Whichever swelling you have hold of grows a bracket round it while you hold it, with an arrow each side of anything that slides, the maw in its own amber and the guard as a bolt.",
  ],
  [
    "A HANDLE",
    "A cord or a rope hanging over the field is taken hold of and carried, any direction at all. It is asked before whatever is behind it, and you grab it where it rests rather than where it has swung to.",
  ],
  [
    "THE GUIDE",
    "While a wave's guide is up the whole screen is the button. Hold it — the circle fills while the thumb is down and empties if it lifts early, and the wave starts when both of you have held it.",
  ],
  [
    "THE CHIP",
    "The ☰ in the corner is the way back to this menu, and the pause with it. Playing alone it stops the world; in a room it does not, because the tick is the two of you sharing one clock.",
  ],
];

/**
 * The keys that are **nobody's button**, which is the only list this page can
 * type out.
 *
 * Every other key belongs to a *slot* on the panel rather than to a control
 * (`content/src/keys-desk.ts`), so what A or I or Q does is a question about
 * the wave in front of you — and the answer is printed against each panel
 * above, off the same table the keyboard reads. A second copy here would be
 * one more list to keep in step with eleven rounds still to come.
 */
const KEYS: [string, string][] = [
  ["G", "Hold the nearest creature — the grip, as the other player."],
  [", / .", "Carry the held creature a column left or right. Nothing without G held."],
  [
    "W",
    "Fire red and guard in one press, on a panel that has both. Not a button: a shortcut for one person playing two seats.",
  ],
  ["SPACE", "Hold the wave's guide down, both seats at once. F and G hold one seat each."],
  [
    "← / →",
    "The previous and the next wave — except on a panel that walks something across the field, where they are its.",
  ],
  ["P", "Pause."],
  ["ESC", "This menu. It pauses the game while it is up, when you are playing alone."],
];

export function buildControls(show: (page: MenuPage) => void, back: MenuPage): HTMLElement {
  const page = el("div", "page");
  page.append(backButton(show, back), el("h2", undefined, "CONTROLS"));

  page.append(
    el(
      "p",
      "lead",
      "The game is played on a phone held upright, with a thumb. This is what a thumb does.",
    ),
  );
  page.append(rows(PHONE));

  page.append(
    el("h2", undefined, "THE PANELS"),
    el(
      "p",
      "lead",
      "A wave names one panel and that panel is the whole of what both of you have. They do not add up: there is no standard panel with a maw on it, there is a panel with a maw on it and a panel without one.",
    ),
  );
  for (const set of CONTROL_SETS) page.append(panelBlock(set));

  page.append(
    el("h2", undefined, "WHEN A CONTROL BREAKS"),
    el(
      "p",
      "lead",
      "A few waves are played under a malfunction: one of the two controls acts on every beat by itself, and the seat it belonged to cannot use it at all. Nothing stops it. The other seat still has a strip, and the whole answer to the fault is where they decide to stand — pointing the runaway control somewhere it can do no harm, every beat, for the length of the wave.",
    ),
  );

  page.append(el("h2", undefined, "AT A DESK"));
  page.append(
    el(
      "p",
      "lead",
      "One person playing both seats on a keyboard — the rig, not the game. A key belongs to a place on the panel and not to a control, so the same key is the guard on one wave and the arm on the next: A and D carry player 1's sideways thing and J and L player 2's, I and S are player 1's buttons, Q and E are player 2's, and the arrows are whatever a panel walks across the field. Each panel above says which is which. What is left is the handful below, which no panel owns.",
    ),
  );
  const table = el("table", "keys");
  for (const [key, what] of KEYS) {
    const row = el("tr");
    row.append(el("td", undefined, key), el("td", undefined, what));
    table.append(row);
  }
  page.append(table);
  return page;
}

/** A two-column table of name and sentence — the shape the keys already had. */
function rows(list: [string, string][]): HTMLElement {
  const table = el("table", "keys");
  for (const [name, what] of list) {
    const row = el("tr");
    row.append(el("td", undefined, name), el("td", undefined, what));
    table.append(row);
  }
  return table;
}

/**
 * One panel, both seats, in the words the content already carries.
 *
 * `setControls` is the same call the drawing makes, so a seat with nothing on
 * this panel says so rather than being quietly absent — THE FLEET giving the
 * pilot one button and the navigator four arrows is the whole point of that
 * round, and a page that dropped the count would be describing a different
 * game.
 */
function panelBlock(set: ControlSet): HTMLElement {
  const block = el("div", "panel");
  block.append(el("h3", undefined, set.name), el("p", "why", set.why));
  block.append(el("p", "form", panelForm(set) === "band" ? "A BAND" : "SLABS"));
  // A rung of the standard ladder says what it is holding back. It is not an
  // exception to the rule above it: a rung is a whole panel like any other,
  // and what this line adds is that the buttons it has not got still have
  // their places, so nothing moves when the next wave hands one over.
  const off = heldBack(set);
  if (off.length > 0) {
    block.append(
      el("p", "why", `Held back, in their places: ${off.map((c) => c.label).join(", ")}.`),
    );
  }
  for (const player of [1, 2] as const) {
    const seat = el("div", "seat-half");
    seat.append(el("span", "tag", `P${player}`));
    const list = el("div", "of");
    const has = setControls(set, player);
    if (has.length === 0) {
      list.append(el("p", "s", "Nothing. This seat has no button on this panel."));
    }
    for (const c of has) {
      const row = el("div", "control");
      row.append(
        el("span", "name", seatLabel(c.label)),
        el("span", "key", deskLabel(set, c)),
        el("span", "s", c.does),
      );
      list.append(row);
    }
    seat.append(list);
    block.append(seat);
  }
  return block;
}

/**
 * Which key this control is on, on this panel — read off the same table the
 * keyboard itself reads, never typed out beside it.
 *
 * A strip takes both keys of its seat's sideways pair and reads as "A / D";
 * everything else takes one. A control with none would be a button no desk can
 * reach, which `content/test/keys-desk.test.ts` refuses, so the empty string
 * here is a case that cannot happen rather than one this page hides.
 */
function deskLabel(set: ControlSet, c: ControlDef): string {
  const codes = deskKeys(set)
    .filter((k) => k.control === c.id)
    .map((k) => keyLabel(k.code));
  return codes.join(" / ");
}

/**
 * The two strips are labelled "PLAYER 1 · CANNON" in the content, because that
 * is what the band writes under them and the band has no other way to say
 * whose half it is. Here the seat is already the row's tag, so the prefix
 * would be said twice.
 */
function seatLabel(label: string): string {
  const cut = label.indexOf("·");
  return cut === -1 ? label : label.slice(cut + 1).trim();
}
