import { type GorgeState, gorgePried } from "./gorge.js";
import { livingKindForColor } from "./kinds.js";
import { spawnOne } from "./spawn.js";
import type { World } from "./world.js";

/**
 * **The pry's own clock, and the bead a spit is**: what `gorge-step.ts` runs
 * on the beat for player 2's thumb, in a file of its own because that one
 * is at its limit and this is the half the thumb owns (`gorge-hand.ts` is
 * the thumb itself, off the wire on the tick).
 *
 * A pry is a window, not a state: `gorgePryBeats` from the beat the thumb
 * came down, in which the beam in the mouth's colour ends the fight. Held
 * past it, the mouth **clenches on the thumb** — the pry is thrown off, one
 * bead is spat down the mouth's column as a body, and the thumb has to lift
 * and come down again for another window. So a pry taken early costs a bead
 * and a lift, and the pry is a thing to take *late*, with the beam already
 * filling in the other hand: the fill is three beats and the window four.
 * The mouth's own count restarts from the clench, so the bead it threw is
 * not back before the count has run — a clench is a bead lost, not a beat.
 */
export function stepGorgePry(world: World, g: GorgeState): void {
  if (!gorgePried(g) || world.beat - g.pryBeat < world.cfg.gorgePryBeats) return;
  g.pry = -1;
  g.pryBeat = -1;
  g.spitBeat = world.beat;
  world.events.push({ type: "gorgeClench", col: g.col + g.mouth });
  spitFrom(world, g, g.mouth);
}

/**
 * The bead out of intake `pick`, down its own column as a body of its
 * colour — whichever chose it: the emptiest, on the spit count, or the mouth
 * throwing off a pry. Nothing out of an intake holding none.
 */
export function spitFrom(world: World, g: GorgeState, pick: number): void {
  const k = g.intakes[pick];
  if (k === undefined || k.color === null || k.beads === 0) return;
  const col = g.col + pick;
  const color = k.color;
  k.beads -= 1;
  k.fullBeat = -1;
  if (k.beads === 0) k.color = null;
  world.events.push({ type: "gorgeSpit", col, color });
  spawnOne(world, { beat: world.beat, col, kind: livingKindForColor(color), color });
}
