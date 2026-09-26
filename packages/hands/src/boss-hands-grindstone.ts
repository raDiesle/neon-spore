import {
  GRINDSTONE_PADS,
  type GrindstoneState,
  grinding,
  grindstoneBoss,
  grindstoneLitStep,
  midCol,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";

/**
 * **THE GRINDSTONE played right**, for the autopilot: the lit flat rubbed
 * clean by its own seat, both jaws of the caliper held shut through a clamp,
 * and the lit axle shot in its colour up the middle.
 *
 * **A rub is a thumb held down and turned back**: the drag's `id` is how many
 * reversals it has made since it went down (`sim/grindstone-hand.ts`), so the
 * seat whose flat is lit sends one more than the wheel last heard, four times
 * a beat — a human's pace, not a tick's — and lifts once its flat is no longer
 * asked for. Only the lit flat's seat ever touches its flat.
 *
 * **A pad is a level**, THE TRIVET's (`boss-hands-trivet.ts`): each seat puts
 * down its jaw's pads once on a clamp step and lifts them once the step is
 * answered, so no chord outlasts its step into the ones that ask for nothing.
 *
 * **The shot** wants the step's colour; the white axle takes either, and the
 * navigator fires cyan.
 */
type Press = Omit<TimedCommand, "tick">;

/** Reversals a beat: about what a thumb rubbing back and forth manages. */
const RUBS_PER_BEAT = 4;

export const grindstoneHand = (w: World): Press[] => {
  const s = grindstoneBoss(w);
  if (s === null) return [];
  return [...rub(w, s), ...jaws(s), ...shoot(w, s)];
};

function rub(w: World, s: GrindstoneState): Press[] {
  const lit = grinding(s);
  const every = Math.max(1, Math.floor(ticksPerBeat(w.cfg) / RUBS_PER_BEAT));
  const out: Press[] = [];
  for (const side of [0, 1] as const) {
    const target = side === 0 ? "grindFlatLeft" : "grindFlatRight";
    const player = side === 0 ? 1 : 2;
    if (lit === side) {
      if (w.tick % every !== 0) continue;
      const id = s.rubs[side] + 1;
      out.push({ player, command: { kind: "drag", target, on: true, fromMilli: 0, id } });
    } else if (s.rubs[side] !== 0) {
      out.push({ player, command: { kind: "drag", target, on: false, fromMilli: 0 } });
    }
  }
  return out;
}

function jaws(s: GrindstoneState): Press[] {
  const want = grindstoneLitStep(s)?.ask === "clamp";
  const mask = want ? (1 << GRINDSTONE_PADS) - 1 : 0;
  const out: Press[] = [];
  for (const side of [0, 1] as const) {
    const target = side === 0 ? "grindJawLeft" : "grindJawRight";
    const player = side === 0 ? 1 : 2;
    for (let pad = 0; pad < GRINDSTONE_PADS; pad++) {
      const on = (mask & (1 << pad)) !== 0;
      if (((s.padsDown[side] & (1 << pad)) !== 0) === on) continue;
      out.push({ player, command: { kind: "drag", target, on, fromMilli: 0, id: pad } });
    }
  }
  return out;
}

function shoot(w: World, s: GrindstoneState): Press[] {
  const step = grindstoneLitStep(s);
  if (step?.ask !== "fire" || !s.locked) return [];
  return [
    { player: 1, command: { kind: "cannonCol", col: midCol(w.cfg) } },
    { player: 2, command: { kind: "fire", color: step.color === "either" ? "cyan" : step.color } },
  ];
}
