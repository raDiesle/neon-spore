import {
  type CapstanState,
  capstanBoss,
  capstanLitStep,
  capstanSeatIndex,
  midCol,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";

/**
 * **THE CAPSTAN played right**, for the autopilot: on a band step the seat
 * the step steers with leans its phone well past the mark toward that band,
 * and the other seat rubs it bright; on a hold the pilot leans and the
 * navigator rubs; on a shot with the core bared, the cannon to the middle and
 * the step's colour up it.
 *
 * **The lean is a level**, THE PLUMB's (`boss-hands-plumb.ts`): sent once
 * when the seat's reading is not what the step wants, and the phone not
 * steering is brought back level the same way, so a seat never steers from
 * where the last step left it. **The rub is THE RIME's**
 * (`boss-hands-rime.ts`): one more reversal than the drum last heard from
 * that thumb, four times a beat, and lifted once the step wants none of it.
 *
 * **The shot** wants the step's colour; `"either"` is fired cyan. The cannon
 * is slid only while it is not on the middle column and the shot is sent
 * once it is.
 */
type Press = Omit<TimedCommand, "tick">;

/** Reversals a beat: about what a thumb rubbing back and forth manages. */
const RUBS_PER_BEAT = 4;

/** How far past the mark the hand leans, in thousandths of a degree. */
const PAST_MILLI = 6000;

export const capstanHand = (w: World): Press[] => {
  const s = capstanBoss(w);
  if (s === null) return [];
  return [...lean(w, s), ...rub(w, s), ...shoot(w, s)];
};

/** Who the lit step wants steering and toward which face: the pilot on a hold, leaning left. */
function wanted(s: CapstanState): { steer: 1 | 2; face: 0 | 1 } | null {
  const ask = capstanLitStep(s)?.ask;
  if (ask === "left") return { steer: 1, face: 0 };
  if (ask === "right") return { steer: 2, face: 1 };
  if (ask === "hold") return { steer: 1, face: 0 };
  return null;
}

function lean(w: World, s: CapstanState): Press[] {
  const want = wanted(s);
  if (want === null) return [];
  const past = w.cfg.capstanLeanMilli + PAST_MILLI;
  const out: Press[] = [];
  for (const player of [1, 2] as const) {
    const to = player === want.steer ? (want.face === 0 ? -past : past) : 0;
    if (s.tiltMilli[capstanSeatIndex(player)] === to) continue;
    out.push({ player, command: { kind: "drag", target: "capstanLean", on: true, fromMilli: to } });
  }
  return out;
}

function rub(w: World, s: CapstanState): Press[] {
  const want = wanted(s);
  const every = Math.max(1, Math.floor(ticksPerBeat(w.cfg) / RUBS_PER_BEAT));
  const out: Press[] = [];
  for (const player of [1, 2] as const) {
    const i = capstanSeatIndex(player);
    if (want !== null && player !== want.steer) {
      if (w.tick % every !== 0) continue;
      const id = s.rubs[i] + 1;
      out.push({
        player,
        command: { kind: "drag", target: "capstanRub", on: true, fromMilli: 0, id },
      });
    } else if (s.rubs[i] !== 0) {
      out.push({
        player,
        command: { kind: "drag", target: "capstanRub", on: false, fromMilli: 0 },
      });
    }
  }
  return out;
}

function shoot(w: World, s: CapstanState): Press[] {
  const step = capstanLitStep(s);
  if (step?.ask !== "fire" || !s.bared) return [];
  const col = midCol(w.cfg);
  if (w.cannonCol !== col) return [{ player: 1, command: { kind: "cannonCol", col } }];
  const color = step.color === "either" ? "cyan" : step.color;
  return [{ player: 2, command: { kind: "fire", color } }];
}
