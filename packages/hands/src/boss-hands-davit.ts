import {
  type DavitState,
  type DavitStep,
  davitBoss,
  davitHalf,
  davitLitStep,
  midCol,
  type TimedCommand,
  type World,
} from "@neon-spore/sim";

/**
 * **THE DAVIT played right**, for the autopilot: the boom steered by one
 * seat's lean and loosed by the other's draw, and the pivot shot.
 *
 * **A lean is a level**, THE PLUMB's kind of reading (`sim/davit-hand.ts`): the
 * seat that steers the lit step leans to its target and says it again only
 * when the lean it has is not that one. On the left swing that is the pilot,
 * on the right the navigator; on a reland either may, and the pilot does.
 *
 * **A draw is THE SLING's**: the finger down on the other seat's loose, held
 * while the steered lean counts its beats, and lifted once they are counted
 * with a swipe toward the target's half. A lift before then springs the draw
 * slack, so the hand waits for the count and never guesses it.
 *
 * **A fire step is the shot out of the middle column**, in the step's colour,
 * or cyan for the white pivot that takes either (`sim/davit-shot.ts`).
 */
type Press = Omit<TimedCommand, "tick">;

export const davitHand = (w: World): Press[] => {
  const s = davitBoss(w);
  const step = s === null ? null : davitLitStep(s);
  if (s === null || step === null) return [];
  if (step.ask === "fire") {
    if (!s.pivotLit) return [];
    return [
      { player: 1, command: { kind: "cannonCol", col: midCol(w.cfg) } },
      {
        player: 2,
        command: { kind: "fire", color: step.color === "either" ? "cyan" : step.color },
      },
    ];
  }
  const steer: 0 | 1 = step.ask === "right" ? 1 : 0;
  return [...lean(s, step, steer), ...loose(s, step, steer === 0 ? 1 : 0)];
};

function lean(s: DavitState, step: DavitStep, side: 0 | 1): Press[] {
  if (s.tiltMilli[side] === step.leanMilli) return [];
  const target = side === 0 ? "davitSteerLeft" : "davitSteerRight";
  return [
    {
      player: side === 0 ? 1 : 2,
      command: { kind: "drag", target, on: true, fromMilli: step.leanMilli },
    },
  ];
}

function loose(s: DavitState, step: DavitStep, side: 0 | 1): Press[] {
  const target = side === 0 ? "davitLooseLeft" : "davitLooseRight";
  const player = side === 0 ? 1 : 2;
  if (!s.holding[side]) {
    return [{ player, command: { kind: "drag", target, on: true, fromMilli: 0 } }];
  }
  if (s.drawnBeats[side] < step.beats) return [];
  const swipe = davitHalf(step.leanMilli) === "left" ? -1 : 1;
  return [{ player, command: { kind: "drag", target, on: false, fromMilli: swipe } }];
}
