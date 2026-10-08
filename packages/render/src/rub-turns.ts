import type { Layout } from "./layout.js";
import type { Pinched } from "./pinch-pair.js";
import { RUB_TURN, rubFinger, rubSays } from "./rub.js";
import type { Hold } from "./touch-hold.js";

type RubHold = Extract<Hold, { kind: "drag" }>;

interface Thumb {
  hold: RubHold;
  /** Where it went down, and the way it is rubbing once it has gone far enough to say. */
  x: number;
  y: number;
  axis: { x: number; y: number } | null;
  /** How far along the axis it has got this stroke, signed the way the stroke runs. */
  reach: number;
  /** Which way this stroke runs along the axis. */
  sense: 1 | -1;
  turns: number;
}

/**
 * **How many times a thumb has turned back** — the pointers' half of
 * `RubCount`, whose meaning is `render/rub.ts`'s.
 *
 * A press on a rubbed face takes hold and says nothing
 * (`render/rime-grip.ts`). Here it is counted: the press says nought,
 * and the first `RUB_TURN` of a tile it travels sets the **axis** it rubs
 * along, whichever way that is — up and down a flat, or across it. From then
 * only the thumb's reach along that axis is read, and coming back `RUB_TURN`
 * from the furthest this stroke got is one turn, sent at once with the count
 * so far. The lift sends the count with `on` false, and the simulation starts
 * it again from nought (`sim/rime-hand.ts`).
 */
export class Rubs {
  private readonly thumbs = new Map<number, Thumb>();

  /** A thumb down, with the holds its press took. */
  down(id: number, holds: readonly Hold[], x: number, y: number): Pinched | null {
    const hold = holds.find(rubFinger);
    if (!hold) return null;
    this.thumbs.set(id, { hold, x, y, axis: null, reach: 0, sense: 1, turns: 0 });
    return { player: hold.player, command: rubSays(hold, 0, true) };
  }

  /** A thumb moved: a message only when it has just turned back. */
  move(l: Layout, id: number, x: number, y: number): Pinched | null {
    const t = this.thumbs.get(id);
    if (!t) return null;
    const turn = RUB_TURN * l.tile;
    const dx = x - t.x;
    const dy = y - t.y;
    if (t.axis === null) {
      const d = Math.hypot(dx, dy);
      if (d < turn) return null;
      t.axis = { x: dx / d, y: dy / d };
    }
    const at = (dx * t.axis.x + dy * t.axis.y) * t.sense;
    if (at > t.reach) t.reach = at;
    if (at > t.reach - turn) return null;
    // Turned: the stroke back is measured from here, the other way.
    t.x = x;
    t.y = y;
    t.reach = 0;
    t.sense = t.sense === 1 ? -1 : 1;
    t.turns += 1;
    return { player: t.hold.player, command: rubSays(t.hold, t.turns, true) };
  }

  /** A thumb lifted, or lost. */
  up(id: number): Pinched | null {
    const t = this.thumbs.get(id);
    if (!t) return null;
    this.thumbs.delete(id);
    return { player: t.hold.player, command: rubSays(t.hold, t.turns, false) };
  }
}
