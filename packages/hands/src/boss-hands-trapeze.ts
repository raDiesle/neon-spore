import {
  chargeDueTick,
  chargePartTicks,
  hullRow,
  laying,
  type TimedCommand,
  type TrapezeState,
  ticksPerBeat,
  trapezeBoss,
  trapezeCaller,
  trapezeLitStep,
  trapezeLocked,
  trapezeOpenZone,
  trapezePeriod,
  trapezeSeat,
  type World,
} from "@neon-spore/sim";

/**
 * **THE TRAPEZE played right**, for the autopilot.
 *
 * **A swipe level**: the moment a side opens — the swing on it, coming back
 * toward the middle — the seat called to it puts a finger down there, and
 * lifts it the next tick a column across toward the middle. A finger is
 * never left down past its lift (`sim/trapeze-hand.ts`).
 *
 * **Shots from below**: aimed at an eighth of a swing after it turns, on
 * whichever side it turns next, so the shot lands while the swing comes back
 * toward the middle. A press leaves on the charge's grid (`shot-charge.ts`),
 * not on the tick it is made, so the hand asks where the swing will be when
 * the shot a press made *now* reaches its row — the charge, then the climb —
 * puts the cannon under that, and fires when that arrival is the nearest the
 * grid allows to the eighth. With no charge that is the exact tick, as it
 * was; under the game's half beat it was ten shots for one hit
 * (8 October 2026).
 *
 * **Shots from the side**: the cannon goes to the left edge, the pilot taps
 * the alien whenever it is not locked, and the navigator fires as the swing
 * turns at the left end, so the shot comes round the corner and pushes the
 * alien right while it is heading right.
 */
type Press = Omit<TimedCommand, "tick">;

export const trapezeHand = (w: World): Press[] => {
  const s = trapezeBoss(w);
  const step = s === null ? null : trapezeLitStep(s);
  if (s === null) return [];
  const lifts = lift(s);
  if (step === null) return lifts;
  if (step.ask === "push" || step.ask === "call") return [...lifts, ...swipe(w, s)];
  if (step.ask === "shoot") return [...lifts, ...below(w, s)];
  return [...lifts, ...side(w, s)];
};

/** A finger down is lifted, a column toward the middle. */
function lift(s: TrapezeState): Press[] {
  const out: Press[] = [];
  for (const seat of [0, 1] as const) {
    const zone = s.down[seat];
    if (zone !== 0) out.push(push(seat, zone, false, -zone * 1000));
  }
  return out;
}

function swipe(w: World, s: TrapezeState): Press[] {
  const zone = trapezeOpenZone(w.cfg, s);
  if (zone === 0) return [];
  const seat = trapezeCaller(s, zone);
  return s.down[seat] === 0 ? [push(seat, zone, true, 0)] : [];
}

/** Ticks a shot takes from the muzzle to the swing's row. */
function climb(w: World, s: TrapezeState): number {
  const perTick = (w.cfg.bulletTilesPerBeat * 1000) / ticksPerBeat(w.cfg);
  const from = (hullRow(w.cfg) - 1) * 1000;
  return Math.ceil((from - trapezeSeat(w.cfg, s).yMilli - w.cfg.trapezeHitMilli) / perTick);
}

function below(w: World, s: TrapezeState): Press[] {
  if (laying(w)) return [];
  const period = trapezePeriod(w.cfg);
  const leaves = chargeDueTick(w.cfg, w.tick);
  const at = (s.swingTick + leaves - w.tick + climb(w, s)) % period;
  const col = Math.round(trapezeSeat(w.cfg, { ...s, swingTick: at }).xMilli / 1000);
  // Under it every tick, and in the same tick as the press: the arrival moves
  // with the tick, and a move made a tick before the press is a column early.
  const under: Press[] =
    w.cannonCol === col ? [] : [{ player: 1, command: { kind: "cannonCol", col } }];
  // How far the arrival is from the nearer eighth, either way round the swing.
  const off = Math.min(
    ...[period / 8, period / 2 + period / 8].map((t) => {
      const d = Math.abs(at - Math.round(t)) % period;
      return Math.min(d, period - d);
    }),
  );
  if (off > Math.floor(chargePartTicks(w.cfg) / 2)) return under;
  return [...under, { player: 2, command: { kind: "fire", color: "cyan" } }];
}

function side(w: World, s: TrapezeState): Press[] {
  if (w.cannonCol !== 0) return [{ player: 1, command: { kind: "cannonCol", col: 0 } }];
  if (!trapezeLocked(s)) return [lock(true)];
  const out: Press[] = [lock(false)];
  if (s.swingTick === trapezePeriod(w.cfg) / 2) {
    out.push({ player: 2, command: { kind: "fire", color: "red" } });
  }
  return out;
}

const push = (seat: 0 | 1, zone: -1 | 1, on: boolean, fromMilli: number): Press => ({
  player: seat === 0 ? 1 : 2,
  command: {
    kind: "drag",
    target: zone < 0 ? "trapezePushLeft" : "trapezePushRight",
    on,
    fromMilli,
  },
});

const lock = (on: boolean): Press => ({
  player: 1,
  command: { kind: "drag", target: "trapezeLock", on, fromMilli: 0 },
});
