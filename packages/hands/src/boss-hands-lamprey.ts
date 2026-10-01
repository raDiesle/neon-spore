import {
  type LampreyState,
  lampreyBiting,
  lampreyBoss,
  lampreyFiring,
  lampreyPinner,
  lampreyStep,
  lampreyTapper,
  midCol,
  type TimedCommand,
  type World,
} from "@neon-spore/sim";

/**
 * **THE LAMPREY played right**, for the autopilot. In a bite the pinner keeps
 * a thumb on the jaw and moves it after the jaw each time it crawls, and the
 * tapper taps the one lit tooth. With the gullet lit, the cannon goes to the
 * middle and the step's colour goes up it.
 *
 * **The jaw is a level**, THE GALL's pinch (`boss-hands-gall.ts`): the column
 * under the thumb is recorded on the tick it is sent (`sim/lamprey-hand.ts`),
 * so it is sent once, and again only when the jaw has crawled out from under
 * it. A crawl is one column and the grip is wider than that, so the thumb is
 * never off the jaw for the tick it takes to follow.
 *
 * **A tooth is an edge**, THE VALVE's pin (`boss-hands-valve.ts`): a thumb
 * still down is lifted the tick after it came down, so the next tap is a new
 * press. The tooth tapped is the lit one, read off the state, so the hand
 * never snaps one back.
 *
 * **The shot** wants the step's colour; `"either"` is fired cyan.
 */
type Press = Omit<TimedCommand, "tick">;

export const lampreyHand = (w: World): Press[] => {
  const s = lampreyBoss(w);
  if (s === null) return [];
  return [...pin(s), ...tap(s), ...shoot(w, s)];
};

function pin(s: LampreyState): Press[] {
  const pinner = lampreyPinner(s);
  if (pinner === null || s.holdCol[pinner - 1] === s.jawCol) return [];
  return [
    {
      player: pinner,
      command: { kind: "drag", target: "lampreyJaw", on: true, fromMilli: 0, id: s.jawCol },
    },
  ];
}

function tap(s: LampreyState): Press[] {
  const lifts = ([1, 2] as const)
    .filter((seat) => s.tapDown[seat - 1])
    .map((seat) => press(seat, false, s.litTooth));
  if (lifts.length > 0) return lifts;
  const tapper = lampreyTapper(s);
  if (tapper === null || !lampreyBiting(s)) return [];
  return [press(tapper, true, s.litTooth)];
}

function shoot(w: World, s: LampreyState): Press[] {
  const step = lampreyStep(s);
  if (step === null || !lampreyFiring(s)) return [];
  const col = midCol(w.cfg);
  if (w.cannonCol !== col) return [{ player: 1, command: { kind: "cannonCol", col } }];
  const color = step.color === "either" ? "cyan" : step.color;
  return [{ player: 2, command: { kind: "fire", color } }];
}

const press = (player: 1 | 2, on: boolean, id: number): Press => ({
  player,
  command: { kind: "drag", target: "lampreyTooth", on, fromMilli: 0, id },
});
