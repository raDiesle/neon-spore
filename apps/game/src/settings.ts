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
   * Whether the phone buzzes for the two things a player must not miss.
   *
   * **Off by default**, deliberately: a phone that buzzes is a phone somebody
   * turns off, and this is a channel worth having when it is asked for rather
   * than discovered. See `haptics.ts`.
   */
  haptics: boolean;
}

export const DEFAULT_SETTINGS: Settings = { haptics: false };

/** Whatever was stored, read as settings. Unreadable means the defaults. */
export function parseSettings(raw: string | null): Settings {
  if (raw === null) return DEFAULT_SETTINGS;
  try {
    const read = JSON.parse(raw) as Partial<Settings> | null;
    if (read === null || typeof read !== "object") return DEFAULT_SETTINGS;
    return { haptics: flag(read.haptics, DEFAULT_SETTINGS.haptics) };
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
