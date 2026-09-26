import { describe, expect, it } from "bun:test";
import { slowing } from "@neon-spore/sim";
import { SLOW_RUNS_OUT_POSE } from "../src/poses-slow.js";
import { stageTickHz } from "../src/stage-loop.js";
import { Freeze, freezeTick, type PairAt } from "../src/versus-pair-freeze.js";
import { LIVE, shotParams } from "../src/versus-shot.js";

/**
 * The two flags that make a VERSUS pair photographable, and the one rule they
 * are both held to: **an unrecognised value falls through to the running pair**.
 *
 * A stale link into this page already says so on screen rather than showing a
 * blank one (`versus-app.ts`). A stale *flag* has to be gentler still — the
 * candidate is what the page is for, and a mistyped camera setting must not be
 * able to hide it.
 */

const read = (query: string) => shotParams(new URLSearchParams(query));

describe("freeze", () => {
  it("is read in seconds", () => {
    expect(read("freeze=1.5").freezeSeconds).toBe(1.5);
  });

  it("takes zero, which is the first frame and not an absent flag", () => {
    expect(read("freeze=0").freezeSeconds).toBe(0);
  });

  it("leaves the pair running when it is absent, negative or a word", () => {
    expect(read("").freezeSeconds).toBeNull();
    expect(read("freeze=-1").freezeSeconds).toBeNull();
    expect(read("freeze=soon").freezeSeconds).toBeNull();
  });
});

describe("only", () => {
  it("names one side", () => {
    expect(read("only=candidate").only).toBe("candidate");
    expect(read("only=current").only).toBe("current");
  });

  it("shows both when it is absent or unrecognised", () => {
    expect(read("").only).toBe("both");
    expect(read("only=left").only).toBe("both");
  });
});

describe("the two together", () => {
  it("are read off one query string", () => {
    expect(read("slot=creature:dart&name=ember&freeze=2&only=candidate")).toEqual({
      freezeSeconds: 2,
      only: "candidate",
    });
  });

  it("come back as the live pair when the query has neither", () => {
    expect(read("slot=creature:dart&name=ember")).toEqual(LIVE);
  });
});

/**
 * **A freeze lands on the second it names, inside THE SLOW too.** It counted
 * its target in ticks at the full rate while the pair spent a window at a
 * quarter of it, and its cadence clock ran four times ahead of the world:
 * `freeze=4.2` on `A WINDOW RUNNING OUT` landed near the window's end, and
 * `freeze=10` and `freeze=17` came back as one frame (`versus-pair-freeze.ts`).
 */
describe("a freeze inside a slowed window", () => {
  const pose = SLOW_RUNS_OUT_POSE;
  const cadence = pose.cadenceSeconds ?? 0;

  /** The pair's tick path, run to the freeze with no canvas. */
  const runTo = (seconds: number) => {
    const freeze = new Freeze(seconds);
    const built = pose.build();
    let at: PairAt = { world: built, events: [...built.events], clock: 0 };
    let rebuilds = 0;
    for (;;) {
      const next = freezeTick(freeze, pose, at);
      if (next === null) return { freeze, at, rebuilds };
      if (next.world !== at.world) rebuilds++;
      at = next;
    }
  };

  it("lands on the tick its seconds name at the slowed rate", () => {
    const start = pose.build();
    expect(slowing(start)).toBe(true);
    const { freeze, at } = runTo(4.2);
    expect(freeze.stepped).toBe(Math.round(4.2 * stageTickHz(start)));
    expect(slowing(at.world)).toBe(true);
    expect(at.clock).toBeCloseTo(4.2, 6);
  });

  it("gives two freezes seven seconds apart two different frames", () => {
    const ten = runTo(10);
    const seventeen = runTo(17);
    expect(seventeen.rebuilds).toBe(0);
    expect(seventeen.at.world.tick - ten.at.world.tick).toBe(
      Math.round(7 * stageTickHz(ten.at.world)),
    );
  });

  it("lands past the cadence where the same second of the next run is", () => {
    const first = runTo(1);
    const second = runTo(cadence + 1);
    expect(second.rebuilds).toBe(1);
    expect(Math.abs(second.at.world.tick - first.at.world.tick)).toBeLessThanOrEqual(1);
  });
});
