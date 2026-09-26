import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { throatMouthRow } from "@neon-spore/sim";
import { tileCX, type ViewRole } from "../src/layout.js";
import { cue, elsewhere, LAYOUT, mouthCol, opened, put, word } from "./boss-cue-throat-rig.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE THROAT, and the four moments it is allowed a word for**
 * (`render/src/boss-cue-read-k.ts`).
 *
 * One case was in `boss-cue-clocks.test.ts` until 19 September 2026 and it was
 * the whole of the fight the field could see: `FLING`, on any gum anywhere.
 * What that case could not catch is that the word was **true almost never** —
 * a gum flies level along the row it was on when the thumb lifted (`gum.ts`)
 * and `throatChoked` refuses one arriving on any row but the mouth's, so a
 * word standing for the twenty beats of a fall asked for a gesture that was
 * worth something on one of them.
 *
 * So the pair of cases at the top of this file is the point of the file: the
 * gum on the mouth's row, and the same gum one row above it. After it come the
 * moments that were silent — the body standing in the mouth with an inhale to
 * live here, and the *rock* standing in it that no shot answers, with the body
 * climbing the gullet under them, in `boss-cue-throat-rock.test.ts`.
 *
 * The states are set rather than played into, as in `boss-cue-undertow.test.ts`:
 * the clock under every one of them is proved in `sim/test/throat*.test.ts`,
 * and a test that pushed the fight through four phases to reach a lift would
 * be that suite's second copy.
 */

beforeAll(installCanvasGlobals);

describe("the gum, and the one row it is worth flinging from", () => {
  it("tells the pilot to fling one standing on the mouth's row", () => {
    const { world, t } = opened();
    expect(word(world, "p1")).toBeNull();
    put(world, "gum", elsewhere(world, t), throatMouthRow(CFG));
    expect(word(world, "p1")).toBe("FLING");
    expect(cue(world, "p1")?.kind).toBe("CARRY");
    // The navigator does not fling, so she is told nothing.
    expect(word(world, "p2")).toBeNull();
  });

  it("tells the pilot to wait for one still falling towards it", () => {
    // The case the old reading got wrong, and the reason this file exists: a
    // thumb lifted here throws the gum along a row the mouth is not on. It was
    // silence until the owner could not tell what to do with it (25 September
    // 2026), so it is `WAIT` now — never `FLING` — and still his alone.
    const { world, t } = opened();
    put(world, "gum", elsewhere(world, t), throatMouthRow(CFG) - 1);
    expect(word(world, "p1")).toBe("WAIT");
    expect(word(world, "p2")).toBeNull();
  });

  it("says nothing about which way or how far", () => {
    const { world, t } = opened();
    const c = put(world, "gum", elsewhere(world, t), throatMouthRow(CFG));
    const l = LAYOUT.p1;
    // On the gum itself and nowhere near the mouth: the distance and the side
    // are the pair's sentence (`docs/decisions.md` #34).
    expect(Math.abs((cue(world, "p1")?.x ?? 0) - tileCX(l, c.col))).toBeLessThan(l.tile);
    expect(Math.abs((cue(world, "p1")?.x ?? 0) - tileCX(l, mouthCol(world, t)))).toBeGreaterThan(
      l.tile / 2,
    );
  });
});

describe("a body standing in the mouth", () => {
  it("gives the shot to the navigator when he is under it", () => {
    const { world, t } = opened();
    world.cannonCol = mouthCol(world, t);
    put(world, "slick", mouthCol(world, t), throatMouthRow(CFG));
    expect(word(world, "p2")).toBe("FIRE");
    expect(cue(world, "p2")?.kind).toBe("PRESS");
    // His half of this beat is already done — the carriage is where it has to
    // be, and a word on his screen would ask for a thumb that changes no rule.
    expect(word(world, "p1")).toBeNull();
  });

  it("gives the column to the pilot when he is not", () => {
    const { world, t } = opened();
    world.cannonCol = elsewhere(world, t);
    put(world, "slick", mouthCol(world, t), throatMouthRow(CFG));
    expect(word(world, "p1")).toBe("MOVE");
    expect(cue(world, "p1")?.kind).toBe("CARRY");
    // Hers to fire once he is under it, and until then it is not her word.
    expect(word(world, "p2")).toBeNull();
  });

  it("marks the cannon and never the mouth he is wanted at", () => {
    const { world, t } = opened();
    world.cannonCol = elsewhere(world, t);
    put(world, "slick", mouthCol(world, t), throatMouthRow(CFG));
    const l = LAYOUT.p1;
    expect(Math.abs((cue(world, "p1")?.x ?? 0) - tileCX(l, world.cannonCol))).toBeLessThan(1);
    expect(Math.abs((cue(world, "p1")?.x ?? 0) - tileCX(l, mouthCol(world, t)))).toBeGreaterThan(
      l.tile,
    );
  });

  it("says nothing about a body the mouth is not under", () => {
    const { world, t } = opened();
    world.cannonCol = elsewhere(world, t);
    put(world, "slick", elsewhere(world, t), throatMouthRow(CFG));
    expect(word(world, "p1")).toBeNull();
    expect(word(world, "p2")).toBeNull();
  });
});

describe("while it everts", () => {
  it("says nothing at all, to either seat", () => {
    // The tube is turning through its own mouth: `throatChoked` refuses, the
    // hold is let go of, and every thumb the words above ask for is worth
    // nothing (`throat-pull.ts`, `throat-step.ts`).
    const { world, t } = opened();
    t.phase = "everts";
    put(world, "gum", mouthCol(world, t), throatMouthRow(CFG));
    put(world, "slick", mouthCol(world, t), throatMouthRow(CFG));
    world.cannonCol = mouthCol(world, t);
    expect(word(world, "p1")).toBeNull();
    expect(word(world, "p2")).toBeNull();
  });
});

describe("what any of these words may say", () => {
  it("is a verb in capitals, and never a column or a colour", () => {
    const { world, t } = opened();
    world.cannonCol = elsewhere(world, t);
    put(world, "gum", mouthCol(world, t), throatMouthRow(CFG));
    put(world, "slick", mouthCol(world, t), throatMouthRow(CFG));
    put(world, "meteor", mouthCol(world, t), throatMouthRow(CFG) + 2);
    for (const role of ["p1", "p2"] as ViewRole[]) {
      const c = cue(world, role);
      if (c === null) continue;
      expect(c.word).toMatch(/^[A-Z]+$/);
      expect(["PRESS", "HOLD", "CARRY", "TURN", "STILL"]).toContain(c.kind);
      expect(c.word).not.toMatch(/RED|CYAN|LEFT|RIGHT|[0-9]/);
    }
  });
});
