import { filamentTileAt, filamentTracing } from "@neon-spore/sim";
import { filamentGrabCircle, filamentPoint } from "./filament-shape.js";
import { hitCircle, type Layout } from "./layout.js";
import type { Field, Touch } from "./touch.js";
import { bossOf } from "./touch-field.js";

/**
 * **A thumb on THE FILAMENT's line**: the pilot's on the head, the
 * navigator's on the tail — the one ring each screen draws
 * (`filament-draw.ts`), answered at the same circle, as a `drag` on the
 * `filament` target with nothing carried yet. The hold's origin is **the
 * tile's centre, not the finger**: every move after it reports the
 * displacement from there in thousandths of a tile, and the simulation
 * resolves the grab's tile plus the rounded displacement to a tile of the
 * field (`sim/filament-hand.ts`) — so a thumb that lands off-centre on the
 * ring and slides a tile up reads as a tile up, not as most of one.
 *
 * Its own file for `surge-grip.ts`'s reason: `handles.ts` is at its limit,
 * and the hit test belongs beside the shape it answers.
 */
export function filamentGrabUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const s = bossOf(field, "filament");
  if (s === null || !filamentTracing(s)) return null;
  const c = filamentGrabCircle(l, s, field.seat);
  const tile = filamentTileAt(s, field.seat === 1 ? s.head : s.tail);
  if (c === null || tile === null || !hitCircle(c, x, y)) return null;
  const at = filamentPoint(l, tile);
  return {
    player: field.seat,
    command: { kind: "drag", target: "filament", on: true, fromMilli: 0, fromYMilli: 0 },
    hold: { kind: "drag", target: "filament", player: field.seat, originX: at.x, originY: at.y },
  };
}
