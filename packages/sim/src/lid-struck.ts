import { metColor, missedColor } from "./balance.js";
import { wornKind } from "./creature-rules.js";
import { removeCreature } from "./field.js";
import { lidIsOpen } from "./lid.js";
import type { Bullet, Creature } from "./types.js";
import type { World } from "./world.js";

/**
 * A shot met a lid.
 *
 * Three answers, and each is charged to the seat that could have prevented it.
 * Plates still across the lens is a *reject* and deliberately not a colour
 * miss — the ammunition may have been exactly right and the hand simply not
 * there yet, which is the pair's timing rather than player 2's choice, and
 * `claspStruck` and `resolveWarden` both make the same argument. The wrong
 * colour into a bare lens is a colour miss and nothing else: the lens has been
 * that colour, on both screens, since the body entered the field.
 *
 * The kill is worth what a veil and a ghost are worth, and for their reason
 * rather than by coincidence: all three are bodies the pair can only reach by
 * doing one thing together at one moment, and a pair that learned one of them
 * priced above the others would be learning that one kind of agreement is
 * worth more than another.
 */
export function lidStruck(world: World, b: Bullet, hit: Creature): void {
  if (!lidIsOpen(world.cfg, hit)) {
    world.events.push({ type: "reject", col: b.col, row: hit.row });
    return;
  }
  if (hit.color !== b.color) {
    missedColor(world);
    world.events.push({ type: "reject", col: b.col, row: hit.row });
    return;
  }
  metColor(world);
  world.events.push({
    type: "destroy",
    id: hit.id,
    col: hit.col,
    row: hit.row,
    color: hit.color,
    kind: wornKind(hit),
  });
  removeCreature(world, hit.id);
}
