import {
  midCol,
  type TimedCommand,
  TRIVET_PADS,
  type TrivetState,
  trivetBoss,
  trivetLitStep,
  trivetStepCol,
  trivetTipSide,
  type World,
} from "@neon-spore/sim";

/**
 * **THE TRIVET played right**, for the STATES sheet and the autopilot: the lit
 * foot's chord held down by its own seat (both chords on a `both` step), and
 * the lit hub shot in its colour up the middle.
 *
 * **A pad is a level**: each seat's pads are recorded as a mask on the tick
 * they are sent and stay so (`sim/trivet-hand.ts`), so a seat puts down the
 * pads its step lights once, one drag each, and lifts them once the step is
 * answered. The lift is safe — the stand is resting by then, and a slip is
 * only heard while a chord step is lit and closed — and a foot not asked for
 * is lifted too, so a chord never outlasts its step.
 *
 * **The shot** wants the step's colour; the white hub takes either, and the
 * navigator fires cyan. On a lurch the leaning foot's seat holds its chord
 * and the shot goes up the column the hub swung to.
 *
 * **The needle** is the shield slid under its column, then the guard.
 */
type Press = Omit<TimedCommand, "tick">;

export const trivetHand = (w: World): Press[] => {
  const s = trivetBoss(w);
  if (s === null) return [];
  return [...chord(s), ...shoot(w, s), ...turn(w, s)];
};

function chord(s: TrivetState): Press[] {
  const step = trivetLitStep(s);
  const out: Press[] = [];
  for (const side of [0, 1] as const) {
    const ask = step?.ask;
    const tip = ask === "tip" && step !== null && trivetTipSide(step) === side;
    const want = tip || ask === "both" || ask === (side === 0 ? "front" : "rear");
    const mask = want && step ? (1 << Math.min(TRIVET_PADS, step.pads)) - 1 : 0;
    const target = side === 0 ? "trivetPadFront" : "trivetPadRear";
    const player = side === 0 ? 1 : 2;
    for (let pad = 0; pad < TRIVET_PADS; pad++) {
      const on = (mask & (1 << pad)) !== 0;
      if (((s.padsDown[side] & (1 << pad)) !== 0) === on) continue;
      out.push({ player, command: { kind: "drag", target, on, fromMilli: 0, id: pad } });
    }
  }
  return out;
}

function shoot(w: World, s: TrivetState): Press[] {
  const step = trivetLitStep(s);
  if (step === null || (step.ask !== "fire" && step.ask !== "tip") || !s.hubLit) return [];
  return [
    { player: 1, command: { kind: "cannonCol", col: trivetStepCol(midCol(w.cfg), step) } },
    { player: 2, command: { kind: "fire", color: step.color === "either" ? "cyan" : step.color } },
  ];
}

function turn(w: World, s: TrivetState): Press[] {
  const step = trivetLitStep(s);
  if (step?.ask !== "needle") return [];
  const col = trivetStepCol(midCol(w.cfg), step);
  if (w.shieldCol !== col) return [{ player: 2, command: { kind: "shieldCol", col } }];
  return [{ player: 1, command: { kind: "guard" } }];
}
