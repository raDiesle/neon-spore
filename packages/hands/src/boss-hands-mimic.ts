import {
  type MimicState,
  midCol,
  mimicBoss,
  mimicDraws,
  mimicFiring,
  mimicPaintMode,
  mimicShapeSize,
  mimicStep,
  mimicWants,
  THROAT_MODES,
  type TimedCommand,
  throatModeSeat,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";

/**
 * **THE MIMIC played right**, for the autopilot. While a picture is up, the
 * first tile of a painter's picture that is not as it wants is put right:
 * the brush set to the colour it needs by the seat whose button that is, then
 * the tile tapped — once to paint it, or, with the brush in the colour a
 * stray is painted, once to clear it. With the core bare, the brush is set to
 * its colour and the core is tapped.
 *
 * **One thing a third of a beat**, and never one a tick: a tap toggles, so a
 * hand that sent the same tap again before the first had landed would undo
 * it — and under delayed lockstep a press lands some ticks after it is sent.
 *
 * **A changing picture is waited for**: a step authored to change is painted
 * only once it has, so the hand plays the movement the way it is meant to be
 * played. `"either"` on the core is tapped cyan.
 */
type Press = Omit<TimedCommand, "tick">;

export const mimicHand = (w: World): Press[] => {
  const s = mimicBoss(w);
  if (s === null) return [];
  if (w.tick % Math.max(1, Math.floor(ticksPerBeat(w.cfg) / 3)) !== 0) return [];
  return mimicFiring(s) ? core(w, s) : paint(w, s);
};

/** The brush set to `paint` by the seat that owns its button, or nothing if it already is. */
function brush(s: MimicState, paint: number): Press[] {
  const mode = mimicPaintMode(paint);
  if (mode === null || s.brush === paint) return [];
  return [{ player: throatModeSeat(mode), command: { kind: "throatMode", mode } }];
}

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
        const has = s.paint[col + row * cols] ?? 0;
        const wants = mimicWants(w, s, seat, col, row);
        if (has === wants) continue;
        // A stray is cleared with the brush in its own colour; a gap painted with the one it wants.
        const set = brush(s, wants === 0 ? has : wants);
        return set.length > 0 ? set : [{ player: seat, command: { kind: "tapTile", col, row } }];
      }
    }
  }
  return [];
}

function core(w: World, s: MimicState): Press[] {
  const step = mimicStep(s);
  if (step === null) return [];
  const color = step.color === "either" ? "cyan" : step.color;
  const set = brush(s, THROAT_MODES.indexOf(color) + 1);
  if (set.length > 0) return set;
  return [{ player: 1, command: { kind: "tapTile", col: midCol(w.cfg), row: w.cfg.mimicCoreRow } }];
}
