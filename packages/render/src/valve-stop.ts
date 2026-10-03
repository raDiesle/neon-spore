import { VALVE_PINS, type ValveState, valveVerdict, type World } from "@neon-spore/sim";
import type { Stopper } from "./bolt-stop.js";
import { coreStopper, type Foot, lowestFoot, outlineFoot } from "./core-stop.js";
import type { Layout } from "./layout.js";
import { VALVE_PIN, valvePinPoints, valvePinTop } from "./valve-pins.js";
import { valveHalfSwing, valveOpen, valvePinOut, valvePinReach } from "./valve-pose.js";
import { type Point, valveRimPoints } from "./valve-shape.js";
import { VALVE_BEAD, valveSparkNow } from "./valve-spark.js";

/** Where the drum is laid this frame: its middle on screen, shake and all, and its turn. */
export interface ValveFrame {
  x: number;
  y: number;
  turn: number;
}

/** `p` turned by `a` about `about`. */
function turned(p: Point, a: number, about: Point = { x: 0, y: 0 }): Point {
  const c = Math.cos(a);
  const s = Math.sin(a);
  const x = p.x - about.x;
  const y = p.y - about.y;
  return { x: about.x + x * c - y * s, y: about.y + x * s + y * c };
}

/**
 * **Where a bolt meets THE VALVE**, for `BoltStops` (`bolt-stop.ts`): the
 * leaking spark in its column, in either colour (`valveVerdict`), at the
 * bead's lower edge; and otherwise the lowest of what is drawn over that x —
 * the drum inside its notched rim, split into its two swung halves once it
 * opens, and each pin still hung under it, swaying about its top — all laid
 * where `drawValve` lays them, through the drum's middle and its list.
 * `drum` is the middle before the shake, which the spark falls from.
 */
export function valveStopper(
  l: Layout,
  world: World,
  s: ValveState,
  drum: Point,
  frame: ValveFrame,
  beat: number,
  beatPhase: number,
  time: number,
): Stopper {
  const cfg = world.cfg;
  const lay = (p: Point): Point => {
    const q = turned(p, frame.turn);
    return { x: frame.x + q.x, y: frame.y + q.y };
  };
  const feet: Foot[] = [];
  for (let i = 0; i < VALVE_PINS; i++) {
    const out = valvePinOut(s, cfg, i, beat, beatPhase);
    if (out > 1) continue;
    const going = Math.max(0, out);
    const top = valvePinTop(l, i, VALVE_PINS, going);
    const sway = VALVE_PIN.sway(i, going, time);
    const plate = valvePinPoints(l, i, VALVE_PINS, valvePinReach(s, i, beatPhase), going);
    feet.push(outlineFoot(plate.map((p) => lay(turned(p, sway, top)))));
  }
  const rim = valveRimPoints(l, s.wheelMilli, time * 0.4);
  const open = valveOpen(s, cfg, beat, beatPhase);
  if (open <= 0) feet.push(outlineFoot(rim.map(lay)));
  else {
    // Each half is the rim pressed onto the seam on the other side, which
    // is the clip `drawValve` cuts it with, then swung as it swings it.
    for (const side of [-1, 1] as const) {
      const swing = valveHalfSwing(l, open, side);
      const half = rim.map((p) => {
        const q = turned({ x: side < 0 ? Math.min(p.x, 0) : Math.max(p.x, 0), y: p.y }, swing.turn);
        return lay({ x: q.x + swing.x, y: q.y + swing.y });
      });
      feet.push(outlineFoot(half));
    }
  }
  const spark = valveSparkNow(l, world, s, drum, beat, beatPhase).y + VALVE_BEAD.ry * l.tile;
  return coreStopper(world, valveVerdict, spark, lowestFoot(feet));
}
