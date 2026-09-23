import type { PressSpec } from "./spec.js";

/**
 * **The tick line a run of presses walks, and the tick each one is heard on.**
 *
 * Its own function, and tested as one, because it carries a rule that is
 * invisible at the call site and cost a lane a picture: **a press is only heard
 * on a tick that runs after it**. `send` pushes into the same buffer a thumb
 * pushes into and `drain` stamps it on the next tick `advance` runs, so a press
 * written at the same tick the capture stops at is a command sitting in a
 * buffer nothing will ever empty. The frame comes back with nothing pressed and
 * no error anywhere, which is the exact shape of failure the seat check above
 * exists to avoid.
 *
 * So the last place a press may land is one tick short of the end, and the
 * capture still stops on the tick the caller asked for. The presses arrive
 * sorted (`parsePress`), and each step is what to advance *before* it.
 */
export function pressPlan(
  presses: readonly PressSpec[],
  advanceBy: number,
): { advance: number; press?: PressSpec }[] {
  const last = Math.max(0, advanceBy - 1);
  const plan: { advance: number; press?: PressSpec }[] = [];
  let at = 0;
  for (const one of presses) {
    const step = Math.max(0, Math.min(one.tick, last) - at);
    plan.push({ advance: step, press: one });
    at += step;
  }
  plan.push({ advance: Math.max(0, advanceBy - at) });
  return plan;
}

/**
 * **Which frame of a strip each press is heard in.** The first frame's run
 * walks every press up to `advanceBy`; each later frame is `stride` ticks on
 * and walks the presses that fall inside those ticks, moved onto its own line
 * so `pressPlan` can lay them out. A press on a frame's own tick belongs to
 * that frame and is heard one tick before it, the same as the first.
 *
 * Without this a strip heard only the first frame's presses, and the guard in
 * `flags.ts` refused the rest rather than drop them in silence — so a flight
 * watched over eight frames had to be photographed as eight runs.
 */
export function pressesByFrame(
  presses: readonly PressSpec[],
  advanceBy: number,
  frames: number,
  stride: number,
): PressSpec[][] {
  const out: PressSpec[][] = [presses.filter((one) => one.tick <= advanceBy)];
  for (let i = 1, from = advanceBy; i < frames; i++, from += stride) {
    out.push(
      presses
        .filter((one) => one.tick > from && one.tick <= from + stride)
        .map((one) => ({ ...one, tick: one.tick - from })),
    );
  }
  return out;
}
