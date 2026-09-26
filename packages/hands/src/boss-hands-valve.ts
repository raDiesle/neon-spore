import {
  type TimedCommand,
  ticksPerBeat,
  type ValveState,
  valveBoss,
  valveLeaking,
  valveMark,
  valveNeedMilli,
  type World,
} from "@neon-spore/sim";

/**
 * **THE VALVE played right**, for the autopilot: the wheel turned onto each
 * mark by the pilot, the pin tapped by the navigator to freeze it and drawn
 * out, and the story between the pins — the jet capped, the shudder and the
 * seal held by both thumbs, the film rubbed off — with the spark shot down.
 *
 * **The wheel is a thumb on the rim**, reported by bearing (`sim/valve-hand.ts`):
 * the first report only puts the hand down, and each one after moves the
 * wheel by the step between them. The hand goes clockwise a little a tick,
 * stops dead on the mark, and in the third movement goes the full lap first.
 * It lifts outside the turning, so every movement starts from a fresh grip.
 *
 * **A tap is an edge**: a thumb still on the pin is lifted a tick before it
 * comes down, so the freeze and the cap are answers, never a thumb parked.
 */
type Press = Omit<TimedCommand, "tick">;

/** Reversals a beat: about what a thumb rubbing back and forth manages. */
const RUBS_PER_BEAT = 4;

/** A lap of the wheel, in thousandths: `sim/bearing.ts`'s `TURN`. */
const LAP = 1000;

export const valveHand = (w: World): Press[] => {
  const s = valveBoss(w);
  if (s === null) return [];
  return [...wheel(w, s), ...pin(w, s), ...spark(s)];
};

function wheel(w: World, s: ValveState): Press[] {
  const off = s.handMilli < 0;
  if (s.phase === "hold") return [];
  if (s.phase !== "turn") return off ? [] : [turn(-1, false)];
  if (off) return [turn(s.wheelMilli, true)];
  // Half a lap a beat: a thumb's pace, and far inside the step the wheel reads.
  const pace = Math.max(1, Math.floor(LAP / (2 * ticksPerBeat(w.cfg))));
  const left = (valveMark(s) - s.wheelMilli + LAP) % LAP;
  const lapOwed = Math.abs(s.travelMilli) < valveNeedMilli(s, w.cfg);
  const by = lapOwed || left === 0 ? pace : Math.min(pace, left);
  return [turn((s.handMilli + by) % LAP, true)];
}

const turn = (at: number, on: boolean): Press => ({
  player: 1,
  command: { kind: "drag", target: "valveWheel", on, fromMilli: at },
});

function pin(w: World, s: ValveState): Press[] {
  switch (s.phase) {
    case "hold":
    case "jet":
      return [s.held[1] ? press(2, false) : press(2, true)];
    case "frozen":
      return [press(2, true, 0, w.cfg.valvePullMilli)];
    case "brace":
    case "seal":
      return ([1, 2] as const).filter((p) => !s.held[p - 1]).map((p) => press(p, true));
    case "wipe": {
      const every = Math.max(1, Math.floor(ticksPerBeat(w.cfg) / RUBS_PER_BEAT));
      return w.tick % every === 0 ? [press(2, true, s.rubs[1] + 1)] : [];
    }
    default:
      return ([1, 2] as const).filter((p) => s.held[p - 1]).map((p) => press(p, false));
  }
}

const press = (player: 1 | 2, on: boolean, id = 0, fromYMilli = 0): Press => ({
  player,
  command: { kind: "drag", target: "valvePin", on, fromMilli: 0, fromYMilli, id },
});

/** The spark takes either colour; the navigator fires cyan. */
function spark(s: ValveState): Press[] {
  if (!valveLeaking(s)) return [];
  return [
    { player: 1, command: { kind: "cannonCol", col: s.sparkCol } },
    { player: 2, command: { kind: "fire", color: "cyan" } },
  ];
}
