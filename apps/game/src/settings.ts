/**
 * The things a player turns on and off, kept on their own device.
 *
 * One store rather than a key per switch, so a setting added later is a field
 * rather than a new corner of `localStorage` to remember. Everything here is a
 * preference and nothing here is game state: no setting may change what the
 * simulation does, because two devices in a room would then disagree about the
 * world over something one of them tapped.
 *
 * Reading is forgiving in one direction only. Anything unreadable, missing or
 * the wrong shape falls back to the default, because a player whose stored
 * settings have gone strange wants the game, not an error — and every default
 * is the quiet one, so a fallback is never a surprise.
 */

/** The key the browser keeps them under. Namespaced like the others. */
export const SETTINGS_KEY = "neon-spore.settings";

export interface Settings {
  /**
   * Whether the game makes any sound. On, because a game that opens silent
   * reads as broken — and the mixer was reachable only by the `M` key, which
   * is not a key a phone has.
   */
  sound: boolean;
  /**
   * Whether the menu animates. This is a *tri-state* flattened to two: unset
   * means "whatever the phone was told", which is `prefers-reduced-motion`,
   * and the toggle overrides it in **both** directions. A player who has asked
   * their phone for less motion and wants this one to move anyway must be able
   * to say so, and a boolean that only ever turns motion off cannot.
   */
  motion: boolean;
  /**
   * Whether the phone buzzes for the two things a player must not miss.
   *
   * **Off by default**, deliberately: a phone that buzzes is a phone somebody
   * turns off, and this is a channel worth having when it is asked for rather
   * than discovered. See `haptics.ts`.
   */
  haptics: boolean;
  /**
   * Whether pressing into the field takes the browser's own furniture off the
   * screen (`fullscreen.ts`).
   *
   * **On by default, and it is still the quiet one.** The manifest has said
   * `"display": "fullscreen"` since the day there was a manifest, so a pair who
   * installed the shortcut has always played without an address bar; the pair
   * who opened a link and never pressed INSTALL — the pair the join flow is
   * built for — got the same game with thirty pixels of browser over the hull
   * and a navigation bar under it. Turning this on is that pair getting what
   * the installed one already had, rather than a new behaviour.
   *
   * The switch exists because there is no other way back out. A person who is
   * put in fullscreen and cannot find the exit closes the tab, and a desk is
   * the one place a fullscreen window is usually the wrong shape — which is
   * why the request is also asked of `atADesk` before it is made.
   */
  fullscreen: boolean;
  /**
   * Whether the cannon and the shield answer a finger **where they are drawn
   * on the hull** — slid, pressed, the muzzle swiped — as well as on the panel
   * below (`render/touch-ship.ts`).
   *
   * **Off by default**, the owner, 25 September 2026: the panel is the control
   * scheme, and a hull that also answers is a second way in a player turns on
   * when they want it. Off, a press on a lobe goes to whatever is behind it,
   * as though the ship were not there. It changes which command a press
   * sends, never what a command does, so two devices set differently still
   * agree about the world.
   */
  shipTouch: boolean;
}

/**
 * What a device that has said nothing gets.
 *
 * `motion` is `true` here and the *stored* value is what overrides the phone's
 * own preference — a device with nothing stored follows
 * `prefers-reduced-motion`, which `hasMotionChoice` is how a caller tells the
 * two apart.
 */
export const DEFAULT_SETTINGS: Settings = {
  sound: true,
  motion: true,
  haptics: false,
  fullscreen: true,
  shipTouch: false,
};

/** Whatever was stored, read as settings. Unreadable means the defaults. */
export function parseSettings(raw: string | null): Settings {
  if (raw === null) return DEFAULT_SETTINGS;
  try {
    const read = JSON.parse(raw) as Partial<Settings> | null;
    if (read === null || typeof read !== "object") return DEFAULT_SETTINGS;
    return {
      sound: flag(read.sound, DEFAULT_SETTINGS.sound),
      motion: flag(read.motion, DEFAULT_SETTINGS.motion),
      haptics: flag(read.haptics, DEFAULT_SETTINGS.haptics),
      fullscreen: flag(read.fullscreen, DEFAULT_SETTINGS.fullscreen),
      shipTouch: flag(read.shipTouch, DEFAULT_SETTINGS.shipTouch),
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function flag(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

/** The stored settings. Wrapped: private browsing refuses to keep anything. */
export function readSettings(): Settings {
  try {
    return parseSettings(localStorage.getItem(SETTINGS_KEY));
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function writeSettings(next: Settings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  } catch {
    // Nothing to be done, and nothing worth saying: the game carries on.
  }
}

/** Read, change, write — the one shape every caller wants. */
export function updateSettings(change: (s: Settings) => Settings): Settings {
  const next = change(readSettings());
  writeSettings(next);
  return next;
}

/**
 * Whether this device has said anything about motion at all.
 *
 * Read straight off storage rather than off `Settings`, because the flattened
 * boolean cannot say "unset" — and unset is the case where the phone's own
 * `prefers-reduced-motion` is the answer. A caller that skipped this would
 * force motion on for every player who had asked their phone for less of it.
 */
export function hasMotionChoice(): boolean {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw === null) return false;
    const read = JSON.parse(raw) as Partial<Settings> | null;
    return typeof read?.motion === "boolean";
  } catch {
    return false;
  }
}

/** Every key this game keeps on a device. The one place they are listed. */
export const DEVICE_KEYS = [
  "neon-spore.settings",
  "neon-spore.name",
  "neon-spore.token",
  "neon-spore.email",
  "neon-spore.pairs",
  "neon-spore.progress",
  "neon-spore.room",
  "neon-spore.view",
  "neon-spore.intro",
  "neon-spore.welcome",
] as const;

/**
 * Forget everything this device knows about the person holding it.
 *
 * For handing the phone to somebody else, or starting clean — and it is the
 * only way back out of a stored name. It clears these keys and nothing else:
 * the server-side claim on the name is deliberately left standing — logging
 * in again is what takes it back — and the button says so in one line.
 *
 * `neon-spore.intro` goes with them, which is the reading the button's own
 * sentence gives: the next person to hold the phone meets the game's front
 * door rather than the menu, and the front door is the opening scene. A key
 * kept back would need a line here saying why, not an absence.
 */
export function forgetThisDevice(): void {
  for (const key of DEVICE_KEYS) {
    try {
      localStorage.removeItem(key);
    } catch {
      // Unstorable is also unclearable. Nothing to be done and nothing lost.
    }
  }
}
