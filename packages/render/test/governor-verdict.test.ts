import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import type { SimEvent, World } from "@neon-spore/sim";
import {
  GOVERNOR_HUB,
  GOVERNOR_MARK,
  GOVERNOR_YOKE,
  GovernorVerdicts,
} from "../src/governor-verdicts.js";
import { rgba } from "../src/hex.js";
import type { ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals, ROLES, runFrames } from "./frame-harness.js";
import { FIRE, posed, stood, TAP } from "./governor-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE GOVERNOR's marks answer a touch the way THE INSTAR's do**
 * (`governor-verdicts.ts`, `.claude/skills/new-boss` §5): the lit mark wears
 * the halo on the tapper's screen and the partner's ring and clock on the
 * braking seat's, the yoke the other way round, the hub on both while a shot
 * is owed; each of the governor's words lands on the mark it names; and the
 * verdict reaches the field's frame on every screen.
 */

beforeAll(installCanvasGlobals);

const HALO = "createRadialGradient";
/** The partner's waiting clock's face, as `drawMarkWait` strokes it. */
const CLOCK = rgba(PALETTE.text, 0.85);
const col = 3;

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
const halos = (role: ViewRole, arrange: (w: World) => void) => count(frame(role, arrange), HALO);
const clocks = (role: ViewRole, arrange: (w: World) => void) => count(frame(role, arrange), CLOCK);
const rest = (w: World) => {
  posed(w, null);
};
const tap = (w: World) => {
  posed(w, TAP);
};
const fire = (w: World) => {
  posed(w, FIRE, 0, (s) => {
    s.hubLit = true;
  });
};

describe("THE GOVERNOR's marks asking", () => {
  it("haloes the mark for the tapper and the yoke for the braking seat, each the other's clock", () => {
    // TAP is the pilot's: the navigator brakes.
    expect(halos("p1", tap)).toBeGreaterThan(halos("p1", rest));
    expect(halos("p2", tap)).toBeGreaterThan(halos("p2", rest));
    expect(clocks("p1", tap)).toBeGreaterThan(clocks("p1", rest));
    expect(clocks("p2", tap)).toBeGreaterThan(clocks("p2", rest));
    expect(clocks("test", tap)).toBe(clocks("test", rest));
  });

  it("haloes the hub on both screens while a shot is owed, and waits on nobody", () => {
    for (const role of ["p1", "p2"] as const) {
      expect(halos(role, fire)).toBeGreaterThan(halos(role, rest));
      expect(clocks(role, fire)).toBe(clocks(role, rest));
    }
  });
});

describe("THE GOVERNOR's verdict on a touch", () => {
  const on = (said: SimEvent[]) => {
    const v = new GovernorVerdicts();
    v.ingest(said);
    return [GOVERNOR_MARK, GOVERNOR_YOKE, GOVERNOR_HUB].map((m) => v.verdicts.at(m)?.good ?? null);
  };

  it("lands each of the governor's words on the mark it names", () => {
    expect(on([{ type: "governorTick", side: 0, taps: 1, col }])).toEqual([true, null, null]);
    expect(on([{ type: "governorRetap", side: 1, col }])).toEqual([true, null, null]);
    expect(on([{ type: "governorSkid", side: 0, col }])).toEqual([false, null, null]);
    expect(on([{ type: "governorSway", col }])).toEqual([false, null, null]);
    expect(on([{ type: "governorDim", col }])).toEqual([false, null, null]);
    expect(on([{ type: "governorPlant", side: 1, col }])).toEqual([null, true, null]);
    expect(on([{ type: "governorSlip", side: 1, col }])).toEqual([null, false, null]);
    expect(on([{ type: "governorHit", hits: 1, col }])).toEqual([null, null, true]);
    expect(on([{ type: "governorMiss", col }])).toEqual([null, null, false]);
    expect(on([{ type: "governorHub", col }])).toEqual([null, null, null]);
  });

  it("forgets on reset", () => {
    const v = new GovernorVerdicts();
    v.ingest([{ type: "governorSkid", side: 0, col }]);
    v.clear();
    expect(v.verdicts.at(GOVERNOR_MARK)).toBeNull();
  });

  it.each(ROLES)("reaches the field's frame, on %s", (role) => {
    const skid: SimEvent[] = [{ type: "governorSkid", side: 0, col }];
    expect(count(frame(role, tap, skid), PALETTE.red)).toBeGreaterThan(
      count(frame(role, tap), PALETTE.red),
    );
  });
});
