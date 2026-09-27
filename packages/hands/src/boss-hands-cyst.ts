import {
  type CystState,
  cystBoss,
  cystFreezer,
  cystLitStep,
  cystPincher,
  cystSide,
  cystStepCol,
  midCol,
  type TimedCommand,
  type World,
} from "@neon-spore/sim";

/**
 * **THE CYST played right**, for the autopilot: on a lit flank step the
 * partner taps it still and its own seat pinches it shut until the step's
 * beats are held; on a swell both seats pinch their own flank at once; the
 * bared core and a bud shot in their colour up their column; a spore turned
 * by the shield under it.
 *
 * **The tap is an edge**, THE VALVE's pin (`boss-hands-valve.ts`): a thumb
 * still down on a freeze mark is lifted the tick after it came down, so the
 * next flank is stilled by a tap and never by a thumb parked there.
 *
 * **The gap is a level**, THE VISE's lobe (`boss-hands-vise.ts`): a seat sends
 * its fingertips pressed together once its flank is stilled, or a swell is
 * lit, and lets go once the step is answered — a gap widening while the
 * flank is still asked for would be a slip, so the lift waits for the step
 * to go.
 *
 * **The shot** wants the step's colour; the white core takes either, and the
 * navigator fires cyan. The cannon is slid only while it is off the column
 * and the shot is sent once it is on it.
 */
type Press = Omit<TimedCommand, "tick">;

export const cystHand = (w: World): Press[] => {
  const s = cystBoss(w);
  if (s === null) return [];
  return [...tap(s), ...pinch(w, s), ...shoot(w, s), ...shield(w, s)];
};

const FREEZE = ["cystFreezeLeft", "cystFreezeRight"] as const;
const FLANK = ["cystFlankLeft", "cystFlankRight"] as const;

function tap(s: CystState): Press[] {
  const lifts = ([0, 1] as const)
    .filter((side) => s.tapDown[side])
    .map((side) => freeze(side, false));
  if (lifts.length > 0) return lifts;
  const side = cystSide(s);
  if (s.phase !== "lit" || side === null) return [];
  return [freeze(side, true)];
}

function pinch(w: World, s: CystState): Press[] {
  const side = cystSide(s);
  const swell = cystLitStep(s)?.ask === "swell";
  const out: Press[] = [];
  for (const flank of [0, 1] as const) {
    const want = swell || (s.phase === "frozen" && side === flank);
    const gap = want ? 0 : w.cfg.cystOpenMilli;
    if (s.gapMilli[flank] === gap) continue;
    out.push({
      player: cystPincher(flank),
      command: { kind: "drag", target: FLANK[flank], on: want, fromMilli: gap },
    });
  }
  return out;
}

function shoot(w: World, s: CystState): Press[] {
  const step = cystLitStep(s);
  if (step?.ask !== "bud" && (step?.ask !== "fire" || !s.bared)) return [];
  const col = cystStepCol(midCol(w.cfg), step);
  if (w.cannonCol !== col) return [{ player: 1, command: { kind: "cannonCol", col } }];
  const color = step.color === "either" ? "cyan" : step.color;
  return [{ player: 2, command: { kind: "fire", color } }];
}

function shield(w: World, s: CystState): Press[] {
  const step = cystLitStep(s);
  if (step?.ask !== "spit") return [];
  const col = cystStepCol(midCol(w.cfg), step);
  if (w.shieldCol !== col) return [{ player: 2, command: { kind: "shieldCol", col } }];
  return [{ player: 1, command: { kind: "guard" } }];
}

const freeze = (side: 0 | 1, on: boolean): Press => ({
  player: cystFreezer(side),
  command: { kind: "drag", target: FREEZE[side], on, fromMilli: 0 },
});
