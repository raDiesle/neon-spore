import {
  type MantleState,
  mantleBoss,
  mantleBracing,
  mantleBuckling,
  mantleFinale,
  mantleLeaking,
  mantlePulling,
  mantleTurning,
  mantleVenting,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";

/**
 * **THE MANTLE played right**, for the STATES sheet and the autopilot: both
 * handles pulled together, the spark shot, and the core tapped out in turn.
 *
 * **The pull is a level, not an edge**, THE SPOOL's kind of press: a knob's
 * depth is carried until it is changed (`sim/mantle-hand.ts`), so each seat
 * presses its own knob at its depth and presses again only when the depth it
 * has is not the one wanted — which is every time the handles light, because
 * lighting puts both back to nought. The depth is half this movement's
 * threshold, never less than the floor: the two thumbs meet in the middle,
 * which is the half-way notch the groove draws (`mantle-handle.ts`), and
 * neither is the arm-wrestle the floor exists to refuse.
 *
 * **The brace is a thumb laid on and kept still** (§23 rows 7 and 8): a side
 * the shell reports let go is pressed at the top of its groove, and nothing
 * lifts until the last pull lights.
 *
 * **The story between** (§23 rows 7 to 12): the buckle is the brace's thumb
 * laid on at nought, eased rather than pulling; the vent is one tap on the
 * core, player 1's, the finish's edge; the turn is both handles at the floor,
 * which is the least that guides the halves open.
 *
 * **The finish is an edge**: a tap is judged on the press, so the seat whose
 * turn it is presses once every half beat and lets go on the tick after,
 * which is a thumb and not a held finger.
 *
 * **And the spark first**, shot out of its column with either colour
 * (`sim/mantle-shot.ts`), because unanswered it is the one blow this boss
 * lands on the hull.
 */
type Press = Omit<TimedCommand, "tick">;

export const mantleHand = (w: World): Press[] => {
  const s = mantleBoss(w);
  if (s === null) return [];
  return [...spark(s), ...brace(s), ...pull(w, s), ...turn(w, s), ...vent(w, s), ...tap(w, s)];
};

function brace(s: MantleState): Press[] {
  if (!mantleBracing(s) && !mantleBuckling(s)) return [];
  const out: Press[] = [];
  for (const index of [0, 1] as const) {
    if (s.held[index]) continue;
    const target = index === 0 ? "mantleLeft" : "mantleRight";
    const player = index === 0 ? 1 : 2;
    out.push({ player, command: { kind: "drag", target, on: true, fromMilli: 0, fromYMilli: 0 } });
  }
  return out;
}

function spark(s: MantleState): Press[] {
  if (!mantleLeaking(s)) return [];
  return [
    { player: 1, command: { kind: "cannonCol", col: s.sparkCol } },
    { player: 2, command: { kind: "fire", color: "cyan" } },
  ];
}

function pull(w: World, s: MantleState): Press[] {
  if (!mantlePulling(s)) return [];
  const need = s.thresholds[s.cursor] ?? 0;
  const depth = Math.max(w.cfg.mantleFloorMilli, Math.ceil(need / 2));
  const out: Press[] = [];
  for (const index of [0, 1] as const) {
    if (s.depthMilli[index] === depth) continue;
    const target = index === 0 ? "mantleLeft" : "mantleRight";
    const player = index === 0 ? 1 : 2;
    out.push({
      player,
      command: { kind: "drag", target, on: true, fromMilli: 0, fromYMilli: depth },
    });
  }
  return out;
}

function turn(w: World, s: MantleState): Press[] {
  if (!mantleTurning(s)) return [];
  const depth = w.cfg.mantleFloorMilli;
  const out: Press[] = [];
  for (const index of [0, 1] as const) {
    if (s.depthMilli[index] >= depth) continue;
    const target = index === 0 ? "mantleLeft" : "mantleRight";
    const player = index === 0 ? 1 : 2;
    out.push({
      player,
      command: { kind: "drag", target, on: true, fromMilli: 0, fromYMilli: depth },
    });
  }
  return out;
}

function vent(w: World, s: MantleState): Press[] {
  if (!mantleVenting(s)) return [];
  const at = w.tick % Math.max(2, Math.floor(ticksPerBeat(w.cfg) / 2));
  if (at === 0) return [core(1, true)];
  return at === 1 ? [core(1, false)] : [];
}

function tap(w: World, s: MantleState): Press[] {
  if (!mantleFinale(s)) return [];
  const every = Math.max(2, Math.floor(ticksPerBeat(w.cfg) / 2));
  const at = w.tick % every;
  if (at === 0) return [core(s.heartbeatNext === 0 ? 1 : 2, true)];
  // The seat that tapped last lets go; the other is already the one waited on.
  if (at === 1) return [core(s.heartbeatNext === 0 ? 2 : 1, false)];
  return [];
}

function core(player: 1 | 2, on: boolean): Press {
  return { player, command: { kind: "drag", target: "mantleCore", on, fromMilli: 0 } };
}
