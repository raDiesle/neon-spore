import {
  type HaspState,
  haspBoss,
  haspHeld,
  haspLoose,
  haspWorking,
  type TimedCommand,
  type World,
} from "@neon-spore/sim";

/**
 * **THE HASP played right**, for the STATES sheet: the latch kept down and
 * the wheel kept turning, which is the whole of what the pair does.
 *
 * The hand has no wrong twin because this boss has no turn-taking in it and
 * no way to play it wrong that is worth a card — a
 * seize is the pair failing to *keep* doing something rather than doing the
 * other thing, so it is reached by a hand that stops rather than by a hand
 * that misbehaves, and nothing here needs a wrong twin.
 *
 * Two things it has to get right, and they are the two halves of the gate:
 *
 * - **The latch is a level**, so it is re-sent every tick at full reach. A
 *   message is the depth the thumb is at, and a thumb that stopped sending
 *   is a thumb still resting where it was — but a burn clears `latchMilli`
 *   under the hand, and only a fresh message takes the latch again
 *   (`sim/hasp-hand.ts`).
 * - **The wheel is a bearing**, so where to send next is read off where the
 *   simulation last heard her hand rather than counted here. After a grab,
 *   after a clasp opens and after a burn, `handMilli` is `NO_BEARING` and
 *   the first message is a reference that turns nothing; every one after it
 *   is a step of `STEP_MILLI`, which is well under `MAX_BEARING_STEP` so the
 *   short way round is always the way the thumb went (`sim/bearing.ts`).
 *
 * The bolt is answered on the way past, in either colour, so the wave holds
 * long enough to reach the third clasp.
 */
type Press = Omit<TimedCommand, "tick">;

/** How far round the wheel goes in a tick. Small enough to be a thumb and
 * large enough that a clasp is wound inside a pose's budget. */
const STEP_MILLI = 60;

const NO_BEARING = -1;

export const haspHand = (w: World): Press[] => {
  const s = haspBoss(w);
  if (s === null) return [];
  return [...bolt(s), ...hands(w, s)];
};

/** The latch down and the wheel round, both only while a clasp is up. */
function hands(w: World, s: HaspState): Press[] {
  if (!haspWorking(s)) return [];
  const out: Press[] = [
    {
      player: 1,
      command: {
        kind: "drag",
        target: "haspLatch",
        on: true,
        fromMilli: 0,
        fromYMilli: w.cfg.haspReachMilli,
      },
    },
  ];
  // Her hand waits for his: a rim turned before the latch is down is the
  // seize, and what this hand poses is the fight going well.
  if (!haspHeld(s, w.cfg)) return out;
  const at = s.handMilli === NO_BEARING ? 0 : (s.handMilli + STEP_MILLI) % 1000;
  out.push({ player: 2, command: { kind: "drag", target: "haspWheel", on: true, fromMilli: at } });
  return out;
}

/** The loose bolt shot out of the middle column before it reaches the hull. */
function bolt(s: HaspState): Press[] {
  if (!haspLoose(s)) return [];
  return [
    { player: 1, command: { kind: "cannonCol", col: s.boltCol } },
    { player: 2, command: { kind: "fire", color: "cyan" } },
  ];
}
