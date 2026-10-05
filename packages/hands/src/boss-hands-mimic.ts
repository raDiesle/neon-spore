import {
  type MimicState,
  midCol,
  mimicBoss,
  mimicDraws,
  mimicFiring,
  mimicShapeSize,
  mimicStep,
  mimicWants,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";

/**
 * **THE MIMIC played right**, for the autopilot. While a picture is up, the
 * first tile of a painter's picture that is not as it wants is tapped — once
 * paints it, once more clears a stray. With the core bare, the core is tapped.
 *
 * **One thing a third of a beat**, and never one a tick: a tap toggles, so a
 * hand that sent the same tap again before the first had landed would undo
 * it — and under delayed lockstep a press lands some ticks after it is sent.
 *
 * **A changing picture is waited for**: a step authored to change is painted
 * only once it has, so the hand plays the movement the way it is meant to be
 * played.
 */
type Press = Omit<TimedCommand, "tick">;

export const mimicHand = (w: World): Press[] => {
  const s = mimicBoss(w);
  if (s === null) return [];
  if (w.tick % Math.max(1, Math.floor(ticksPerBeat(w.cfg) / 3)) !== 0) return [];
  return mimicFiring(s) ? core(w) : paint(w, s);
};

function paint(w: World, s: MimicState): Press[] {
  const step = mimicStep(s);
  if (step === null || (step.changes && !s.changed)) return [];
  const cols = w.cfg.cols;
  for (const seat of [1, 2] as const) {
    if (!mimicDraws(s, seat)) continue;
    const origin = s.origins[seat - 1] ?? 0;
    const [c0, r0] = [origin % cols, Math.floor(origin / cols)];
    const { w: wide, h } = mimicShapeSize(s.signs[seat - 1] ?? 0);
    for (let dr = 0; dr < h; dr++) {
      for (let dc = 0; dc < wide; dc++) {
        const [col, row] = [c0 + dc, r0 + dr];
        if ((s.paint[col + row * cols] ?? 0) === mimicWants(w, s, seat, col, row)) continue;
        return [{ player: seat, command: { kind: "tapTile", col, row } }];
      }
    }
  }
  return [];
}

function core(w: World): Press[] {
  return [{ player: 1, command: { kind: "tapTile", col: midCol(w.cfg), row: w.cfg.mimicCoreRow } }];
}
