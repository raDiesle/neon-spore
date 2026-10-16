import type { BlisterSpawn } from "@neon-spore/sim";

/**
 * **A blister's fields, copied from the wave into the queue** — whose hand,
 * which gesture, which way, and the wave's three numbers for it (beats up,
 * blows, one blow's length; `sim/blister-numbers.ts`). Each only when the
 * wave set it, so a blister left at every default is byte-for-byte the queue
 * entry it always was, and `blisterOnSpawn` is the one place a default is
 * read. Out of `queue.ts` for its size; none of these goes through `mapCol` —
 * a seat, a gesture and a count are not columns.
 */
export function blisterQueueFields(e: BlisterSpawn): BlisterSpawn {
  return {
    ...(e.by === undefined ? {} : { by: e.by }),
    ...(e.gesture === undefined ? {} : { gesture: e.gesture }),
    ...(e.way === undefined ? {} : { way: e.way }),
    ...(e.upBeats === undefined ? {} : { upBeats: e.upBeats }),
    ...(e.blows === undefined ? {} : { blows: e.blows }),
    ...(e.lengthMilli === undefined ? {} : { lengthMilli: e.lengthMilli }),
  };
}
