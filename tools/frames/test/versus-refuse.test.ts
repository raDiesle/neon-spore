import { describe, expect, it } from "bun:test";
import { readShotFlags } from "../shot-flags.js";
import { MOVES_NOTHING, movesNothing, REFUSED } from "../versus-refuse.js";

/**
 * A frozen VERSUS frame whose candidate moves nothing is refused, by name
 * (`versus-refuse.ts`). The death lane of 17 October 2026 took four frames of
 * a candidate frozen before the death it patches, each written with `wrote …`
 * and exit 0, and read them as broken candidates.
 */
describe("a frozen frame that moves nothing", () => {
  it("is refused with the candidate, the freeze and what to do instead", () => {
    const said = movesNothing("blister:death-tap", "plunge", "0.1");
    expect(said).toContain("blister:death-tap · plunge");
    expect(said).toContain("moves 0% of the frame at --freeze 0.1");
    expect(said).toContain("Freeze later, or use --rate");
  });

  it("is found by the share `versus-one.ts` writes for a candidate that moves nothing", () => {
    // `row.dataset.moves = String(plan.share)`, and a share of nothing is 0.
    expect(MOVES_NOTHING).toBe(`.versus-row[data-moves="${String(0)}"]`);
  });

  it("is asked of `bun run shot` with --refuse, and it exits with its own code", () => {
    expect(readShotFlags(["#x", "out.png", "--refuse", MOVES_NOTHING]).refuse).toBe(MOVES_NOTHING);
    expect(readShotFlags(["#x", "out.png"]).refuse).toBeUndefined();
    // Not 1 (a usage error) or 2 (a page that never got there): its own.
    expect(REFUSED).not.toBe(1);
    expect(REFUSED).not.toBe(2);
  });
});
