import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import { createWorld, type ScoutState, startWave, type World } from "@neon-spore/sim";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, waveWith } from "./frame-harness.js";
import { added, spared } from "./handle-hole-count.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **The last three bosses under the rule, and the three that were not the
 * plain seat check the others were**: THE SINEW, THE SURGE and THE SCOUT.
 *
 * A ring fills a disc in `PALETTE.background` before it draws its own colour
 * so it reads over whatever is behind it, and until 22 September 2026 it did
 * so for the seat that is only *reading* it as well. On the four bosses of
 * `handle-hole-bosses.test.ts` that was one question asked four times. These
 * three each asked it differently, which is why they were split off and ruled
 * one at a time.
 *
 * **THE SINEW** draws its ring `swinging ? ember : mine ? rock : dim`, so
 * there are three colours and only two seats: an ember ring is nobody's. The
 * ruling is that `theirs` is a question about *whose* and not about who may
 * press — while the handles swing neither seat may take hold, and both keep
 * the copy they had.
 *
 * **THE SURGE** is the one handle in the game **either** seat may press: the
 * hit test is the whole bulb and answers whichever seat asked. So the dim mark
 * is not an invitation refused, it is a report — *your partner's thumb is
 * there* — and a report does not need the disc an invitation does. What it was
 * taking instead was two black holes in the glass, on the boss whose whole
 * reading is how far that glass has swollen.
 *
 * **THE SCOUT** is the plain check after all; it was last only because no
 * photograph of it can be taken (`bun run frames` knows no verb that flies the
 * round). A count needs no verb, which is what this file is.
 */

beforeAll(installCanvasGlobals);

function boss(kind: Parameters<typeof waveWith>[0]): World {
  const world = createWorld(CFG, 5);
  const index = waveWith(kind);
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  return world;
}

/** The little ship with `carry` motes aboard, in the one phase that hears a hand. */
function scout(carry: number): World {
  const world = boss("scout");
  const s = world.boss as ScoutState | null;
  if (s === null || s.kind !== "scout") throw new Error("THE SCOUT's wave installed no round");
  s.phase = "play";
  s.carrying = Array.from({ length: carry }, (_, i) => i);
  return world;
}

describe("THE SINEW's two handles, resting on the mass's own lobes", () => {
  it("spares each seat the disc of the handle that is not its own", () => {
    // Both are on offer for the whole fight, so there is no ring-free state of
    // this boss to difference against: `test` owns both and is the both-seats
    // picture. One fewer disc than it is the other seat's ring cutting nothing.
    const { p1, p2 } = spared(() => boss("sinew"));
    expect(p1).toBe(1);
    expect(p2).toBe(1);
  });
});

describe("THE SURGE's two grip marks, on the bulb's lower flank", () => {
  it("spares each seat the disc of the mark that reports the other thumb", () => {
    const { p1, p2 } = spared(() => boss("surge"));
    expect(p1).toBe(1);
    expect(p2).toBe(1);
  });
});

describe("THE SCOUT's two rings, one of them on the ship itself", () => {
  it("punches the line's disc on her screen and not on his", () => {
    // Laden: hers alone is offered, and it sits on the ship's own middle.
    const { p1, p2, test } = added(scout(0), scout(CFG.scoutLadenMotes + 1));
    expect(p2).toBe(1);
    expect(p1).toBe(0);
    expect(test).toBe(1);
  });

  it("punches one apiece once the ship is heavy and both hands are on offer", () => {
    const { p1, p2, test } = added(scout(0), scout(CFG.scoutHeavyMotes + 1));
    expect(p1).toBe(1);
    expect(p2).toBe(1);
    expect(test).toBe(2);
  });
});
