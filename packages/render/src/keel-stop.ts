import { type KeelState, keelMarrowLit, keelVerdict, type World } from "@neon-spore/sim";
import type { Stopper } from "./bolt-stop.js";
import {
  coreStopper,
  type Foot,
  lowestFoot,
  outlineFoot,
  rodFoot,
  roundFoot,
} from "./core-stop.js";
import { KEEL_SOCKET_R, keelSocketAt } from "./keel-marks.js";
import { keelTendons } from "./keel-pose.js";
import { KEEL_ROCK } from "./keel-rock.js";
import { keelPlatePoints, type Point, type Seg } from "./keel-shape.js";
import { KEEL_MARROW, keelMarrowAt } from "./keel-story.js";
import type { Layout } from "./layout.js";
import { STROKE } from "./palette.js";

/**
 * **Where a bolt meets THE KEEL**, for `BoltStops` (`bolt-stop.ts`), asked of
 * `keelVerdict`: the thrown rock in its column, in either colour, at its lower
 * edge; up the middle, the marrow's lens at its lower edge while it is lit and
 * the socket at its lower rim while it is open — `wrong` there in the other
 * colour — and otherwise the lowest of what is drawn over that x: the plates,
 * the tendons between them, and the lens while it is lit. All `shift` off
 * where they stand, as the jolt lays them.
 *
 * The ribs hung under each plate and the cut faces the split shows are thin
 * strokes a bolt passes, and they are not met here.
 */
export function keelStopper(
  l: Layout,
  world: World,
  s: KeelState,
  segs: readonly Seg[],
  rock: Point | null,
  shift: Point,
): Stopper {
  const lay = (p: Point): Point => ({ x: p.x + shift.x, y: p.y + shift.y });
  const feet: Foot[] = segs.map((g) =>
    outlineFoot(keelPlatePoints(l, g.centre, g.slope, g.pose), shift.x, shift.y),
  );
  for (const [a, b] of keelTendons(l, segs))
    feet.push(rodFoot(lay(a), lay(b), STROKE.outline * 0.7));
  const lens = keelMarrowLit(s) ? keelMarrowAt(l, s, segs) : null;
  if (lens !== null) {
    const at = lay(lens);
    feet.push(
      roundFoot(at.x, at.y, KEEL_MARROW.r * KEEL_MARROW.wide * l.tile, KEEL_MARROW.r * l.tile),
    );
  }
  // Up the middle the one part asked is the lens while it is lit and the
  // socket otherwise: `keelVerdict` says `target` or `wrong` there for no
  // other phase.
  const socket = keelSocketAt(l, s, segs);
  const middle =
    lens !== null
      ? lens.y + KEEL_MARROW.r * l.tile
      : (socket?.y ?? l.gridTop) + KEEL_SOCKET_R * l.tile;
  // The rock is drawn exactly while it is thrown, which is when the verdict
  // answers in its column.
  const thrown = rock === null ? null : rock.y + KEEL_ROCK.ry * l.tile;
  return coreStopper(
    world,
    keelVerdict,
    (col) => (thrown !== null && col === s.rockCol ? thrown : middle) + shift.y,
    lowestFoot(feet),
  );
}
