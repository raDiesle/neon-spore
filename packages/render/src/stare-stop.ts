import { stareVerdict, type World } from "@neon-spore/sim";
import type { Stopper } from "./bolt-stop.js";
import { coreStopper, outlineFoot, roundFoot } from "./core-stop.js";
import type { StareEye } from "./stare-shape.js";
import { stareDome } from "./stare-shell.js";

/**
 * **Where a bolt meets THE STARE**, for `BoltStops` (`bolt-stop.ts`): the
 * glass dome round the eye, at its lower edge, wherever it stands over the
 * bolt's x. Nothing in it is ever a target (`stareVerdict`), so the dome is
 * all a bolt can meet — the cowl, the eye and the lashes are inside it — and
 * a bolt up the middle rings off it there (`stare-shell.ts`). Rolled about the
 * eye (`stare-sway.ts`), the dome is met as it is drawn.
 */
export function stareStopper(world: World, socket: StareEye, roll = 0): Stopper {
  const d = stareDome(socket);
  if (roll === 0)
    return coreStopper(world, stareVerdict, d.cy + d.ry, roundFoot(d.cx, d.cy, d.rx, d.ry));
  const cos = Math.cos(roll);
  const sin = Math.sin(roll);
  const rim = Array.from({ length: SAMPLES }, (_, i) => {
    const a = (i / SAMPLES) * Math.PI * 2;
    const x = d.cx + d.rx * Math.cos(a) - socket.cx;
    const y = d.cy + d.ry * Math.sin(a) - socket.cy;
    return { x: socket.cx + x * cos - y * sin, y: socket.cy + x * sin + y * cos };
  });
  return coreStopper(world, stareVerdict, d.cy + d.ry, outlineFoot(rim));
}

/** How many points round the rolled dome a bolt is met on. */
const SAMPLES = 48;
