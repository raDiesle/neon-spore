import { missedColor } from "./balance.js";
import { failWave } from "./wave-fail.js";
import type { World } from "./world.js";

/**
 * **A boss shot in the wrong colour loses the wave.** The owner, 10 October
 * 2026, of THE BASTION and of boss waves in general: *when users have to
 * shoot, and its wrong colour (especially for choreographed bosses), it
 * should fail the boss wave … like a default for boss waves for cannon
 * shots.* Until then the wrong colour on most bosses was a colour missed on
 * the balance sheet and nothing else: the gun stayed lit, and the pair could
 * fire the other colour a moment later and lose nothing but the moment.
 *
 * So it is a default, asked by every boss's own `…Struck` on the branch its
 * verdict calls `"wrong"` — a bolt or the beam, out of the top or into a body
 * on the field. Ordinary creatures keep their wrong-colour window
 * (`colour-armour.ts`); this is about the boss.
 *
 * **The bosses whose wrong colour already does something keep it**, because
 * each was a ruling of its own and a lost wave would put it out of reach:
 * THE BATON knocks the bead back two sockets (the owner, 6 October 2026),
 * THE GORGE spills a bead, THE HIVE spills sooner, THE TASTER thickens the
 * blade it was meant to break, and THE CURTAIN throws a rock down the column.
 * They still call here, so this list is the one place a boss is moved over.
 *
 * Not in a film, which is a rehearsal and not the pair's play
 * (`bossWrongColourFails`), and not in the rest after a clear: a bolt still
 * climbing when the last part went is not a shot at the boss.
 */
export const OWN_WRONG_COLOUR: ReadonlySet<string> = new Set([
  "baton",
  "gorge",
  "hive",
  "taster",
  "curtain",
]);

/** The wrong colour met the boss: the wave is lost, unless the boss answers it itself. */
export function wrongColourFails(world: World): void {
  if (!world.cfg.bossWrongColourFails || world.restBeat !== 0) return;
  const kind = world.boss?.kind;
  if (kind === undefined || OWN_WRONG_COLOUR.has(kind)) return;
  failWave(world, "wrongColour");
}

/** A colour missed on the balance sheet, and the wave lost for it. */
export function bossColourMissed(world: World): void {
  missedColor(world);
  wrongColourFails(world);
}
