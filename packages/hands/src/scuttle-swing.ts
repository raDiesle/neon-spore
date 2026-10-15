import {
  MILLI,
  type ScuttleState,
  scuttleAttached,
  scuttlePartCol,
  scuttleSocketCol,
  scuttleSwingable,
  scuttleSwingCol,
  type TimedCommand,
  type World,
} from "@neon-spore/sim";

type Press = Omit<TimedCommand, "tick">;

/**
 * **The pilot's one carry a cycle on THE SCUTTLE's frame**, and which part
 * it goes on. Its own file beside `boss-hands-field.ts`, whose hand asks it
 * first every tick.
 *
 * A rock the frame throws falls a row a beat and stops the beam it meets
 * (`sim/lance-burn.ts`), so one thrown down a column some part still hangs
 * over can stand in the last part's column through the whole wind-up — the
 * column only the beam ends the fight in, and a pod left hanging there stops
 * it the same way. Which attached part is last is the seed's, so every column
 * one hangs over is that column until it is not: a rock or a pod about to be
 * thrown over one is carried to the side that has fewer. With none, the carry
 * goes on the live part — a column nearer the cannon, which is a beat of aim
 * bought, or out from over a hanging pod, which no bolt gets past.
 */

/** The pilot's thumb on hanging part `id`, carried `milli` along the frame. */
const hangingPart = (id: number, milli: number): Press => ({
  player: 1,
  command: { kind: "drag", target: "scuttlePart", on: true, fromMilli: milli, id },
});

/** How many attached parts hang over `col`: the chance it is the last one's. */
function hangsOver(w: World, s: ScuttleState, col: number): number {
  let n = 0;
  for (const i of scuttleAttached(s)) if (scuttleSocketCol(w.cfg, i) === col) n += 1;
  return n;
}

/** The way that carries part `id` over fewer attached parts, or `0` when neither does. */
function clearWay(w: World, s: ScuttleState, id: number): 1 | -1 | 0 {
  const from = scuttlePartCol(s, w.cfg, id);
  let best: 1 | -1 | 0 = 0;
  let fewest = hangsOver(w, s, from);
  for (const dir of [1, -1] as const) {
    const to = scuttleSwingCol(s, w.cfg, id, dir);
    const n = hangsOver(w, s, to);
    if (to !== from && n < fewest) {
      best = dir;
      fewest = n;
    }
  }
  return best;
}

/** A pod hanging in `col`, which stops a bolt fired up it at a part above. */
function podIn(w: World, col: number): boolean {
  return w.pods.some((p) => !p.loose && Math.round(p.colMilli / MILLI) === col);
}

/** The way that brings the live part a column nearer the cannon, out from over a hanging pod; `0` when none does. */
function liveWay(w: World, s: ScuttleState): 1 | -1 | 0 {
  const from = scuttlePartCol(s, w.cfg, s.live);
  const dirs = w.cannonCol < from ? ([-1, 1] as const) : ([1, -1] as const);
  for (const dir of dirs) {
    const to = scuttleSwingCol(s, w.cfg, s.live, dir);
    if (to === from || podIn(w, to)) continue;
    if (podIn(w, from) || Math.abs(to - w.cannonCol) < Math.abs(from - w.cannonCol)) return dir;
  }
  return 0;
}

/**
 * The part to carry and the way: a rock or a pod about to be thrown over a
 * part still attached, one that will be thrown before one that may be struck;
 * else the live part, nearer the cannon or out from over a hanging pod.
 */
function choice(w: World, s: ScuttleState): { id: number; dir: 1 | -1 } | null {
  const blocks = s.loose
    .filter((i) => s.parts[i]?.kind !== "body")
    .sort((a, b) => Number(a === s.live) - Number(b === s.live));
  for (const id of blocks) {
    const dir = clearWay(w, s, id);
    if (dir !== 0) return { id, dir };
  }
  if (s.live < 0) return null;
  const dir = liveWay(w, s);
  return dir === 0 ? null : { id: s.live, dir };
}

/**
 * The pilot takes hold of a hanging part and carries it a column, once a
 * cycle (`sim/scuttle-hand.ts`). Two ticks on purpose: the grab is a state of
 * its own before any carry is worth anything, and a hand that sent both at
 * once would never put the world in it.
 */
export function swingPart(w: World, s: ScuttleState): Press[] {
  if (!scuttleSwingable(s)) return [];
  const pick = choice(w, s);
  if (pick === null) return [];
  if (s.held !== pick.id) return [hangingPart(pick.id, 0)];
  return [hangingPart(pick.id, pick.dir * w.cfg.scuttleSwingMilli)];
}
