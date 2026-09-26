import {
  midCol,
  type TimedCommand,
  type ViseState,
  viseBoss,
  viseLitStep,
  type World,
} from "@neon-spore/sim";

/**
 * **THE VISE played right**, for the STATES sheet and the autopilot: the lit
 * lobe pinched shut by its own seat (both lobes on a `both` step), and the
 * bared kernel shot in its colour up the middle.
 *
 * **The gap is a level**: a lobe's gap is recorded on the tick it is sent and
 * stays so (`sim/vise-hand.ts`), so a seat sends its fingertips pressed
 * together once when its lobe is asked for, and lets go once the step is
 * answered. The lift after a crack is safe — the case is already resting, and
 * a slip is only heard while a pinch step is lit; a lobe not asked for is
 * let go too, so a pinch never outlasts its step.
 *
 * **The shot** wants the step's colour; the white kernel takes either, and
 * the navigator fires cyan.
 */
type Press = Omit<TimedCommand, "tick">;

export const viseHand = (w: World): Press[] => {
  const s = viseBoss(w);
  if (s === null) return [];
  return [...pinch(w, s), ...shoot(w, s)];
};

function pinch(w: World, s: ViseState): Press[] {
  const ask = viseLitStep(s)?.ask;
  const out: Press[] = [];
  for (const side of [0, 1] as const) {
    const want = ask === "both" || ask === (side === 0 ? "left" : "right");
    const gap = want ? 0 : w.cfg.viseOpenMilli;
    if (s.gapMilli[side] === gap) continue;
    const target = side === 0 ? "viseLobeLeft" : "viseLobeRight";
    const player = side === 0 ? 1 : 2;
    out.push({ player, command: { kind: "drag", target, on: want, fromMilli: gap } });
  }
  return out;
}

function shoot(w: World, s: ViseState): Press[] {
  const step = viseLitStep(s);
  if (step?.ask !== "fire" || !s.bared) return [];
  return [
    { player: 1, command: { kind: "cannonCol", col: midCol(w.cfg) } },
    { player: 2, command: { kind: "fire", color: step.color === "either" ? "cyan" : step.color } },
  ];
}
