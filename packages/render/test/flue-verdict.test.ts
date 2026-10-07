import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import type { SimEvent, World } from "@neon-spore/sim";
import { FLUE_SIGHT_MARK, FlueVerdicts } from "../src/flue-verdicts.js";
import { rgba } from "../src/hex.js";
import type { ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import { BEAM, BOLT, posed, stood } from "./flue-harness.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals, ROLES, runFrames } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE FLUE's mark answers a shot the way every mark does**
 * (`flue-verdicts.ts`, `.claude/skills/new-boss` §5): a hit greens the glass
 * and a shot spent reddens it, and the verdict reaches the field's frame on
 * every screen. Since 7 October 2026 nothing else stands round the glass —
 * no halo, no partner's ring and clock (the owner: *remove the scanner box
 * and the text*).
 */

beforeAll(installCanvasGlobals);

/** The partner's waiting clock's face, as `drawMarkWait` strokes it. */
const CLOCK = rgba(PALETTE.text, 0.85);

function frame(role: ViewRole, arrange: (world: World) => void, said: SimEvent[] = []): string {
  const world = stood();
  arrange(world);
  const log: string[] = [];
  runFrames(world, role, 9, {
    every: 3,
    onCanvas: (c) => {
      c.log = log;
    },
    onTick: (tick, w) => {
      w.events.length = 0;
      if (tick === 2) w.events.push(...said);
    },
  });
  return log.join("|");
}

const count = (text: string, what: string) => text.split(what).length - 1;
const clocks = (role: ViewRole, arrange: (w: World) => void) => count(frame(role, arrange), CLOCK);

const rest = (w: World) => void posed(w, null);
const bolt = (w: World) => void posed(w, BOLT);
const beam = (w: World) => void posed(w, BEAM);

describe("THE FLUE's sight asking", () => {
  it.each([bolt, beam])("stands no partner's clock round the glass on any screen", (lit) => {
    for (const role of ROLES) expect(clocks(role, lit)).toBe(clocks(role, rest));
  });
});

describe("THE FLUE's verdict on a shot", () => {
  const on = (said: SimEvent[]) => {
    const v = new FlueVerdicts();
    v.ingest(said);
    return v.verdicts.at(FLUE_SIGHT_MARK)?.good ?? null;
  };
  const col = 5;

  it("greens the sight for a hit and reddens it for a shot spent, whatever spent it", () => {
    expect(on([{ type: "flueHit", hits: 1, left: 0, col, emberMilli: 0 }])).toBe(true);
    for (const why of ["wide", "color", "weapon"] as const) {
      expect(on([{ type: "flueMiss", shots: 2, why, late: false, emberMilli: 0, col }])).toBe(
        false,
      );
    }
    expect(on([{ type: "flueLight", level: 1, col }])).toBeNull();
    expect(on([{ type: "flueSpent", col }])).toBeNull();
  });

  it("forgets on reset", () => {
    const v = new FlueVerdicts();
    v.ingest([{ type: "flueMiss", shots: 2, why: "wide", late: false, emberMilli: 0, col }]);
    v.clear();
    expect(v.verdicts.at(FLUE_SIGHT_MARK)).toBeNull();
  });

  it.each(ROLES)("reaches the field's frame, on %s", (role) => {
    const missed: SimEvent[] = [
      { type: "flueMiss", shots: 2, why: "color", late: false, emberMilli: 0, col },
    ];
    expect(count(frame(role, rest, missed), PALETTE.red)).toBeGreaterThan(
      count(frame(role, rest), PALETTE.red),
    );
  });
});
