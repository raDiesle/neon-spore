import { stareVerdict, type World } from "@neon-spore/sim";
import type { Stopper } from "./bolt-stop.js";
import { coreStopper, roundFoot } from "./core-stop.js";
import type { StareEye } from "./stare-shape.js";
import { stareDome } from "./stare-shell.js";

/**
 * **Where a bolt meets THE STARE**, for `BoltStops` (`bolt-stop.ts`): the
 * glass dome round the eye, at its lower edge, wherever it stands over the
 * bolt's x. Nothing in it is ever a target (`stareVerdict`), so the dome is
 * all a bolt can meet — the cowl, the eye and the lashes are inside it — and
 * a bolt up the middle rings off it there (`stare-shell.ts`).
 */
export function stareStopper(world: World, socket: StareEye): Stopper {
  const d = stareDome(socket);
  return coreStopper(world, stareVerdict, d.cy + d.ry, roundFoot(d.cx, d.cy, d.rx, d.ry));
}
