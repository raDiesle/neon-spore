import { swindleBoss } from "./swindle.js";
import { MILLI, type World } from "./world.js";

/**
 * **Two of THE SWINDLE's pods crossing pass one in front of the other.** A
 * swap glides on the pods' own crossing (`swindle-step.ts`), which moves only
 * their columns; on their own they would meet on one row and overlap halfway,
 * and the pilot could not follow them by eye. So every tick of a glide this
 * sets their rows on an arc: the pod going right dips toward the hull by
 * `swindleArcMilli` at the middle of the glide, and the other rises toward her
 * as far — each a pod's width clear of any pod still hanging between them.
 * Both are back on `swindlePodRow` when the glide stops.
 *
 * Run after `advancePods`, so the arc is read off the columns the tick has
 * just moved. **It reads nothing of what a pod is**: the same arc for a real
 * pod and a fake, so the pilot's screen still cannot tell them apart.
 */
export function swindleArc(world: World): void {
  const s = swindleBoss(world);
  if (s === null || s.phase !== "hang") return;
  const [a, b] = s.glide;
  const to = s.glideTo[0];
  const from = s.glideTo[1];
  if (a === undefined || b === undefined || to === undefined || from === undefined) return;
  if (to === from) return;
  const pa = world.pods.find((p) => p.id === a);
  const pb = world.pods.find((p) => p.id === b);
  if (pa === undefined || pb === undefined) return;
  // How far through the glide, in thousandths, read off the first pod.
  const k = Math.max(0, Math.min(MILLI, Math.round(((pa.colMilli - from) * MILLI) / (to - from))));
  // A parabola in integers, highest at the middle: no trigonometry in the
  // simulation (`purity.test.ts`).
  const lift = Math.round((world.cfg.swindleArcMilli * 4 * k * (MILLI - k)) / (MILLI * MILLI));
  const row = world.cfg.swindlePodRow * MILLI;
  const [front, back] = to > from ? [pa, pb] : [pb, pa];
  if (!front.loose) front.rowMilli = row + lift;
  if (!back.loose) back.rowMilli = row - lift;
}
