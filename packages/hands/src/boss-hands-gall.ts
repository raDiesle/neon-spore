import {
  type GallState,
  gallBoss,
  gallClosing,
  gallLitStep,
  gallPincher,
  midCol,
  type TimedCommand,
  type World,
} from "@neon-spore/sim";

/**
 * **THE GALL played right**, for the autopilot: on a close step the seat
 * whose half the gall sits on pinches it shut where it is and keeps it shut,
 * and when it jumps, that seat — or the other — pinches it on the point it
 * went to; with the root bared, the cannon to the middle and the step's
 * colour up it.
 *
 * **The gap is a level**, THE VISE's (`boss-hands-vise.ts`): the gap is
 * recorded on the tick it is sent (`sim/gall-hand.ts`), so the pincher sends
 * its fingertips together once when a close is lit, and lets go once the
 * step is answered. A close leaves the pinch on nothing and the gap open
 * again (`gall-step.ts`), which is what makes the hand send it again where
 * the gall now sits. The pinch's `id` is the point it goes down on.
 *
 * **The shot** wants the step's colour; `"either"` is fired cyan. The cannon
 * is slid only while it is not on the middle column and the shot is sent
 * once it is.
 */
type Press = Omit<TimedCommand, "tick">;

export const gallHand = (w: World): Press[] => {
  const s = gallBoss(w);
  if (s === null) return [];
  return [...pinch(w, s), ...shoot(w, s)];
};

function pinch(w: World, s: GallState): Press[] {
  const want = gallClosing(s);
  const gap = want ? 0 : w.cfg.gallOpenMilli;
  if (s.gapMilli === gap) return [];
  return [
    {
      player: gallPincher(s),
      command: { kind: "drag", target: "gallPinch", on: want, fromMilli: gap, id: s.point },
    },
  ];
}

function shoot(w: World, s: GallState): Press[] {
  const step = gallLitStep(s);
  if (step?.ask !== "fire" || !s.bared) return [];
  const col = midCol(w.cfg);
  if (w.cannonCol !== col) return [{ player: 1, command: { kind: "cannonCol", col } }];
  const color = step.color === "either" ? "cyan" : step.color;
  return [{ player: 2, command: { kind: "fire", color } }];
}
