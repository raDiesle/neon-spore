import { type TasterState, tasterVerdict, type World } from "@neon-spore/sim";
import type { Stopper } from "./bolt-stop.js";
import { coreStopper, outlineFoot } from "./core-stop.js";
import { type Layout, tileCX } from "./layout.js";
import { crestPoints } from "./taster-crest.js";

/**
 * **Where a bolt meets THE TASTER**, for `BoltStops` (`bolt-stop.ts`): the
 * crest's underside over the bolt's x, every blade standing up out of it,
 * so in a blade's column a bolt is drawn stopping there whatever it does to
 * the blade above — pares it as a `target`, thickens it as `wrong`, or rings
 * off an uncoloured edge or the closed fan (`tasterVerdict`) — `shake` off
 * where the crest stands, as the blow of a blade struck off shakes it.
 *
 * The blade a bolt pares stands above the crest, so it is drawn reaching the
 * crest and not the blade. That is a look, and it is not fixed here.
 */
export function tasterStopper(
  l: Layout,
  world: World,
  t: TasterState,
  ridge: { y: number; thick: number },
  time: number,
  shake: number,
): Stopper {
  const left = tileCX(l, t.col) - l.tile * 0.5;
  const right = tileCX(l, t.col + t.blades.length - 1) + l.tile * 0.5;
  const crest = crestPoints(left, right, ridge.y, ridge.thick, l.tile, time);
  const foot = outlineFoot(crest, shake);
  return coreStopper(world, tasterVerdict, (col) => foot(tileCX(l, col) + shake) ?? ridge.y, foot);
}
