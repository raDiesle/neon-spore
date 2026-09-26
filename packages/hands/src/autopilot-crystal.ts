import {
  type Creature,
  crystalFalling,
  crystalHeld,
  crystalMiddleCol,
  crystalUnder,
  type TimedCommand,
  ticksSinceGuard,
  type World,
} from "@neon-spore/sim";

/**
 * **THE CRYSTAL, on AUTO**: a shell whose middle breaks only to a shot of its
 * colour while the shield stands armed under the body (`crystal.ts`).
 *
 * All four hands at one moment. Player 2 carries the shield under the middle
 * of the crystal nearest the hull, and player 1 stands the cannon there too.
 * Once both are under it, player 1 keeps the dome up, pressing again a tick or
 * two before it would drop, so it is armed on whatever tick the shot lands.
 * Player 2 fires only while the dome is up and the crystal is falling rather
 * than sliding, when the middle keeps its column for the shot's whole climb.
 * What it breaks into is a slick and a bulb, and the field hand shoots those.
 */

type Press = Omit<TimedCommand, "tick">;

/** The crystal nearest the hull, if any. */
export function lowestCrystal(w: World): Creature | undefined {
  let best: Creature | undefined;
  for (const c of w.creatures) {
    if (c.kind === "crystal" && (best === undefined || c.row > best.row)) best = c;
  }
  return best;
}

/** The shield's presses under a crystal: carried under its middle, then held
 * up for as long as the cannon stands under it too. */
export function shieldCrystal(w: World, c: Creature): Press[] {
  const middle = crystalMiddleCol(c);
  if (w.shieldCol !== middle) return [{ player: 2, command: { kind: "shieldCol", col: middle } }];
  if (w.cannonCol !== middle || !crystalUnder(w, c)) return [];
  // Negative while the window is open: pressed again two ticks before it shuts.
  return ticksSinceGuard(w) >= -2 ? [{ player: 1, command: { kind: "guard" } }] : [];
}

/** Whether a shot at this crystal's middle would break it now. */
export function crystalOpen(w: World, c: Creature): boolean {
  return crystalFalling(w.cfg, c) && crystalHeld(w, c);
}
