import {
  BEARING_TURN,
  type Command,
  crankWinds,
  hullRow,
  isMeteorKind,
  isWardable,
  MILLI,
  mawOpen,
  NO_BEARING,
  occupiesCol,
  type Pod,
  reachMilliPerTick,
  reachOut,
  shieldRow,
  type TimedCommand,
  type World,
  windPerTickMilli,
} from "@neon-spore/sim";
import type { Hand } from "./hand.js";

/**
 * **THE CLAW, on AUTO** (`sim/reach.ts`, `sim/crank.ts`): the arm sent up a
 * column for a pod crossing the field, wound home with it, and the maw opened
 * on the other seat as it arrives.
 *
 * The panel has no colours and no shield, so the field hand's cannon fired at
 * a pod nothing on it can shoot, and every pod crossed and left — the wave was
 * lost on the first (`docs/spec/wave-curriculum-today.md`, 14 October 2026).
 * The rule played is the pair's: player 1 stands the arm a column ahead of the
 * pod and presses as it is about to come over, so the tip and the pod meet;
 * then turns the crank until the arm is home; player 2 opens the mouth over
 * the last of the way. A column with a body under the pod's row is passed
 * over, since the arm would close on the body first and drop it on the hull.
 *
 * **A caught pod is held on the arm until it is wanted**, because the panel
 * has no shield and every rock is answered by a pod: a ward held until the
 * rock in the shield's column is close, so its beats cover the landing; a
 * purge held until the lowest rock is close, so every rock on the field by
 * then goes with it. It is wound in at once when another pod is crossing, since
 * the arm has to be home to reach for it, and when nothing more is coming.
 *
 * The world does not know its panel, so this is chosen by whoever does
 * (`autopilotHand`'s `arm`); a pod on any other panel is the cannon's.
 */

type Press = Omit<TimedCommand, "tick">;

/** How far off a column's centre the pod may be predicted and still be met. */
const MEET_MILLI = 300;

/** Rows above the shield at which a held pod's rock is close enough to wind it in. */
const HOLD_ROWS = 3;

const aim = (col: number): Press => ({ player: 1, command: { kind: "cannonCol", col } });
const reach: Press = { player: 1, command: { kind: "reach" } };
const intake: Press = { player: 2, command: { kind: "intake" } };
const crank = (fromMilli: number): Press => ({
  player: 1,
  command: { kind: "drag", target: "crank", on: true, fromMilli } satisfies Command,
});

/** Ticks the tip takes from the hull to `rowMilli`. */
const climbTicks = (w: World, rowMilli: number): number =>
  Math.ceil((hullRow(w.cfg) * MILLI - rowMilli) / reachMilliPerTick(w.cfg));

/** The hanging pod to reach for: the one that leaves the field soonest, a husk let go. */
function target(w: World): Pod | undefined {
  let best: Pod | undefined;
  for (const p of w.pods) {
    if (p.loose || p.husk || p.id === w.reachHeld) continue;
    if (best === undefined || Math.abs(p.crossMilli) > Math.abs(best.crossMilli)) best = p;
  }
  return best;
}

/** Whether a body stands in `col` between the hull and the pod's row. */
const blocked = (w: World, col: number, rowMilli: number): boolean =>
  w.creatures.some((c) => occupiesCol(c, col) && c.row * MILLI >= rowMilli - MILLI);

/** Whether the pod on the arm is held there a while yet, for a rock not close enough. */
function holding(w: World): boolean {
  const held = w.pods.find((p) => p.id === w.reachHeld);
  if (held === undefined || target(w) !== undefined) return false;
  const answers =
    held.kind === "ward"
      ? (c: World["creatures"][number]) => isWardable(c.kind) && occupiesCol(c, w.shieldCol)
      : (c: World["creatures"][number]) => isMeteorKind(c.kind);
  let lowest = -1;
  for (const c of w.creatures) if (answers(c)) lowest = Math.max(lowest, c.row);
  if (lowest < 0) return w.spawned < w.queue.length;
  return shieldRow(w.cfg) - lowest > HOLD_ROWS;
}

/** Player 1: wind a hanging arm home, or stand under the pod's meeting column and press. */
function arm(w: World): Press[] {
  if (reachOut(w)) {
    if (!crankWinds(w) || holding(w)) return [];
    const at = w.crankAtMilli;
    return [crank(at === NO_BEARING ? 0 : (at + windPerTickMilli(w.cfg)) % BEARING_TURN)];
  }
  const pod = target(w);
  if (pod === undefined) return [];
  const t = climbTicks(w, pod.rowMilli);
  const at = pod.colMilli + pod.crossMilli * t;
  const way = Math.sign(pod.crossMilli);
  let col =
    way > 0
      ? Math.ceil((at - MEET_MILLI) / MILLI)
      : way < 0
        ? Math.floor((at + MEET_MILLI) / MILLI)
        : Math.round(at / MILLI);
  while (col >= 0 && col < w.cfg.cols && blocked(w, col, pod.rowMilli)) col += way === 0 ? 1 : way;
  if (col < 0 || col >= w.cfg.cols) return [];
  if (w.cannonCol !== col) return [aim(col)];
  return Math.abs(at - col * MILLI) <= MEET_MILLI ? [reach] : [];
}

/** Player 2: the mouth open over the last of the way, for a pod carried or falling home. */
function mouth(w: World): Press[] {
  const home = w.pods.some(
    (p) =>
      !p.husk &&
      (p.loose || p.id === w.reachHeld) &&
      hullRow(w.cfg) * MILLI - p.rowMilli <= w.cfg.podHomeTiles * MILLI,
  );
  return home && !mawOpen(w) ? [intake] : [];
}

/** Both seats on THE CLAW's panel. */
export const clawHand: Hand = (w) => [...arm(w), ...mouth(w)];
