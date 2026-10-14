import {
  type Color,
  type HydraState,
  hydraBoss,
  hydraEyeOpen,
  hydraHeadOf,
  hydraLitStep,
  hydraTarget,
  hydraUnwindWay,
  hydraWayOf,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";

/**
 * **THE HYDRA played right**, for the autopilot, a level at a time:
 *
 * - **The bites**: each seat presses on its own next neck, swipes across it
 *   past the cut the way its arrow points, and lifts.
 * - **The coils**: each seat takes its coil's lever and carries it round the
 *   way it unwinds, a short stride a message, until the coil is off.
 * - **The eyes**: each seat taps its own eye while it is open, and lifts.
 * - **The maws**: the pilot slides the cannon under the open maw, and the
 *   navigator fires its fire's colour — one bolt at a time, so none is left
 *   over for the next maw.
 *
 * **A message a third of a beat**, THE CHRYSALIS's reason: the cut and the
 * coil are read from where the simulation last heard them, and a hand that
 * sent again before that landed would send twice.
 */
type Press = Omit<TimedCommand, "tick">;

export const hydraHand = (w: World): Press[] => {
  const s = hydraBoss(w);
  const step = s === null ? null : hydraLitStep(s);
  if (s === null || step === null) return [];
  if (step.head === "maw") return shoot(w);
  const paced = w.tick % Math.max(1, Math.floor(ticksPerBeat(w.cfg) / 3)) === 0;
  if (!paced) return [];
  if (step.head === "bite") return [...cut(w, s, 0), ...cut(w, s, 1)];
  if (step.head === "coil") return [...coil(s, 0), ...coil(s, 1)];
  return [...poke(s, 0), ...poke(s, 1)];
};

const NECK = ["hydraNeckLeft", "hydraNeckRight"] as const;
const COIL = ["hydraCoilLeft", "hydraCoilRight"] as const;
const EYE = ["hydraEyeLeft", "hydraEyeRight"] as const;

function cut(w: World, s: HydraState, seat: 0 | 1): Press[] {
  const target = NECK[seat];
  const player = seat === 0 ? 1 : 2;
  const step = hydraLitStep(s);
  const i = hydraHeadOf(s, seat);
  if (!s.down[seat]) {
    return i < 0 ? [] : [{ player, command: { kind: "drag", target, on: true, fromMilli: 0 } }];
  }
  if (s.spent[seat] || i < 0 || step === null) {
    return [{ player, command: { kind: "drag", target, on: false, fromMilli: 0 } }];
  }
  const across = hydraWayOf(step, i) * (w.cfg.hydraCutMilli + 200);
  return [{ player, command: { kind: "drag", target, on: true, fromMilli: across } }];
}

/** How far round its ring a coil's lever is carried a message: well inside half a lap. */
const STRIDE = 1500;

function coil(s: HydraState, seat: 0 | 1): Press[] {
  const target = COIL[seat];
  const player = seat === 0 ? 1 : 2;
  const i = hydraHeadOf(s, seat);
  if (i < 0) {
    return s.turning[seat]
      ? [{ player, command: { kind: "drag", target, on: false, fromMilli: 0 } }]
      : [];
  }
  if (!s.turning[seat]) {
    return [{ player, command: { kind: "drag", target, on: true, fromMilli: 0 } }];
  }
  const at = s.turnAtMilli[seat] + hydraUnwindWay(seat) * STRIDE;
  return [{ player, command: { kind: "drag", target, on: true, fromMilli: at } }];
}

function poke(s: HydraState, seat: 0 | 1): Press[] {
  const target = EYE[seat];
  const player = seat === 0 ? 1 : 2;
  if (s.down[seat]) return [{ player, command: { kind: "drag", target, on: false, fromMilli: 0 } }];
  if (!hydraEyeOpen(s, seat)) return [];
  return [{ player, command: { kind: "drag", target, on: true, fromMilli: 0 } }];
}

function shoot(w: World): Press[] {
  const target = hydraTarget(w);
  if (target === null) return [];
  const color: Color = target.color;
  const aim: Press = { player: 1, command: { kind: "cannonCol", col: target.col } };
  if (w.cannonCol !== target.col || (w.charge === null ? 0 : 1) + w.bullets.length > 0) {
    return [aim];
  }
  return [aim, { player: 2, command: { kind: "fire", color } }];
}
