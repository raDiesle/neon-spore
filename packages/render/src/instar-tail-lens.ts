import { type SeenRing, SIDE, type View, view } from "@neon-spore/content";

/**
 * Two measures of THE INSTAR's tail, cut off `instar-tail.ts` when the body's
 * record (`instar-body-look.ts`) took it to the size ceiling: where its curl
 * tops out, and the side view it is seen through at its lens.
 */

const W_OF = new Map<number, View>();

/**
 * Where the curl tops out: the highest ring, when it is well inside the tail
 * and the tail comes back down from it — else 0, and the tail is one tube.
 */
export function apex(seen: readonly SeenRing[]): number {
  let k = 0;
  for (let i = 1; i < seen.length; i++)
    if ((seen[i] as SeenRing).c.y < (seen[k] as SeenRing).c.y) k = i;
  const last = seen[seen.length - 1] as SeenRing;
  const rise = last.c.y - (seen[k] as SeenRing).c.y;
  return k > 1 && k < seen.length - 2 && rise > (seen[k] as SeenRing).r * 2 ? k : 0;
}

/** The side view at the tail's lens, one per head radius the field has been drawn at. */
export function lensView(lens: number): View {
  const key = Math.round(lens);
  let w = W_OF.get(key);
  if (!w) {
    if (W_OF.size > 8) W_OF.clear();
    w = view(SIDE, 0, key);
    W_OF.set(key, w);
  }
  return w;
}
