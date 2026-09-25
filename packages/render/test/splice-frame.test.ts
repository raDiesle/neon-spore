import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type SpliceState,
  spliceWanted,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import type { ViewRole } from "../src/layout.js";
import { showsSpliceTangle } from "../src/view-role.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  ROLES,
  remembered,
  runFrames,
  thirdOf,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE SPLICE, played rather than posed: a tangle standing, a number leaving
 * its top end, the same number crossing four straws on the way down, the
 * verdict on the mouth it landed in — and the wrong feed and the spent clock,
 * which are the two states an honest run reaches only by losing the wave.
 *
 * The picture is different on the two seats and that difference *is* the
 * fight, so both are played: the navigator's whole tangle with the numbers and
 * the clock over it, and the pilot's row of mouths with a hand's width of
 * straw above each. Nothing here can say whether a straw can be traced by an
 * eye — that wants a person, and this lane owes one. What it holds is that
 * every value either seat hands a canvas is one a canvas takes, including the
 * states no run without a press ever reaches.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const INDEX = waveWith("splice");

/** The shipped wave, with the hull held: a run that loses it restarts into a
 * field with no tangle on it, and the frames after a wrong feed are the point. */
function spliceWorld(hull = true): World {
  const world = createWorld({ ...CFG, hullInvulnerable: hull }, 3);
  startWave(world, INDEX, buildQueue(INDEX, CFG.cols), [], buildBoss(INDEX, CFG.cols));
  return world;
}

function fight(world: World): SpliceState {
  if (world.boss?.kind !== "splice") throw new Error("the splice wave installed no splice");
  return world.boss;
}

/**
 * A play with a feed every eight beats — right, then deliberately wrong, then
 * right again — so a run of frames crosses a flight, a good verdict, a bad one
 * and a fresh tangle without ever standing still.
 */
function play(role: ViewRole, i: number, right: boolean[]) {
  const world = spliceWorld();
  let at = 0;
  return runFrames(world, role, TPB * 8 * (right.length + 1), {
    ...thirdOf(2, i),
    onTick: (tick, w) => {
      const s = fight(w);
      const want = spliceWanted(s);
      const straw = right[at] === false ? (want === 0 ? 1 : 0) : want;
      // The cannon a beat before the maw, which is the sentence the pair says:
      // *under the second from the left* — *under it* — *now*.
      if (tick > 0 && tick % (TPB * 8) === TPB * 2 && at < right.length) {
        const col = s.entranceCols[straw] ?? w.cannonCol;
        step(w, [{ tick: w.tick, player: 1, command: { kind: "cannonCol", col } }]);
        return;
      }
      if (tick > 0 && tick % (TPB * 8) === TPB * 3 && at < right.length) {
        step(w, [{ tick: w.tick, player: 2, command: { kind: "intake" } }]);
        at += 1;
        return;
      }
      step(w, []);
    },
  });
}

const played = remembered((role: ViewRole) => {
  const i = ROLES.indexOf(role);
  return play(role, i < 0 ? 0 : i, [true, false, true]);
});

describe("THE SPLICE, drawn", () => {
  for (const role of ROLES) {
    it(`draws the tangle, the flight and both verdicts on ${role}`, () => {
      const run = played(role);
      expect(run.ctx.calls, "no frame reached the canvas").toBeGreaterThan(0);
      // The run has to have been the run: a flight, a feed that landed and one
      // that did not. Otherwise this is a test of an empty field.
      const types = new Set(run.events.map((e) => e.type));
      expect(types.has("spliceFeed"), "nothing was ever sucked").toBe(true);
      expect(types.has("spliceFed"), "nothing ever landed").toBe(true);
      expect(types.has("spliceWrong"), "nothing ever went wrong").toBe(true);
    });
  }

  it("shows the numbers to one seat and not the other", () => {
    // The split written as a predicate rather than as a count of draws: the
    // pilot holds the cannon and the navigator the only maw, so the tangle is
    // hers — she is the seat that cannot reach a mouth — and a seat that could
    // see both halves would be a seat playing alone. This comment said the
    // pilot held both buttons until 19 September 2026, which is what
    // `sim/splice.ts` said too; the panel is `["cannon", "mawTake"]`.
    expect(showsSpliceTangle("p1")).toBe(false);
    expect(showsSpliceTangle("p2")).toBe(true);
    // The director's own seat sees everything, the way it does everywhere else.
    expect(showsSpliceTangle("test")).toBe(true);
  });

  it("draws a round whose clock runs out with nothing coming down", () => {
    // The other way to lose, and the one no press reaches: the pair says
    // nothing for the whole round and the verdict lands on the cannon's own
    // column rather than on a mouth.
    const world = spliceWorld();
    const run = runFrames(world, "p2", TPB * 20, { every: 2 });
    expect(run.ctx.calls, "no frame reached the canvas").toBeGreaterThan(0);
    expect(
      run.events.some((e) => e.type === "spliceWrong" && e.clock),
      "the clock never ran out",
    ).toBe(true);
  });

  it("draws the last tangle coming apart", () => {
    // Every round fed in order, to the end of the fight — which takes the boss
    // off the world under the picture that was drawing it.
    const world = spliceWorld();
    const run = runFrames(world, "test", TPB * 90, {
      every: 3,
      onTick: (tick, w) => {
        const s = w.boss?.kind === "splice" ? w.boss : null;
        if (s !== null && s.flights.length === 0 && s.passBeat === -1 && tick % TPB === 0) {
          const col = s.entranceCols[spliceWanted(s)] ?? w.cannonCol;
          step(w, [{ tick: w.tick, player: 1, command: { kind: "cannonCol", col } }]);
          step(w, [{ tick: w.tick, player: 2, command: { kind: "intake" } }]);
          return;
        }
        step(w, []);
      },
    });
    expect(run.ctx.calls, "no frame reached the canvas").toBeGreaterThan(0);
    expect(
      run.events.some((e) => e.type === "spliceDown"),
      "the fight never ended",
    ).toBe(true);
  });
});
