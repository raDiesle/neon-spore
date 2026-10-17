import { readSettings, updateSettings } from "./settings.js";

/**
 * Whether this player wants the siren on their screen — the SIREN switch in
 * the menu and a tap on the bar itself, which are one setting
 * (`settings.ts` `siren`).
 *
 * Held here as well as in storage because the frame asks every frame, and
 * `readSettings` parses the whole store each time it is called. Both ways of
 * changing it come through `setSirenShown`, so the copy cannot go stale.
 */
let shown: boolean | null = null;

export function sirenShown(): boolean {
  if (shown === null) shown = readSettings().siren;
  return shown;
}

export function setSirenShown(next: boolean): void {
  shown = next;
  updateSettings((held) => (held.siren === next ? held : { ...held, siren: next }));
}
