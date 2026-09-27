import { describe, expect, it } from "bun:test";
import { capstanLitStep } from "../src/capstan.js";
import { capstanStruck } from "../src/capstan-shot.js";
import { hashWorld, type World } from "../src/index.js";
import { slowing } from "../src/slow.js";
import { NOT_FAILED } from "../src/wave-fail.js";
import {
  beats,
  CFG,
  capstan,
  install,
  OVER,
  pull,
  rightColor,
  rubCount,
  runUntil,
  SCRIPT,
  shot,
  toLit,
  wipe,
} from "./capstan-rig.js";

/**
 * THE CAPSTAN: one of you pulls the drum to turn a band toward the other,
 * who rubs it bright; then shoot the bared core.
 *
 * What these pin is what a picture cannot show: that only the bared face
 * wears, and the hidden one keeps its wear; that the seat steering is never
 * the seat rubbing; that a band not lit stops one short of bright and loses
 * nothing; that a window run out keeps its wear; that a hold counts beats
 * without ever setting the count back, and run out covers the core; and that
 * a shot run out is the wave.
 */

const THRESHOLD = CFG.capstanWearThreshold;

/** The lit step answered: steered and rubbed, held, or shot in its colour. */
function answer(world: World): void {
  const step = capstanLitStep(capstan(world));
  if (step === null) throw new Error("nothing is lit");
  if (step.ask === "fire") {
    capstanStruck(world, shot(rightColor(step)));
    return;
  }
  if (step.ask === "hold") {
    pull(world, 1, -OVER);
    while (capstan(world).phase === "lit") {
      wipe(world, 2, 1);
      beats(world, 1);
    }
    return;
  }
  const steer = step.ask === "left" ? 1 : 2;
  pull(world, steer, step.ask === "left" ? -OVER : OVER);
  wipe(world, steer === 1 ? 2 : 1, THRESHOLD);
}

/** A drum with the steps before `n` answered and step `n` lit. */
function toStep(n: number): World {
  const world = install();
  toLit(world);
  while (capstan(world).cursor < n) {
    answer(world);
    toLit(world);
  }
  return world;
}

describe("THE CAPSTAN comes in", () => {
  it("rusted, the cradle level, both bands dull, the core covered", () => {
    const world = install();
    const s = capstan(world);
    expect(s.phase).toBe("rusted");
    expect(s.wear).toEqual([0, 0]);
    expect(s.pullMilli).toEqual([0, 0]);
    expect(s.bared).toBe(false);
    expect(s.steps).toEqual([...SCRIPT]);
    expect(world.events.some((e) => e.type === "capstanEnter")).toBe(true);
  });

  it("lights the first band after the rust settles, under THE SLOW", () => {
    const world = install();
    const seen = toLit(world);
    expect(seen.has("capstanLight")).toBe(true);
    expect(slowing(world)).toBe(true);
  });

  it("takes no shot while the core is covered", () => {
    const world = toStep(0);
    capstanStruck(world, shot("red"));
    expect(capstan(world).hits).toBe(0);
    expect(capstan(world).phase).toBe("lit");
  });
});

describe("the pull", () => {
  it("past the mark rocks the steering seat's face over, and back inside drifts it", () => {
    const world = toStep(0);
    expect(pull(world, 1, -OVER)).toContain("capstanRock");
    expect(pull(world, 1, -CFG.capstanPullMilli + 200)).toContain("capstanDrift");
  });

  it("from the seat that is not steering rocks nothing", () => {
    const world = toStep(0);
    expect(pull(world, 2, -OVER)).not.toContain("capstanRock");
  });

  it("let go is centred", () => {
    const world = toStep(0);
    pull(world, 1, -OVER);
    expect(pull(world, 1, -OVER, false)).toContain("capstanDrift");
    expect(capstan(world).pullMilli[0]).toBe(0);
  });
});

describe("the rub", () => {
  it("from the other seat wears the bared face's band", () => {
    const world = toStep(0);
    pull(world, 1, -OVER);
    expect(wipe(world, 2, 3)).toContain("capstanWear");
    expect(capstan(world).wear).toEqual([3, 0]);
  });

  it("from the steering seat wears nothing", () => {
    const world = toStep(0);
    pull(world, 1, -OVER);
    wipe(world, 1, 3);
    expect(capstan(world).wear).toEqual([0, 0]);
  });

  it("on a level cradle wears nothing", () => {
    const world = toStep(0);
    wipe(world, 2, 3);
    expect(capstan(world).wear).toEqual([0, 0]);
  });

  it("counts only fresh reversals, and a lower count is a fresh touch", () => {
    const world = toStep(0);
    pull(world, 1, -OVER);
    rubCount(world, 2, 2);
    rubCount(world, 2, 2);
    expect(capstan(world).wear[0]).toBe(2);
    rubCount(world, 2, 1);
    expect(capstan(world).wear[0]).toBe(3);
    rubCount(world, 2, 0, false);
    rubCount(world, 2, 2);
    expect(capstan(world).wear[0]).toBe(5);
  });

  it("the lit band worn to the threshold cracks bright and answers the step", () => {
    const world = toStep(0);
    pull(world, 1, -OVER);
    const types = wipe(world, 2, THRESHOLD);
    expect(types).toContain("capstanBright");
    expect(capstan(world).phase).toBe("rest");
    expect(capstan(world).cursor).toBe(1);
    expect(slowing(world)).toBe(false);
  });
});

describe("turning between the faces", () => {
  it("keeps the hidden face's wear exactly where it was", () => {
    const world = toStep(0);
    pull(world, 1, -OVER);
    wipe(world, 2, 3);
    pull(world, 1, OVER);
    wipe(world, 2, 2);
    pull(world, 1, -OVER);
    expect(capstan(world).wear).toEqual([3, 2]);
    wipe(world, 2, 1);
    expect(capstan(world).wear).toEqual([4, 2]);
  });

  it("stops a band not lit one short of bright, and it cracks once its mark is", () => {
    const world = toStep(0);
    pull(world, 1, OVER);
    const types = wipe(world, 2, THRESHOLD + 4);
    expect(types).not.toContain("capstanBright");
    expect(capstan(world).wear[1]).toBe(THRESHOLD - 1);
    pull(world, 1, -OVER);
    wipe(world, 2, THRESHOLD);
    expect(capstan(world).wear).toEqual([THRESHOLD, THRESHOLD - 1]);
    toLit(world);
    pull(world, 2, OVER);
    const last = wipe(world, 1, 1);
    expect(last).toContain("capstanBright");
    expect(last).toContain("capstanBare");
    expect(capstan(world).bared).toBe(true);
  });

  it("swaps the seats on the right band: the navigator steers and the pilot rubs", () => {
    const world = toStep(1);
    pull(world, 2, OVER);
    wipe(world, 2, 3);
    expect(capstan(world).wear[1]).toBe(0);
    wipe(world, 1, 3);
    expect(capstan(world).wear[1]).toBe(3);
  });
});

describe("a band window run out", () => {
  it("stalls, keeps its wear, and lights the same step again", () => {
    const world = toStep(0);
    pull(world, 1, -OVER);
    wipe(world, 2, 3);
    const seen = runUntil(world, (w) => capstan(w).phase === "rest");
    expect(seen.has("capstanStall")).toBe(true);
    expect(capstan(world).wear[0]).toBe(3);
    expect(slowing(world)).toBe(false);
    toLit(world);
    expect(capstan(world).cursor).toBe(0);
    expect(world.failTick).toBe(NOT_FAILED);
  });
});

describe("a fire step", () => {
  it("lights without THE SLOW, the core bare", () => {
    const world = toStep(2);
    expect(slowing(world)).toBe(false);
    expect(capstan(world).bared).toBe(true);
  });

  it("wants its own colour: the other is a colour missed, and it stays lit", () => {
    const world = toStep(2);
    const misses = world.balance.colorMisses;
    capstanStruck(world, shot("cyan"));
    expect(world.balance.colorMisses).toBe(misses + 1);
    expect(capstan(world).phase).toBe("lit");
  });

  it("wants the middle column", () => {
    const world = toStep(2);
    capstanStruck(world, shot("red", CFG.cols - 1));
    expect(capstan(world).phase).toBe("lit");
  });

  it("shot in its colour is a hit, and the drum rests", () => {
    const world = toStep(2);
    capstanStruck(world, shot("red"));
    expect(world.events.some((e) => e.type === "capstanHit")).toBe(true);
    expect(capstan(world).hits).toBe(1);
    expect(capstan(world).phase).toBe("rest");
  });

  it("run out, is a hull hit, and that is the wave", () => {
    const world = toStep(2);
    const seen = runUntil(world, (w) => w.failTick !== NOT_FAILED);
    expect(seen.has("capstanMiss")).toBe(true);
  });
});

describe("a hold", () => {
  it("counts a beat with a rub on a bared face, and a beat without is not a reset", () => {
    const world = toStep(3);
    pull(world, 1, -OVER);
    wipe(world, 2, 1);
    beats(world, 1);
    expect(capstan(world).heldBeats).toBe(1);
    beats(world, 1);
    expect(capstan(world).heldBeats).toBe(1);
    const seen = new Set<string>();
    while (capstan(world).phase === "lit") {
      wipe(world, 2, 1);
      for (const t of beats(world, 1)) seen.add(t);
    }
    expect(seen.has("capstanKept")).toBe(true);
    expect(capstan(world).bared).toBe(true);
    expect(capstan(world).cursor).toBe(4);
  });

  it("takes either way round: the navigator pulling and the pilot rubbing", () => {
    const world = toStep(3);
    pull(world, 1, 0, false);
    pull(world, 2, OVER);
    const seen = new Set<string>();
    while (capstan(world).phase === "lit") {
      wipe(world, 1, 1);
      for (const t of beats(world, 1)) seen.add(t);
    }
    expect(seen.has("capstanKept")).toBe(true);
  });

  it("run out, covers the core until the same hold is made", () => {
    const world = toStep(3);
    const seen = runUntil(world, (w) => capstan(w).phase === "rest");
    expect(seen.has("capstanCover")).toBe(true);
    expect(capstan(world).bared).toBe(false);
    expect(capstan(world).cursor).toBe(3);
    toLit(world);
    answer(world);
    expect(capstan(world).bared).toBe(true);
    expect(capstan(world).cursor).toBe(4);
  });
});

describe("the end", () => {
  it("answered whole, the cap swings open and the fight ends", () => {
    const world = toStep(6);
    capstanStruck(world, shot("red"));
    expect(capstan(world).hits).toBe(3);
    const seen = runUntil(world, (w) => w.boss === null);
    expect(seen.has("capstanOpen")).toBe(true);
    expect(seen.has("capstanOut")).toBe(true);
    expect(world.failTick).toBe(NOT_FAILED);
  });
});

describe("two devices", () => {
  it("agree while their commands do, and part over a single reversal", () => {
    const a = toStep(0);
    const b = toStep(0);
    pull(a, 1, -OVER);
    pull(b, 1, -OVER);
    expect(hashWorld(a)).toBe(hashWorld(b));
    wipe(a, 2, 1);
    wipe(b, 2, 2);
    expect(hashWorld(a)).not.toBe(hashWorld(b));
  });
});
