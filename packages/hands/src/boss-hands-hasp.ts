import {
  type HaspState,
  haspBoss,
  haspHeld,
  haspLatchUp,
  haspLoose,
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
 *
 * **The story between the hasps** is answered state by state
 * (`sim/hasp-story.ts`): the rattle with the latch alone, the backspin with
 * the wheel alone and no wait for his hand, the rust with the wheel rocked
 * `ROCK_TICKS` each way while the latch is down, and the sway with the latch
 * down and her hand sent to the bearing it already has, which is a wheel held
 * still.
 */
type Press = Omit<TimedCommand, "tick">;

/** How far round the wheel goes in a tick. Small enough to be a thumb and
 * large enough that a clasp is wound inside a pose's budget. */
const STEP_MILLI = 60;

/** Ticks the rust is rocked each way: a sweep of `ROCK_TICKS * STEP_MILLI`,
 * past `haspRockMilli`, so every turn back counts. */
const ROCK_TICKS = 3;

const NO_BEARING = -1;

export const haspHand = (w: World): Press[] => {
  const s = haspBoss(w);
  if (s === null) return [];
  return [...bolt(s), ...hands(w, s)];
};

/** The latch down and the wheel round, each only while the door takes it. */
function hands(w: World, s: HaspState): Press[] {
  const out: Press[] = [];
  if (haspLatchUp(s)) {
    out.push({
      player: 1,
      command: {
        kind: "drag",
        target: "haspLatch",
        on: true,
        fromMilli: 0,
        fromYMilli: w.cfg.haspReachMilli,
      },
    });
  }
  const step = wheelStep(w, s);
  if (step === null) return out;
  const at = s.handMilli === NO_BEARING ? 0 : (((s.handMilli + step) % 1000) + 1000) % 1000;
  out.push({ player: 2, command: { kind: "drag", target: "haspWheel", on: true, fromMilli: at } });
  return out;
}

/**
 * How far her hand goes this tick, or null for no hand. Her hand waits for
 * his everywhere but the backspin: a rim turned before the latch is down is
 * the seize, and what this hand poses is the fight going well.
 */
function wheelStep(w: World, s: HaspState): number | null {
  if (s.phase === "backspin") return STEP_MILLI;
  if (s.phase !== "work" && s.phase !== "rust" && s.phase !== "sway") return null;
  if (!haspHeld(s, w.cfg)) return null;
  if (s.phase === "sway") return 0;
  if (s.phase === "rust")
    return Math.floor(w.tick / ROCK_TICKS) % 2 === 0 ? STEP_MILLI : -STEP_MILLI;
  return STEP_MILLI;
}

/** The loose bolt shot out of the middle column before it reaches the hull. */
function bolt(s: HaspState): Press[] {
  if (!haspLoose(s)) return [];
  return [
    { player: 1, command: { kind: "cannonCol", col: s.boltCol } },
    { player: 2, command: { kind: "fire", color: "cyan" } },
  ];
}
