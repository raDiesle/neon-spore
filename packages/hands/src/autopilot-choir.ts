import { type Creature, choirIsDots, choirIsFusing, type TimedCommand } from "@neon-spore/sim";

/**
 * **THE CHOIR, on AUTO**: two bodies in one membrane that no button reaches,
 * drawn together by shaking the device twice (`choir.ts`,
 * `choir-gesture.ts`).
 *
 * The gesture is player 1's. While the choir nearest the hull is still a
 * membrane nobody has opened, player 1 shakes, once to arm the gesture and
 * again to close it, and the cannon holds its fire, since a shot at a membrane
 * is spent on nothing. What it draws together into is a slick or a bulb of its
 * colour, and the field hand shoots that.
 */

type Press = Omit<TimedCommand, "tick">;

/** Player 1's shake at `body`, or `null` when it is not a membrane waiting. */
export function shakeChoir(body: Creature | undefined): Press[] | null {
  if (body === undefined || !choirIsDots(body)) return null;
  return choirIsFusing(body) ? [] : [{ player: 1, command: { kind: "shake" } }];
}
