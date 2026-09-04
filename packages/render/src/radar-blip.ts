import { showsRadar } from "@neon-spore/content";
import { bodyCenterCol, type SpawnEntry, spanOf, type World } from "@neon-spore/sim";
import { type Layout, tileCX } from "./layout.js";

/**
 * Which arrivals this screen's warning strip is carrying, and where each one
 * sits on it.
 *
 * **One copy of the arithmetic.** `drawRadar` walked the queue and worked out
 * the gate, the place and the size inline, which was fine while drawing was
 * the only thing that ever wanted them. A guide's caption wants them too — a
 * page about the strip has to point at the blip, and *"player 2 sees nothing"*
 * has to point at the place where a blip would be — and a second walk of the
 * same queue with the same four expressions in it is exactly the drift
 * `purity.test.ts` carries a table against. So the walk is here, and both
 * callers ask it.
 *
 * The gate is `showsRadar`, which is the split itself: a torch is announced on
 * player 1's strip and on nobody else's (`content/src/comms.ts`).
 */

export interface RadarBlip {
  /** The arrival being warned about. */
  entry: SpawnEntry;
  /** Beats until it enters the field. 0 is "next beat". */
  inBeats: number;
  x: number;
  y: number;
  /** Half the height of the mark, and how many columns wide it is. */
  s: number;
  span: number;
  alpha: number;
}

/** Every blip this screen carries, soonest first — the queue's own order. */
export function radarBlips(l: Layout, world: World): RadarBlip[] {
  const lead = world.cfg.radarLead;
  const out: RadarBlip[] = [];
  for (let i = world.spawned; i < world.queue.length; i++) {
    const q = world.queue[i]!;
    if (!showsRadar(l.role, q.kind)) continue;
    const inBeats = q.beat - (world.waveBeat - 1);
    if (inBeats < 0 || inBeats > lead) continue;
    out.push({
      entry: q,
      inBeats,
      // `q.col` is a wide kind's leftmost column (`spanCenterCol` in
      // sim/types.ts) — the blip itself is drawn at the visual centre.
      x: tileCX(l, bodyCenterCol(q, q.col)),
      y: l.gridTop - 7 - inBeats * ((l.radarHeight - 12) / lead),
      s: 5 + 4 * (1 - inBeats / (lead + 1)),
      // How wide the thing being warned about actually is. Asked of the entry
      // rather than of its kind: the torch is no longer the only two-tile
      // rock, and a blip drawn one tile wide over a rock that covers two is a
      // warning that names the wrong number of columns out loud.
      span: spanOf(q),
      alpha: Math.max(0.18, 1 - inBeats / (lead + 1)),
    });
  }
  return out;
}
