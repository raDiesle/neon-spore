import {
  midCol,
  type RimeState,
  rimeBoss,
  rimeIcicleCol,
  rimeLitStep,
  rimeRubbing,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";

/**
 * **THE RIME played right**, for the autopilot: each lit half wiped clear by
 * its own seat, both at once through a whiteout, the bared core shot in the
 * step's colour up the middle, and the shield carried under a surge or an
 * icicle and pressed.
 *
 * **A wipe is a rub**, THE CAPSTAN's (`boss-hands-capstan.ts`): the
 * drag's `id` is how many reversals the thumb has made since it went down
 * (`sim/rime-hand.ts`), so a seat whose half is asked for sends one more than
 * the lens last heard, four times a beat, and lifts once it is not.
 *
 * **The shot** wants the step's colour; the white core takes either, and the
 * navigator fires cyan. **The shield** goes where the step says — the middle
 * for a surge, the icicle's own column for an icicle — as THE OCULUS carries
 * it (`boss-hands-oculus.ts`).
 */
type Press = Omit<TimedCommand, "tick">;

/** Reversals a beat: about what a thumb rubbing back and forth manages. */
const RUBS_PER_BEAT = 4;

export const rimeHand = (w: World): Press[] => {
  const s = rimeBoss(w);
  if (s === null) return [];
  return [...wipe(w, s), ...shoot(w, s), ...shield(w, s)];
};

function wipe(w: World, s: RimeState): Press[] {
  const every = Math.max(1, Math.floor(ticksPerBeat(w.cfg) / RUBS_PER_BEAT));
  const out: Press[] = [];
  for (const side of [0, 1] as const) {
    const target = side === 0 ? "rimeHalfLeft" : "rimeHalfRight";
    const player = side === 0 ? 1 : 2;
    if (rimeRubbing(s, side) && s.rimeMilli[side] > 0) {
      if (w.tick % every !== 0) continue;
      const id = s.rubs[side] + 1;
      out.push({ player, command: { kind: "drag", target, on: true, fromMilli: 0, id } });
    } else if (s.rubs[side] !== 0) {
      out.push({ player, command: { kind: "drag", target, on: false, fromMilli: 0 } });
    }
  }
  return out;
}

function shoot(w: World, s: RimeState): Press[] {
  const step = rimeLitStep(s);
  if (step?.ask !== "fire" || !s.bared) return [];
  return [
    { player: 1, command: { kind: "cannonCol", col: midCol(w.cfg) } },
    { player: 2, command: { kind: "fire", color: step.color === "either" ? "cyan" : step.color } },
  ];
}

function shield(w: World, s: RimeState): Press[] {
  const step = rimeLitStep(s);
  if (step?.ask !== "shield" && step?.ask !== "icicle") return [];
  const mid = midCol(w.cfg);
  const col = step.ask === "icicle" ? rimeIcicleCol(mid, step) : mid;
  if (w.shieldCol !== col) return [{ player: 2, command: { kind: "shieldCol", col } }];
  return [{ player: 1, command: { kind: "guard" } }];
}
