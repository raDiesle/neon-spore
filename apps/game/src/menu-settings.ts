import { canVibrate } from "./haptics.js";
import { backButton, el, type MenuPage } from "./menu-parts.js";
import { claimName, readName, writeName } from "./nickname.js";
import { forgetThisDevice, readSettings, type Settings, updateSettings } from "./settings.js";

/**
 * The one durable place for "things about me".
 *
 * The room screen asks for a name once and never again; changing it lives
 * here, beside the switches, because that is where a person looks for it. So
 * does the way out — the button that forgets everything this device knows,
 * which is what a phone handed to somebody else needs and the only way back
 * out of a stored name.
 *
 * Everything here is a *preference*. Nothing on this page may change what the
 * simulation does: two devices in a room would then disagree about the world
 * over something one of them tapped.
 */

/** What the page needs of the rest of the app, so it needs nothing else. */
export interface SettingsHooks {
  /** Turn the mixer's mute on or off. It already had one; only `M` reached it. */
  setSound: (on: boolean) => void;
  /** Motion is a body class, because the animations are CSS. */
  setMotion: (on: boolean) => void;
  /** Offer the home screen, when the browser has offered it to us. */
  install?: () => void;
  /** Whether that offer is standing. */
  canInstall?: () => boolean;
}

/** Declared by the build (`apps/game/build.ts`), so this reads a constant. */
declare const __BUILD_DATE__: string;

interface ToggleRow {
  key: keyof Settings;
  label: string;
  /** What it means when it is on, in one line. */
  on: string;
  /** What it means when it is off. */
  off: string;
  /** Whether this device can offer it at all. */
  available?: () => boolean;
  apply: (hooks: SettingsHooks, value: boolean) => void;
}

const TOGGLES: ToggleRow[] = [
  {
    key: "sound",
    label: "SOUND",
    on: "The mixer is playing.",
    off: "Silent. The wave still says everything it says on screen.",
    apply: (hooks, value) => hooks.setSound(value),
  },
  {
    key: "motion",
    label: "MOTION",
    on: "The menu animates.",
    off: "Still. Nothing on the menu moves on its own.",
    apply: (hooks, value) => hooks.setMotion(value),
  },
  {
    key: "haptics",
    label: "BUZZ",
    // The two events, named, because a toggle whose effect is a surprise is a
    // toggle people leave alone. See `haptics.ts`.
    on: "A short buzz for a shot in the wrong colour, a long one for the hull.",
    off: "The phone stays still.",
    // Absent on desktop and on iOS: a switch that turns nothing on is worse
    // than no switch.
    available: canVibrate,
    apply: () => {},
  },
];

export function buildSettings(show: (page: MenuPage) => void, hooks: SettingsHooks): HTMLElement {
  const page = el("div", "page");
  page.append(backButton(show), el("h2", undefined, "SETTINGS"));

  page.append(controlsRow(show));
  for (const row of TOGGLES) {
    if (row.available && !row.available()) continue;
    page.append(toggleRow(row, hooks));
  }

  page.append(nameRow(), installRow(hooks), forgetRow());
  // Which build this phone is running, so a bug report can say. A constant the
  // build already defines, not new machinery.
  page.append(el("p", "foot", `Build ${__BUILD_DATE__}`));
  return page;
}

/**
 * The way to CONTROLS, which used to be a row on the front page.
 *
 * It is here because it is a thing about *this device* — which buttons this
 * phone puts under a thumb, and which keys a desk answers — and that is the
 * question people bring to a settings page. It is not a preference and so it
 * is not a switch: a row that opens a page, in the place a person looks.
 */
function controlsRow(show: (page: MenuPage) => void): HTMLElement {
  const block = el("div", "setting");
  const button = el("button", "switch", "CONTROLS");
  button.type = "button";
  button.addEventListener("click", () => show("keys"));
  block.append(
    button,
    el("span", "s", "What a thumb does, every panel in the game, and the keys at a desk."),
  );
  return block;
}

function toggleRow(row: ToggleRow, hooks: SettingsHooks): HTMLElement {
  const block = el("div", "setting");
  const button = el("button", "switch");
  button.type = "button";
  const what = el("span", "s");

  const paint = (): void => {
    const value = readSettings()[row.key];
    button.textContent = `${row.label}  ${value ? "ON" : "OFF"}`;
    button.classList.toggle("on", value);
    what.textContent = value ? row.on : row.off;
  };

  button.addEventListener("click", () => {
    const next = !readSettings()[row.key];
    updateSettings((held) => ({ ...held, [row.key]: next }));
    row.apply(hooks, next);
    paint();
  });

  paint();
  block.append(button, what);
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

  const code = el("input");
  code.type = "text";
  code.maxLength = 4;
  code.spellcheck = false;
  code.placeholder = "RECOVERY CODE";

  const button = el("button", "switch", "CHANGE");
  button.type = "button";
  const said = el("span", "s");

  button.addEventListener("click", () => {
    void claimName(input.value, code.value).then((answer) => {
      if (!answer.ok) {
        said.textContent = answer.why ?? "That name cannot be used.";
        return;
      }
      writeName(answer.name ?? input.value);
      said.textContent = answer.code
        ? `${answer.name} is yours. Write down ${answer.code}.`
        : `You are ${answer.name}.`;
    });
  });

  block.append(label, input, code, button, said);
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
    "Forgets your name, who you have played with and how far you have got. The name itself stays yours — the recovery code is how you take it back.",
  );
  let armed = false;
  button.addEventListener("click", () => {
    if (!armed) {
      armed = true;
      button.textContent = "SURE? CLEAR IT";
      return;
    }
    forgetThisDevice();
    button.textContent = "CLEARED";
    button.disabled = true;
  });
  block.append(button, what);
  return block;
}
