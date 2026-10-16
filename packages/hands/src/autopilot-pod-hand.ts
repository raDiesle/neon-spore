import {
  hullRow,
  MILLI,
  mawOpen,
  type Pod,
  podTicksToHull,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";

/**
 * **The pods, on an ordinary wave**: shot loose, followed down, swallowed —
 * and a husk followed down and let past with the maw shut.
 *
 * The field hand's cannon half asks this first (`autopilot-field-hand.ts`).
 * A falling pod comes before any body, because a pod that reaches the skin is
 * a hit and nothing else on the field is waiting on the cannon's column; a
 * hanging one comes after every body until its clock is short (`duePod`),
 * and then before them, because a pod left too long loses the wave
 * (`Pod.dueTicks`). The rule is the one the pair says out loud: player 2
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
// Any colour frees a pod but a coloured one, which only its own does.
const fire = (p: Pod): Press => ({ player: 2, command: { kind: "fire", color: p.tint ?? "red" } });

/** Beats over the fall itself a hanging pod's clock is left before it is shot
 * loose ahead of every body: the column to reach, the shot to land, a margin. */
const DUE_MARGIN_BEATS = 5;

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
  if (pod.kind === "husk") return [];
  // A heavy pod in the grip: the second press, now (`sim/pod-options.ts`).
  if (pod.gripTicks !== undefined) return [intake];
  const near = hullRow(w.cfg) * MILLI - pod.rowMilli <= w.cfg.podHomeTiles * MILLI;
  return near && !mawOpen(w) ? [intake] : [];
}

/**
 * A real pod still hanging whose clock is down to its fall and a margin: the
 * one that has to be shot loose now, whatever else is on the field. A husk is
 * never due — its clock running out costs nothing (`pods.ts`).
 */
export function duePod(w: World): Pod | undefined {
  const margin = DUE_MARGIN_BEATS * ticksPerBeat(w.cfg);
  let best: Pod | undefined;
  for (const p of w.pods) {
    if (p.loose || p.kind === "husk" || p.dueTicks <= 0) continue;
    if (p.dueTicks > podTicksToHull(w, p) + margin) continue;
    if (!best || p.dueTicks < best.dueTicks) best = p;
  }
  return best;
}

/** Both seats' presses for a due pod, or `null` when none is: the cannon under
 * it and a shot up the column, in any colour, once nothing is in the air. */
export function freeDuePod(w: World): Press[] | null {
  const pod = duePod(w);
  if (pod === undefined) return null;
  const col = colOf(pod);
  if (w.cannonCol !== col) return [aim(col)];
  return w.bullets.length === 0 && w.beam === null ? [fire(pod)] : [];
}
