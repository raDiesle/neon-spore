import { BUILD_STAMP } from "../../../tools/build-stamp.js";
import { atADesk } from "./at-a-desk.js";
import { backButton, el, type MenuPage } from "./menu-parts.js";
import { signInRow } from "./menu-sign-in.js";
import { TOGGLES, toggleRow } from "./menu-toggles.js";
import { claimName, readName, writeName } from "./nickname.js";
import { forgetThisDevice } from "./settings.js";
import { signOut } from "./sign-in.js";

/**
 * The one durable place for "things about me": the order of the page, and
 * every row on it that is not a switch — the switches themselves are
 * `menu-toggles.ts`.
 *
 * The room screen asks for a name once and never again; changing it lives
 * here, beside the switches, because that is where a person looks for it, and
 * so does logging in (`menu-sign-in.ts`), which is what keeps the name past
 * this phone. So does the way out — the button that forgets everything this
 * device knows, which is what a phone handed to somebody else needs and the
 * only way back out of a stored name.
 *
 * Most of it is a *preference*; the two rows at the top — WHAT THIS IS, and
 * CONTROLS where there is a keyboard to describe — are pages a person asks for
 * once, put here for the same reason.
 * **Nothing on this page may change what the simulation does**: two devices in
 * a room would then disagree about the world over something one of them
 * tapped.
 */

/** What the page needs of the rest of the app, so it needs nothing else. */
export interface SettingsHooks {
  /**
   * Play the intro scene again, with the menu going away behind it and coming
   * back when it ends (`intro.ts`, and the wrapper in `menu.ts` that is both
   * halves of that). It is here because HOW TO PLAY, which used to carry it,
   * left the front page on 14 September 2026 — and the scene is the only thing
   * in the game that answers *what is this*, so it may not leave with the page
   * that pointed at it.
   */
  openIntro: () => void;
  /** Turn the mixer's mute on or off. It already had one; only `M` reached it. */
  setSound: (on: boolean) => void;
  /** Motion is a body class, because the animations are CSS. */
  setMotion: (on: boolean) => void;
  /** Offer the home screen, when the browser has offered it to us. */
  install?: () => void;
  /** Whether that offer is standing. */
  canInstall?: () => boolean;
}

export function buildSettings(show: (page: MenuPage) => void, hooks: SettingsHooks): HTMLElement {
  const page = el("div", "page");
  page.append(backButton(show), el("h2", undefined, "SETTINGS"));

  page.append(whatThisIsRow(hooks));
  // CONTROLS teaches keys, and a phone has none. Asked here rather than inside
  // the row so the page simply does not carry it — a row present and hidden is
  // a row somebody finds with a screen reader (`at-a-desk.ts`).
  const controls = controlsRow(show, atADesk());
  if (controls) page.append(controls);
  for (const row of TOGGLES) {
    if (row.available && !row.available()) continue;
    page.append(toggleRow(row, hooks));
  }

  page.append(nameRow(), signInRow(), installRow(hooks), forgetRow());
  // Which build this phone is running, so a bug report can say. Through
  // `BUILD_STAMP` rather than the identifier the build substitutes: that name
  // exists in a bundle and nowhere else, so under a dev server — the
  // director's `/game`, or `bun run dev:game` — reading it directly threw
  // before the menu was drawn. See `tools/build-stamp.ts`.
  page.append(el("p", "foot", `Build ${BUILD_STAMP}`));
  return page;
}

/**
 * The way back to the intro scene, which used to sit at the top of HOW TO PLAY.
 *
 * The same argument CONTROLS is here on, one floor further: a person who wants
 * to be told what this game is asks for it once and then never again, and a
 * row that is read once does not belong on the page somebody presses to start
 * playing. A row rather than a switch, for the reason the next one gives.
 */
function whatThisIsRow(hooks: SettingsHooks): HTMLElement {
  const block = el("div", "setting");
  const button = el("button", "switch", "WHAT THIS IS");
  button.type = "button";
  button.addEventListener("click", () => hooks.openIntro());
  block.append(
    button,
    el(
      "span",
      "s",
      "The scene a new device opens on: two phones, one game, and the two of you talking.",
    ),
  );
  return block;
}

/**
 * The way to CONTROLS, which used to be a row on the front page — **and only
 * at a desk**.
 *
 * It is here because it is a thing about *this device*, and that is the
 * question people bring to a settings page. It is not a preference and so it
 * is not a switch: a row that opens a page, in the place a person looks.
 *
 * `atDesk` false means no row and no way to the page at all, which the owner
 * asked for on 14 September 2026. What that page has left to teach is the
 * keyboard — which key each panel's buttons are on, and the one key that is on
 * no panel — and a phone has no keyboard: it had the shapes a thumb meets and
 * every panel's own sentences, which is the same reading the band itself gives
 * a thumb holding it. Passed in rather than asked for here, so the decision
 * has one home and this function has none of it.
 */
export function controlsRow(show: (page: MenuPage) => void, atDesk: boolean): HTMLElement | null {
  if (!atDesk) return null;
  const block = el("div", "setting");
  const button = el("button", "switch", "CONTROLS");
  button.type = "button";
  button.addEventListener("click", () => show("keys"));
  block.append(button, el("span", "s", "Which key each of this wave's buttons is on, both seats."));
  return block;
}

/** Changing the name, which is the only part of this page that reaches the server. */
function nameRow(): HTMLElement {
  const block = el("div", "setting");
  const label = el("label", "sub", "YOUR NAME");
  const input = el("input");
  input.type = "text";
  input.maxLength = 12;
  input.spellcheck = false;
  input.value = readName();
  label.htmlFor = "settingsName";
  input.id = "settingsName";

  const button = el("button", "switch", "CHANGE");
  button.type = "button";
  const said = el("span", "s");

  button.addEventListener("click", () => {
    void claimName(input.value).then((answer) => {
      if (!answer.ok) {
        said.textContent = answer.why ?? "That name cannot be used.";
        return;
      }
      writeName(answer.name ?? input.value);
      said.textContent = `You are ${answer.name}.`;
    });
  });

  block.append(label, input, button, said);
  return block;
}

/**
 * The home screen, offered where a player looks for it.
 *
 * It was a chip floating over the field, which may stay as the just-in-time
 * prompt — this is the durable place for it. Absent entirely when the browser
 * has not offered one, which is most of them most of the time: a button that
 * cannot do its thing is worse than no button.
 */
function installRow(hooks: SettingsHooks): HTMLElement {
  const block = el("div", "setting");
  if (!hooks.canInstall?.()) {
    block.hidden = true;
    return block;
  }
  const button = el("button", "switch", "ADD TO HOME SCREEN");
  button.type = "button";
  button.addEventListener("click", () => hooks.install?.());
  block.append(
    button,
    el("span", "s", "Opens without a browser bar, which is most of a phone screen."),
  );
  return block;
}

/** The way out: everything this device knows about the person holding it. */
function forgetRow(): HTMLElement {
  const block = el("div", "setting");
  const button = el("button", "switch danger", "CLEAR THIS DEVICE");
  button.type = "button";
  const what = el(
    "span",
    "s",
    "Forgets your name, who you have played with and how far you have got, and logs you out. A name you logged in with stays yours: log in again to take it back.",
  );
  let armed = false;
  button.addEventListener("click", () => {
    if (!armed) {
      armed = true;
      button.textContent = "SURE? CLEAR IT";
      return;
    }
    forgetThisDevice();
    void signOut();
    button.textContent = "CLEARED";
    button.disabled = true;
  });
  block.append(button, what);
  return block;
}
