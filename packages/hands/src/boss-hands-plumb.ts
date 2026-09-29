import {
  midCol,
  type PlumbState,
  plumbBoss,
  plumbLitStep,
  type TimedCommand,
  type World,
} from "@neon-spore/sim";

type Press = Omit<TimedCommand, "tick">;

/**
 * **THE PLUMB, on AUTO**: both stones pulled half the lit step's skew each,
 * the other way, so the bob hangs dead true; then a shot at the core once
 * both weights are true.
 */
export const plumbHand = (w: World): Press[] => {
  const s = plumbBoss(w);
  if (s === null) return [];
  return [...level(s), ...shoot(w, s)];
};

/** Both seats' pulls while a level step is lit, and both thumbs up otherwise. */
function level(s: PlumbState): Press[] {
  const step = plumbLitStep(s);
  const on = step !== null && step.ask !== "fire";
  const skew = on ? step.skewMilli : 0;
  const half = Math.trunc(skew / 2);
  const pulls = [-half, half - skew] as const;
  const out: Press[] = [];
  for (const side of [0, 1] as const) {
    const target = side === 0 ? "plumbLevelLeft" : "plumbLevelRight";
    const player: 1 | 2 = side === 0 ? 1 : 2;
    out.push({ player, command: { kind: "drag", target, on, fromMilli: on ? pulls[side] : 0 } });
  }
  return out;
}

/** The cannon on the middle column, fired in the lit core's colour. */
function shoot(w: World, s: PlumbState): Press[] {
  const step = plumbLitStep(s);
  if (step?.ask !== "fire" || !s.coreLit) return [];
  return [
    { player: 1, command: { kind: "cannonCol", col: midCol(w.cfg) } },
    { player: 2, command: { kind: "fire", color: step.color === "either" ? "cyan" : step.color } },
  ];
}
