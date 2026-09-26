import { hullRow, MILLI, mawOpen, type Pod, type TimedCommand, type World } from "@neon-spore/sim";

/**
 * **The pods, on an ordinary wave**: shot loose, followed down, swallowed —
 * and a husk followed down and let past with the maw shut.
 *
 * The field hand's cannon half asks this first (`autopilot-field-hand.ts`).
 * A falling pod comes before any body, because a pod that reaches the skin is
 * a hit and nothing else on the field is waiting on the cannon's column; a
 * hanging one comes after every body, because it waits for as long as it is
 * left (`pods.ts`). The rule is the one the pair says out loud: player 2
 * shoots it loose, player 1 stands under it and opens the maw as it arrives.
 *
 * The maw is held open by pressing it again whenever it has shut, over the
 * last stretch of the fall — the stretch in which the pod steers into the
 * cannon's column anyway. No arrival tick is worked out here: the window the
 * maw keeps is the simulation's, asked through `mawOpen`.
 */

type Press = Omit<TimedCommand, "tick">;

const aim = (col: number): Press => ({ player: 1, command: { kind: "cannonCol", col } });
const intake: Press = { player: 1, command: { kind: "intake" } };

const colOf = (p: Pod): number => Math.round(p.colMilli / MILLI);

/** The pod the pair is chasing down: the loose one nearest the hull. */
function falling(w: World): Pod | undefined {
  let best: Pod | undefined;
  for (const p of w.pods) if (p.loose && (!best || p.rowMilli > best.rowMilli)) best = p;
  return best;
}

/** A hanging pod, the lowest first: the next one to shoot loose. */
export function hanging(w: World): Pod | undefined {
  let best: Pod | undefined;
  for (const p of w.pods) if (!p.loose && (!best || p.rowMilli > best.rowMilli)) best = p;
  return best;
}

/**
 * Player 1's presses for a pod on its way down, or `null` when none is: the
 * cannon under it, and the maw opened over the last stretch unless it is a
 * husk. A husk is followed all the same — it steers into the cannon's column
 * at the end whatever the cannon does — and refused by never opening.
 */
export function catchPod(w: World): Press[] | null {
  const pod = falling(w);
  if (pod === undefined) return null;
  const col = colOf(pod);
  if (w.cannonCol !== col) return [aim(col)];
  if (pod.husk) return [];
  const near = hullRow(w.cfg) * MILLI - pod.rowMilli <= w.cfg.podHomeTiles * MILLI;
  return near && !mawOpen(w) ? [intake] : [];
}
